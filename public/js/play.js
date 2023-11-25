const { AlgoCard } = require("algoCard");
const { ObjectArray_to_AlgoCardArray } = require("algoCard");

// IMPORTS
import * as Animations from './animations.js';
import * as CardDivManager from './cardcreation.js';
import * as Helpers from './helpers.js';
import * as CalloutHandler from './callout.js';


var myHand = [];
var enemyHand = [];

var buttonValue = 0;

var globals = {
    username: undefined,
    socket: undefined,
    myTurn: undefined,
    ready: false,
    deckTop: undefined,
    selectedCard: 0,
    myGuessValue: 0,
};

export {
    globals
};

$(document).ready(function() {
    const readyButton = $('#ready-button');
    const me = $('#me');
    const enemy = $('#enemy');

    const roomKey = $('#room-key').html();
    globals.username = $('#me').html();
    const numberOfPlayersReady = parseInt($('#ready-count').html());
    
    if(numberOfPlayersReady == 1) {
        enemy.addClass('player-ready');
    }

    window.history.pushState(null, '', `/${roomKey}/play`);

    Animations.initAnimations();
    
    // SOCKET.IO ONS AND EMITS

    globals.socket = io({
        query: {
            username: globals.username,
            roomKey: roomKey,
        }
    });

    globals.socket.on('lobbyUpdate', (data) => {
        const usernames = data.usernames;
        Helpers.setEnemyUsername(usernames);
    });

    // want to refactor this later, looks very ugly
    globals.socket.on('readyUpdate', (data) => {
        $('#ready-count').html(data.readyCount);

        var youUser = data.userList[0];

        if(data.userList.length !== 1) {
            var enemyUser = data.userList[1];

            if(youUser.username !== globals.username) {
                [youUser, enemyUser] = [enemyUser, youUser];
            }

            if(enemyUser.ready) {
                enemy.addClass('player-ready');
            }
            else {
                enemy.removeClass('player-ready');
            }
        } else {
            enemy.removeClass('player-ready');
        }

        if(youUser.ready) {
            me.addClass('player-ready');
            readyButton.addClass('ready-status');
        }
        else {
            me.removeClass('player-ready');
            readyButton.removeClass('ready-status');
        }
    });


    globals.socket.on('startGame', (data) => {
        Helpers.applyGameStartTransition();

        globals.myTurn = data.yourTurn;
        globals.deckTop = new AlgoCard(data.deckTop.number, data.deckTop.color);
        Helpers.setDeckTopDiv(globals.deckTop);

        $('#my-hand').html('');
        $('#enemy-hand').html('');
        myHand = ObjectArray_to_AlgoCardArray(data.yourHand);
        enemyHand = ObjectArray_to_AlgoCardArray(data.enemyHand);

        CardDivManager.createInitialHands(myHand, enemyHand);

        if(globals.myTurn) {
            Helpers.applyTransitionToMyTurn();
        } else {
            Helpers.applyTransitionToEnemyTurn();
        }
    });

    globals.socket.on('highlightCard', (data) => {
        let myCardDivs = document.querySelectorAll('.my-card');

        myCardDivs[globals.selectedCard].classList.remove('selected');
        globals.selectedCard = data.index;
        myCardDivs[globals.selectedCard].classList.add('selected');
        
        CalloutHandler.displayCallout(globals.selectedCard, myHand[globals.selectedCard].getColor(), buttonValue);
    });

    globals.socket.on('updateButtonValue', (data) => {
        buttonValue = data.buttonValue;
        CalloutHandler.updateCallout(buttonValue);
    });

    globals.socket.on('correctMove', (data) => {
        globals.myTurn = data.yourTurn;
        var index = data.guessTarget;
        var enemyCardDivs = $('.enemy-card');
        let myCardDivs = $('.my-card');

        if(globals.myTurn) {
            Animations.highlightFadeOutTo('correct', enemyCardDivs[index])

            $(enemyCardDivs[index]).html(globals.myGuessValue);
            $(enemyCardDivs[index]).addClass('open');

            Animations.flipCardAnimation($($('.enemy-card')[index]), enemyHand[index]);
        } else {
            $(myCardDivs[index]).removeClass('closed');
            $(myCardDivs[index]).addClass('open');

            Animations.highlightFadeOutTo('correct', myCardDivs[index]);
        }
    });

    globals.socket.on('wrongMove', (data) => {
        const nextDeckTop = new AlgoCard(data.nextDeckTop.number, data.nextDeckTop.color);
        const insertIndex = data.insertIndex;
        var cardToInsert = globals.deckTop;
        globals.myTurn = data.yourTurn;

        if(!globals.myTurn) {
            Animations.highlightFadeOutTo('wrong', $('.enemy-card')[globals.selectedCard]);

            myHand.splice(insertIndex, 0, cardToInsert);
            CardDivManager.createAndAnimateCardDiv(cardToInsert, insertIndex, 'my', 'open');
            
            Helpers.applyTransitionToEnemyTurn();
        } else {
            Animations.highlightFadeOutTo('wrong', $('.my-card')[globals.selectedCard]);

            cardToInsert.setNumber(data.value);
            enemyHand.splice(insertIndex, 0, cardToInsert);
            CardDivManager.createAndAnimateCardDiv(cardToInsert, insertIndex, 'enemy', 'open');
            CalloutHandler.removeCallout();

            Helpers.applyTransitionToMyTurn();
        }

        Helpers.setDeckTopDiv(nextDeckTop);
        globals.deckTop = nextDeckTop;
    });

    globals.socket.on('gameEnded', (data) => {
        var wonGame = data.wonGame;

        // Send back to the lobby instead after playing a win or lose animation
        if(wonGame) {
            console.log('nice you win');
        } else {
            console.log('loser');
        }
    });

    // EVENT LISTENERS

    Helpers.addReadyButtonEventListener();
    Helpers.addDealtCardEventListener();
    Helpers.addButtonEventListeners();
});