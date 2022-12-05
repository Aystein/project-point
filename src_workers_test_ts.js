/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/tsne.js":
/*!*********************!*\
  !*** ./src/tsne.js ***!
  \*********************/
/***/ ((module) => {


var Module = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(Module) {
  Module = Module || {};

var Module = typeof Module != "undefined" ? Module : {};

var readyPromiseResolve, readyPromiseReject;

Module["ready"] = new Promise(function(resolve, reject) {
 readyPromiseResolve = resolve;
 readyPromiseReject = reject;
});

[ "_main", "_version", "_fflush", "onRuntimeInitialized" ].forEach(prop => {
 if (!Object.getOwnPropertyDescriptor(Module["ready"], prop)) {
  Object.defineProperty(Module["ready"], prop, {
   get: () => abort("You are getting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),
   set: () => abort("You are setting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")
  });
 }
});

var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
 throw toThrow;
};

var ENVIRONMENT_IS_WEB = false;

var ENVIRONMENT_IS_WORKER = true;

var ENVIRONMENT_IS_NODE = false;

var ENVIRONMENT_IS_SHELL = false;

if (Module["ENVIRONMENT"]) {
 throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
}

var scriptDirectory = "";

function locateFile(path) {
 if (Module["locateFile"]) {
  return Module["locateFile"](path, scriptDirectory);
 }
 return scriptDirectory + path;
}

var read_, readAsync, readBinary, setWindowTitle;

function logExceptionOnExit(e) {
 if (e instanceof ExitStatus) return;
 let toLog = e;
 if (e && typeof e == "object" && e.stack) {
  toLog = [ e, e.stack ];
 }
 err("exiting due to exception: " + toLog);
}

if (ENVIRONMENT_IS_SHELL) {
 if (typeof process == "object" && "function" === "function" || typeof window == "object" || typeof importScripts == "function") throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
 if (typeof read != "undefined") {
  read_ = function shell_read(f) {
   return read(f);
  };
 }
 readBinary = function readBinary(f) {
  let data;
  if (typeof readbuffer == "function") {
   return new Uint8Array(readbuffer(f));
  }
  data = read(f, "binary");
  assert(typeof data == "object");
  return data;
 };
 readAsync = function readAsync(f, onload, onerror) {
  setTimeout(() => onload(readBinary(f)), 0);
 };
 if (typeof scriptArgs != "undefined") {
  arguments_ = scriptArgs;
 } else if (typeof arguments != "undefined") {
  arguments_ = arguments;
 }
 if (typeof quit == "function") {
  quit_ = (status, toThrow) => {
   logExceptionOnExit(toThrow);
   quit(status);
  };
 }
 if (typeof print != "undefined") {
  if (typeof console == "undefined") console = {};
  console.log = print;
  console.warn = console.error = typeof printErr != "undefined" ? printErr : print;
 }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = self.location.href;
 } else if (typeof document != "undefined" && document.currentScript) {
  scriptDirectory = document.currentScript.src;
 }
 if (_scriptDir) {
  scriptDirectory = _scriptDir;
 }
 if (scriptDirectory.indexOf("blob:") !== 0) {
  scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
 } else {
  scriptDirectory = "";
 }
 if (!(typeof window == "object" || typeof importScripts == "function")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
 {
  read_ = url => {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", url, false);
   xhr.send(null);
   return xhr.responseText;
  };
  if (ENVIRONMENT_IS_WORKER) {
   readBinary = url => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.responseType = "arraybuffer";
    xhr.send(null);
    return new Uint8Array(xhr.response);
   };
  }
  readAsync = (url, onload, onerror) => {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", url, true);
   xhr.responseType = "arraybuffer";
   xhr.onload = () => {
    if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
     onload(xhr.response);
     return;
    }
    onerror();
   };
   xhr.onerror = onerror;
   xhr.send(null);
  };
 }
 setWindowTitle = title => document.title = title;
} else {
 throw new Error("environment detection error");
}

var out = Module["print"] || console.log.bind(console);

var err = Module["printErr"] || console.warn.bind(console);

Object.assign(Module, moduleOverrides);

moduleOverrides = null;

checkIncomingModuleAPI();

if (Module["arguments"]) arguments_ = Module["arguments"];

legacyModuleProp("arguments", "arguments_");

if (Module["thisProgram"]) thisProgram = Module["thisProgram"];

legacyModuleProp("thisProgram", "thisProgram");

if (Module["quit"]) quit_ = Module["quit"];

legacyModuleProp("quit", "quit_");

assert(typeof Module["memoryInitializerPrefixURL"] == "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["pthreadMainPrefixURL"] == "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["cdInitializerPrefixURL"] == "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["filePackagePrefixURL"] == "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["read"] == "undefined", "Module.read option was removed (modify read_ in JS)");

assert(typeof Module["readAsync"] == "undefined", "Module.readAsync option was removed (modify readAsync in JS)");

assert(typeof Module["readBinary"] == "undefined", "Module.readBinary option was removed (modify readBinary in JS)");

assert(typeof Module["setWindowTitle"] == "undefined", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)");

assert(typeof Module["TOTAL_MEMORY"] == "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");

legacyModuleProp("read", "read_");

legacyModuleProp("readAsync", "readAsync");

legacyModuleProp("readBinary", "readBinary");

legacyModuleProp("setWindowTitle", "setWindowTitle");

var IDBFS = "IDBFS is no longer included by default; build with -lidbfs.js";

var PROXYFS = "PROXYFS is no longer included by default; build with -lproxyfs.js";

var WORKERFS = "WORKERFS is no longer included by default; build with -lworkerfs.js";

var NODEFS = "NODEFS is no longer included by default; build with -lnodefs.js";

assert(!ENVIRONMENT_IS_WEB, "web environment detected but not enabled at build time.  Add 'web' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_NODE, "node environment detected but not enabled at build time.  Add 'node' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");

var STACK_ALIGN = 16;

var POINTER_SIZE = 4;

function getNativeTypeSize(type) {
 switch (type) {
 case "i1":
 case "i8":
 case "u8":
  return 1;

 case "i16":
 case "u16":
  return 2;

 case "i32":
 case "u32":
  return 4;

 case "i64":
 case "u64":
  return 8;

 case "float":
  return 4;

 case "double":
  return 8;

 default:
  {
   if (type[type.length - 1] === "*") {
    return POINTER_SIZE;
   }
   if (type[0] === "i") {
    const bits = Number(type.substr(1));
    assert(bits % 8 === 0, "getNativeTypeSize invalid bits " + bits + ", type " + type);
    return bits / 8;
   }
   return 0;
  }
 }
}

function legacyModuleProp(prop, newName) {
 if (!Object.getOwnPropertyDescriptor(Module, prop)) {
  Object.defineProperty(Module, prop, {
   configurable: true,
   get: function() {
    abort("Module." + prop + " has been replaced with plain " + newName + " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
   }
  });
 }
}

function ignoredModuleProp(prop) {
 if (Object.getOwnPropertyDescriptor(Module, prop)) {
  abort("`Module." + prop + "` was supplied but `" + prop + "` not included in INCOMING_MODULE_JS_API");
 }
}

function isExportedByForceFilesystem(name) {
 return name === "FS_createPath" || name === "FS_createDataFile" || name === "FS_createPreloadedFile" || name === "FS_unlink" || name === "addRunDependency" || name === "FS_createLazyFile" || name === "FS_createDevice" || name === "removeRunDependency";
}

function missingLibrarySymbol(sym) {
 if (typeof globalThis !== "undefined" && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
  Object.defineProperty(globalThis, sym, {
   configurable: true,
   get: function() {
    var msg = "`" + sym + "` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line";
    if (isExportedByForceFilesystem(sym)) {
     msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
    }
    warnOnce(msg);
    return undefined;
   }
  });
 }
}

function unexportedRuntimeSymbol(sym) {
 if (!Object.getOwnPropertyDescriptor(Module, sym)) {
  Object.defineProperty(Module, sym, {
   configurable: true,
   get: function() {
    var msg = "'" + sym + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
    if (isExportedByForceFilesystem(sym)) {
     msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
    }
    abort(msg);
   }
  });
 }
}

var tempRet0 = 0;

var setTempRet0 = value => {
 tempRet0 = value;
};

var getTempRet0 = () => tempRet0;

var wasmBinary;

if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];

legacyModuleProp("wasmBinary", "wasmBinary");

var noExitRuntime = Module["noExitRuntime"] || true;

legacyModuleProp("noExitRuntime", "noExitRuntime");

if (typeof WebAssembly != "object") {
 abort("no native wasm support detected");
}

var wasmMemory;

var ABORT = false;

var EXITSTATUS;

function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed" + (text ? ": " + text : ""));
 }
}

