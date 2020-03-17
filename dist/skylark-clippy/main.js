/**
 * skylark-clippy - A version of clippy that ported to running on skylarkjs ui.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-clippy/
 * @license MIT
 */
define(["skylark-langx/skylark","./Agent","./Animator","./Queue","./Balloon","./loads"],function(a,n,e,o,t,l){"use strict";const d={Agent:n,Animator:e,Queue:o,Balloon:t,load:l.load,ready:l.ready,soundsReady:l.soundsReady};return a.attach("intg.clippy",d)});
//# sourceMappingURL=sourcemaps/main.js.map
