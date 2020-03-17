/**
 * skylark-clippy - A version of clippy that ported to running on skylarkjs ui.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-clippy/
 * @license MIT
 */
define(["skylark-jquery"],function(t){"use strict";class e{constructor(e,i,n,s){this._el=e,this._data=n,this._path=i,this._currentFrameIndex=0,this._currentFrame=void 0,this._exiting=!1,this._currentAnimation=void 0,this._endCallback=void 0,this._started=!1,this._sounds={},this.currentAnimationName=void 0,this.preloadSounds(s),this._overlays=[this._el];let r=this._el;this._setupElement(this._el);for(let e=1;e<this._data.overlayCount;e++){let e=this._setupElement(t("<div></div>"));r.append(e),this._overlays.push(e),r=e}}_setupElement(t){let e=this._data.framesize;return t.css("display","none"),t.css({width:e[0],height:e[1]}),t.css("background","url('"+this._path+"/map.png') no-repeat"),t}animations(){let t=[],e=this._data.animations;for(let i in e)t.push(i);return t}preloadSounds(t){for(let e=0;e<this._data.sounds.length;e++){let i=this._data.sounds[e],n=t[i];n&&(this._sounds[i]=new Audio(n))}}hasAnimation(t){return!!this._data.animations[t]}exitAnimation(){this._exiting=!0}showAnimation(t,e){return this._exiting=!1,!!this.hasAnimation(t)&&(this._currentAnimation=this._data.animations[t],this.currentAnimationName=t,this._started||(this._step(),this._started=!0),this._currentFrameIndex=0,this._currentFrame=void 0,this._endCallback=e,!0)}_draw(){let t=[];this._currentFrame&&(t=this._currentFrame.images||[]);for(let e=0;e<this._overlays.length;e++)if(e<t.length){let i=t[e],n=-i[0]+"px "+-i[1]+"px";this._overlays[e].css({"background-position":n,display:"block"})}else this._overlays[e].css("display","none")}_getNextAnimationFrame(){if(!this._currentAnimation)return;if(!this._currentFrame)return 0;let t=this._currentFrame,e=this._currentFrame.branching;if(this._exiting&&void 0!==t.exitBranch)return t.exitBranch;if(e){let t=100*Math.random();for(let i=0;i<e.branches.length;i++){let n=e.branches[i];if(t<=n.weight)return n.frameIndex;t-=n.weight}}return this._currentFrameIndex+1}_playSound(){let t=this._currentFrame.sound;if(!t)return;let e=this._sounds[t];e&&e.play()}_atLastFrame(){return this._currentFrameIndex>=this._currentAnimation.frames.length-1}_step(){if(!this._currentAnimation)return;let i=Math.min(this._getNextAnimationFrame(),this._currentAnimation.frames.length-1),n=!this._currentFrame||this._currentFrameIndex!==i;this._currentFrameIndex=i,this._atLastFrame()&&this._currentAnimation.useExitBranching||(this._currentFrame=this._currentAnimation.frames[this._currentFrameIndex]),this._draw(),this._playSound(),this._loop=window.setTimeout(t.proxy(this._step,this),this._currentFrame.duration),this._endCallback&&n&&this._atLastFrame()&&(this._currentAnimation.useExitBranching&&!this._exiting?this._endCallback(this.currentAnimationName,e.States.WAITING):this._endCallback(this.currentAnimationName,e.States.EXITED))}pause(){window.clearTimeout(this._loop)}resume(){this._step()}}return e.States={WAITING:1,EXITED:0},e});
//# sourceMappingURL=sourcemaps/Animator.js.map
