// HOWLER JS AUDIO HANDLER

var correctSound = undefined;
var wrongSound = undefined;
var winSound = undefined;

function initAudio() {
    correctSound = new Howl({
        src: ['/sounds/ding.ogg'],
    });

    wrongSound = new Howl({
        src: ['/sounds/wrong.ogg'],
    });

    winSound = new Howl({
        src: ['/sounds/win.ogg'],
    });
}

function playCorrectSound() {
    correctSound.play();
}

function playWrongSound() {
    wrongSound.play();
}

function playWinSound() {
    winSound.play();
}

export {
    initAudio,
    
    playCorrectSound,
    playWrongSound,
    playWinSound,
}