function _free() {
 abort("free() called but not included in the build - add '_free' to EXPORTED_FUNCTIONS");
}

var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
 idx >>>= 0;
 var endIdx = idx + maxBytesToRead;
 var endPtr = idx;
 while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
 if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
  return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
 }
 var str = "";
 while (idx < endPtr) {
  var u0 = heapOrArray[idx++];
  if (!(u0 & 128)) {
   str += String.fromCharCode(u0);
   continue;
  }
  var u1 = heapOrArray[idx++] & 63;
  if ((u0 & 224) == 192) {
   str += String.fromCharCode((u0 & 31) << 6 | u1);
   continue;
  }
  var u2 = heapOrArray[idx++] & 63;
  if ((u0 & 240) == 224) {
   u0 = (u0 & 15) << 12 | u1 << 6 | u2;
  } else {
   if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte 0x" + u0.toString(16) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!");
   u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
  }
  if (u0 < 65536) {
   str += String.fromCharCode(u0);
  } else {
   var ch = u0 - 65536;
   str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
  }
 }
 return str;
}

function UTF8ToString(ptr, maxBytesToRead) {
 ptr >>>= 0;
 return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
 outIdx >>>= 0;
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) {
   var u1 = str.charCodeAt(++i);
   u = 65536 + ((u & 1023) << 10) | u1 & 1023;
  }
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   heap[outIdx++ >>> 0] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   heap[outIdx++ >>> 0] = 192 | u >> 6;
   heap[outIdx++ >>> 0] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   heap[outIdx++ >>> 0] = 224 | u >> 12;
   heap[outIdx++ >>> 0] = 128 | u >> 6 & 63;
   heap[outIdx++ >>> 0] = 128 | u & 63;
  } else {
   if (outIdx + 3 >= endIdx) break;
   if (u > 1114111) warnOnce("Invalid Unicode code point 0x" + u.toString(16) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
   heap[outIdx++ >>> 0] = 240 | u >> 18;
   heap[outIdx++ >>> 0] = 128 | u >> 12 & 63;
   heap[outIdx++ >>> 0] = 128 | u >> 6 & 63;
   heap[outIdx++ >>> 0] = 128 | u & 63;
  }
 }
 heap[outIdx >>> 0] = 0;
 return outIdx - startIdx;
}

function stringToUTF8(str, outPtr, maxBytesToWrite) {
 assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}

function lengthBytesUTF8(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var c = str.charCodeAt(i);
  if (c <= 127) {
   len++;
  } else if (c <= 2047) {
   len += 2;
  } else if (c >= 55296 && c <= 57343) {
   len += 4;
   ++i;
  } else {
   len += 3;
  }
 }
 return len;
}

