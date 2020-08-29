/**
 * skylark-clippy - A version of clippy that ported to running on skylarkjs ui.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-clippy/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-clippy/Queue',['skylark-jquery'], function ($) {
    'use strict';
    class Queue {
        constructor(onEmptyCallback) {
            this._queue = [];
            this._onEmptyCallback = onEmptyCallback;
        }
        queue(func) {
            this._queue.push(func);
            if (this._queue.length === 1 && !this._active) {
                this._progressQueue();
            }
        }
        _progressQueue() {
            if (!this._queue.length) {
                this._onEmptyCallback();
                return;
            }
            let f = this._queue.shift();
            this._active = true;
            let completeFunction = $.proxy(this.next, this);
            f(completeFunction);
        }
        clear() {
            this._queue = [];
        }
        next() {
            this._active = false;
            this._progressQueue();
        }
    }

    return Queue;
});
define('skylark-clippy/Animator',['skylark-jquery'], function ($) {
    'use strict';
    class Animator {
        constructor(el, path, data, sounds) {
            this._el = el;
            this._data = data;
            this._path = path;
            this._currentFrameIndex = 0;
            this._currentFrame = undefined;
            this._exiting = false;
            this._currentAnimation = undefined;
            this._endCallback = undefined;
            this._started = false;
            this._sounds = {};
            this.currentAnimationName = undefined;
            this.preloadSounds(sounds);
            this._overlays = [this._el];
            let curr = this._el;
            this._setupElement(this._el);
            for (let i = 1; i < this._data.overlayCount; i++) {
                let inner = this._setupElement($('<div></div>'));
                curr.append(inner);
                this._overlays.push(inner);
                curr = inner;
            }
        }
        _setupElement(el) {
            let frameSize = this._data.framesize;
            el.css('display', 'none');
            el.css({
                width: frameSize[0],
                height: frameSize[1]
            });
            el.css('background', "url('" + this._path + "/map.png') no-repeat");
            return el;
        }
        animations() {
            let r = [];
            let d = this._data.animations;
            for (let n in d) {
                r.push(n);
            }
            return r;
        }
        preloadSounds(sounds) {
            for (let i = 0; i < this._data.sounds.length; i++) {
                let snd = this._data.sounds[i];
                let uri = sounds[snd];
                if (!uri)
                    continue;
                this._sounds[snd] = new Audio(uri);
            }
        }
        hasAnimation(name) {
            return !!this._data.animations[name];
        }
        exitAnimation() {
            this._exiting = true;
        }
        showAnimation(animationName, stateChangeCallback) {
            this._exiting = false;
            if (!this.hasAnimation(animationName)) {
                return false;
            }
            this._currentAnimation = this._data.animations[animationName];
            this.currentAnimationName = animationName;
            if (!this._started) {
                this._step();
                this._started = true;
            }
            this._currentFrameIndex = 0;
            this._currentFrame = undefined;
            this._endCallback = stateChangeCallback;
            return true;
        }
        _draw() {
            let images = [];
            if (this._currentFrame)
                images = this._currentFrame.images || [];
            for (let i = 0; i < this._overlays.length; i++) {
                if (i < images.length) {
                    let xy = images[i];
                    let bg = -xy[0] + 'px ' + -xy[1] + 'px';
                    this._overlays[i].css({
                        'background-position': bg,
                        'display': 'block'
                    });
                } else {
                    this._overlays[i].css('display', 'none');
                }
            }
        }
        _getNextAnimationFrame() {
            if (!this._currentAnimation)
                return undefined;
            if (!this._currentFrame)
                return 0;
            let currentFrame = this._currentFrame;
            let branching = this._currentFrame.branching;
            if (this._exiting && currentFrame.exitBranch !== undefined) {
                return currentFrame.exitBranch;
            } else if (branching) {
                let rnd = Math.random() * 100;
                for (let i = 0; i < branching.branches.length; i++) {
                    let branch = branching.branches[i];
                    if (rnd <= branch.weight) {
                        return branch.frameIndex;
                    }
                    rnd -= branch.weight;
                }
            }
            return this._currentFrameIndex + 1;
        }
        _playSound() {
            let s = this._currentFrame.sound;
            if (!s)
                return;
            let audio = this._sounds[s];
            if (audio)
                audio.play();
        }
        _atLastFrame() {
            return this._currentFrameIndex >= this._currentAnimation.frames.length - 1;
        }
        _step() {
            if (!this._currentAnimation)
                return;
            let newFrameIndex = Math.min(this._getNextAnimationFrame(), this._currentAnimation.frames.length - 1);
            let frameChanged = !this._currentFrame || this._currentFrameIndex !== newFrameIndex;
            this._currentFrameIndex = newFrameIndex;
            if (!(this._atLastFrame() && this._currentAnimation.useExitBranching)) {
                this._currentFrame = this._currentAnimation.frames[this._currentFrameIndex];
            }
            this._draw();
            this._playSound();
            this._loop = window.setTimeout($.proxy(this._step, this), this._currentFrame.duration);
            if (this._endCallback && frameChanged && this._atLastFrame()) {
                if (this._currentAnimation.useExitBranching && !this._exiting) {
                    this._endCallback(this.currentAnimationName, Animator.States.WAITING);
                } else {
                    this._endCallback(this.currentAnimationName, Animator.States.EXITED);
                }
            }
        }
        pause() {
            window.clearTimeout(this._loop);
        }
        resume() {
            this._step();
        }
    }
    
    Animator.States = {
        WAITING: 1,
        EXITED: 0
    };

    return Animator;
});
define('skylark-clippy/Balloon',['skylark-jquery'], function ($) {
    'use strict';
    class Balloon {
        constructor(targetEl) {
            this._targetEl = targetEl;
            this._hidden = true;
            this._setup();
            this.WORD_SPEAK_TIME = 200;
            this.CLOSE_BALLOON_DELAY = 2000;
            this._BALLOON_MARGIN = 15;
        }
        _setup() {
            this._balloon = $('<div class="clippy-balloon"><div class="clippy-tip"></div><div class="clippy-content"></div></div> ').hide();
            this._content = this._balloon.find('.clippy-content');
            $(document.body).append(this._balloon);
        }
        reposition() {
            let sides = [
                'top-left',
                'top-right',
                'bottom-left',
                'bottom-right'
            ];
            for (let i = 0; i < sides.length; i++) {
                let s = sides[i];
                this._position(s);
                if (!this._isOut())
                    break;
            }
        }
        _position(side) {
            let o = this._targetEl.offset();
            let h = this._targetEl.height();
            let w = this._targetEl.width();
            o.top -= $(window).scrollTop();
            o.left -= $(window).scrollLeft();
            let bH = this._balloon.outerHeight();
            let bW = this._balloon.outerWidth();
            this._balloon.removeClass('clippy-top-left');
            this._balloon.removeClass('clippy-top-right');
            this._balloon.removeClass('clippy-bottom-right');
            this._balloon.removeClass('clippy-bottom-left');
            let left, top;
            switch (side) {
            case 'top-left':
                left = o.left + w - bW;
                top = o.top - bH - this._BALLOON_MARGIN;
                break;
            case 'top-right':
                left = o.left;
                top = o.top - bH - this._BALLOON_MARGIN;
                break;
            case 'bottom-right':
                left = o.left;
                top = o.top + h + this._BALLOON_MARGIN;
                break;
            case 'bottom-left':
                left = o.left + w - bW;
                top = o.top + h + this._BALLOON_MARGIN;
                break;
            }
            this._balloon.css({
                top: top,
                left: left
            });
            this._balloon.addClass('clippy-' + side);
        }
        _isOut() {
            let o = this._balloon.offset();
            let bH = this._balloon.outerHeight();
            let bW = this._balloon.outerWidth();
            let wW = $(window).width();
            let wH = $(window).height();
            let sT = $(document).scrollTop();
            let sL = $(document).scrollLeft();
            let top = o.top - sT;
            let left = o.left - sL;
            let m = 5;
            if (top - m < 0 || left - m < 0)
                return true;
            return top + bH + m > wH || left + bW + m > wW;
        }
        speak(complete, text, hold) {
            this._hidden = false;
            this.show();
            let c = this._content;
            c.height('auto');
            c.width('auto');
            c.text(text);
            c.height(c.height());
            c.width(c.width());
            c.text('');
            this.reposition();
            this._complete = complete;
            this._sayWords(text, hold, complete);
        }
        show() {
            if (this._hidden)
                return;
            this._balloon.show();
        }
        hide(fast) {
            if (fast) {
                this._balloon.hide();
                return;
            }
            this._hiding = window.setTimeout($.proxy(this._finishHideBalloon, this), this.CLOSE_BALLOON_DELAY);
        }
        _finishHideBalloon() {
            if (this._active)
                return;
            this._balloon.hide();
            this._hidden = true;
            this._hiding = null;
        }
        _sayWords(text, hold, complete) {
            this._active = true;
            this._hold = hold;
            let words = text.split(/[^\S-]/);
            let time = this.WORD_SPEAK_TIME;
            let el = this._content;
            let idx = 1;
            this._addWord = $.proxy(function () {
                if (!this._active)
                    return;
                if (idx > words.length) {
                    delete this._addWord;
                    this._active = false;
                    if (!this._hold) {
                        complete();
                        this.hide();
                    }
                } else {
                    el.text(words.slice(0, idx).join(' '));
                    idx++;
                    this._loop = window.setTimeout($.proxy(this._addWord, this), time);
                }
            }, this);
            this._addWord();
        }
        close() {
            if (this._active) {
                this._hold = false;
            } else if (this._hold) {
                this._complete();
            }
        }
        pause() {
            window.clearTimeout(this._loop);
            if (this._hiding) {
                window.clearTimeout(this._hiding);
                this._hiding = null;
            }
        }
        resume() {
            if (this._addWord) {
                this._addWord();
            } else if (!this._hold && !this._hidden) {
                this._hiding = window.setTimeout($.proxy(this._finishHideBalloon, this), this.CLOSE_BALLOON_DELAY);
            }
        }
    }

    return Balloon;
});
define('skylark-clippy/Agent',[
    'skylark-jquery',
    './Queue',
    './Animator',
    './Balloon'
], function ($, Queue, Animator, Balloon) {
    'use strict';
     class Agent {
        constructor(path, data, sounds) {
            this.path = path;
            this._queue = new Queue($.proxy(this._onQueueEmpty, this));
            this._el = $('<div class="clippy"></div>').hide();
            $(document.body).append(this._el);
            this._animator = new Animator(this._el, path, data, sounds);
            this._balloon = new Balloon(this._el);
            this._setupEvents();
        }
        gestureAt(x, y) {
            let d = this._getDirection(x, y);
            let gAnim = 'Gesture' + d;
            let lookAnim = 'Look' + d;
            let animation = this.hasAnimation(gAnim) ? gAnim : lookAnim;
            return this.play(animation);
        }
        hide(fast, callback) {
            this._hidden = true;
            let el = this._el;
            this.stop();
            if (fast) {
                this._el.hide();
                this.stop();
                this.pause();
                if (callback)
                    callback();
                return;
            }
            return this._playInternal('Hide', function () {
                el.hide();
                this.pause();
                if (callback)
                    callback();
            });
        }
        moveTo(x, y, duration) {
            let dir = this._getDirection(x, y);
            let anim = 'Move' + dir;
            if (duration === undefined)
                duration = 1000;
            this._addToQueue(function (complete) {
                if (duration === 0) {
                    this._el.css({
                        top: y,
                        left: x
                    });
                    this.reposition();
                    complete();
                    return;
                }
                if (!this.hasAnimation(anim)) {
                    this._el.animate({
                        top: y,
                        left: x
                    }, duration, complete);
                    return;
                }
                let callback = $.proxy(function (name, state) {
                    if (state === Animator.States.EXITED) {
                        complete();
                    }
                    if (state === Animator.States.WAITING) {
                        this._el.animate({
                            top: y,
                            left: x
                        }, duration, $.proxy(function () {
                            this._animator.exitAnimation();
                        }, this));
                    }
                }, this);
                this._playInternal(anim, callback);
            }, this);
        }
        _playInternal(animation, callback) {
            if (this._isIdleAnimation() && this._idleDfd && this._idleDfd.state() === 'pending') {
                this._idleDfd.done($.proxy(function () {
                    this._playInternal(animation, callback);
                }, this));
            }
            this._animator.showAnimation(animation, callback);
        }
        play(animation, timeout, cb) {
            if (!this.hasAnimation(animation))
                return false;
            if (timeout === undefined)
                timeout = 5000;
            this._addToQueue(function (complete) {
                let completed = false;
                let callback = function (name, state) {
                    if (state === Animator.States.EXITED) {
                        completed = true;
                        if (cb)
                            cb();
                        complete();
                    }
                };
                if (timeout) {
                    window.setTimeout($.proxy(function () {
                        if (completed)
                            return;
                        this._animator.exitAnimation();
                    }, this), timeout);
                }
                this._playInternal(animation, callback);
            }, this);
            return true;
        }
        show(fast) {
            this._hidden = false;
            if (fast) {
                this._el.show();
                this.resume();
                this._onQueueEmpty();
                return;
            }
            if (this._el.css('top') === 'auto' || !this._el.css('left') === 'auto') {
                let left = $(window).width() * 0.8;
                let top = ($(window).height() + $(document).scrollTop()) * 0.8;
                this._el.css({
                    top: top,
                    left: left
                });
            }
            this.resume();
            return this.play('Show');
        }
        speak(text, hold) {
            this._addToQueue(function (complete) {
                this._balloon.speak(complete, text, hold);
            }, this);
        }
        closeBalloon() {
            this._balloon.hide();
        }
        delay(time) {
            time = time || 250;
            this._addToQueue(function (complete) {
                this._onQueueEmpty();
                window.setTimeout(complete, time);
            });
        }
        stopCurrent() {
            this._animator.exitAnimation();
            this._balloon.close();
        }
        stop() {
            this._queue.clear();
            this._animator.exitAnimation();
            this._balloon.hide();
        }
        hasAnimation(name) {
            return this._animator.hasAnimation(name);
        }
        animations() {
            return this._animator.animations();
        }
        animate() {
            let animations = this.animations();
            let anim = animations[Math.floor(Math.random() * animations.length)];
            if (anim.indexOf('Idle') === 0) {
                return this.animate();
            }
            return this.play(anim);
        }
        _getDirection(x, y) {
            let offset = this._el.offset();
            let h = this._el.height();
            let w = this._el.width();
            let centerX = offset.left + w / 2;
            let centerY = offset.top + h / 2;
            let a = centerY - y;
            let b = centerX - x;
            let r = Math.round(180 * Math.atan2(a, b) / Math.PI);
            if (-45 <= r && r < 45)
                return 'Right';
            if (45 <= r && r < 135)
                return 'Up';
            if (135 <= r && r <= 180 || -180 <= r && r < -135)
                return 'Left';
            if (-135 <= r && r < -45)
                return 'Down';
            return 'Top';
        }
        _onQueueEmpty() {
            if (this._hidden || this._isIdleAnimation())
                return;
            let idleAnim = this._getIdleAnimation();
            this._idleDfd = $.Deferred();
            this._animator.showAnimation(idleAnim, $.proxy(this._onIdleComplete, this));
        }
        _onIdleComplete(name, state) {
            if (state === Animator.States.EXITED) {
                this._idleDfd.resolve();
            }
        }
        _isIdleAnimation() {
            let c = this._animator.currentAnimationName;
            return c && c.indexOf('Idle') === 0;
        }
        _getIdleAnimation() {
            let animations = this.animations();
            let r = [];
            for (let i = 0; i < animations.length; i++) {
                let a = animations[i];
                if (a.indexOf('Idle') === 0) {
                    r.push(a);
                }
            }
            let idx = Math.floor(Math.random() * r.length);
            return r[idx];
        }
        _setupEvents() {
            $(window).on('resize', $.proxy(this.reposition, this));
            this._el.on('mousedown', $.proxy(this._onMouseDown, this));
            this._el.on('dblclick', $.proxy(this._onDoubleClick, this));
        }
        _onDoubleClick() {
            if (!this.play('ClickedOn')) {
                this.animate();
            }
        }
        reposition() {
            if (!this._el.is(':visible'))
                return;
            let o = this._el.offset();
            let bH = this._el.outerHeight();
            let bW = this._el.outerWidth();
            let wW = $(window).width();
            let wH = $(window).height();
            let sT = $(window).scrollTop();
            let sL = $(window).scrollLeft();
            let top = o.top - sT;
            let left = o.left - sL;
            let m = 5;
            if (top - m < 0) {
                top = m;
            } else if (top + bH + m > wH) {
                top = wH - bH - m;
            }
            if (left - m < 0) {
                left = m;
            } else if (left + bW + m > wW) {
                left = wW - bW - m;
            }
            this._el.css({
                left: left,
                top: top
            });
            this._balloon.reposition();
        }
        _onMouseDown(e) {
            e.preventDefault();
            this._startDrag(e);
        }
        _startDrag(e) {
            this.pause();
            this._balloon.hide(true);
            this._offset = this._calculateClickOffset(e);
            this._moveHandle = $.proxy(this._dragMove, this);
            this._upHandle = $.proxy(this._finishDrag, this);
            $(window).on('mousemove', this._moveHandle);
            $(window).on('mouseup', this._upHandle);
            this._dragUpdateLoop = window.setTimeout($.proxy(this._updateLocation, this), 10);
        }
        _calculateClickOffset(e) {
            let mouseX = e.pageX;
            let mouseY = e.pageY;
            let o = this._el.offset();
            return {
                top: mouseY - o.top,
                left: mouseX - o.left
            };
        }
        _updateLocation() {
            this._el.css({
                top: this._targetY,
                left: this._targetX
            });
            this._dragUpdateLoop = window.setTimeout($.proxy(this._updateLocation, this), 10);
        }
        _dragMove(e) {
            e.preventDefault();
            let x = e.clientX - this._offset.left;
            let y = e.clientY - this._offset.top;
            this._targetX = x;
            this._targetY = y;
        }
        _finishDrag() {
            window.clearTimeout(this._dragUpdateLoop);
            $(window).off('mousemove', this._moveHandle);
            $(window).off('mouseup', this._upHandle);
            this._balloon.show();
            this.reposition();
            this.resume();
        }
        _addToQueue(func, scope) {
            if (scope)
                func = $.proxy(func, scope);
            this._queue.queue(func);
        }
        pause() {
            this._animator.pause();
            this._balloon.pause();
        }
        resume() {
            this._animator.resume();
            this._balloon.resume();
        }
    }

    return Agent;
});
define('skylark-clippy/loads',[
    'skylark-jquery',
    './Agent'
], function ($, Agent) {
    'use strict';
    class load {
        constructor(name, successCb, failCb, base_path) {
            base_path = base_path || window.CLIPPY_CDN || 'https://gitcdn.xyz/repo/pi0/clippyjs/master/assets/agents/';
            let path = base_path + name;
            let mapDfd = load._loadMap(path);
            let agentDfd = load._loadAgent(name, path);
            let soundsDfd = load._loadSounds(name, path);
            let data;
            agentDfd.done(function (d) {
                data = d;
            });
            let sounds;
            soundsDfd.done(function (d) {
                sounds = d;
            });
            let cb = function () {
                let a = new Agent(path, data, sounds);
                successCb(a);
            };
            $.when(mapDfd, agentDfd, soundsDfd).done(cb).fail(failCb);
        }
        static _loadMap(path) {
            let dfd = load._maps[path];
            if (dfd)
                return dfd;
            dfd = load._maps[path] = $.Deferred();
            let src = path + '/map.png';
            let img = new Image();
            img.onload = dfd.resolve;
            img.onerror = dfd.reject;
            img.setAttribute('src', src);
            return dfd.promise();
        }
        static _loadSounds(name, path) {
            let dfd = load._sounds[name];
            if (dfd)
                return dfd;
            dfd = load._sounds[name] = $.Deferred();
            let audio = document.createElement('audio');
            let canPlayMp3 = !!audio.canPlayType && '' !== audio.canPlayType('audio/mpeg');
            let canPlayOgg = !!audio.canPlayType && '' !== audio.canPlayType('audio/ogg; codecs="vorbis"');
            if (!canPlayMp3 && !canPlayOgg) {
                dfd.resolve({});
            } else {
                let src = path + (canPlayMp3 ? '/sounds-mp3.js' : '/sounds-ogg.js');
                load._loadScript(src);
            }
            return dfd.promise();
        }
        static _loadAgent(name, path) {
            let dfd = load._data[name];
            if (dfd)
                return dfd;
            dfd = load._getAgentDfd(name);
            let src = path + '/agent.js';
            load._loadScript(src);
            return dfd.promise();
        }
        static _loadScript(src) {
            let script = document.createElement('script');
            script.setAttribute('src', src);
            script.setAttribute('async', 'async');
            script.setAttribute('type', 'text/javascript');
            document.head.appendChild(script);
        }
        static _getAgentDfd(name) {
            let dfd = load._data[name];
            if (!dfd) {
                dfd = load._data[name] = $.Deferred();
            }
            return dfd;
        }
    }
    load._maps = {};
    load._sounds = {};
    load._data = {};
    function ready(name, data) {
        let dfd = load._getAgentDfd(name);
        dfd.resolve(data);
    }
    function soundsReady(name, data) {
        let dfd = load._sounds[name];
        if (!dfd) {
            dfd = load._sounds[name] = $.Deferred();
        }
        dfd.resolve(data);
    }
    return {
        load: load,
        ready: ready,
        soundsReady: soundsReady
    };
});
define('skylark-clippy/main',[
    "skylark-langx/skylark",
    './Agent',
    './Animator',
    './Queue',
    './Balloon',
    './loads'
], function (skylark,Agent, Animator, Queue, Balloon, loads) {
    'use strict';

    const clippy = {
        Agent,
        Animator,
        Queue,
        Balloon,
        "load" : loads.load,
        "ready": loads.ready,
        "soundsReady": loads.soundsReady
    };
    return skylark.attach("intg.clippy",clippy);

});
define('skylark-clippy', ['skylark-clippy/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-clippy.js.map
