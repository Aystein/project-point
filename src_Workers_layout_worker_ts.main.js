!function(){var e,r,n,t,o,i={801163:function(e,r,n){"use strict";n.r(r),n.d(r,{scaleToWorld:function(){return i},forceNormalizationNew:function(){return s}});var t=n("75405"),o=n("10398");function i(e){let r=(0,t.scaleLinear)().domain([0,1]).range([e.x,e.x+e.width]),n=(0,t.scaleLinear)().domain([0,1]).range([e.y,e.y+e.height]);return[r,n]}function s(e){let r=500/e.width,n=(0,t.scaleLinear)().domain([0,1]).range([0,e.width*r]),i=(0,t.scaleLinear)().domain([0,1]).range([0,e.height*r]),s=(0,t.scaleLinear)().domain([0,1]).range([e.x+.01*e.width,e.x+.99*e.width]),a=(0,t.scaleLinear)().domain([0,1]).range([e.y+.01*e.height,e.y+.99*e.height]);return[n,i,s,a,o.POINT_RADIUS*r]}},10398:function(e,r,n){"use strict";n.r(r),n.d(r,{POINT_RADIUS:function(){return t}});let t=.012},19300:function(e,r,n){"use strict";n.r(r);var t=n("801163"),o=n("10398");self.onmessage=({data:{N:e,area:r,type:n,radius:i=o.POINT_RADIUS}})=>{if("fill_rect"===n){let n=3*i,o=n**2*e,s=Math.sqrt(o/(r.width/r.height)),a=o/s;a=Math.ceil(a/n),s=Math.ceil(s/n);let u=r.x+r.width/2-a/2*n,d=r.y+r.height/2-s/2*n,c=Array.from({length:e}).map((e,r)=>({x:r%a*n,y:Math.floor(r/a)*n})),[l,f,p,_,h]=(0,t.forceNormalizationNew)(r);self.postMessage({type:"finish",Y:c.map(e=>({x:u+e.x,y:d+e.y}))})}}}},s={};function a(e){var r=s[e];if(void 0!==r)return r.exports;var n=s[e]={id:e,loaded:!1,exports:{}};return i[e](n,n.exports,a),n.loaded=!0,n.exports}a.m=i,a.x=function(){var e=a.O(void 0,["vendors~node_modules_lodash_groupBy_js~node_modules_umap-js_dist_index_js~node_modules_d3-sca~62a577"],function(){return a("19300")});return e=a.O(e)},e=a.x,a.x=function(){return Promise.all(["vendors~node_modules_lodash_groupBy_js~node_modules_umap-js_dist_index_js~node_modules_d3-sca~62a577"].map(a.e,a)).then(e)},a.f={},a.e=function(e){return Promise.all(Object.keys(a.f).reduce(function(r,n){return a.f[n](e,r),r},[]))},!function(){self.importScripts&&(e=self.location+"");var e,r=self.document;if(!e&&r&&(r.currentScript&&(e=r.currentScript.src),!e)){var n=r.getElementsByTagName("script");n.length&&(e=n[n.length-1].src)}if(!e)throw Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),a.p=e}(),a.u=function(e){return({"vendors~node_modules_lodash_groupBy_js~node_modules_umap-js_dist_index_js~node_modules_d3-sca~62a577":"vendors~node_modules_lodash_groupBy_js~node_modules_umap-js_dist_index_js~node_modules_d3-sca~62a577.main.js"})[e]},a.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},r=[],a.O=function(e,n,t,o){if(n){o=o||0;for(var i=r.length;i>0&&r[i-1][2]>o;i--)r[i]=r[i-1];r[i]=[n,t,o];return}for(var s=1/0,i=0;i<r.length;i++){for(var n=r[i][0],t=r[i][1],o=r[i][2],u=!0,d=0;d<n.length;d++)s>=o&&Object.keys(a.O).every(function(e){return a.O[e](n[d])})?n.splice(d--,1):(u=!1,o<s&&(s=o));if(u){r.splice(i--,1);var c=t();void 0!==c&&(e=c)}}return e},a.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||Function("return this")()}catch(e){if("object"==typeof window)return window}}(),a.d=function(e,r){for(var n in r)a.o(r,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:r[n]})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.nmd=function(e){return e.paths=[],!e.children&&(e.children=[]),e},n={src_Workers_layout_worker_ts:1},a.f.i=function(e,r){!n[e]&&(e?importScripts(a.p+a.u(e)):n[e]=1)},t=self.webpackChunkmy_sample_typescript_app=self.webpackChunkmy_sample_typescript_app||[],o=t.push.bind(t),t.push=function(e){var r=e[0],t=e[1],i=e[2];for(var s in t)a.o(t,s)&&(a.m[s]=t[s]);for(i&&i(a);r.length;)n[r.pop()]=1;o(e)},a.x()}();
//# sourceMappingURL=src_Workers_layout_worker_ts.main.js.map