var HEAP, buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateGlobalBufferAndViews(buf) {
 buffer = buf;
 Module["HEAP8"] = HEAP8 = new Int8Array(buf);
 Module["HEAP16"] = HEAP16 = new Int16Array(buf);
 Module["HEAP32"] = HEAP32 = new Int32Array(buf);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;

if (Module["TOTAL_STACK"]) assert(TOTAL_STACK === Module["TOTAL_STACK"], "the stack size can no longer be determined at runtime");

var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 2147483648;

legacyModuleProp("INITIAL_MEMORY", "INITIAL_MEMORY");

assert(INITIAL_MEMORY >= TOTAL_STACK, "INITIAL_MEMORY should be larger than TOTAL_STACK, was " + INITIAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");

assert(typeof Int32Array != "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined, "JS engine does not provide full typed array support");

assert(!Module["wasmMemory"], "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");

assert(INITIAL_MEMORY == 2147483648, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");

var wasmTable;

function writeStackCookie() {
 var max = _emscripten_stack_get_end();
 assert((max & 3) == 0);
 HEAP32[max >>> 2] = 34821223;
 HEAP32[max + 4 >>> 2] = 2310721022;
 HEAPU32[0 >>> 0] = 1668509029;
}

function checkStackCookie() {
 if (ABORT) return;
 var max = _emscripten_stack_get_end();
 var cookie1 = HEAPU32[max >>> 2];
 var cookie2 = HEAPU32[max + 4 >>> 2];
 if (cookie1 != 34821223 || cookie2 != 2310721022) {
  abort("Stack overflow! Stack cookie has been overwritten at 0x" + max.toString(16) + ", expected hex dwords 0x89BACDFE and 0x2135467, but received 0x" + cookie2.toString(16) + " 0x" + cookie1.toString(16));
 }
 if (HEAPU32[0 >>> 0] !== 1668509029) abort("Runtime error: The application has corrupted its heap memory area (address zero)!");
}

(function() {
 var h16 = new Int16Array(1);
 var h8 = new Int8Array(h16.buffer);
 h16[0] = 25459;
 if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
})();

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATEXIT__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

function keepRuntimeAlive() {
 return noExitRuntime;
}

function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
 assert(!runtimeInitialized);
 runtimeInitialized = true;
 checkStackCookie();
 callRuntimeCallbacks(__ATINIT__);
}

function postRun() {
 checkStackCookie();
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}

function addOnExit(cb) {}

function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}

assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

var runDependencyTracking = {};

function getUniqueRunDependency(id) {
 var orig = id;
 while (1) {
  if (!runDependencyTracking[id]) return id;
  id = orig + Math.random();
 }
}

function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(!runDependencyTracking[id]);
  runDependencyTracking[id] = 1;
  if (runDependencyWatcher === null && typeof setInterval != "undefined") {
   runDependencyWatcher = setInterval(function() {
    if (ABORT) {
     clearInterval(runDependencyWatcher);
     runDependencyWatcher = null;
     return;
    }
    var shown = false;
    for (var dep in runDependencyTracking) {
     if (!shown) {
      shown = true;
      err("still waiting on run dependencies:");
     }
     err("dependency: " + dep);
    }
    if (shown) {
     err("(end of list)");
    }
   }, 1e4);
  }
 } else {
  err("warning: run dependency added without ID");
 }
}

function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(runDependencyTracking[id]);
  delete runDependencyTracking[id];
 } else {
  err("warning: run dependency removed without ID");
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}

function abort(what) {
 {
  if (Module["onAbort"]) {
   Module["onAbort"](what);
  }
 }
 what = "Aborted(" + what + ")";
 err(what);
 ABORT = true;
 EXITSTATUS = 1;
 var e = new WebAssembly.RuntimeError(what);
 readyPromiseReject(e);
 throw e;
}

var FS = {
 error: function() {
  abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM");
 },
 init: function() {
  FS.error();
 },
 createDataFile: function() {
  FS.error();
 },
 createPreloadedFile: function() {
  FS.error();
 },
 createLazyFile: function() {
  FS.error();
 },
 open: function() {
  FS.error();
 },
 mkdev: function() {
  FS.error();
 },
 registerDevice: function() {
  FS.error();
 },
 analyzePath: function() {
  FS.error();
 },
 loadFilesFromDB: function() {
  FS.error();
 },
 ErrnoError: function ErrnoError() {
  FS.error();
 }
};

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

var dataURIPrefix = "data:application/octet-stream;base64,";

function isDataURI(filename) {
 return filename.startsWith(dataURIPrefix);
}

function isFileURI(filename) {
 return filename.startsWith("file://");
}

function createExportWrapper(name, fixedasm) {
 return function() {
  var displayName = name;
  var asm = fixedasm;
  if (!fixedasm) {
   asm = Module["asm"];
  }
  assert(runtimeInitialized, "native function `" + displayName + "` called before runtime initialization");
  if (!asm[name]) {
   assert(asm[name], "exported native function `" + displayName + "` not found");
  }
  return asm[name].apply(null, arguments);
 };
}

var wasmBinaryFile;

wasmBinaryFile = "tsne.wasm";

if (!isDataURI(wasmBinaryFile)) {
 wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary(file) {
 try {
  if (file == wasmBinaryFile && wasmBinary) {
   return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
   return readBinary(file);
  }
  throw "both async and sync fetching of the wasm failed";
 } catch (err) {
  abort(err);
 }
}

function getBinaryPromise() {
 if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
  if (typeof fetch == "function") {
   return fetch(wasmBinaryFile, {
    credentials: "same-origin"
   }).then(function(response) {
    if (!response["ok"]) {
     throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
    }
    return response["arrayBuffer"]();
   }).catch(function() {
    return getBinary(wasmBinaryFile);
   });
  }
 }
 return Promise.resolve().then(function() {
  return getBinary(wasmBinaryFile);
 });
}

function createWasm() {
 var info = {
  "env": asmLibraryArg,
  "wasi_snapshot_preview1": asmLibraryArg
 };
 function receiveInstance(instance, module) {
  var exports = instance.exports;
  Module["asm"] = exports;
  wasmMemory = Module["asm"]["memory"];
  assert(wasmMemory, "memory not found in wasm exports");
  updateGlobalBufferAndViews(wasmMemory.buffer);
  wasmTable = Module["asm"]["__indirect_function_table"];
  assert(wasmTable, "table not found in wasm exports");
  addOnInit(Module["asm"]["__wasm_call_ctors"]);
  removeRunDependency("wasm-instantiate");
 }
 addRunDependency("wasm-instantiate");
 var trueModule = Module;
 function receiveInstantiationResult(result) {
  assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
  trueModule = null;
  receiveInstance(result["instance"]);
 }
 function instantiateArrayBuffer(receiver) {
  return getBinaryPromise().then(function(binary) {
   return WebAssembly.instantiate(binary, info);
  }).then(function(instance) {
   return instance;
  }).then(receiver, function(reason) {
   err("failed to asynchronously prepare wasm: " + reason);
   if (isFileURI(wasmBinaryFile)) {
    err("warning: Loading from a file URI (" + wasmBinaryFile + ") is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing");
   }
   abort(reason);
  });
 }
 function instantiateAsync() {
  if (!wasmBinary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(wasmBinaryFile) && typeof fetch == "function") {
   return fetch(wasmBinaryFile, {
    credentials: "same-origin"
   }).then(function(response) {
    var result = WebAssembly.instantiateStreaming(response, info);
    return result.then(receiveInstantiationResult, function(reason) {
     err("wasm streaming compile failed: " + reason);
     err("falling back to ArrayBuffer instantiation");
     return instantiateArrayBuffer(receiveInstantiationResult);
    });
   });
  } else {
   return instantiateArrayBuffer(receiveInstantiationResult);
  }
 }
 if (Module["instantiateWasm"]) {
  try {
   var exports = Module["instantiateWasm"](info, receiveInstance);
   return exports;
  } catch (e) {
   err("Module.instantiateWasm callback failed with error: " + e);
   return false;
  }
 }
 instantiateAsync().catch(readyPromiseReject);
 return {};
}

