/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*****************************!*\
  !*** ./src/workers/test.ts ***!
  \*****************************/
self.onmessage = function (_a) {
    var question = _a.data.question;
    self.postMessage({
        answer: 42
    });
};

/******/ })()
;
//# sourceMappingURL=src_workers_test_ts.js.map