import * as glMatrix from "gl-matrix";
import { Hover } from "../../shaders/engine/utility/Hover";
import { WebGPUBuffer } from "../webgpu-utils/webgpu-buffer";
import * as WebGPU from "../webgpu-utils/webgpu-utils";
import { CellsBufferData, CellsBufferDescriptor, GridData, Indexing, NonEmptyCellsBuffers } from "./indexing/indexing";
import { SetPositions } from "./simulation/SetPositions";
import { Acceleration } from "./simulation/acceleration";
import { Initialization } from "./simulation/initialization";
import { Integration } from "./simulation/integration";
import { SetBounds } from "./simulation/SetBounds";
import { Copy } from "./simulation/copy";
import { SetColor } from "./simulation/SetColor";
import { Shadow } from "../../Store/interfaces";
import { SetHover } from "./simulation/SetHover";
import { SetSelected } from "./simulation/SetSelected";

// Make room for 20k extra particles if needed (shadows)
const DYNAMIC_SIZE = 10000;

type Data = {
    spheresRadius: number;
    particlesPositions: ReadonlyArray<glMatrix.ReadonlyVec2>
};

type ParticlesBufferData = {
    readonly particlesBuffer: WebGPU.Buffer;
    readonly particlesStructType: WebGPU.Types.StructType;
    readonly particlesCount: number;
};

type ResetResult = {
    particlesBuffer: WebGPU.Buffer;

    cellSize: number;
    gridSize: glMatrix.ReadonlyVec2;
};

class Engine {
    public static readonly particleStructType = new WebGPU.Types.StructType("Particle", [
        { name: "position", type: WebGPU.Types.vec2F32 },
        { name: "velocity", type: WebGPU.Types.vec2F32 },
        { name: "acceleration", type: WebGPU.Types.vec2F32 },
        { name: "indexInCell", type: WebGPU.Types.u32 },
        { name: "index", type: WebGPU.Types.u32 },
        { name: "force", type: WebGPU.Types.vec2F32 },
        { name: "selected", type: WebGPU.Types.u32 },
        { name: "bounds", type: WebGPU.Types.vec4F32 },
        { name: "color", type: WebGPU.Types.u32 },
        { name: "shape", type: WebGPU.Types.f32 },
        { name: "copyOf", type: WebGPU.Types.u32 },
        { name: "hover", type: WebGPU.Types.u32 }
    ]);

    private readonly device: GPUDevice;

    public particlesBuffer: WebGPU.Buffer;

    private spheresRadius: number;

    private cellSize: number;

    private gridSize: glMatrix.ReadonlyVec2;

    private readonly initialization: Initialization;

    private needsInitialization: boolean = true;

    private readonly acceleration: Acceleration;

    private readonly integration: Integration;

    private readonly indexing: Indexing;

    private needsIndexing: boolean = true;

    public indexBuffer: WebGPU.Buffer;

    private needsForceUpdate: boolean = false;

    private x: number[]

    private y: number[]

    public static board_size = 20;

    private particlesPositions: Data['particlesPositions']

    public id = Math.random();

    private mapXYBuffer: WebGPUBuffer;

    private needsMapXY = false;

    public hover: Hover;

    public copy: Copy;

    private bounds?: Float32Array;

    private color?: WebGPUBuffer;

    private selectedBuffer?: WebGPUBuffer;

    private hoverBuffer?: WebGPUBuffer;

    public dynamicSize = 2;

    public constructor(device: GPUDevice, public N: number, data: Data) {
        this.device = device;
        this.particlesPositions = data.particlesPositions;

        const resetResult = this.applyReset(data);
        this.particlesBuffer = resetResult.particlesBuffer;
        this.spheresRadius = data.spheresRadius;
        this.cellSize = resetResult.cellSize;
        this.gridSize = resetResult.gridSize;

        const particlesBufferData: ParticlesBufferData = {
            particlesBuffer: this.particlesBuffer,
            particlesCount: this.N,
            particlesStructType: Engine.particleStructType,
        };

        this.hover = new Hover(this.device, particlesBufferData);

        this.initialization = new Initialization(this.device, {
            particlesPositions: this.particlesPositions,
            particlesBufferData,
            indexBuffer: this.indexBuffer
        });

        this.indexing = new Indexing(this.device, {
            gridSize: this.gridSize,
            cellSize: this.cellSize,
            particlesBufferData,
            indexBuffer: this.indexBuffer,
        });

        this.acceleration = new Acceleration(this.device, {
            gridSize: this.gridSize,
            cellSize: this.cellSize,
            cellsBufferData: this.indexing.cellsBufferData,
            particlesBufferData,
            particleRadius: this.spheresRadius,
            indexBuffer: this.indexBuffer
        });

        this.integration = new Integration(this.device, {
            particlesBufferData,
            particleRadius: this.spheresRadius,
        });

        const encoder = device.createCommandEncoder();
        this.compute(encoder, 0.0005, 1)
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }

