!function(){var e,t,n,r,o,i={801163:function(e,t,n){"use strict";n.r(t),n.d(t,{scaleToWorld:function(){return i},forceNormalizationNew:function(){return a}});var r=n("75405"),o=n("10398");function i(e){let t=(0,r.scaleLinear)().domain([0,1]).range([e.x,e.x+e.width]),n=(0,r.scaleLinear)().domain([0,1]).range([e.y,e.y+e.height]);return[t,n]}function a(e){let t=500/e.width,n=(0,r.scaleLinear)().domain([0,1]).range([0,e.width*t]),i=(0,r.scaleLinear)().domain([0,1]).range([0,e.height*t]),a=(0,r.scaleLinear)().domain([0,1]).range([e.x+.01*e.width,e.x+.99*e.width]),s=(0,r.scaleLinear)().domain([0,1]).range([e.y+.01*e.height,e.y+.99*e.height]);return[n,i,a,s,o.POINT_RADIUS*t]}},10398:function(e,t,n){"use strict";n.r(t),n.d(t,{POINT_RADIUS:function(){return r}});let r=.012},629119:function(e,t,n){"use strict";n.r(t),n.d(t,{getMinMax:function(){return o},spread:function(){return a},scaleInto:function(){return s},normalizeVectors01:function(){return l},pointInPolygon:function(){return u}});var r=n("75405");function o(e){let t=Number.MAX_SAFE_INTEGER,n=Number.MIN_SAFE_INTEGER;return e.forEach(e=>{t=Math.min(t,e),n=Math.max(n,e)}),[t,n]}function i(e){let t=1e3,n=-1e3,r=1e3,o=-1e3;return e.forEach(e=>{t=Math.min(t,e.x),n=Math.max(n,e.x),r=Math.min(r,e.y),o=Math.max(o,e.y)}),{minX:t,maxX:n,minY:r,maxY:o,centerX:(t+n)/2,centerY:(r+o)/2,extentX:n-t,extentY:o-r}}function a(e,t){return e-t+2*Math.random()*t}function s(e){let t=i(e);if(t.extentX>=t.extentY){let n=10-t.centerX,o=(0,r.scaleLinear)().domain([t.minX,t.maxX]).range([t.minX+n,t.maxX+n]),i=(0,r.scaleLinear)().domain([t.minY,t.maxY]).range([10-t.extentY/2,10+t.extentY/2]);return[e.map(e=>({x:o(e.x),y:i(e.y)})),t.extentX]}if(t.extentX<t.extentY){let n=10-t.centerY,o=(0,r.scaleLinear)().domain([t.minX,t.maxX]).range([10-t.extentX/2,10+t.extentX/2]),i=(0,r.scaleLinear)().domain([t.minY,t.maxY]).range([t.minY+n,t.maxY+n]);return[e.map(e=>({x:o(e.x),y:i(e.y)})),t.extentY]}}function l(e){let t,n;let o=i(e);if(o.extentX>=o.extentY){let e=o.extentY/o.extentX;t=(0,r.scaleLinear)().domain([o.minX,o.maxX]).range([0,1]),n=(0,r.scaleLinear)().domain([o.minY,o.maxY]).range([1-e,e])}else{let e=o.extentX/o.extentY;t=(0,r.scaleLinear)().domain([o.minX,o.maxX]).range([1-e,e]),n=(0,r.scaleLinear)().domain([o.minY,o.maxY]).range([0,1])}return e.map(e=>({x:t(e.x),y:n(e.y)}))}function u(e,t,n){let r=0;for(let o=0,i=n.length-1;o<n.length;i=o++){let[a,s]=n[i],[l,u]=n[o];u>t!=s>t&&e<(a-l)*(t-u)/(s-u)+l&&r++}return 1&r}},651178:function(e,t,n){"use strict";n.r(t);var r=n("507566"),o=n("75405"),i=n("629119"),a=n("801163");self.onmessage=({data:{X:e,D:t,N:n,area:s,type:l,Y_in:u,axis:c}})=>{let d;if("init"!==l)return;self.postMessage({type:"message",message:"Calculating embedding ..."});let m=new r.UMAP({nComponents:"xy"===c?2:1,nEpochs:200,nNeighbors:15}),p=m.fit(e),f=[];if("x"===c){let e=p.map(e=>e[0]),t=(0,o.scaleLinear)().domain((0,i.getMinMax)(e)).range([0,1]);d=e.map((e,n)=>({x:t(e),y:u[n].y})),f.push({discriminator:"positionedlabels",type:"x",labels:[{position:.5,content:"umap-x"}]})}else if("y"===c){let e=p.map(e=>e[0]),t=(0,o.scaleLinear)().domain((0,i.getMinMax)(e)).range([0,1]);d=e.map((e,n)=>({y:t(e),x:u[n].x})),f.push({discriminator:"positionedlabels",type:"y",labels:[{position:.5,content:"umap-y"}]})}else"xy"===c&&(d=p.map(e=>({x:e[0],y:e[1]})),d=(0,i.normalizeVectors01)(d),f.push({discriminator:"positionedlabels",type:"x",labels:[{position:.5,content:"umap-x"}]}),f.push({discriminator:"positionedlabels",type:"y",labels:[{position:.5,content:"umap-y"}]}));let[x,y]=(0,a.scaleToWorld)(s);self.postMessage({type:"message",message:"Force layout ..."}),console.log(d),self.postMessage({type:"finish",Y:d.map(e=>({x:"y"!==c?x(e.x):e.x,y:"x"!==c?y(e.y):e.y})),labels:f})}}},a={};function s(e){var t=a[e];if(void 0!==t)return t.exports;var n=a[e]={id:e,loaded:!1,exports:{}};return i[e](n,n.exports,s),n.loaded=!0,n.exports}s.m=i,s.x=function(){var e=s.O(void 0,["vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_lodash_groupBy_js~2df69e"],function(){return s("651178")});return e=s.O(e)},e=s.x,s.x=function(){return Promise.all(["vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_lodash_groupBy_js~2df69e"].map(s.e,s)).then(e)},s.es=function(e,t){return Object.keys(e).forEach(function(n){"default"!==n&&!Object.prototype.hasOwnProperty.call(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:function(){return e[n]}})}),e},s.f={},s.e=function(e){return Promise.all(Object.keys(s.f).reduce(function(t,n){return s.f[n](e,t),t},[]))},!function(){self.importScripts&&(e=self.location+"");var e,t=self.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var n=t.getElementsByTagName("script");n.length&&(e=n[n.length-1].src)}if(!e)throw Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),s.p=e}(),s.u=function(e){return({"vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_lodash_groupBy_js~2df69e":"vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_lodash_groupBy_js~2df69e.main.js"})[e]},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t=[],s.O=function(e,n,r,o){if(n){o=o||0;for(var i=t.length;i>0&&t[i-1][2]>o;i--)t[i]=t[i-1];t[i]=[n,r,o];return}for(var a=1/0,i=0;i<t.length;i++){for(var n=t[i][0],r=t[i][1],o=t[i][2],l=!0,u=0;u<n.length;u++)a>=o&&Object.keys(s.O).every(function(e){return s.O[e](n[u])})?n.splice(u--,1):(l=!1,o<a&&(a=o));if(l){t.splice(i--,1);var c=r();void 0!==c&&(e=c)}}return e},s.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||Function("return this")()}catch(e){if("object"==typeof window)return window}}(),s.d=function(e,t){for(var n in t)s.o(t,n)&&!s.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.n=function(e){return e&&e.__esModule?e.default:e},s.nmd=function(e){return e.paths=[],!e.children&&(e.children=[]),e},n={src_Workers_umap_worker_ts:1},s.f.i=function(e,t){!n[e]&&(e?importScripts(s.p+s.u(e)):n[e]=1)},r=self.webpackChunkmy_sample_typescript_app=self.webpackChunkmy_sample_typescript_app||[],o=r.push.bind(r),r.push=function(e){var t=e[0],r=e[1],i=e[2];for(var a in r)s.o(r,a)&&(s.m[a]=r[a]);for(i&&i(s);t.length;)n[t.pop()]=1;o(e)},s.x()}();
//# sourceMappingURL=src_Workers_umap_worker_ts.main.js.map