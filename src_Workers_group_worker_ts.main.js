!function(){var e,t,r,i,n,o={10398:function(e,t,r){"use strict";r.r(t),r.d(t,{POINT_RADIUS:function(){return i}});let i=.012},426449:function(e,t,r){"use strict";r.r(t),r.d(t,{Rectangle:function(){return i}});class i{x;y;width;height;constructor(e,t,r,i){this.x=e,this.y=t,this.width=r,this.height=i}within(e){return e.x>this.x&&e.x<this.x+this.width&&e.y>this.y&&e.y<this.y+this.height}serialize(){return{x:this.x,y:this.y,width:this.width,height:this.height}}percent(e,t){return{x:this.x+this.width*e,y:this.y+this.height*t}}percentX(e){return(e-this.x)/this.width}percentY(e){return(e-this.y)/this.height}get centerX(){return this.x+this.width/2}get centerY(){return this.y+this.height/2}static deserialize(e){return new i(e.x,e.y,e.width,e.height)}}},789810:function(e,t,r){"use strict";r.r(t);var i=r("814796"),n=r.n(i),o=r("905269"),s=r.n(o),h=r("426449"),u=r("826307"),d=r("184086"),c=r("169805"),l=r("10398");self.onmessage=({data:{X:e,area:t,type:r,feature:i,strategy:o}})=>{if("init"!==r)return;let a=h.Rectangle.deserialize(t),f={discriminator:"annotations",type:"xy",labels:[]};self.postMessage({type:"message",message:"Calculating groups"});let p=e.map((e,t)=>({relativeIndex:t,value:e})),_=e.length,y=n(p,e=>e.value[i]),g=Array(_),m=[{id:"root"}];for(let e of s(y)){m.push({id:e,parent:"root"});let t=y[e];t.forEach(t=>{m.push({id:(0,d.nanoid)(),parent:e})})}let x="slice"===o?u.treemapSlice:u.treemapSquarify,v=(0,u.stratify)().id(e=>e.id).parentId(e=>e.parent)(m).count(),w=(0,u.treemap)().tile(x).paddingTop(3*l.POINT_RADIUS).size([t.width,t.height])(v);for(let e of s(y)){let r=y[e],i=w.children.find(t=>t.id===e),n={x:i.x0+t.x,y:i.y0+t.y,width:i.x1-i.x0,height:i.y1-i.y0},{Y:o,bounds:s}=(0,c.fillRect)(n,r.length,l.POINT_RADIUS),h=a.percentY(12*l.POINT_RADIUS)-a.percentY(0);f.labels.push({position:{x:a.percentX(s.x),y:a.percentY(s.y)-h,width:a.percentX(s.x+s.width)-a.percentX(s.x),height:h},content:e}),r.forEach((e,t)=>{g[e.relativeIndex]=o[t]})}self.postMessage({type:"finish",Y:g,labels:[f]})}},169805:function(e,t,r){"use strict";r.r(t),r.d(t,{fillRect:function(){return o}});var i=r("10398"),n=r("426449");function o(e,t,r=i.POINT_RADIUS){(0===e.width||0===e.height)&&console.log(e);let o=3*r,s=o**2*t,h=Math.sqrt(s/(e.width/e.height)),u=s/h;u=Math.ceil(u/o),h=Math.ceil(h/o);let d=e.x+e.width/2-u/2*o,c=e.y+e.height/2-h/2*o,l=Array.from({length:t}).map((e,t)=>({x:t%u*o,y:Math.floor(t/u)*o}));return{Y:l.map(e=>({x:d+e.x+o/2,y:c+e.y+o/2})),bounds:n.Rectangle.deserialize({x:d,y:c,width:u*o,height:h*o})}}}},s={};function h(e){var t=s[e];if(void 0!==t)return t.exports;var r=s[e]={id:e,loaded:!1,exports:{}};return o[e](r,r.exports,h),r.loaded=!0,r.exports}h.m=o,h.x=function(){var e=h.O(void 0,["vendors~node_modules_lodash_groupBy_js","vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_d3-hierarchy_src_~e31acd"],function(){return h("789810")});return e=h.O(e)},e=h.x,h.x=function(){return Promise.all(["vendors~node_modules_lodash_groupBy_js","vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_d3-hierarchy_src_~e31acd"].map(h.e,h)).then(e)},h.es=function(e,t){return Object.keys(e).forEach(function(r){"default"!==r&&!Object.prototype.hasOwnProperty.call(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:function(){return e[r]}})}),e},h.f={},h.e=function(e){return Promise.all(Object.keys(h.f).reduce(function(t,r){return h.f[r](e,t),t},[]))},h.u=function(e){return({"vendors~node_modules_lodash_groupBy_js":"vendors~node_modules_lodash_groupBy_js.main.js","vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_d3-hierarchy_src_~e31acd":"vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_d3-hierarchy_src_~e31acd.main.js"})[e]},h.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t=[],h.O=function(e,r,i,n){if(r){n=n||0;for(var o=t.length;o>0&&t[o-1][2]>n;o--)t[o]=t[o-1];t[o]=[r,i,n];return}for(var s=1/0,o=0;o<t.length;o++){for(var r=t[o][0],i=t[o][1],n=t[o][2],u=!0,d=0;d<r.length;d++)s>=n&&Object.keys(h.O).every(function(e){return h.O[e](r[d])})?r.splice(d--,1):(u=!1,n<s&&(s=n));if(u){t.splice(o--,1);var c=i();void 0!==c&&(e=c)}}return e},h.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||Function("return this")()}catch(e){if("object"==typeof window)return window}}(),h.d=function(e,t){for(var r in t)h.o(t,r)&&!h.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},h.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},h.n=function(e){return e&&e.__esModule?e.default:e},h.nmd=function(e){return e.paths=[],!e.children&&(e.children=[]),e},r={src_Workers_group_worker_ts:1},h.f.i=function(e,t){!r[e]&&importScripts(h.p+h.u(e))},n=(i=self.webpackChunkliqvis=self.webpackChunkliqvis||[]).push.bind(i),i.push=function(e){var t=e[0],i=e[1],o=e[2];for(var s in i)h.o(i,s)&&(h.m[s]=i[s]);for(o&&o(h);t.length;)r[t.pop()]=1;n(e)},!function(){h.g.importScripts&&(e=h.g.location+"");var e,t=h.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var r=t.getElementsByTagName("script");if(r.length){for(var i=r.length-1;i>-1&&!e;)e=r[i--].src}}if(!e)throw Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),h.p=e}(),h.x()}();
//# sourceMappingURL=src_Workers_group_worker_ts.main.js.map