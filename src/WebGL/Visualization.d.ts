import { Commands, LexicalCommand, CommandPayloadType, CommandListener, CommandListenerPriority } from './Commands';
export declare class Visualization {
    _commands: Commands;
    constructor();
    triggerCommandListeners<TCommand extends LexicalCommand<unknown>>(type: TCommand, payload: CommandPayloadType<TCommand>): boolean;
    dispatchCommand<TCommand extends LexicalCommand<unknown>>(type: TCommand, payload: CommandPayloadType<TCommand>): boolean;
    registerCommand<P>(command: LexicalCommand<P>, listener: CommandListener<P>, priority: CommandListenerPriority): () => void;
}
