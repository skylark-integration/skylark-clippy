/**
 * skylark-clippy - A version of clippy that ported to running on skylarkjs ui.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-clippy/
 * @license MIT
 */
define(["skylark-jquery"],function(t){"use strict";return class{constructor(t){this._targetEl=t,this._hidden=!0,this._setup(),this.WORD_SPEAK_TIME=200,this.CLOSE_BALLOON_DELAY=2e3,this._BALLOON_MARGIN=15}_setup(){this._balloon=t('<div class="clippy-balloon"><div class="clippy-tip"></div><div class="clippy-content"></div></div> ').hide(),this._content=this._balloon.find(".clippy-content"),t(document.body).append(this._balloon)}reposition(){let t=["top-left","top-right","bottom-left","bottom-right"];for(let i=0;i<t.length;i++){let o=t[i];if(this._position(o),!this._isOut())break}}_position(i){let o=this._targetEl.offset(),s=this._targetEl.height(),h=this._targetEl.width();o.top-=t(window).scrollTop(),o.left-=t(window).scrollLeft();let e,l,_=this._balloon.outerHeight(),d=this._balloon.outerWidth();switch(this._balloon.removeClass("clippy-top-left"),this._balloon.removeClass("clippy-top-right"),this._balloon.removeClass("clippy-bottom-right"),this._balloon.removeClass("clippy-bottom-left"),i){case"top-left":e=o.left+h-d,l=o.top-_-this._BALLOON_MARGIN;break;case"top-right":e=o.left,l=o.top-_-this._BALLOON_MARGIN;break;case"bottom-right":e=o.left,l=o.top+s+this._BALLOON_MARGIN;break;case"bottom-left":e=o.left+h-d,l=o.top+s+this._BALLOON_MARGIN}this._balloon.css({top:l,left:e}),this._balloon.addClass("clippy-"+i)}_isOut(){let i=this._balloon.offset(),o=this._balloon.outerHeight(),s=this._balloon.outerWidth(),h=t(window).width(),e=t(window).height(),l=t(document).scrollTop(),_=t(document).scrollLeft(),d=i.top-l,n=i.left-_;return d-5<0||n-5<0||d+o+5>e||n+s+5>h}speak(t,i,o){this._hidden=!1,this.show();let s=this._content;s.height("auto"),s.width("auto"),s.text(i),s.height(s.height()),s.width(s.width()),s.text(""),this.reposition(),this._complete=t,this._sayWords(i,o,t)}show(){this._hidden||this._balloon.show()}hide(i){i?this._balloon.hide():this._hiding=window.setTimeout(t.proxy(this._finishHideBalloon,this),this.CLOSE_BALLOON_DELAY)}_finishHideBalloon(){this._active||(this._balloon.hide(),this._hidden=!0,this._hiding=null)}_sayWords(i,o,s){this._active=!0,this._hold=o;let h=i.split(/[^\S-]/),e=this.WORD_SPEAK_TIME,l=this._content,_=1;this._addWord=t.proxy(function(){this._active&&(_>h.length?(delete this._addWord,this._active=!1,this._hold||(s(),this.hide())):(l.text(h.slice(0,_).join(" ")),_++,this._loop=window.setTimeout(t.proxy(this._addWord,this),e)))},this),this._addWord()}close(){this._active?this._hold=!1:this._hold&&this._complete()}pause(){window.clearTimeout(this._loop),this._hiding&&(window.clearTimeout(this._hiding),this._hiding=null)}resume(){this._addWord?this._addWord():this._hold||this._hidden||(this._hiding=window.setTimeout(t.proxy(this._finishHideBalloon,this),this.CLOSE_BALLOON_DELAY))}}});
//# sourceMappingURL=sourcemaps/Balloon.js.map