var tempDouble;

var tempI64;

var ASM_CONSTS = {};

function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}

function callRuntimeCallbacks(callbacks) {
 while (callbacks.length > 0) {
  callbacks.shift()(Module);
 }
}

function withStackSave(f) {
 var stack = stackSave();
 var ret = f();
 stackRestore(stack);
 return ret;
}

function demangle(func) {
 warnOnce("warning: build with -sDEMANGLE_SUPPORT to link in libcxxabi demangling");
 return func;
}

function demangleAll(text) {
 var regex = /\b_Z[\w\d_]+/g;
 return text.replace(regex, function(x) {
  var y = demangle(x);
  return x === y ? x : y + " [" + x + "]";
 });
}

function getValue(ptr, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  return HEAP8[ptr >>> 0];

 case "i8":
  return HEAP8[ptr >>> 0];

 case "i16":
  return HEAP16[ptr >>> 1];

 case "i32":
  return HEAP32[ptr >>> 2];

 case "i64":
  return HEAP32[ptr >>> 2];

 case "float":
  return HEAPF32[ptr >>> 2];

 case "double":
  return HEAPF64[ptr >>> 3];

 case "*":
  return HEAPU32[ptr >>> 2];

 default:
  abort("invalid type for getValue: " + type);
 }
 return null;
}

function handleException(e) {
 if (e instanceof ExitStatus || e == "unwind") {
  return EXITSTATUS;
 }
 quit_(1, e);
}

function jsStackTrace() {
 var error = new Error();
 if (!error.stack) {
  try {
   throw new Error();
  } catch (e) {
   error = e;
  }
  if (!error.stack) {
   return "(no stack trace available)";
  }
 }
 return error.stack.toString();
}

function setValue(ptr, value, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  HEAP8[ptr >>> 0] = value;
  break;

 case "i8":
  HEAP8[ptr >>> 0] = value;
  break;

 case "i16":
  HEAP16[ptr >>> 1] = value;
  break;

 case "i32":
  HEAP32[ptr >>> 2] = value;
  break;

 case "i64":
  tempI64 = [ value >>> 0, (tempDouble = value, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[ptr >>> 2] = tempI64[0], HEAP32[ptr + 4 >>> 2] = tempI64[1];
  break;

 case "float":
  HEAPF32[ptr >>> 2] = value;
  break;

 case "double":
  HEAPF64[ptr >>> 3] = value;
  break;

 case "*":
  HEAPU32[ptr >>> 2] = value;
  break;

 default:
  abort("invalid type for setValue: " + type);
 }
}

function stackTrace() {
 var js = jsStackTrace();
 if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
 return demangleAll(js);
}

function warnOnce(text) {
 if (!warnOnce.shown) warnOnce.shown = {};
 if (!warnOnce.shown[text]) {
  warnOnce.shown[text] = 1;
  err(text);
 }
}

function writeArrayToMemory(array, buffer) {
 assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
 HEAP8.set(array, buffer >>> 0);
}

function ___cxa_allocate_exception(size) {
 return _malloc(size + 24) + 24;
}

function ExceptionInfo(excPtr) {
 this.excPtr = excPtr;
 this.ptr = excPtr - 24;
 this.set_type = function(type) {
  HEAPU32[this.ptr + 4 >>> 2] = type;
 };
 this.get_type = function() {
  return HEAPU32[this.ptr + 4 >>> 2];
 };
 this.set_destructor = function(destructor) {
  HEAPU32[this.ptr + 8 >>> 2] = destructor;
 };
 this.get_destructor = function() {
  return HEAPU32[this.ptr + 8 >>> 2];
 };
 this.set_refcount = function(refcount) {
  HEAP32[this.ptr >>> 2] = refcount;
 };
 this.set_caught = function(caught) {
  caught = caught ? 1 : 0;
  HEAP8[this.ptr + 12 >>> 0] = caught;
 };
 this.get_caught = function() {
  return HEAP8[this.ptr + 12 >>> 0] != 0;
 };
 this.set_rethrown = function(rethrown) {
  rethrown = rethrown ? 1 : 0;
  HEAP8[this.ptr + 13 >>> 0] = rethrown;
 };
 this.get_rethrown = function() {
  return HEAP8[this.ptr + 13 >>> 0] != 0;
 };
 this.init = function(type, destructor) {
  this.set_adjusted_ptr(0);
  this.set_type(type);
  this.set_destructor(destructor);
  this.set_refcount(0);
  this.set_caught(false);
  this.set_rethrown(false);
 };
 this.add_ref = function() {
  var value = HEAP32[this.ptr >>> 2];
  HEAP32[this.ptr >>> 2] = value + 1;
 };
 this.release_ref = function() {
  var prev = HEAP32[this.ptr >>> 2];
  HEAP32[this.ptr >>> 2] = prev - 1;
  assert(prev > 0);
  return prev === 1;
 };
 this.set_adjusted_ptr = function(adjustedPtr) {
  HEAPU32[this.ptr + 16 >>> 2] = adjustedPtr;
 };
 this.get_adjusted_ptr = function() {
  return HEAPU32[this.ptr + 16 >>> 2];
 };
 this.get_exception_ptr = function() {
  var isPointer = ___cxa_is_pointer_type(this.get_type());
  if (isPointer) {
   return HEAPU32[this.excPtr >>> 2];
  }
  var adjusted = this.get_adjusted_ptr();
  if (adjusted !== 0) return adjusted;
  return this.excPtr;
 };
}

var exceptionLast = 0;

var uncaughtExceptionCount = 0;

function ___cxa_throw(ptr, type, destructor) {
 var info = new ExceptionInfo(ptr);
 info.init(type, destructor);
 exceptionLast = ptr;
 uncaughtExceptionCount++;
 throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.";
}

function __emscripten_date_now() {
 return Date.now();
}

function _abort() {
 abort("native code called abort()");
}

function _emscripten_memcpy_big(dest, src, num) {
 HEAPU8.copyWithin(dest >>> 0, src >>> 0, src + num >>> 0);
}

function getHeapMax() {
 return 4294901760;
}

function emscripten_realloc_buffer(size) {
 try {
  wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
  updateGlobalBufferAndViews(wasmMemory.buffer);
  return 1;
 } catch (e) {
  err("emscripten_realloc_buffer: Attempted to grow heap from " + buffer.byteLength + " bytes to " + size + " bytes, but got error: " + e);
 }
}

function _emscripten_resize_heap(requestedSize) {
 var oldSize = HEAPU8.length;
 requestedSize = requestedSize >>> 0;
 assert(requestedSize > oldSize);
 var maxHeapSize = getHeapMax();
 if (requestedSize > maxHeapSize) {
  err("Cannot enlarge memory, asked to go up to " + requestedSize + " bytes, but the limit is " + maxHeapSize + " bytes!");
  return false;
 }
 let alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
 for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
  var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
  overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
  var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
  var replacement = emscripten_realloc_buffer(newSize);
  if (replacement) {
   return true;
  }
 }
 err("Failed to grow the heap from " + oldSize + " bytes to " + newSize + " bytes, not enough memory!");
 return false;
}

