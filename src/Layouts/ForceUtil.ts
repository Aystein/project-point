import { ScaleLinear, scaleLinear } from 'd3-scale';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { Simulation, SimulationLinkDatum } from 'd3-force';
import { POINT_RADIUS } from './Globals';

export function forceNormalizationNew(
  area: IRectangle
): [
  ScaleLinear<number, number>,
  ScaleLinear<number, number>,
  ScaleLinear<number, number>,
  ScaleLinear<number, number>,
  number
] {
  const factor = 500 / area.width;

  const scaleX = scaleLinear()
    .domain([0, 1])
    .range([0, area.width * factor]);

  const scaleY = scaleLinear()
    .domain([0, 1])
    .range([0, area.height * factor]);

  const worldX = scaleLinear()
    .domain([0, 1])
    .range([area.x + area.width * 0.01, area.x + area.width * 0.99]);

  const worldY = scaleLinear()
    .domain([0, 1])
    .range([area.y + area.height * 0.01, area.y + area.height * 0.99]);

  return [scaleX, scaleY, worldX, worldY, POINT_RADIUS * factor];
}

export function forceNormalization(
  area: IRectangle
): [ScaleLinear<number, number>, ScaleLinear<number, number>, number] {
  const factor = 500 / area.width;

  const scaleX = scaleLinear()
    .domain([area.x, area.x + area.width])
    .range([0, area.width * factor]);

  const scaleY = scaleLinear()
    .domain([area.y, area.y + area.height])
    .range([0, area.height * factor]);

  return [scaleX, scaleY, POINT_RADIUS * factor];
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
