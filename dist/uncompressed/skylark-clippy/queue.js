define(['skylark-jquery'], function ($) {
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