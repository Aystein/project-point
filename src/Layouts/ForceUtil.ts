import { ScaleLinear, scaleLinear } from 'd3-scale';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { Simulation, SimulationLinkDatum } from 'd3-force';

export function forceNormalization(area: IRectangle): [ScaleLinear<number, number>, ScaleLinear<number, number>, number] {
  const factor = 500 / area.width;

  const scaleX = scaleLinear()
    .domain([area.x, area.x + area.width])
    .range([area.x, area.x + area.width * factor]);

  const scaleY = scaleLinear()
    .domain([area.y, area.y + area.height])
    .range([area.y, area.y + area.height * factor]);

  return [scaleX, scaleY, 0.006 * factor];
}

export function convergeLayout<A, B extends SimulationLinkDatum<A>>(
  simulation: Simulation<A, B>
) {
  for (
    var i = 0,
      n = Math.ceil(
        Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
      );
    i < n;
    ++i
  ) {
    // console.log("TICK")
    simulation.tick();
  }
}
