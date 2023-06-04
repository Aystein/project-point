import * as React from 'react';
import { LexicalCommand, CommandListener, CommandListenerPriority } from '../Commands';
export declare function useMouseEvent<T>(command: LexicalCommand<T>, callback: CommandListener<T>, priority: CommandListenerPriority, deps: React.DependencyList): void;
