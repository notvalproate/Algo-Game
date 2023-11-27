// Helper functions

import { globals } from "./play.js";

const dealtCard = $('#dealt-card');
const attackButton = $('.attack');
const holdButton = $('.hold');

const gameResult = $('.game-result');
const resultModal = $('.modal-game-result');

// MISC HELPERS

function invertColor(color){
    if(color == 'black'){
        return 'white';
    }
    return 'black';
}

function setDeckTopDiv(card) {
    const cardNumber = card.getNumber();
    const cardColor = card.getColor();

    if(cardNumber !== null) {
        dealtCard.html(cardNumber);
    } else {
        dealtCard.html("");
    }

    dealtCard.removeClass(invertColor(cardColor));
    dealtCard.addClass(cardColor);
}


// EVENT LISTENER HELPERS

function addReadyButtonEventListener() {
    $('#ready-button').click(() => {
        if(!globals.ready) {
            globals.ready = true;
        } else {
            globals.ready = false;
        }
        globals.socket.emit('readyConfirmation', { ready: globals.ready });
    });
}

function addReturnButtonEventListener() {
    $('#return-button').click(() => {
        resultModal.removeClass('modal-in');
        
        applyBackToLobbyTransition();
    })
}

function addButtonEventListeners() {
    const buttons = $('.guess-button');

    for(let i = 0; i < 12; i++) {
        $(buttons[i]).click(() => {
            if(globals.myTurn) {
                $(buttons[globals.myGuessValue]).removeClass('guess-button-selected');
                globals.myGuessValue = i;
                $(buttons[globals.myGuessValue]).addClass('guess-button-selected');

                globals.socket.emit('buttonClicked', { buttonValue: globals.myGuessValue });
            }
        });
    }
}

function addDecisionsEventListener() {
    attackButton.click(() => {
        if(globals.myTurn) {
            globals.socket.emit('attackMove', { guessTarget: globals.selectedCard, guessValue: globals.myGuessValue });
        }
    });

    holdButton.click(() => {
        if(globals.myTurn) {
            globals.socket.emit('holdMove');
        }
    });
}


// DATA SETTINGS HELPERS

function setEnemyUsername(usernames) {
    let enemyUser = usernames[0];
    if(enemyUser === globals.username) {
        enemyUser = usernames[1];
    }

    if(enemyUser === null) {
        $('#enemy').html('...');
        return;
    }
    
    $('#enemy').html(enemyUser);
    $('#enemy-username').html(enemyUser);
}


// CSS CLASS MANAGING HELPERS

function applyJoinLobbyTransition() {
    setTimeout(() => {
        $("header").removeClass("header-out");
        $("footer").removeClass("footer-out");
        $(".lobby").removeClass("fade-out");
    }, 200);
}

function applyGameStartTransition() {
    $("header").addClass("header-out");
    $("footer").addClass("footer-out");
    $(".lobby").addClass("fade-out");

    setTimeout(() => {
        $("header").addClass("display-none");
        $("footer").addClass("display-none");
        $(".lobby").addClass("display-none");

        $(".desk-wrapper").addClass("fade-in");
            
        globals.ready = false;
        $('#enemy').removeClass('player-ready');
        $('#me').removeClass('player-ready');
        $('#ready-count').html('0');
    }, 1400);
}

function applyBackToLobbyTransition() {
    $("header").removeClass("display-none");
    $("footer").removeClass("display-none");
    $(".lobby").removeClass("display-none");

    setTimeout(() => {
        $(".desk-wrapper").removeClass("fade-in");
    }, 1000);

    setTimeout(() => {
        $("header").removeClass("header-out");
        $("footer").removeClass("footer-out");
        $(".lobby").removeClass("fade-out");
        resultModal.addClass('display-none');
    }, 1400);
}

const myUsername = $('#my-username');
const enemyUsername = $('#enemy-username');
const enemyHandCont = $('.enemy-hand-container');
const guessArray = $('.guess-array');
const decisionWrapper = $('.decision-wrapper');

