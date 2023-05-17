import * as React from 'react';
import {
  LexicalCommand,
  CommandListener
} from '../Commands';
import { useVisContext } from '../VisualizationContext';


export function useMouseDrag<T>(
  command: LexicalCommand<T>,
  callback: CommandListener<T>,
  deps: React.DependencyList
) {
  const { vis } = useVisContext();

  React.useEffect(() => {
    return vis.registerCommand(command, callback, 1);
  }, deps);
}