var SYSCALLS = {
 varargs: undefined,
 get: function() {
  assert(SYSCALLS.varargs != undefined);
  SYSCALLS.varargs += 4;
  var ret = HEAP32[SYSCALLS.varargs - 4 >>> 2];
  return ret;
 },
 getStr: function(ptr) {
  var ret = UTF8ToString(ptr);
  return ret;
 }
};

function _proc_exit(code) {
 EXITSTATUS = code;
 if (!keepRuntimeAlive()) {
  if (Module["onExit"]) Module["onExit"](code);
  ABORT = true;
 }
 quit_(code, new ExitStatus(code));
}

function exitJS(status, implicit) {
 EXITSTATUS = status;
 checkUnflushedContent();
 if (keepRuntimeAlive() && !implicit) {
  var msg = "program exited (with status: " + status + "), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)";
  readyPromiseReject(msg);
  err(msg);
 }
 _proc_exit(status);
}

var _exit = exitJS;

var printCharBuffers = [ null, [], [] ];

function printChar(stream, curr) {
 var buffer = printCharBuffers[stream];
 assert(buffer);
 if (curr === 0 || curr === 10) {
  (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
  buffer.length = 0;
 } else {
  buffer.push(curr);
 }
}

function flush_NO_FILESYSTEM() {
 _fflush(0);
 if (printCharBuffers[1].length) printChar(1, 10);
 if (printCharBuffers[2].length) printChar(2, 10);
}

function _fd_write(fd, iov, iovcnt, pnum) {
 var num = 0;
 for (var i = 0; i < iovcnt; i++) {
  var ptr = HEAPU32[iov >>> 2];
  var len = HEAPU32[iov + 4 >>> 2];
  iov += 8;
  for (var j = 0; j < len; j++) {
   printChar(fd, HEAPU8[ptr + j >>> 0]);
  }
  num += len;
 }
 HEAPU32[pnum >>> 2] = num;
 return 0;
}

function _setTempRet0(val) {
 setTempRet0(val);
}

function uleb128Encode(n, target) {
 assert(n < 16384);
 if (n < 128) {
  target.push(n);
 } else {
  target.push(n % 128 | 128, n >> 7);
 }
}

function sigToWasmTypes(sig) {
 var typeNames = {
  "i": "i32",
  "j": "i64",
  "f": "f32",
  "d": "f64",
  "p": "i32"
 };
 var type = {
  parameters: [],
  results: sig[0] == "v" ? [] : [ typeNames[sig[0]] ]
 };
 for (var i = 1; i < sig.length; ++i) {
  assert(sig[i] in typeNames, "invalid signature char: " + sig[i]);
  type.parameters.push(typeNames[sig[i]]);
 }
 return type;
}

function convertJsFunctionToWasm(func, sig) {
 if (typeof WebAssembly.Function == "function") {
  return new WebAssembly.Function(sigToWasmTypes(sig), func);
 }
 var typeSectionBody = [ 1, 96 ];
 var sigRet = sig.slice(0, 1);
 var sigParam = sig.slice(1);
 var typeCodes = {
  "i": 127,
  "p": 127,
  "j": 126,
  "f": 125,
  "d": 124
 };
 uleb128Encode(sigParam.length, typeSectionBody);
 for (var i = 0; i < sigParam.length; ++i) {
  assert(sigParam[i] in typeCodes, "invalid signature char: " + sigParam[i]);
  typeSectionBody.push(typeCodes[sigParam[i]]);
 }
 if (sigRet == "v") {
  typeSectionBody.push(0);
 } else {
  typeSectionBody.push(1, typeCodes[sigRet]);
 }
 var bytes = [ 0, 97, 115, 109, 1, 0, 0, 0, 1 ];
 uleb128Encode(typeSectionBody.length, bytes);
 bytes.push.apply(bytes, typeSectionBody);
 bytes.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
 var module = new WebAssembly.Module(new Uint8Array(bytes));
 var instance = new WebAssembly.Instance(module, {
  "e": {
   "f": func
  }
 });
 var wrappedFunc = instance.exports["f"];
 return wrappedFunc;
}

var wasmTableMirror = [];

function getWasmTableEntry(funcPtr) {
 var func = wasmTableMirror[funcPtr];
 if (!func) {
  if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
  wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
 }
 assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
 return func;
}

function updateTableMap(offset, count) {
 if (functionsInTableMap) {
  for (var i = offset; i < offset + count; i++) {
   var item = getWasmTableEntry(i);
   if (item) {
    functionsInTableMap.set(item, i);
   }
  }
 }
}

var functionsInTableMap = undefined;

var freeTableIndexes = [];

function getEmptyTableSlot() {
 if (freeTableIndexes.length) {
  return freeTableIndexes.pop();
 }
 try {
  wasmTable.grow(1);
 } catch (err) {
  if (!(err instanceof RangeError)) {
   throw err;
  }
  throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
 }
 return wasmTable.length - 1;
}

function setWasmTableEntry(idx, func) {
 wasmTable.set(idx, func);
 wasmTableMirror[idx] = wasmTable.get(idx);
}

function addFunction(func, sig) {
 assert(typeof func != "undefined");
 if (!functionsInTableMap) {
  functionsInTableMap = new WeakMap();
  updateTableMap(0, wasmTable.length);
 }
 if (functionsInTableMap.has(func)) {
  return functionsInTableMap.get(func);
 }
 var ret = getEmptyTableSlot();
 try {
  setWasmTableEntry(ret, func);
 } catch (err) {
  if (!(err instanceof TypeError)) {
   throw err;
  }
  assert(typeof sig != "undefined", "Missing signature argument to addFunction: " + func);
  var wrapped = convertJsFunctionToWasm(func, sig);
  setWasmTableEntry(ret, wrapped);
 }
 functionsInTableMap.set(func, ret);
 return ret;
}

function removeFunction(index) {
 functionsInTableMap.delete(getWasmTableEntry(index));
 freeTableIndexes.push(index);
}

var ALLOC_NORMAL = 0;

var ALLOC_STACK = 1;

function allocate(slab, allocator) {
 var ret;
 assert(typeof allocator == "number", "allocate no longer takes a type argument");
 assert(typeof slab != "number", "allocate no longer takes a number as arg0");
 if (allocator == ALLOC_STACK) {
  ret = stackAlloc(slab.length);
 } else {
  ret = _malloc(slab.length);
 }
 if (!slab.subarray && !slab.slice) {
  slab = new Uint8Array(slab);
 }
 HEAPU8.set(slab, ret >>> 0);
 return ret;
}

function AsciiToString(ptr) {
 ptr >>>= 0;
 var str = "";
 while (1) {
  var ch = HEAPU8[ptr++ >>> 0];
  if (!ch) return str;
  str += String.fromCharCode(ch);
 }
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
 for (var i = 0; i < str.length; ++i) {
  assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
  HEAP8[buffer++ >>> 0] = str.charCodeAt(i);
 }
 if (!dontAddNull) HEAP8[buffer >>> 0] = 0;
}

function stringToAscii(str, outPtr) {
 return writeAsciiToMemory(str, outPtr, false);
}

var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : undefined;

function UTF16ToString(ptr, maxBytesToRead) {
 assert(ptr % 2 == 0, "Pointer passed to UTF16ToString must be aligned to two bytes!");
 var endPtr = ptr;
 var idx = endPtr >> 1;
 var maxIdx = idx + maxBytesToRead / 2;
 while (!(idx >= maxIdx) && HEAPU16[idx >>> 0]) ++idx;
 endPtr = idx << 1;
 if (endPtr - ptr > 32 && UTF16Decoder) {
  return UTF16Decoder.decode(HEAPU8.subarray(ptr >>> 0, endPtr >>> 0));
 } else {
  var str = "";
  for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
   var codeUnit = HEAP16[ptr + i * 2 >>> 1];
   if (codeUnit == 0) break;
   str += String.fromCharCode(codeUnit);
  }
  return str;
 }
}

