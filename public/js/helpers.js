// Helper functions

import { globals } from "./play.js";

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

export {
    invertColor,
    setDeckTopDiv,
    addReadyButtonEventListener,
    addButtonEventListeners,
    addDealtCardEventListener,
}