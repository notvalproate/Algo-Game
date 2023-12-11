// HOWLER JS AUDIO HANDLER

var correctSound = undefined;
var wrongSound = undefined;

function initAudio() {
    correctSound = new Howl({
        src: ['/assets/sounds/ding.ogg'],
    });

    wrongSound = new Howl({
        src: ['/assets/sounds/wrong.ogg'],
    });
}

function playCorrectSound() {
    correctSound.play();
}

function playWrongSound() {
    wrongSound.play();
}

export {
    initAudio,
    
    playCorrectSound,
    playWrongSound,
}