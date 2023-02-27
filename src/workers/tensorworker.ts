import * as tf from "@tensorflow/tfjs";
import { create } from "lodash";

import "@tensorflow/tfjs-backend-webgl";
await tf.setBackend("cpu");

self.onmessage = ({ data: { X, Y, D, N, type } }) => {
  if (type !== "init") {
    return;
  }

  // Define a model for linear regression.
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: Y.length / N, inputShape: [D] }));

  // Prepare the model for training: Specify the loss and the optimizer.
  model.compile({ loss: "meanSquaredError", optimizer: "sgd" });

  // Generate some synthetic data for training.
  const xs = tf.tensor2d(X, [N, D]);
  const ys = tf.tensor2d(Y, [N, Y.length / N]);

  // Train the model using the data.
  model.fit(xs, ys, { epochs: 200 }).then(() => {
    // Use the model to do inference on a data point the model hasn't seen before:
    // console.log(model.predict(tf.tensor2d([5], [1, 1])));
    self.postMessage({ type: "finish", model: model.toJSON() });
    console.log("FITTED");
  });
};

const model = tf.sequential();
model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

// Prepare the model for training: Specify the loss and the optimizer.
model.compile({ loss: "meanSquaredError", optimizer: "sgd" });

// Generate some synthetic data for training.
const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

// Train the model using the data.
model.fit(xs, ys).then(async () => {
  // Use the model to do inference on a data point the model hasn't seen before:
  // Open the browser devtools to see the output
  console.log(model.toJSON());
  const saveResult = await model.save("localstorage://nn");
    model.predict
  for (const d in model.nodesByDepth) {
    //console.log(model.getLayer().getConfig().);
  }
});
