import { IconArrowMoveUp } from '@tabler/icons-react';
import * as React from 'react';
import { VectorLike } from '../../../Interfaces';
import { changeSize } from '../../../Store/ViewSlice';
import { useAppDispatch } from '../../../Store/hooks';
import { useVisContext } from '../../VisualizationContext';
import { SimpleDragCover } from './DragCover';

export function DragCoverVertical({ parentModel }: { parentModel }) {
    const [drag, setDrag] = React.useState<{
        direction: 'x' | 'y' | 'xy';
        position: VectorLike;
    }>();

    const dispatch = useAppDispatch();
    const { scaledYDomain } = useVisContext();

    return <SimpleDragCover
        onMove={(movement) => {
            dispatch(
                changeSize({
                    id: parentModel.id,
                    height:
                        parentModel.area.height +
                        (scaledYDomain.invert(movement.y) - scaledYDomain.invert(0)),
                    width: parentModel.area.width,
                })
            );
        }}
        style={{
            pointerEvents: 'initial',
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            left: 0,
            top: 0,
        }}
        icon={<IconArrowMoveUp />}
        setDrag={(position) => {
            setDrag(position ? { position, direction: 'y' } : null);
        }}
        drag={drag?.direction === 'y' ? drag.position : null}
    />
}