function stringToUTF16(str, outPtr, maxBytesToWrite) {
 assert(outPtr % 2 == 0, "Pointer passed to stringToUTF16 must be aligned to two bytes!");
 assert(typeof maxBytesToWrite == "number", "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 if (maxBytesToWrite === undefined) {
  maxBytesToWrite = 2147483647;
 }
 if (maxBytesToWrite < 2) return 0;
 maxBytesToWrite -= 2;
 var startPtr = outPtr;
 var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
 for (var i = 0; i < numCharsToWrite; ++i) {
  var codeUnit = str.charCodeAt(i);
  HEAP16[outPtr >>> 1] = codeUnit;
  outPtr += 2;
 }
 HEAP16[outPtr >>> 1] = 0;
 return outPtr - startPtr;
}

function lengthBytesUTF16(str) {
 return str.length * 2;
}

function UTF32ToString(ptr, maxBytesToRead) {
 assert(ptr % 4 == 0, "Pointer passed to UTF32ToString must be aligned to four bytes!");
 var i = 0;
 var str = "";
 while (!(i >= maxBytesToRead / 4)) {
  var utf32 = HEAP32[ptr + i * 4 >>> 2];
  if (utf32 == 0) break;
  ++i;
  if (utf32 >= 65536) {
   var ch = utf32 - 65536;
   str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
  } else {
   str += String.fromCharCode(utf32);
  }
 }
 return str;
}

function stringToUTF32(str, outPtr, maxBytesToWrite) {
 outPtr >>>= 0;
 assert(outPtr % 4 == 0, "Pointer passed to stringToUTF32 must be aligned to four bytes!");
 assert(typeof maxBytesToWrite == "number", "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 if (maxBytesToWrite === undefined) {
  maxBytesToWrite = 2147483647;
 }
 if (maxBytesToWrite < 4) return 0;
 var startPtr = outPtr;
 var endPtr = startPtr + maxBytesToWrite - 4;
 for (var i = 0; i < str.length; ++i) {
  var codeUnit = str.charCodeAt(i);
  if (codeUnit >= 55296 && codeUnit <= 57343) {
   var trailSurrogate = str.charCodeAt(++i);
   codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
  }
  HEAP32[outPtr >>> 2] = codeUnit;
  outPtr += 4;
  if (outPtr + 4 > endPtr) break;
 }
 HEAP32[outPtr >>> 2] = 0;
 return outPtr - startPtr;
}

function lengthBytesUTF32(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var codeUnit = str.charCodeAt(i);
  if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
  len += 4;
 }
 return len;
}

function allocateUTF8(str) {
 var size = lengthBytesUTF8(str) + 1;
 var ret = _malloc(size);
 if (ret) stringToUTF8Array(str, HEAP8, ret, size);
 return ret;
}

function allocateUTF8OnStack(str) {
 var size = lengthBytesUTF8(str) + 1;
 var ret = stackAlloc(size);
 stringToUTF8Array(str, HEAP8, ret, size);
 return ret;
}

