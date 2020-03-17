/**
 * skylark-clippy - A version of clippy that ported to running on skylarkjs ui.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-clippy/
 * @license MIT
 */
define(["skylark-jquery","./Agent"],function(e,t){"use strict";class n{constructor(s,a,r,o){let d,i,l=(o=o||window.CLIPPY_CDN||"https://gitcdn.xyz/repo/pi0/clippyjs/master/assets/agents/")+s,c=n._loadMap(l),u=n._loadAgent(s,l),p=n._loadSounds(s,l);u.done(function(e){d=e}),p.done(function(e){i=e});e.when(c,u,p).done(function(){let e=new t(l,d,i);a(e)}).fail(r)}static _loadMap(t){let s=n._maps[t];if(s)return s;s=n._maps[t]=e.Deferred();let a=t+"/map.png",r=new Image;return r.onload=s.resolve,r.onerror=s.reject,r.setAttribute("src",a),s.promise()}static _loadSounds(t,s){let a=n._sounds[t];if(a)return a;a=n._sounds[t]=e.Deferred();let r=document.createElement("audio"),o=!!r.canPlayType&&""!==r.canPlayType("audio/mpeg"),d=!!r.canPlayType&&""!==r.canPlayType('audio/ogg; codecs="vorbis"');if(o||d){let e=s+(o?"/sounds-mp3.js":"/sounds-ogg.js");n._loadScript(e)}else a.resolve({});return a.promise()}static _loadAgent(e,t){let s=n._data[e];if(s)return s;s=n._getAgentDfd(e);let a=t+"/agent.js";return n._loadScript(a),s.promise()}static _loadScript(e){let t=document.createElement("script");t.setAttribute("src",e),t.setAttribute("async","async"),t.setAttribute("type","text/javascript"),document.head.appendChild(t)}static _getAgentDfd(t){let s=n._data[t];return s||(s=n._data[t]=e.Deferred()),s}}return n._maps={},n._sounds={},n._data={},{load:n,ready:function(e,t){n._getAgentDfd(e).resolve(t)},soundsReady:function(t,s){let a=n._sounds[t];a||(a=n._sounds[t]=e.Deferred()),a.resolve(s)}}});
//# sourceMappingURL=sourcemaps/loads.js.map
