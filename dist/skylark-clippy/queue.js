/**
 * skylark-clippy - A version of clippy that ported to running on skylarkjs ui.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-clippy/
 * @license MIT
 */
define(["skylark-jquery"],function(e){"use strict";return class{constructor(e){this._queue=[],this._onEmptyCallback=e}queue(e){this._queue.push(e),1!==this._queue.length||this._active||this._progressQueue()}_progressQueue(){if(!this._queue.length)return void this._onEmptyCallback();let t=this._queue.shift();this._active=!0,t(e.proxy(this.next,this))}clear(){this._queue=[]}next(){this._active=!1,this._progressQueue()}}});
//# sourceMappingURL=sourcemaps/queue.js.map
