/* eslint-disable no-restricted-globals */
import { forceNormalizationNew } from "../Layouts/ForceUtil";
import { POINT_RADIUS } from "../Layouts/Globals";
import { IRectangle } from "../WebGL/Math/Rectangle";
import { fillRect } from "./util";

type Commands = 'init' | 'fill_rect'

interface Props {
    data: {
        N: number;
        area: IRectangle;
        type: Commands;
        radius?: number;
    };
}

self.onmessage = ({
    data: { N, area, type, radius = POINT_RADIUS },
}: Props) => {
    /** Generate N points in a rectangle that has the same aspect ratio as the area */
    if (type === 'fill_rect') {
        const { Y } = fillRect(area, N, radius);

        self.postMessage({
            type: 'finish',
            Y,
        });
    }

}