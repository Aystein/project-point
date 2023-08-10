import * as glMatrix from "gl-matrix";
import * as WebGPU from "../webgpu-utils/webgpu-utils";
import { CellsBufferData, CellsBufferDescriptor, GridData, Indexing, NonEmptyCellsBuffers } from "./indexing/indexing";
import { Acceleration } from "./simulation/acceleration";
import { Initialization } from "./simulation/initialization";
import { Integration } from "./simulation/integration";
import { SetPositions } from "./simulation/SetPositions";
import { SetSelection } from "./simulation/SetSelection";

type Data = {
    spheresRadius: number;
    particlesPositions: ReadonlyArray<glMatrix.ReadonlyVec2>
};

type SpheresBuffer = {
    readonly gpuBuffer: GPUBuffer;
    readonly instancesCount: number;
    readonly sphereRadius: number;
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
        { name: "weight", type: WebGPU.Types.f32 },
        { name: "velocity", type: WebGPU.Types.vec2F32 },
        { name: "acceleration", type: WebGPU.Types.vec2F32 },
        { name: "indexInCell", type: WebGPU.Types.u32 },
        { name: "index", type: WebGPU.Types.u32 },
        { name: "force", type: WebGPU.Types.vec2F32 },
        { name: "selected", type: WebGPU.Types.u32 },
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

    private needsSelected = false
    private selected: number[]

    private needsForceUpdate: boolean = false;
    private x: number[]
    private y: number[]

    public static board_size = 20;
    private particlesPositions: Data['particlesPositions']
    public id = Math.random();

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

        this.initialization = new Initialization(this.device, {
            particlesPositions: this.particlesPositions,
            particlesBufferData,
        });

        this.indexing = new Indexing(this.device, {
            gridSize: this.gridSize,
            cellSize: this.cellSize,
            particlesBufferData,
        });

        this.acceleration = new Acceleration(this.device, {
            gridSize: this.gridSize,
            cellSize: this.cellSize,
            cellsBufferData: this.indexing.cellsBufferData,
            particlesBufferData,
            particleRadius: this.spheresRadius,
            weightThreshold: Engine.getMaxWeight(),
        });

        this.integration = new Integration(this.device, {
            particlesBufferData,
            particleRadius: this.spheresRadius,
            weightThreshold: Engine.getMaxWeight(),
        });
    }

    

    public compute(commandEncoder: GPUCommandEncoder, dt: number, gravity: glMatrix.ReadonlyVec2): void {
        if (this.needsInitialization) {
            this.initialization.compute(commandEncoder);
            this.needsInitialization = false;
            this.needsIndexing = true;
        }

        if (this.needsForceUpdate) {
            new SetPositions(this.device, {
                particlesPositions: Array.from({length: this.N}).map((_, i) => ([this.x[i], this.y[i]])),
                particlesBufferData: {
                    particlesBuffer: this.particlesBuffer,
                    particlesCount: this.N,
                    particlesStructType: Engine.particleStructType,
                },
            }).compute(commandEncoder);

            this.needsForceUpdate = false;
        }

        

        if (this.needsSelected) {
            new SetSelection(this.device, {
                particlesPositions: this.selected,
                particlesBufferData: {
                    particlesBuffer: this.particlesBuffer,
                    particlesCount: this.N,
                    particlesStructType: Engine.particleStructType,
                }
            }).compute(commandEncoder);

            this.needsSelected = false;
        }

       this.indexIfNeeded(commandEncoder);

        if (dt > 0) {
            this.acceleration.compute(commandEncoder, dt, gravity);
            this.integration.compute(commandEncoder, dt);

            this.needsIndexing = true;

           this.indexIfNeeded(commandEncoder);
        }
    }

    public setSelection(selected: number[]) {
        this.needsSelected = true;
        this.selected = selected;
    }

    public setForces(x: number[], y: number[]) {
        this.x = x;
        this.y = y;
        this.needsForceUpdate = true;
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
        });

        this.indexing.reset({
            gridSize: this.gridSize,
            cellSize: this.cellSize,
            particlesBufferData,
        });

        this.acceleration.reset({
            gridSize: this.gridSize,
            cellSize: this.cellSize,
            cellsBufferData: this.indexing.cellsBufferData,
            particlesBufferData,
            particleRadius: this.spheresRadius,
            weightThreshold: Engine.getMaxWeight(),
        });
        this.integration.reset({
            particlesBufferData,
            particleRadius: this.spheresRadius,
            weightThreshold: Engine.getMaxWeight(),
        });

        this.needsInitialization = true;
        this.needsIndexing = true;
    }

    private applyReset(data: Data): ResetResult {
        const particlesBuffer = new WebGPU.Buffer(this.device, {
            size: Engine.particleStructType.size * this.N,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
        });

        const cellSize = Math.max(0.01, 2.05 * data.spheresRadius);
        const gridSize: glMatrix.vec2 = [Math.ceil(Engine.board_size / cellSize), Math.ceil(Engine.board_size / cellSize)];

        return { particlesBuffer, cellSize, gridSize };
    }

    public static getMaxWeight(): number {
        return Initialization.PARTICLE_WEIGHT_THRESHOLD;
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

    public get spheresBuffer(): SpheresBuffer {
        return {
            gpuBuffer: this.particlesBuffer.gpuBuffer,
            instancesCount: this.N,
            sphereRadius: this.spheresRadius,
        };
    }

    private indexIfNeeded(commandEncoder: GPUCommandEncoder): void {
        if (this.needsIndexing) {
            this.indexing.compute(commandEncoder);
            this.needsIndexing = false;
        }
    }
}

export type {
    ParticlesBufferData,
    CellsBufferData,
    CellsBufferDescriptor,
    GridData,
    NonEmptyCellsBuffers,
    SpheresBuffer,
};
export {
    Engine,
};