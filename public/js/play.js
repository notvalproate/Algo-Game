import { AlgoCard, ObjectArray_to_AlgoCardArray } from '../../modules/algoCard.js';

// IMPORTS
import * as Animations from './animations.js';
import * as Sounds from './audio.js';
import * as CardDivManager from './cardcreation.js';
import * as Helpers from './helpers.js';
import * as CalloutHandler from './callout.js';

// SCSS For Webpack

import '../scss/styles.scss';


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
    calloutActive: false,
};

export {
    globals
};

$(document).ready(function() {
    // JQUERY ELEMENTS CACHE
    const readyButton = $('#ready-button');
    const attackButton = $('.attack');
    const holdButton = $('.hold');

    const me = $('#me');
    const enemy = $('#enemy');
    let enemyUsername = enemy.html();
    const readyCount = $('#ready-count');

    const roomKey = $('#room-key').html();
    globals.username = $('#me').html();
    const numberOfPlayersReady = parseInt(readyCount.html());
    
    if(numberOfPlayersReady == 1) {
        enemy.addClass('player-ready');
    }

    window.history.pushState(null, '', `/${roomKey}/play`);

    Animations.initAnimations();
    Sounds.initAudio();
    
    // JOIN LOBBY TRANSITION
    Helpers.applyJoinLobbyTransition();

    // SOCKET.IO ONS AND EMITS

    globals.socket = io({
        query: {
            username: globals.username,
            roomKey: roomKey,
        }
    });

    globals.socket.on('disconnect', () => {
        window.location.href = window.location.href;
    });

    globals.socket.on('lobbyUpdate', (data) => {
        const usernames = data.usernames;
        enemyUsername = Helpers.setEnemyUsername(usernames);
    });

    // want to refactor this later, looks very ugly
    globals.socket.on('readyUpdate', (data) => {
        readyCount.html(data.readyCount);

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
        Helpers.addHighlightTo(data.index);
        
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

        Sounds.playCorrectSound();

        if(globals.myTurn) {
            Animations.highlightFadeOutTo('correct', enemyCardDivs[index])

            $(enemyCardDivs[index]).html(globals.myGuessValue);
            $(enemyCardDivs[index]).addClass('open');
            attackButton.addClass('decision-inactive');
            holdButton.removeClass('decision-inactive');
            CardDivManager.removeEventListenerFromEnemyCard(index);

            Animations.flipCardAnimation($(enemyCardDivs[index]), enemyHand[index]);
        } else {
            $(myCardDivs[index]).removeClass('closed');
            $(myCardDivs[index]).addClass('open');

            Animations.highlightFadeOutTo('correct', myCardDivs[index]);
        }
    });

    globals.socket.on('wrongMove', (data) => {
        const nextDeckTop = new AlgoCard(data.nextDeckTop.number, data.nextDeckTop.color);
        const insertIndex = data.insertIndex;
        let cardToInsert = globals.deckTop;
        globals.myTurn = data.yourTurn;

        Sounds.playWrongSound();

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
            CardDivManager.removeEventListenerFromEnemyCard(insertIndex);
            CalloutHandler.removeCallout();

            Helpers.applyTransitionToMyTurn();
        }

        Helpers.setDeckTopDiv(nextDeckTop);
        globals.deckTop = nextDeckTop;
    });

    globals.socket.on('cardHeld', (data) => {        
        const nextDeckTop = new AlgoCard(data.nextDeckTop.number, data.nextDeckTop.color);
        const insertIndex = data.insertIndex;
        const cardToInsert = globals.deckTop;
        globals.myTurn = data.yourTurn;

        if(!globals.myTurn) {
            myHand.splice(insertIndex, 0, cardToInsert);           
            CardDivManager.createAndAnimateCardDiv(cardToInsert, insertIndex, 'my', 'open');
            Helpers.closeCardWithDelay(insertIndex, 500);
            Helpers.removeHighlightFrom($('.enemy-card')[globals.selectedCard]);

            Helpers.applyTransitionToEnemyTurn();
        } else {            
            enemyHand.splice(insertIndex, 0, cardToInsert);
            CardDivManager.createAndAnimateCardDiv(cardToInsert, insertIndex, 'enemy', 'closed');
            CalloutHandler.removeCallout();
            Helpers.removeHighlightFrom($('.my-card')[globals.selectedCard]);

            Helpers.applyTransitionToMyTurn();
        }
        
        Helpers.setDeckTopDiv(nextDeckTop);
        globals.deckTop = nextDeckTop;
    })

    globals.socket.on('gameEnded', (data) => {
        let wonGame = data.wonGame;

        Helpers.setStatsSection(data.stats);

        if(data.enemyDisconnect) {
            $('.game-status').html('Enemy has disconnected!');
            Helpers.showResultModal(wonGame);
            return;
        }

        if(wonGame) {
            Animations.playWinLoseAnimation($('.enemy-card'));
            $('.game-status').html(`You guessed all of ${enemyUsername}'s cards!`);
        } else {
            Animations.playWinLoseAnimation($('.my-card'));
            $('.game-status').html(`${enemyUsername} guessed all your cards!`);
        }

        Helpers.showResultModal(wonGame);
    });

    globals.socket.on('rejected', () => {
        console.log('reconnect not allowed');
    })

    globals.socket.on('afk-warning', () => {
        window.location.href = '/afk';
    })


    // EVENT LISTENERS

    Helpers.addCopyKeyButtonEventListener(roomKey);
    Helpers.addReadyButtonEventListener();
    Helpers.addReturnButtonEventListener();
    Helpers.addDecisionsEventListener();
    Helpers.addButtonEventListeners();
});