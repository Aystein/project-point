/* eslint-disable no-restricted-globals */
import { IRectangle } from '../WebGL/Math/Rectangle';
import { forceNormalizationNew, scaleToWorld } from '../Layouts/ForceUtil';
import { LabelContainer } from '../Store/interfaces';
import { VectorLike } from '../Interfaces';

interface Props {
  data: {
    n: number;
    area: IRectangle;
    axis: 'x' | 'y' | 'xy';
    type: string;
    X: VectorLike[];
  };
}

self.onmessage = ({
  data: { n, area, type, axis, X },
}: Props) => {
  if (type !== 'init') {
    return;
  }

  //const [worldX, worldY] = scaleToWorld(area);
  const [a, b, worldX, worldY, r] = forceNormalizationNew(area);

  const labels: LabelContainer[] = [{
    discriminator: 'positionedlabels',
    type: axis === 'x' ? 'x' : 'y',
    labels: [],
  }];

  self.postMessage({
    type: 'finish',
    Y: X.map((node, i) => ({ x: axis !== 'y' ? worldX(0.5) : X[i].x, y: axis !== 'x' ? worldY(0.5) : X[i].y })),
    labels,
  });
};