// Helper functions

import { globals } from "./play.js";


// MISC HELPERS

function invertColor(color){
    if(color == 'black'){
        return 'white';
    }
    return 'black';
}

function setDeckTopDiv(card) {
    let dealtCard = $('#dealt-card');
    if(card.getNumber() !== null) {
        dealtCard.html(card.getNumber());
    } else {
        dealtCard.html("");
    }

    dealtCard.css({
        "background-color": card.getColor(),
        "color": invertColor(card.getColor()),
    });
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

function addDealtCardEventListener() {
    const dealtCard = $('#dealt-card');

    // SEE A MORE ELEGANT SOLUTION TO THIS PLS IM TOO LAZY
    dealtCard.css({
        'z-index': '10',
    })

    dealtCard.click(() => {
        if(globals.myTurn) {
            globals.socket.emit('playMove', { guessTarget: globals.selectedCard, guessValue: globals.myGuessValue });
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

function applyGameStartTransition() {
    $("header").addClass("header-out");
    $("footer").addClass("footer-out");
    $(".lobby").addClass("fade-out");

    setInterval(() => {
        $("header").addClass("display-none");
        $("footer").addClass("display-none");
        $(".lobby").addClass("display-none");

        $(".desk-wrapper").addClass("fade-in");
            
        globals.ready = false;
        $('#enemy').removeClass('player-ready');
        $('#me').removeClass('player-ready');
    }, 1400);
}

function applyTransitionToEnemyTurn() {
    $('#my-username').removeClass('player-turn');
    $('#enemy-username').addClass('player-turn');
    $('.enemy-hand-container').addClass('no-pointer-events');
    $('.guess-array').addClass('guess-array-inactive');
    $('#dealt-card').removeClass('highlight-dealt-card');
    $('.decision-wrapper').addClass('decision-fade-away');
    $('.attack').addClass('decision-inactive');
    $('.hold').addClass('decision-inactive');
}

function applyTransitionToMyTurn() {
    $('#my-username').addClass('player-turn');
    $('#enemy-username').removeClass('player-turn');
    $('.enemy-hand-container').removeClass('no-pointer-events');
    $('.guess-array').removeClass('guess-array-inactive');
    $('#dealt-card').addClass('highlight-dealt-card');
    $('.decision-wrapper').removeClass('decision-fade-away');
}

export {
    invertColor,
    setDeckTopDiv,

    addReadyButtonEventListener,
    addButtonEventListeners,
    addDealtCardEventListener,

    setEnemyUsername,

    applyGameStartTransition,
    applyTransitionToEnemyTurn,
    applyTransitionToMyTurn,
}