function writeStringToMemory(string, buffer, dontAddNull) {
 warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
 var lastChar, end;
 if (dontAddNull) {
  end = buffer + lengthBytesUTF8(string);
  lastChar = HEAP8[end >>> 0];
 }
 stringToUTF8(string, buffer, Infinity);
 if (dontAddNull) HEAP8[end >>> 0] = lastChar;
}

function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}

function intArrayToString(array) {
 var ret = [];
 for (var i = 0; i < array.length; i++) {
  var chr = array[i];
  if (chr > 255) {
   if (ASSERTIONS) {
    assert(false, "Character code " + chr + " (" + String.fromCharCode(chr) + ")  at offset " + i + " not in 0x00-0xFF.");
   }
   chr &= 255;
  }
  ret.push(String.fromCharCode(chr));
 }
 return ret.join("");
}

function getCFunc(ident) {
 var func = Module["_" + ident];
 assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
 return func;
}

function ccall(ident, returnType, argTypes, args, opts) {
 var toC = {
  "string": str => {
   var ret = 0;
   if (str !== null && str !== undefined && str !== 0) {
    var len = (str.length << 2) + 1;
    ret = stackAlloc(len);
    stringToUTF8(str, ret, len);
   }
   return ret;
  },
  "array": arr => {
   var ret = stackAlloc(arr.length);
   writeArrayToMemory(arr, ret);
   return ret;
  }
 };
 function convertReturnValue(ret) {
  if (returnType === "string") {
   return UTF8ToString(ret);
  }
  if (returnType === "boolean") return Boolean(ret);
  return ret;
 }
 var func = getCFunc(ident);
 var cArgs = [];
 var stack = 0;
 assert(returnType !== "array", 'Return type should not be "array".');
 if (args) {
  for (var i = 0; i < args.length; i++) {
   var converter = toC[argTypes[i]];
   if (converter) {
    if (stack === 0) stack = stackSave();
    cArgs[i] = converter(args[i]);
   } else {
    cArgs[i] = args[i];
   }
  }
 }
 var ret = func.apply(null, cArgs);
 function onDone(ret) {
  if (stack !== 0) stackRestore(stack);
  return convertReturnValue(ret);
 }
 ret = onDone(ret);
 return ret;
}

function cwrap(ident, returnType, argTypes, opts) {
 return function() {
  return ccall(ident, returnType, argTypes, arguments, opts);
 };
}

var ASSERTIONS = true;

function checkIncomingModuleAPI() {
 ignoredModuleProp("fetchSettings");
}

var asmLibraryArg = {
 "__cxa_allocate_exception": ___cxa_allocate_exception,
 "__cxa_throw": ___cxa_throw,
 "_emscripten_date_now": __emscripten_date_now,
 "abort": _abort,
 "emscripten_memcpy_big": _emscripten_memcpy_big,
 "emscripten_resize_heap": _emscripten_resize_heap,
 "exit": _exit,
 "fd_write": _fd_write,
 "setTempRet0": _setTempRet0
};

var asm = createWasm();

var ___wasm_call_ctors = Module["___wasm_call_ctors"] = createExportWrapper("__wasm_call_ctors");

var _version = Module["_version"] = createExportWrapper("version");

var _malloc = Module["_malloc"] = createExportWrapper("malloc");

var ___errno_location = Module["___errno_location"] = createExportWrapper("__errno_location");

var _fflush = Module["_fflush"] = createExportWrapper("fflush");

var _emscripten_stack_init = Module["_emscripten_stack_init"] = function() {
 return (_emscripten_stack_init = Module["_emscripten_stack_init"] = Module["asm"]["emscripten_stack_init"]).apply(null, arguments);
};

var _emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = function() {
 return (_emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = Module["asm"]["emscripten_stack_get_free"]).apply(null, arguments);
};

var _emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = function() {
 return (_emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = Module["asm"]["emscripten_stack_get_base"]).apply(null, arguments);
};

var _emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = function() {
 return (_emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = Module["asm"]["emscripten_stack_get_end"]).apply(null, arguments);
};

var stackSave = Module["stackSave"] = createExportWrapper("stackSave");

var stackRestore = Module["stackRestore"] = createExportWrapper("stackRestore");

var stackAlloc = Module["stackAlloc"] = createExportWrapper("stackAlloc");

var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = createExportWrapper("__cxa_is_pointer_type");

var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");

Module["cwrap"] = cwrap;

