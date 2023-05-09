/* eslint-disable no-restricted-globals */
import TSNE from 'tsne-js';

self.onmessage = ({ data: { X, D, N, type } }) => {
  if (type !== "init") {
    return;
  }

  let model = new TSNE({
    dim: 2,
    perplexity: 30.0,
    earlyExaggeration: 4.0,
    learningRate: 50.0,
    nIter: 400,
    metric: 'euclidean'
  });

  model.init({
    data: X,
    type: 'dense'
  });

  let [error, iter] = model.run();
  
  let outputScaled = model.getOutputScaled();

  self.postMessage({
    type: 'finish',
    Y: outputScaled.map((arr) => ({ x: arr[0], y: arr[1] }))
  })
};
