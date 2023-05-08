import { Visualization } from "./Visualization";


export type CommandListener<P> = (payload: P, editor: Visualization) => boolean;

export type EditableListener = (editable: boolean) => void;

export type CommandListenerPriority = 0 | 1 | 2 | 3 | 4;

export const COMMAND_PRIORITY_EDITOR = 0;
export const COMMAND_PRIORITY_LOW = 1;
export const COMMAND_PRIORITY_NORMAL = 2;
export const COMMAND_PRIORITY_HIGH = 3;
export const COMMAND_PRIORITY_CRITICAL = 4;

export type LexicalCommand<TPayload> = {
   type?: string;
};

export type CommandPayloadType<TCommand extends LexicalCommand<unknown>> = TCommand extends LexicalCommand<infer TPayload> ? TPayload : never;
export type Commands = Map<
   LexicalCommand<unknown>, Array<Set<CommandListener<unknown>>>
>;

export interface DragEvent {
   movementX: number;
   movementY: number;
   offsetX: number;
   offsetY: number;
   button: number;
}

export const MOUSE_DRAG: LexicalCommand<MouseEvent> = { type: "mousedrag" };
export const MOUSE_DRAGGING: LexicalCommand<DragEvent> = { type: "mousedragging" };
export const MOUSE_DRAG_END: LexicalCommand<MouseEvent> = { type: "mousedraggingend" };
export const MOUSE_MOVE: LexicalCommand<MouseEvent> = { type: "mousemove" };
export const MOUSE_UP: LexicalCommand<MouseEvent> = { type: "mouseup" };
export const MOUSE_DOWN: LexicalCommand<MouseEvent> = { type: "mousedown" };
export const MOUSE_LEAVE: LexicalCommand<MouseEvent> = { type: "mouseleave" };

export const MOUSE_HOVER: LexicalCommand<MouseEvent> = { type: "mousehover" }
export const MOUSE_WHEEL: LexicalCommand<MouseEvent> = { type: 'wheel' }