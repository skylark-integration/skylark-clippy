/**
 * skylark-clippy - A version of clippy that ported to running on skylarkjs ui.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-clippy/
 * @license MIT
 */
!function(t,e){var i=e.define,require=e.require,s="function"==typeof i&&i.amd,o=!s&&"undefined"!=typeof exports;if(!s&&!i){var n={};i=e.define=function(t,e,i){"function"==typeof i?(n[t]={factory:i,deps:e.map(function(e){return function(t,e){if("."!==t[0])return t;var i=e.split("/"),s=t.split("/");i.pop();for(var o=0;o<s.length;o++)"."!=s[o]&&(".."==s[o]?i.pop():i.push(s[o]));return i.join("/")}(e,t)}),resolved:!1,exports:null},require(t)):n[t]={factory:null,resolved:!0,exports:i}},require=e.require=function(t){if(!n.hasOwnProperty(t))throw new Error("Module "+t+" has not been defined");var module=n[t];if(!module.resolved){var i=[];module.deps.forEach(function(t){i.push(require(t))}),module.exports=module.factory.apply(e,i)||null,module.resolved=!0}return module.exports}}if(!i)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(t,require){t("skylark-clippy/Queue",["skylark-jquery"],function(t){"use strict";return class{constructor(t){this._queue=[],this._onEmptyCallback=t}queue(t){this._queue.push(t),1!==this._queue.length||this._active||this._progressQueue()}_progressQueue(){if(!this._queue.length)return void this._onEmptyCallback();let e=this._queue.shift();this._active=!0;let i=t.proxy(this.next,this);e(i)}clear(){this._queue=[]}next(){this._active=!1,this._progressQueue()}}}),t("skylark-clippy/Animator",["skylark-jquery"],function(t){"use strict";class e{constructor(e,i,s,o){this._el=e,this._data=s,this._path=i,this._currentFrameIndex=0,this._currentFrame=void 0,this._exiting=!1,this._currentAnimation=void 0,this._endCallback=void 0,this._started=!1,this._sounds={},this.currentAnimationName=void 0,this.preloadSounds(o),this._overlays=[this._el];let n=this._el;this._setupElement(this._el);for(let e=1;e<this._data.overlayCount;e++){let e=this._setupElement(t("<div></div>"));n.append(e),this._overlays.push(e),n=e}}_setupElement(t){let e=this._data.framesize;return t.css("display","none"),t.css({width:e[0],height:e[1]}),t.css("background","url('"+this._path+"/map.png') no-repeat"),t}animations(){let t=[],e=this._data.animations;for(let i in e)t.push(i);return t}preloadSounds(t){for(let e=0;e<this._data.sounds.length;e++){let i=this._data.sounds[e],s=t[i];s&&(this._sounds[i]=new Audio(s))}}hasAnimation(t){return!!this._data.animations[t]}exitAnimation(){this._exiting=!0}showAnimation(t,e){return this._exiting=!1,!!this.hasAnimation(t)&&(this._currentAnimation=this._data.animations[t],this.currentAnimationName=t,this._started||(this._step(),this._started=!0),this._currentFrameIndex=0,this._currentFrame=void 0,this._endCallback=e,!0)}_draw(){let t=[];this._currentFrame&&(t=this._currentFrame.images||[]);for(let e=0;e<this._overlays.length;e++)if(e<t.length){let i=t[e],s=-i[0]+"px "+-i[1]+"px";this._overlays[e].css({"background-position":s,display:"block"})}else this._overlays[e].css("display","none")}_getNextAnimationFrame(){if(!this._currentAnimation)return;if(!this._currentFrame)return 0;let t=this._currentFrame,e=this._currentFrame.branching;if(this._exiting&&void 0!==t.exitBranch)return t.exitBranch;if(e){let t=100*Math.random();for(let i=0;i<e.branches.length;i++){let s=e.branches[i];if(t<=s.weight)return s.frameIndex;t-=s.weight}}return this._currentFrameIndex+1}_playSound(){let t=this._currentFrame.sound;if(!t)return;let e=this._sounds[t];e&&e.play()}_atLastFrame(){return this._currentFrameIndex>=this._currentAnimation.frames.length-1}_step(){if(!this._currentAnimation)return;let i=Math.min(this._getNextAnimationFrame(),this._currentAnimation.frames.length-1),s=!this._currentFrame||this._currentFrameIndex!==i;this._currentFrameIndex=i,this._atLastFrame()&&this._currentAnimation.useExitBranching||(this._currentFrame=this._currentAnimation.frames[this._currentFrameIndex]),this._draw(),this._playSound(),this._loop=window.setTimeout(t.proxy(this._step,this),this._currentFrame.duration),this._endCallback&&s&&this._atLastFrame()&&(this._currentAnimation.useExitBranching&&!this._exiting?this._endCallback(this.currentAnimationName,e.States.WAITING):this._endCallback(this.currentAnimationName,e.States.EXITED))}pause(){window.clearTimeout(this._loop)}resume(){this._step()}}return e.States={WAITING:1,EXITED:0},e}),t("skylark-clippy/Balloon",["skylark-jquery"],function(t){"use strict";return class{constructor(t){this._targetEl=t,this._hidden=!0,this._setup(),this.WORD_SPEAK_TIME=200,this.CLOSE_BALLOON_DELAY=2e3,this._BALLOON_MARGIN=15}_setup(){this._balloon=t('<div class="clippy-balloon"><div class="clippy-tip"></div><div class="clippy-content"></div></div> ').hide(),this._content=this._balloon.find(".clippy-content"),t(document.body).append(this._balloon)}reposition(){let t=["top-left","top-right","bottom-left","bottom-right"];for(let e=0;e<t.length;e++){let i=t[e];if(this._position(i),!this._isOut())break}}_position(e){let i=this._targetEl.offset(),s=this._targetEl.height(),o=this._targetEl.width();i.top-=t(window).scrollTop(),i.left-=t(window).scrollLeft();let n,a,r=this._balloon.outerHeight(),h=this._balloon.outerWidth();switch(this._balloon.removeClass("clippy-top-left"),this._balloon.removeClass("clippy-top-right"),this._balloon.removeClass("clippy-bottom-right"),this._balloon.removeClass("clippy-bottom-left"),e){case"top-left":n=i.left+o-h,a=i.top-r-this._BALLOON_MARGIN;break;case"top-right":n=i.left,a=i.top-r-this._BALLOON_MARGIN;break;case"bottom-right":n=i.left,a=i.top+s+this._BALLOON_MARGIN;break;case"bottom-left":n=i.left+o-h,a=i.top+s+this._BALLOON_MARGIN}this._balloon.css({top:a,left:n}),this._balloon.addClass("clippy-"+e)}_isOut(){let e=this._balloon.offset(),i=this._balloon.outerHeight(),s=this._balloon.outerWidth(),o=t(window).width(),n=t(window).height(),a=t(document).scrollTop(),r=t(document).scrollLeft(),h=e.top-a,l=e.left-r;return h-5<0||l-5<0||(h+i+5>n||l+s+5>o)}speak(t,e,i){this._hidden=!1,this.show();let s=this._content;s.height("auto"),s.width("auto"),s.text(e),s.height(s.height()),s.width(s.width()),s.text(""),this.reposition(),this._complete=t,this._sayWords(e,i,t)}show(){this._hidden||this._balloon.show()}hide(e){e?this._balloon.hide():this._hiding=window.setTimeout(t.proxy(this._finishHideBalloon,this),this.CLOSE_BALLOON_DELAY)}_finishHideBalloon(){this._active||(this._balloon.hide(),this._hidden=!0,this._hiding=null)}_sayWords(e,i,s){this._active=!0,this._hold=i;let o=e.split(/[^\S-]/),n=this.WORD_SPEAK_TIME,a=this._content,r=1;this._addWord=t.proxy(function(){this._active&&(r>o.length?(delete this._addWord,this._active=!1,this._hold||(s(),this.hide())):(a.text(o.slice(0,r).join(" ")),r++,this._loop=window.setTimeout(t.proxy(this._addWord,this),n)))},this),this._addWord()}close(){this._active?this._hold=!1:this._hold&&this._complete()}pause(){window.clearTimeout(this._loop),this._hiding&&(window.clearTimeout(this._hiding),this._hiding=null)}resume(){this._addWord?this._addWord():this._hold||this._hidden||(this._hiding=window.setTimeout(t.proxy(this._finishHideBalloon,this),this.CLOSE_BALLOON_DELAY))}}}),t("skylark-clippy/Agent",["skylark-jquery","./Queue","./Animator","./Balloon"],function(t,e,i,s){"use strict";return class{constructor(o,n,a){this.path=o,this._queue=new e(t.proxy(this._onQueueEmpty,this)),this._el=t('<div class="clippy"></div>').hide(),t(document.body).append(this._el),this._animator=new i(this._el,o,n,a),this._balloon=new s(this._el),this._setupEvents()}gestureAt(t,e){let i=this._getDirection(t,e),s="Gesture"+i,o="Look"+i,n=this.hasAnimation(s)?s:o;return this.play(n)}hide(t,e){this._hidden=!0;let i=this._el;return this.stop(),t?(this._el.hide(),this.stop(),this.pause(),void(e&&e())):this._playInternal("Hide",function(){i.hide(),this.pause(),e&&e()})}moveTo(e,s,o){let n=this._getDirection(e,s),a="Move"+n;void 0===o&&(o=1e3),this._addToQueue(function(n){if(0===o)return this._el.css({top:s,left:e}),this.reposition(),void n();if(!this.hasAnimation(a))return void this._el.animate({top:s,left:e},o,n);let r=t.proxy(function(a,r){r===i.States.EXITED&&n(),r===i.States.WAITING&&this._el.animate({top:s,left:e},o,t.proxy(function(){this._animator.exitAnimation()},this))},this);this._playInternal(a,r)},this)}_playInternal(e,i){this._isIdleAnimation()&&this._idleDfd&&"pending"===this._idleDfd.state()&&this._idleDfd.done(t.proxy(function(){this._playInternal(e,i)},this)),this._animator.showAnimation(e,i)}play(e,s,o){return!!this.hasAnimation(e)&&(void 0===s&&(s=5e3),this._addToQueue(function(n){let a=!1;s&&window.setTimeout(t.proxy(function(){a||this._animator.exitAnimation()},this),s),this._playInternal(e,function(t,e){e===i.States.EXITED&&(a=!0,o&&o(),n())})},this),!0)}show(e){if(this._hidden=!1,e)return this._el.show(),this.resume(),void this._onQueueEmpty();if("auto"===this._el.css("top")||"auto"===!this._el.css("left")){let e=.8*t(window).width(),i=.8*(t(window).height()+t(document).scrollTop());this._el.css({top:i,left:e})}return this.resume(),this.play("Show")}speak(t,e){this._addToQueue(function(i){this._balloon.speak(i,t,e)},this)}closeBalloon(){this._balloon.hide()}delay(t){t=t||250,this._addToQueue(function(e){this._onQueueEmpty(),window.setTimeout(e,t)})}stopCurrent(){this._animator.exitAnimation(),this._balloon.close()}stop(){this._queue.clear(),this._animator.exitAnimation(),this._balloon.hide()}hasAnimation(t){return this._animator.hasAnimation(t)}animations(){return this._animator.animations()}animate(){let t=this.animations(),e=t[Math.floor(Math.random()*t.length)];return 0===e.indexOf("Idle")?this.animate():this.play(e)}_getDirection(t,e){let i=this._el.offset(),s=this._el.height(),o=this._el.width(),n=i.left+o/2,a=i.top+s/2,r=a-e,h=n-t,l=Math.round(180*Math.atan2(r,h)/Math.PI);return-45<=l&&l<45?"Right":45<=l&&l<135?"Up":135<=l&&l<=180||-180<=l&&l<-135?"Left":-135<=l&&l<-45?"Down":"Top"}_onQueueEmpty(){if(this._hidden||this._isIdleAnimation())return;let e=this._getIdleAnimation();this._idleDfd=t.Deferred(),this._animator.showAnimation(e,t.proxy(this._onIdleComplete,this))}_onIdleComplete(t,e){e===i.States.EXITED&&this._idleDfd.resolve()}_isIdleAnimation(){let t=this._animator.currentAnimationName;return t&&0===t.indexOf("Idle")}_getIdleAnimation(){let t=this.animations(),e=[];for(let i=0;i<t.length;i++){let s=t[i];0===s.indexOf("Idle")&&e.push(s)}let i=Math.floor(Math.random()*e.length);return e[i]}_setupEvents(){t(window).on("resize",t.proxy(this.reposition,this)),this._el.on("mousedown",t.proxy(this._onMouseDown,this)),this._el.on("dblclick",t.proxy(this._onDoubleClick,this))}_onDoubleClick(){this.play("ClickedOn")||this.animate()}reposition(){if(!this._el.is(":visible"))return;let e=this._el.offset(),i=this._el.outerHeight(),s=this._el.outerWidth(),o=t(window).width(),n=t(window).height(),a=t(window).scrollTop(),r=t(window).scrollLeft(),h=e.top-a,l=e.left-r;h-5<0?h=5:h+i+5>n&&(h=n-i-5),l-5<0?l=5:l+s+5>o&&(l=o-s-5),this._el.css({left:l,top:h}),this._balloon.reposition()}_onMouseDown(t){t.preventDefault(),this._startDrag(t)}_startDrag(e){this.pause(),this._balloon.hide(!0),this._offset=this._calculateClickOffset(e),this._moveHandle=t.proxy(this._dragMove,this),this._upHandle=t.proxy(this._finishDrag,this),t(window).on("mousemove",this._moveHandle),t(window).on("mouseup",this._upHandle),this._dragUpdateLoop=window.setTimeout(t.proxy(this._updateLocation,this),10)}_calculateClickOffset(t){let e=t.pageX,i=t.pageY,s=this._el.offset();return{top:i-s.top,left:e-s.left}}_updateLocation(){this._el.css({top:this._targetY,left:this._targetX}),this._dragUpdateLoop=window.setTimeout(t.proxy(this._updateLocation,this),10)}_dragMove(t){t.preventDefault();let e=t.clientX-this._offset.left,i=t.clientY-this._offset.top;this._targetX=e,this._targetY=i}_finishDrag(){window.clearTimeout(this._dragUpdateLoop),t(window).off("mousemove",this._moveHandle),t(window).off("mouseup",this._upHandle),this._balloon.show(),this.reposition(),this.resume()}_addToQueue(e,i){i&&(e=t.proxy(e,i)),this._queue.queue(e)}pause(){this._animator.pause(),this._balloon.pause()}resume(){this._animator.resume(),this._balloon.resume()}}}),t("skylark-clippy/loads",["skylark-jquery","./Agent"],function(t,e){"use strict";class i{constructor(s,o,n,a){let r,h,l=(a=a||window.CLIPPY_CDN||"https://gitcdn.xyz/repo/pi0/clippyjs/master/assets/agents/")+s,d=i._loadMap(l),_=i._loadAgent(s,l),u=i._loadSounds(s,l);_.done(function(t){r=t}),u.done(function(t){h=t});t.when(d,_,u).done(function(){let t=new e(l,r,h);o(t)}).fail(n)}static _loadMap(e){let s=i._maps[e];if(s)return s;s=i._maps[e]=t.Deferred();let o=e+"/map.png",n=new Image;return n.onload=s.resolve,n.onerror=s.reject,n.setAttribute("src",o),s.promise()}static _loadSounds(e,s){let o=i._sounds[e];if(o)return o;o=i._sounds[e]=t.Deferred();let n=document.createElement("audio"),a=!!n.canPlayType&&""!==n.canPlayType("audio/mpeg"),r=!!n.canPlayType&&""!==n.canPlayType('audio/ogg; codecs="vorbis"');if(a||r){let t=s+(a?"/sounds-mp3.js":"/sounds-ogg.js");i._loadScript(t)}else o.resolve({});return o.promise()}static _loadAgent(t,e){let s=i._data[t];if(s)return s;s=i._getAgentDfd(t);let o=e+"/agent.js";return i._loadScript(o),s.promise()}static _loadScript(t){let e=document.createElement("script");e.setAttribute("src",t),e.setAttribute("async","async"),e.setAttribute("type","text/javascript"),document.head.appendChild(e)}static _getAgentDfd(e){let s=i._data[e];return s||(s=i._data[e]=t.Deferred()),s}}return i._maps={},i._sounds={},i._data={},{load:i,ready:function(t,e){i._getAgentDfd(t).resolve(e)},soundsReady:function(e,s){let o=i._sounds[e];o||(o=i._sounds[e]=t.Deferred());o.resolve(s)}}}),t("skylark-clippy/main",["skylark-langx/skylark","./Agent","./Animator","./Queue","./Balloon","./loads"],function(t,e,i,s,o,n){"use strict";const a={Agent:e,Animator:i,Queue:s,Balloon:o,load:n.load,ready:n.ready,soundsReady:n.soundsReady};return t.attach("intg.clippy",a)}),t("skylark-clippy",["skylark-clippy/main"],function(t){return t})}(i),!s){var a=require("skylark-langx-ns");o?module.exports=a:e.skylarkjs=a}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-clippy.js.map
