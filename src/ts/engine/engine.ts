import * as glMatrix from "gl-matrix";
import * as WebGPU from "../webgpu-utils/webgpu-utils";
import { CellsBufferData, CellsBufferDescriptor, GridData, Indexing, NonEmptyCellsBuffers } from "./indexing/indexing";
import { FillableMesh } from "./initial-conditions/fillable-mesh";
import { InitialPositions } from "./initial-conditions/initial-positions";
import { Mesh } from "./initial-conditions/models/mesh";
import { Acceleration } from "./simulation/acceleration";
import { Initialization } from "./simulation/initialization";
import { Integration } from "./simulation/integration";
import { createQuadBuffer } from "../../Scatter/Util";

type Data = {
    particlesContainerMesh: Mesh;
    obstaclesMesh: Mesh | null;
    spheresRadius: number;
};

type SpheresBufferDescriptor = {
    readonly positionAttribute: WebGPU.Types.VertexAttribute;
    readonly weightAttribute: WebGPU.Types.VertexAttribute;
    readonly foamAttribute: WebGPU.Types.VertexAttribute;
    readonly bufferArrayStride: number;
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
    particlesCount: number;

    particlesPositions: glMatrix.vec3[];

    cellSize: number;
    gridSize: glMatrix.ReadonlyVec2;
};

class Engine {
    public static readonly particleStructType = new WebGPU.Types.StructType("Particle", [
        { name: "position", type: WebGPU.Types.vec2F32 },
        { name: "weight", type: WebGPU.Types.f32 },
        { name: "velocity", type: WebGPU.Types.vec2F32 },
        { name: "foam", type: WebGPU.Types.f32 },
        { name: "acceleration", type: WebGPU.Types.vec2F32 },
        { name: "indexInCell", type: WebGPU.Types.u32 },
        { name: "forceX", type: WebGPU.Types.vec2F32 },
        { name: "forceY", type: WebGPU.Types.vec2F32 }
    ]);

    public static readonly spheresBufferDescriptor: SpheresBufferDescriptor = {
        positionAttribute: Engine.particleStructType.asVertexAttribute("position"),
        weightAttribute: Engine.particleStructType.asVertexAttribute("weight"),
        foamAttribute: Engine.particleStructType.asVertexAttribute("foam"),
        bufferArrayStride: Engine.particleStructType.size,
    };

    private readonly device: GPUDevice;

    public particlesBuffer: WebGPU.Buffer;
    private particlesCount: number;

    private spheresRadius: number;
    private cellSize: number;
    private gridSize: glMatrix.ReadonlyVec2;

    private readonly initialization: Initialization;
    private needsInitialization: boolean;

    private readonly acceleration: Acceleration;
    private readonly integration: Integration;

    private readonly indexing: Indexing;
    private needsIndexing: boolean;

    public static board_size = 5;

    public constructor(device: GPUDevice, protected N: number, data: Data) {
        this.device = device;

        const resetResult = this.applyReset(data);
        this.particlesBuffer = resetResult.particlesBuffer;
        this.particlesCount = resetResult.particlesCount;
        this.spheresRadius = data.spheresRadius;
        this.cellSize = resetResult.cellSize;
        this.gridSize = resetResult.gridSize;

        const particlesBufferData: ParticlesBufferData = {
            particlesBuffer: this.particlesBuffer,
            particlesCount: this.particlesCount,
            particlesStructType: Engine.particleStructType,
        };

        this.initialization = new Initialization(this.device, {
            particlesPositions: resetResult.particlesPositions,
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

        this.needsInitialization = true;
        this.needsIndexing = true;
    }

    public compute(commandEncoder: GPUCommandEncoder, dt: number, gravity: glMatrix.ReadonlyVec2): void {
        if (this.needsInitialization) {
            this.initialization.compute(commandEncoder);
            this.needsInitialization = false;
            this.needsIndexing = true;
        }

        this.indexIfNeeded(commandEncoder);

        if (dt > 0) {
            this.acceleration.compute(commandEncoder, dt, gravity);
            this.integration.compute(commandEncoder, dt);

            this.needsIndexing = true;

            this.indexIfNeeded(commandEncoder);
        }
    }

    public render(device: GPUDevice, encoder: GPUCommandEncoder, context: GPUCanvasContext) {
        context.configure({
            device,
            format: navigator.gpu.getPreferredCanvasFormat(),
            // alphaMode: 'opaque',
            alphaMode: 'premultiplied',
        });
        device.createShaderModule({
            code: '',
        })
        const pass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: context.getCurrentTexture().createView(), // this.sampleTexture.createView(),
                    // resolveTarget: context.getCurrentTexture().createView(),
                    clearValue: [1, 0, 0, 1],
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        });

        pass.end();
    }

    public reinitialize(): void {
        this.needsInitialization = true;
    }

    public reset(data: Data): void {
        this.particlesBuffer.free();

        const resetResult = this.applyReset(data);
        this.particlesBuffer = resetResult.particlesBuffer;
        this.particlesCount = resetResult.particlesCount;
        this.spheresRadius = data.spheresRadius;
        this.cellSize = resetResult.cellSize;
        this.gridSize = resetResult.gridSize;

        const particlesBufferData: ParticlesBufferData = {
            particlesBuffer: this.particlesBuffer,
            particlesCount: this.particlesCount,
            particlesStructType: Engine.particleStructType,
        };

        this.initialization.reset({
            particlesPositions: resetResult.particlesPositions,
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
        const particlesPositions = Array.from({length: this.N}).map(() => ([Math.random(), Math.random()]));

        const particlesCount = particlesPositions.length;
        const particlesBuffer = new WebGPU.Buffer(this.device, {
            size: Engine.particleStructType.size * particlesCount,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
        });

        const cellSize = Math.max(0.01, 2.05 * data.spheresRadius);
        const gridSize: glMatrix.vec2 = [Math.ceil(Engine.board_size / cellSize), Math.ceil(Engine.board_size / cellSize)];

        console.log(data.spheresRadius, cellSize, gridSize);

        return { particlesBuffer, particlesCount, particlesPositions, cellSize, gridSize };
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
            instancesCount: this.particlesCount,
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
    SpheresBufferDescriptor,
};
export {
    Engine,
};