var unexportedRuntimeSymbols = [ "run", "UTF8ArrayToString", "UTF8ToString", "stringToUTF8Array", "stringToUTF8", "lengthBytesUTF8", "addOnPreRun", "addOnInit", "addOnPreMain", "addOnExit", "addOnPostRun", "addRunDependency", "removeRunDependency", "FS_createFolder", "FS_createPath", "FS_createDataFile", "FS_createPreloadedFile", "FS_createLazyFile", "FS_createLink", "FS_createDevice", "FS_unlink", "getLEB", "getFunctionTables", "alignFunctionTables", "registerFunctions", "prettyPrint", "getCompilerSetting", "print", "printErr", "getTempRet0", "setTempRet0", "callMain", "abort", "keepRuntimeAlive", "wasmMemory", "stackSave", "stackRestore", "stackAlloc", "writeStackCookie", "checkStackCookie", "ptrToString", "zeroMemory", "stringToNewUTF8", "exitJS", "getHeapMax", "emscripten_realloc_buffer", "ENV", "ERRNO_CODES", "ERRNO_MESSAGES", "setErrNo", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "DNS", "getHostByName", "Protocols", "Sockets", "getRandomDevice", "warnOnce", "traverseStack", "UNWIND_CACHE", "convertPCtoSourceLocation", "readAsmConstArgsArray", "readAsmConstArgs", "mainThreadEM_ASM", "jstoi_q", "jstoi_s", "getExecutableName", "listenOnce", "autoResumeAudioContext", "dynCallLegacy", "getDynCaller", "dynCall", "handleException", "runtimeKeepalivePush", "runtimeKeepalivePop", "callUserCallback", "maybeExit", "safeSetTimeout", "asmjsMangle", "asyncLoad", "alignMemory", "mmapAlloc", "writeI53ToI64", "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "readI53FromI64", "readI53FromU64", "convertI32PairToI53", "convertI32PairToI53Checked", "convertU32PairToI53", "getCFunc", "ccall", "uleb128Encode", "sigToWasmTypes", "convertJsFunctionToWasm", "freeTableIndexes", "functionsInTableMap", "getEmptyTableSlot", "updateTableMap", "addFunction", "removeFunction", "reallyNegative", "unSign", "strLen", "reSign", "formatString", "setValue", "getValue", "PATH", "PATH_FS", "intArrayFromString", "intArrayToString", "AsciiToString", "stringToAscii", "UTF16Decoder", "UTF16ToString", "stringToUTF16", "lengthBytesUTF16", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "allocateUTF8", "allocateUTF8OnStack", "writeStringToMemory", "writeArrayToMemory", "writeAsciiToMemory", "SYSCALLS", "getSocketFromFD", "getSocketAddress", "JSEvents", "registerKeyEventCallback", "specialHTMLTargets", "maybeCStringToJsString", "findEventTarget", "findCanvasEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "currentFullscreenStrategy", "restoreOldWindowedStyle", "softFullscreenResizeWebGLRenderTarget", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "setCanvasElementSize", "getCanvasElementSize", "demangle", "demangleAll", "jsStackTrace", "stackTrace", "ExitStatus", "getEnvStrings", "checkWasiClock", "flush_NO_FILESYSTEM", "dlopenMissingError", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "uncaughtExceptionCount", "exceptionLast", "exceptionCaught", "ExceptionInfo", "exception_addRef", "exception_decRef", "Browser", "setMainLoop", "wget", "FS", "MEMFS", "TTY", "PIPEFS", "SOCKFS", "_setNetworkCallback", "tempFixedLengthArray", "miniTempWebGLFloatBuffers", "heapObjectForWebGLType", "heapAccessShiftForWebGLHeap", "GL", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "writeGLArray", "AL", "SDL_unicode", "SDL_ttfContext", "SDL_audio", "SDL", "SDL_gfx", "GLUT", "EGL", "GLFW_Window", "GLFW", "GLEW", "IDBStore", "runAndAbortIfError", "ALLOC_NORMAL", "ALLOC_STACK", "allocate" ];

unexportedRuntimeSymbols.forEach(unexportedRuntimeSymbol);

var missingLibrarySymbols = [ "ptrToString", "zeroMemory", "stringToNewUTF8", "setErrNo", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "getHostByName", "getRandomDevice", "traverseStack", "convertPCtoSourceLocation", "readAsmConstArgs", "mainThreadEM_ASM", "jstoi_q", "jstoi_s", "getExecutableName", "listenOnce", "autoResumeAudioContext", "dynCallLegacy", "getDynCaller", "dynCall", "runtimeKeepalivePush", "runtimeKeepalivePop", "callUserCallback", "maybeExit", "safeSetTimeout", "asmjsMangle", "asyncLoad", "alignMemory", "mmapAlloc", "writeI53ToI64", "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "readI53FromI64", "readI53FromU64", "convertI32PairToI53", "convertI32PairToI53Checked", "convertU32PairToI53", "reallyNegative", "unSign", "strLen", "reSign", "formatString", "getSocketFromFD", "getSocketAddress", "registerKeyEventCallback", "maybeCStringToJsString", "findEventTarget", "findCanvasEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "softFullscreenResizeWebGLRenderTarget", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "setCanvasElementSize", "getCanvasElementSize", "getEnvStrings", "checkWasiClock", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "exception_addRef", "exception_decRef", "setMainLoop", "_setNetworkCallback", "heapObjectForWebGLType", "heapAccessShiftForWebGLHeap", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "writeGLArray", "SDL_unicode", "SDL_ttfContext", "SDL_audio", "GLFW_Window", "runAndAbortIfError" ];

missingLibrarySymbols.forEach(missingLibrarySymbol);

var calledRun;

dependenciesFulfilled = function runCaller() {
 if (!calledRun) run();
 if (!calledRun) dependenciesFulfilled = runCaller;
};

function stackCheckInit() {
 _emscripten_stack_init();
 writeStackCookie();
}

function run(args) {
 args = args || arguments_;
 if (runDependencies > 0) {
  return;
 }
 stackCheckInit();
 preRun();
 if (runDependencies > 0) {
  return;
 }
 function doRun() {
  if (calledRun) return;
  calledRun = true;
  Module["calledRun"] = true;
  if (ABORT) return;
  initRuntime();
  readyPromiseResolve(Module);
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  assert(!Module["_main"], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout(function() {
   setTimeout(function() {
    Module["setStatus"]("");
   }, 1);
   doRun();
  }, 1);
 } else {
  doRun();
 }
 checkStackCookie();
}

function checkUnflushedContent() {
 var oldOut = out;
 var oldErr = err;
 var has = false;
 out = err = x => {
  has = true;
 };
 try {
  flush_NO_FILESYSTEM();
 } catch (e) {}
 out = oldOut;
 err = oldErr;
 if (has) {
  warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.");
  warnOnce("(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)");
 }
}

if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}

run();


  return Module.ready
}
);
})();
if (true)
  module.exports = Module;
else {}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*****************************!*\
  !*** ./src/workers/test.ts ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tsne_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tsne.js */ "./src/tsne.js");
/* harmony import */ var _tsne_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tsne_js__WEBPACK_IMPORTED_MODULE_0__);

setTimeout(function () {
    _tsne_js__WEBPACK_IMPORTED_MODULE_0___default()().then(function (module) {
        var N = 100;
        var D = 1;
        var data = [];
        for (var i = 0; i < N; i++) {
            data.push(Math.random() * 100);
        }
        var X = new Float64Array(module.HEAP8.buffer, module._malloc(N * 8 * D), N * D);
        X.set(data);
        var Y = new Float64Array(module.HEAP8.buffer, module._malloc(N * 8 * 2), N * 2);
        Y.set(data);
        var version = module.cwrap("version", "number", []);
        version(X.byteOffset, N, Y.byteOffset, D);
    });
}, 2000);
self.onmessage = function (_a) {
    var question = _a.data.question;
    self.postMessage({
        answer: 42
    });
};

})();

/******/ })()
;
//# sourceMappingURL=src_workers_test_ts.js.map