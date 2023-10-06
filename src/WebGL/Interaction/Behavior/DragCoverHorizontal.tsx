import { IconArrowMoveRight, IconCircle } from '@tabler/icons-react';
import { scaleLinear } from 'd3-scale';
import * as React from 'react';
import { VectorLike } from '../../../Interfaces';
import { runForceLayout } from '../../../Layouts/Layouts';
import { changeSize, rerunLayouts, updatePositionByFilter } from '../../../Store/ViewSlice';
import { useAppDispatch, useAppSelector } from '../../../Store/hooks';
import { useVisContext } from '../../VisualizationContext';
import { SimpleDragCover } from './DragCover';

export function DragCoverHorizontal({ parentModel }: { parentModel }) {
    const [drag, setDrag] = React.useState<{
        direction: 'x' | 'y' | 'xy';
        position: VectorLike;
    }>();

    const dispatch = useAppDispatch();
    const positions = useAppSelector((state) => state.views.positions);
    const { scaledXDomain } = useVisContext();
    const [firstArea, setFirstArea] = React.useState(parentModel.area);

    return <SimpleDragCover
        setDrag={async (position) => {
            setDrag(position ? { position, direction: 'x' } : null);

            if (position) {
                setFirstArea(parentModel.area);
            }

            if (!position) {
                const rescale = scaleLinear().domain([firstArea.x, firstArea.x + firstArea.width]).range([0, 1])

                const Y_in = parentModel.filter.map((i) => positions[i]);

                const { Y } = await runForceLayout({
                    N: parentModel.filter.length,
                    area: parentModel.area,
                    axis: 'x',
                    Y_in,
                    X: Y_in.map((vec) => rescale(vec.x))
                });

                dispatch(rerunLayouts({ id: parentModel.id }))
                /**dispatch(
                    updatePositionByFilter({
                        position: Y,
                        filter: parentModel.filter,
                    })
                );**/
            }
        }}
        drag={drag?.direction === 'x' ? drag.position : null}
        onMove={(movement) => {
            dispatch(
                changeSize({
                    id: parentModel.id,
                    width:
                        parentModel.area.width +
                        (scaledXDomain.invert(movement.x) - scaledXDomain.invert(0)),
                    height: parentModel.area.height,
                })
            );
        }}
        style={{
            pointerEvents: 'initial',
            transform: 'translate(50%, 50%)',
            position: 'absolute',
            bottom: 0,
            right: 0,
        }}
        icon={<IconCircle />}
    />
}