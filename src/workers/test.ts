// import TSNE from "../WebAssembly/tsne.js";

const t = self;

t.onmessage = ({ data: { X, D, N, type } }) => {
  if (type !== "init") {
    return;
  }
  /** TSNE(undefined).then((module: EmscriptenModule) => {
    const newX = new Float64Array(
      module.HEAP8.buffer,
      module._malloc(N * 8 * D),
      N * D
    );
    newX.set(X);

    const Y = new Float64Array(
      module.HEAP8.buffer,
      module._malloc(N * 8 * 2),
      N * 2
    );
    //Y.set(new Array())

    // @ts-ignore
    var version = module.cwrap("version", "number", []);
    version(newX.byteOffset, N, Y.byteOffset, D);

    t.postMessage({ type: "finish", Y: Y.slice(0) });
  }); **/
};
