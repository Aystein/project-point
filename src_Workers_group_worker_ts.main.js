!function(){var e,t,r,n,i,o={10398:function(e,t,r){"use strict";r.r(t),r.d(t,{POINT_RADIUS:function(){return n}});let n=.012},426449:function(e,t,r){"use strict";r.r(t),r.d(t,{Rectangle:function(){return n}});class n{x;y;width;height;constructor(e,t,r,n){this.x=e,this.y=t,this.width=r,this.height=n}within(e){return e.x>this.x&&e.x<this.x+this.width&&e.y>this.y&&e.y<this.y+this.height}serialize(){return{x:this.x,y:this.y,width:this.width,height:this.height}}percent(e,t){return{x:this.x+this.width*e,y:this.y+this.height*t}}percentX(e){return(e-this.x)/this.width}percentY(e){return(e-this.y)/this.height}get centerX(){return this.x+this.width/2}get centerY(){return this.y+this.height/2}static deserialize(e){return new n(e.x,e.y,e.width,e.height)}}},789810:function(e,t,r){"use strict";r.r(t);var n=r("184086"),i=r("826307"),o=r("814796"),s=r.n(o),d=r("905269"),l=r.n(d),u=r("10398"),h=r("426449"),a=r("169805"),c=r("299934"),_=r("427964");self.onmessage=({data:{X:e,area:t,type:r,feature:o,strategy:d}})=>{let f;if("init"!==r)return;let p=h.Rectangle.deserialize(t),g={discriminator:"annotations",type:"xy",labels:[]};self.postMessage({type:"message",message:"Calculating groups"});let y=e.map((e,t)=>({relativeIndex:t,value:e})),m=y.map(e=>e.value[o]),x=e.length;if((0,_.isNumber)(m[0])){let e=y.filter(e=>!(0,_.isNumber)(e.value[o])),t=(0,c.bin)().value(e=>e.value[o])(y);f=t.reduce((e,t)=>(e[`${t.x0} - ${t.x1}`]=t,e),{}),e.length>0&&(f.missing=e)}else f=s(y,e=>e.value[o]);let v=Array(x),j=[{id:"root"}];for(let e of l(f)){j.push({id:e,parent:"root"});let t=f[e];t.forEach(t=>{j.push({id:(0,n.nanoid)(),parent:e})})}let b="slice"===d?i.treemapSlice:i.treemapSquarify,w=(0,i.stratify)().id(e=>e.id).parentId(e=>e.parent)(j).count(),O=(0,i.treemap)().tile(b).paddingTop(3*u.POINT_RADIUS).size([t.width,t.height])(w);for(let e of l(f)){let r=f[e],n=O.children.find(t=>t.id===e),i={x:n.x0+t.x,y:n.y0+t.y,width:n.x1-n.x0,height:n.y1-n.y0},{Y:o,bounds:s}=(0,a.fillRect)(i,r.length,u.POINT_RADIUS),d=p.percentY(12*u.POINT_RADIUS)-p.percentY(0);g.labels.push({position:{x:p.percentX(s.x),y:p.percentY(s.y)-d,width:p.percentX(s.x+s.width)-p.percentX(s.x),height:d},content:e}),r.forEach((e,t)=>{v[e.relativeIndex]=o[t]})}self.postMessage({type:"finish",Y:v,labels:[g]})}},169805:function(e,t,r){"use strict";r.r(t),r.d(t,{fillRect:function(){return o}});var n=r("10398"),i=r("426449");function o(e,t,r=n.POINT_RADIUS){(0===e.width||0===e.height)&&console.log(e);let o=3*r,s=o**2*t,d=Math.sqrt(s/(e.width/e.height)),l=s/d;l=Math.ceil(l/o),d=Math.ceil(d/o);let u=e.x+e.width/2-l/2*o,h=e.y+e.height/2-d/2*o,a=Array.from({length:t}).map((e,t)=>({x:t%l*o,y:Math.floor(t/l)*o}));return{Y:a.map(e=>({x:u+e.x+o/2,y:h+e.y+o/2})),bounds:i.Rectangle.deserialize({x:u,y:h,width:l*o,height:d*o})}}}},s={};function d(e){var t=s[e];if(void 0!==t)return t.exports;var r=s[e]={id:e,loaded:!1,exports:{}};return o[e](r,r.exports,d),r.loaded=!0,r.exports}d.m=o,d.x=function(){var e=d.O(void 0,["vendors~node_modules_d3-scale_src_index_js","vendors~node_modules_lodash_groupBy_js","vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_lodash_lodash_js~~f985a3"],function(){return d("789810")});return e=d.O(e)},e=d.x,d.x=function(){return Promise.all(["vendors~node_modules_d3-scale_src_index_js","vendors~node_modules_lodash_groupBy_js","vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_lodash_lodash_js~~f985a3"].map(d.e,d)).then(e)},d.es=function(e,t){return Object.keys(e).forEach(function(r){"default"!==r&&!Object.prototype.hasOwnProperty.call(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:function(){return e[r]}})}),e},d.f={},d.e=function(e){return Promise.all(Object.keys(d.f).reduce(function(t,r){return d.f[r](e,t),t},[]))},d.u=function(e){return({"vendors~node_modules_d3-scale_src_index_js":"vendors~node_modules_d3-scale_src_index_js.main.js","vendors~node_modules_lodash_groupBy_js":"vendors~node_modules_lodash_groupBy_js.main.js","vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_lodash_lodash_js~~f985a3":"vendors~node_modules_reduxjs_toolkit_dist_redux-toolkit_esm_js~node_modules_lodash_lodash_js~~f985a3.main.js"})[e]},d.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t=[],d.O=function(e,r,n,i){if(r){i=i||0;for(var o=t.length;o>0&&t[o-1][2]>i;o--)t[o]=t[o-1];t[o]=[r,n,i];return}for(var s=1/0,o=0;o<t.length;o++){for(var r=t[o][0],n=t[o][1],i=t[o][2],l=!0,u=0;u<r.length;u++)s>=i&&Object.keys(d.O).every(function(e){return d.O[e](r[u])})?r.splice(u--,1):(l=!1,i<s&&(s=i));if(l){t.splice(o--,1);var h=n();void 0!==h&&(e=h)}}return e},d.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||Function("return this")()}catch(e){if("object"==typeof window)return window}}(),d.d=function(e,t){for(var r in t)d.o(t,r)&&!d.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},d.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},d.n=function(e){return e&&e.__esModule?e.default:e},d.nmd=function(e){return e.paths=[],!e.children&&(e.children=[]),e},r={src_Workers_group_worker_ts:1},d.f.i=function(e,t){!r[e]&&importScripts(d.p+d.u(e))},i=(n=self.webpackChunkliqvis=self.webpackChunkliqvis||[]).push.bind(n),n.push=function(e){var t=e[0],n=e[1],o=e[2];for(var s in n)d.o(n,s)&&(d.m[s]=n[s]);for(o&&o(d);t.length;)r[t.pop()]=1;i(e)},!function(){d.g.importScripts&&(e=d.g.location+"");var e,t=d.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var r=t.getElementsByTagName("script");if(r.length){for(var n=r.length-1;n>-1&&!e;)e=r[n--].src}}if(!e)throw Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),d.p=e}(),d.x()}();
//# sourceMappingURL=src_Workers_group_worker_ts.main.js.map