function applyTransitionToEnemyTurn() {
    myUsername.removeClass('player-turn');
    enemyUsername.addClass('player-turn');
    enemyHandCont.addClass('no-pointer-events');
    guessArray.addClass('guess-array-inactive');
    dealtCard.removeClass('highlight-dealt-card');
    decisionWrapper.addClass('decision-fade-away');
    attackButton.addClass('decision-inactive');
    holdButton.addClass('decision-inactive');
}

function applyTransitionToMyTurn() {
    myUsername.addClass('player-turn');
    enemyUsername.removeClass('player-turn');
    enemyHandCont.removeClass('no-pointer-events');
    guessArray.removeClass('guess-array-inactive');
    dealtCard.addClass('highlight-dealt-card');
    decisionWrapper.removeClass('decision-fade-away');
}

function closeCardWithDelay(index, delay) {
    const cardToClose = $($('.my-card')[index]);
    setTimeout(() => {
        cardToClose.addClass('closed');
        cardToClose.removeClass('open');
    }, delay);
}

function addHighlightTo(index) {
    let myCardDivs = $('.my-card');

    $(myCardDivs[globals.selectedCard]).removeClass('selected');
    globals.selectedCard = index;
    $(myCardDivs[globals.selectedCard]).addClass('selected');
}

function removeHighlightFrom(cardDiv) {
    $(cardDiv).removeClass('selected');
}

function showResultModal(wonGame) {
    if(wonGame) {
        gameResult.html('YOU WIN');
    } else {
        gameResult.html('YOU LOSE');
    }

    resultModal.removeClass('display-none');

    setTimeout(() => {
        resultModal.addClass('modal-in');
    }, 1600);
}

function runParticlesJs() {
    particlesJS('particles-js',
        {
            "particles": {
                "number": {
                  "value": 48,
                  "density": {
                    "enable": true,
                    "value_area": 394.57382081613633
                  }
                },
                "color": {
                  "value": "#ffffff"
                },
                "shape": {
                  "type": "triangle",
                  "stroke": {
                    "width": 0,
                    "color": "#000000"
                  },
                  "polygon": {
                    "nb_sides": 3
                  },
                  "image": {
                    "src": "img/github.svg",
                    "width": 100,
                    "height": 100
                  }
                },
                "opacity": {
                  "value": 0.6234266368894954,
                  "random": false,
                  "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                  }
                },
                "size": {
                  "value": 0,
                  "random": true,
                  "anim": {
                    "enable": false,
                    "speed": 2,
                    "size_min": 0,
                    "sync": false
                  }
                },
                "line_linked": {
                  "enable": true,
                  "distance": 157.82952832645452,
                  "color": "#ffffff",
                  "opacity": 0.2367442924896818,
                  "width": 1
                },
                "move": {
                  "enable": true,
                  "speed": 1,
                  "direction": "none",
                  "random": false,
                  "straight": false,
                  "out_mode": "out",
                  "bounce": false,
                  "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                  }
                }
              },
              "interactivity": {
                "detect_on": "canvas",
                "events": {
                  "onhover": {
                    "enable": false,
                    "mode": "repulse"
                  },
                  "onclick": {
                    "enable": false,
                    "mode": "push"
                  },
                  "resize": true
                },
                "modes": {
                  "grab": {
                    "distance": 400,
                    "line_linked": {
                      "opacity": 1
                    }
                  },
                  "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                  },
                  "repulse": {
                    "distance": 200,
                    "duration": 0.4
                  },
                  "push": {
                    "particles_nb": 4
                  },
                  "remove": {
                    "particles_nb": 2
                  }
                }
              },
              "retina_detect": true,
        }
    );
}

export {
    invertColor,
    setDeckTopDiv,

    addReadyButtonEventListener,
    addReturnButtonEventListener,
    addButtonEventListeners,
    addDecisionsEventListener,

    setEnemyUsername,

    applyJoinLobbyTransition,
    applyGameStartTransition,
    applyTransitionToEnemyTurn,
    applyTransitionToMyTurn,

    closeCardWithDelay,
    addHighlightTo,
    removeHighlightFrom,

    showResultModal,

    runParticlesJs,
}