    public async readXY() {
        this.needsMapXY = true;

        this.mapXYBuffer = new WebGPU.Buffer(this.device, {
            size: Engine.particleStructType.size * this.N,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });

        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(this.particlesBuffer.gpuBuffer, 0, this.mapXYBuffer.gpuBuffer, 0, this.mapXYBuffer.size);
        this.device.queue.submit([commandEncoder.finish()]);

        await this.device.queue.onSubmittedWorkDone();

        await this.mapXYBuffer.gpuBuffer.mapAsync(GPUMapMode.READ, 0, this.mapXYBuffer.gpuBuffer.size);

        const range = new Float32Array(this.mapXYBuffer.gpuBuffer.getMappedRange(0, this.mapXYBuffer.gpuBuffer.size).slice(0));
        this.mapXYBuffer.gpuBuffer.unmap();

        return range;
    }

    public addShadowPoints(shadows: Shadow[]) {
        const shadowBuffer = new ArrayBuffer(Engine.particleStructType.size * shadows.length);

        shadows.forEach((shadow, i) => {
            Engine.particleStructType.setValue(shadowBuffer, Engine.particleStructType.size * i, {
                position: [shadow.position.x, shadow.position.y],
                velocity: [0, 0],
                acceleration: [0, 0],
                indexInCell: 10000,
                index: 0,
                force: [11, 10],
                selected: 0,
                bounds: [5, 5, 15, 15],
                color: shadow.color,
                shape: 0.0,
                copyOf: shadow.copyOf
            })
        })

        this.dynamicSize = shadows.length;
        this.device.queue.writeBuffer(this.particlesBuffer.gpuBuffer, Engine.particleStructType.size * this.N, shadowBuffer, 0, Engine.particleStructType.size * shadows.length);
    }

    public compute(commandEncoder: GPUCommandEncoder, dt: number, radiusScaling: number): void {
        if (this.needsInitialization) {
            this.initialization.compute(commandEncoder);
            this.needsInitialization = false;
            this.needsIndexing = true;
        }

        if (this.needsForceUpdate) {
            new SetPositions(this.device, {
                particlesPositions: Array.from({ length: this.N }).map((_, i) => ([this.x[i], this.y[i]])),
                particlesBufferData: {
                    particlesBuffer: this.particlesBuffer,
                    particlesCount: this.N,
                    particlesStructType: Engine.particleStructType,
                },
            }).compute(commandEncoder);

            this.needsForceUpdate = false;
        }

        if (this.bounds) {
            new SetBounds(this.device, {
                bounds: this.bounds,
                particlesBufferData: {
                    particlesBuffer: this.particlesBuffer,
                    particlesCount: this.N,
                    particlesStructType: Engine.particleStructType,
                },
            }).compute(commandEncoder);

            this.bounds = undefined;
        }

        if (this.color) {
            new SetColor(this.device, {
                particlesBufferData: {
                    particlesBuffer: this.particlesBuffer,
                    particlesCount: this.N,
                    particlesStructType: Engine.particleStructType
                },
                colorBuffer: this.color
            }).compute(commandEncoder);

            this.color = null;
        }

        if (this.hoverBuffer) {
            new SetHover(this.device, {
                particlesBufferData: {
                    particlesBuffer: this.particlesBuffer,
                    particlesCount: this.N,
                    particlesStructType: Engine.particleStructType
                },
                hoverBuffer: this.hoverBuffer
            }).compute(commandEncoder);

            this.hoverBuffer = null;
        }

        if (this.selectedBuffer) {
            new SetSelected(this.device, {
                particlesBufferData: {
                    particlesBuffer: this.particlesBuffer,
                    particlesCount: this.N,
                    particlesStructType: Engine.particleStructType
                },
                selectedBuffer: this.selectedBuffer
            }).compute(commandEncoder);

            this.selectedBuffer = null;
        }

        this.indexIfNeeded(commandEncoder);

        if (dt > 0) {
            this.acceleration.compute(commandEncoder, dt, radiusScaling);
            this.integration.compute(commandEncoder, dt);

            this.needsIndexing = true;

            this.indexIfNeeded(commandEncoder);
        }

        this.hover.compute(commandEncoder, [Math.random(), Math.random()]);
    }

