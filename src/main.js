define([
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