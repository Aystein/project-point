self.onmessage = () => {
    self.postMessage({ type: "finish" });
};