    public setHover(hover: WebGPUBuffer) {
        this.hoverBuffer = hover;
    }

    public setSelected(selected: WebGPUBuffer) {
        this.selectedBuffer = selected;
    }

    public setForces(x: number[], y: number[]) {
        this.x = x;
        this.y = y;
        this.needsForceUpdate = true;
    }

    public setBounds(bounds: Float32Array) {
        this.bounds = bounds;
    }

    public setColor(color: WebGPUBuffer) {
        this.color = color;
    }

    public reinitialize(): void {
        this.needsInitialization = true;
    }

    public reset(data: Data): void {
        this.particlesBuffer.free();

        const resetResult = this.applyReset(data);
        this.particlesBuffer = resetResult.particlesBuffer;
        this.spheresRadius = data.spheresRadius;
        this.cellSize = resetResult.cellSize;
        this.gridSize = resetResult.gridSize;

        const particlesBufferData: ParticlesBufferData = {
            particlesBuffer: this.particlesBuffer,
            particlesCount: this.N,
            particlesStructType: Engine.particleStructType,
        };

        this.initialization.reset({
            particlesPositions: this.particlesPositions,
            particlesBufferData,
            indexBuffer: this.indexBuffer
        });

        this.indexing.reset({
            gridSize: this.gridSize,
            cellSize: this.cellSize,
            particlesBufferData,
            indexBuffer: this.indexBuffer
        });

        this.acceleration.reset({
            gridSize: this.gridSize,
            cellSize: this.cellSize,
            cellsBufferData: this.indexing.cellsBufferData,
            particlesBufferData,
            particleRadius: this.spheresRadius,
            indexBuffer: this.indexBuffer
        });
        this.integration.reset({
            particlesBufferData,
            particleRadius: this.spheresRadius,
        });

        this.needsInitialization = true;
        this.needsIndexing = true;
    }

    private applyReset(data: Data): ResetResult {
        const particlesBuffer = new WebGPU.Buffer(this.device, {
            size: Engine.particleStructType.size * (this.N + DYNAMIC_SIZE),
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });



        //const cellSize = Math.max(0.01, 2.05 * data.spheresRadius);
        const cellSize = Math.max(2.15 * data.spheresRadius, 2.05 * data.spheresRadius);

        const gridSize: glMatrix.vec2 = [Math.ceil(Engine.board_size / cellSize), Math.ceil(Engine.board_size / cellSize)];

        this.indexBuffer = new WebGPU.Buffer(this.device, {
            size: 4 * this.N,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE
        })

        this.mapXYBuffer = new WebGPU.Buffer(this.device, {
            size: Engine.particleStructType.size * this.N,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });

        return { particlesBuffer, cellSize, gridSize };
    }

    public static get cellBufferDescriptor(): CellsBufferDescriptor {
        return Indexing.cellsBufferDescriptor;
    }

    public get cellsBufferData(): CellsBufferData {
        return this.indexing.cellsBufferData;
    }

    public get nonEmptyCellsBuffers(): NonEmptyCellsBuffers {
        return this.indexing.nonEmptyCellsBuffers;
    }

    public get gridData(): GridData {
        return this.indexing.gridData;
    }

    private indexIfNeeded(commandEncoder: GPUCommandEncoder): void {
        if (this.needsIndexing) {
            this.indexing.compute(commandEncoder);
            this.needsIndexing = false;
        }
    }
}

export {
    Engine
};
export type {
    CellsBufferData,
    CellsBufferDescriptor,
    GridData,
    NonEmptyCellsBuffers, ParticlesBufferData,
};
