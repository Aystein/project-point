/* eslint-disable no-restricted-globals */
import { forceNormalizationNew } from "../Layouts/ForceUtil";
import { POINT_RADIUS } from "../Layouts/Globals";
import { IRectangle } from "../WebGL/Math/Rectangle";

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
        const c = radius * 3;
        const A = c ** 2 * N;

        let aspectRatio = area.width / area.height;

        let h = Math.sqrt(A / aspectRatio);
        let w = A / h;

        w = Math.ceil(w / c);
        h = Math.ceil(h / c);

        const offX = area.x + area.width / 2 - (w / 2) * c;
        const offY = area.y + area.height / 2 - (h / 2) * c;

        const Y = Array.from({ length: N }).map((_, i) => ({ x: (i % w) * c, y: Math.floor(i / w) * c }))

        const [scaleX, scaleY, worldX, worldY, r] = forceNormalizationNew(area);

        self.postMessage({
            type: 'finish',
            Y: Y.map((value) => ({ x: offX + value.x, y: offY + value.y })),
        });
    }

}