import React from "react";
import ReactDOM from "react-dom";

ReactDOM.render(
  <React.StrictMode>
    <div>HELLO TEST</div>
  </React.StrictMode>,
  document.getElementById("root") as HTMLElement
);

const worker = new Worker(new URL("./workers/test.ts", import.meta.url));
worker.postMessage({
  question:
    "The Answer to the Ultimate Question of Life, The Universe, and Everything.",
});
worker.onmessage = ({ data: { answer } }) => {
  console.log(answer);
};

export * from "./calculator";
