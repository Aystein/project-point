/* eslint-disable no-restricted-globals */
import { UMAP } from 'umap-js';
import * as d3 from 'd3-force';
import { scaleLinear } from 'd3-scale';
import { getBounds } from '../Util';

self.onmessage = ({ data: { X, D, N, area, type } }) => {
  if (type !== 'init') {
    return
  }

  self.postMessage({
    type: 'message',
    message: 'Calculating embedding ...',
  })

  const umap = new UMAP({
    nComponents: 2,
    nEpochs: 200,
    nNeighbors: 15,
  });
  const embedding = umap.fit(X);

  console.log(embedding)

  let Y = embedding.map((arr) => ({ x: arr[0], y: arr[1] }))
  
  // Apply force col´lision
  var width = 300, height = 300
  let nodes = Y.map((y) => ({ x: y.x, y: y.y }))
  console.log(nodes)
  
  const embeddingBounds = getBounds(Y)

  const scaleX = scaleLinear()
  .domain([embeddingBounds.minX, embeddingBounds.maxX])
  .range([
    area.x + area.width * 0.01,
    area.x + area.width * 0.99,
  ])
  const scaleY = scaleLinear()
    .domain([embeddingBounds.minY, embeddingBounds.maxY])
    .range([
      area.y + area.height * 0.01,
      area.y + area.height * 0.99,
    ])

  Y = Y.map((value) => ({ x: scaleX(value.x), y: scaleY(value.y) }))

  self.postMessage({
    type: 'message',
    message: 'Force layout ...',
  })

  var simulation = d3.forceSimulation(nodes)
    .force('collision', d3.forceCollide().radius(function(d) {
      return 0.006
    }))
    .force('x', d3.forceX().x(function(d) {
      return Y[d.index].x;
    }))
    .force('y', d3.forceY().y(function(d) {
      return Y[d.index].y;
    }))
    .stop();
  
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
      simulation.tick();
    }

    const t0 = performance.now()
    for (var i = 0; i < 60; ++i) {
      simulation.tick();
    }
    const t1 = performance.now()

    console.log(`Force layout run for ${(t1 - t0) / 1000} seconds`)
  

  self.postMessage({
    type: 'finish',
    Y: simulation.nodes().map((node) => ({ x: node.x, y: node.y })),
  })
}
