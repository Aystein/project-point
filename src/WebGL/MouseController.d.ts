import { DragEvent as GDragEvent } from './Commands';
declare enum Mode {
    None = 0,
    Pressed = 1,
    Drag = 2
}
export declare class MouseController {
    pressed: boolean[];
    pressedPosition: any;
    pressedButton: number;
    mode: Mode;
    private mousePosition;
    private prevX;
    private prevY;
    onDragStart: (event: GDragEvent, button: number, initial: any) => void;
    onDragEnd: (event: MouseEvent, button: number) => void;
    onDragMove: (event: GDragEvent, button: number) => void;
    onContext: (event: MouseEvent, button: number) => void;
    onMouseUp: (event: MouseEvent) => void;
    onMouseMove: (event: MouseEvent) => void;
    onMouseLeave: (event: MouseEvent) => void;
    onMouseWheel: (event: MouseEvent) => void;
    attachContext: {
        rootElement: HTMLElement;
        mouseDown: any;
        mouseLeave: any;
        mouseUp: any;
        mouseMove: any;
        mouseWheel: any;
    };
    get currentMousePosition(): {
        x: number;
        y: number;
    };
    attach(element: HTMLElement): void;
    detach(): void;
    mouseLeave(event: MouseEvent): void;
    mouseDown(event: MouseEvent): void;
    mouseUp(event: MouseEvent): void;
    mouseWheel(event: MouseEvent): void;
    mouseMove(event: MouseEvent): void;
}
export {};
