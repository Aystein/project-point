import { POINT_RADIUS } from "../Layouts/Globals";
import { IRectangle } from "../WebGL/Math/Rectangle";

export function UpdateText(self: Window, value: string) {
  self.postMessage({
    type: 'message',
    message: 'Calculating embedding ...',
  });
}




export function fillRect(area: IRectangle, N: number, radius = POINT_RADIUS) {
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
  return Y.map((value) => ({ x: offX + value.x, y: offY + value.y }));
}