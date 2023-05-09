import * as React from 'react'
import {
    LexicalCommand,
    CommandListener,
    MOUSE_DRAG,
    MOUSE_DRAGGING,
    MOUSE_DRAG_END
} from '../Commands'
import { useVisContext } from '../VisualizationContext'
import { Rectangle } from '../Math/Rectangle'

export function useMouseEvent<T>(
    command: LexicalCommand<T>,
    callback: CommandListener<T>,
    deps: React.DependencyList
) {
    const { vis } = useVisContext()

    React.useEffect(() => {
        return vis.registerCommand(command, callback, 1)
    }, deps)
}

export function BoxBehavior() {
    const { vis } = useVisContext()

    const [rect, setRect] = React.useState<Rectangle>()

    // register to mousedrag...
    useMouseEvent(
        MOUSE_DRAG,
        (event) => {
            setRect(new Rectangle(event.offsetX, event.offsetY, 0, 0))
            return true
        },
        []
    )

    useMouseEvent(
        MOUSE_DRAGGING,
        (event) => {
            setRect((value) => {
                return new Rectangle(
                    value.x,
                    value.y,
                    event.offsetX - value.x,
                    event.offsetY - value.y
                )
            })
            return true
        },
        [rect, setRect]
    )

    useMouseEvent(
        MOUSE_DRAG_END,
        (event) => {
            return false
        },
        []
    )

    return (
        <div
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
            }}
        >
            {rect ? (
                <div
                    style={{
                        position: 'absolute',
                        left: rect.x,
                        top: rect.y,
                        width: rect.width,
                        height: rect.height,
                        background: 'red',
                        opacity: 0.5,
                        border: '3px solid black',
                    }}
                ></div>
            ) : null}
        </div>
    )
}
