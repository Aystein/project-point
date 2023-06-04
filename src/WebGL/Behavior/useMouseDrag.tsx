import * as React from 'react';
import {
  LexicalCommand,
  CommandListener,
  CommandListenerPriority
} from '../Commands';
import { useVisContext } from '../VisualizationContext';


export function useMouseEvent<T>(
  command: LexicalCommand<T>,
  callback: CommandListener<T>,
  priority: CommandListenerPriority,
  deps: React.DependencyList
) {
  const { vis } = useVisContext();

  React.useEffect(() => {
    return vis.registerCommand(command, callback, priority);
  }, deps);
}
