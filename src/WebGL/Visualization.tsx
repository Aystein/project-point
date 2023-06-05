import {
  Commands,
  LexicalCommand,
  CommandPayloadType,
  CommandListener,
  CommandListenerPriority,
} from './Interaction/Commands'

export class Visualization {
  _commands: Commands

  constructor() {
    this._commands = new Map()
  }

  triggerCommandListeners<TCommand extends LexicalCommand<unknown>>(
    type: TCommand,
    payload: CommandPayloadType<TCommand>
  ): boolean {
    for (let i = 4; i >= 0; i--) {
      const commandListeners = this._commands
      const listenerInPriorityOrder = commandListeners.get(type)

      if (listenerInPriorityOrder !== undefined) {
        const listenersSet = listenerInPriorityOrder[i]

        if (listenersSet !== undefined) {
          const listeners = Array.from(listenersSet)
          const listenersLength = listeners.length

          for (let j = 0; j < listenersLength; j++) {
            if (listeners[j](payload, this) === true) {
              return true
            }
          }
        }
      }
    }

    return false
  }

  dispatchCommand<TCommand extends LexicalCommand<unknown>>(
    type: TCommand,
    payload: CommandPayloadType<TCommand>
  ): boolean {
    return this.triggerCommandListeners(type, payload)
  }

  registerCommand<P>(
    command: LexicalCommand<P>,
    listener: CommandListener<P>,
    priority: CommandListenerPriority
  ): () => void {
    if (priority === undefined) {
      //invariant(false, 'Listener for type "command" requires a "priority".');
    }

    const commandsMap = this._commands

    if (!commandsMap.has(command)) {
      commandsMap.set(command, [
        new Set(),
        new Set(),
        new Set(),
        new Set(),
        new Set(),
      ])
    }

    const listenersInPriorityOrder = commandsMap.get(command)

    if (listenersInPriorityOrder === undefined) {
      /**invariant(
             false,
             'registerCommand: Command %s not found in command map',
             String(command),
           );**/
    }

    const listeners = listenersInPriorityOrder[priority]
    listeners.add(listener as CommandListener<unknown>)
    return () => {
      listeners.delete(listener as CommandListener<unknown>)

      if (
        listenersInPriorityOrder.every(
          (listenersSet) => listenersSet.size === 0
        )
      ) {
        commandsMap.delete(command)
      }
    }
  }
}
