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
    const you = $('#you');
    const enemy = $('#enemy');
    const dealer = $('#dealer');

    const roomKey = $('#roomkey').html();
    const username = $('#you').html();
    const numberOfPlayersReady = parseInt($('#ready-count').html());
    
    if(numberOfPlayersReady == 1) {
        enemy.addClass('player-ready');
    }

    window.history.pushState(null, '', `/${roomKey}/play`);

    Animations.initAnimations();
    
    // SOCKET.IO ONS AND EMITS

    globals.socket = io({
        query: {
            username: username,
            roomKey: roomKey,
        }
    });

    globals.socket.on('lobbyUpdate', (roomData) => {
        if(roomData.users.length === 2) {
            var enemyuser = roomData.users[0].username;
            if(enemyuser === username) {
                enemyuser = roomData.users[1].username;
            }
            $('#enemy').html(enemyuser);
            $('#enemy-username').html(enemyuser);
        }
        else {
            $('#enemy').html('...');
        }
    });

    globals.socket.on('readyUpdate', (data) => {
        $('#ready-count').html(data.readyCount);

        var youUser = data.userList[0];

        if(data.userList.length !== 1) {
            var enemyUser = data.userList[1];

            if(youUser.username !== username) {
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
            you.addClass('player-ready');
            readyButton.addClass('ready-status');
        }
        else {
            you.removeClass('player-ready');
            readyButton.removeClass('ready-status');
        }
    });

    globals.socket.on('startGame', (data) => {
        $("header").addClass("header-out");
        $("footer").addClass("footer-out");
        $(".board").addClass("fade-out");

        setInterval(() => {
            $("header").addClass("display-none");
            $("footer").addClass("display-none");
            $(".board").addClass("display-none");

            $(".desk").addClass("fade-in");
            
            globals.ready = false;
            enemy.removeClass('player-ready');
            you.removeClass('player-ready');
        }, 1400);

        globals.myTurn = data.yourTurn;
        globals.deckTop = new AlgoCard(data.deckTop.number, data.deckTop.color);
        Helpers.setDeckTopDiv(globals.deckTop);

        $('#yourHand').html('');
        $('#enemyHand').html('');
        myHand = ObjectArray_to_AlgoCardArray(data.yourHand);
        enemyHand = ObjectArray_to_AlgoCardArray(data.enemyHand);

        CardDivManager.createInitialHands(myHand, enemyHand);

        if(globals.myTurn) {
            $('#my-username').addClass('player-turn');
            dealer.addClass('highlight-dealer');
        } else {
            $('#enemy-username').addClass('player-turn');
            $('.enemy-hand-container').addClass('no-pointer-events');
            $('#pick-array').addClass('pick-inactive');
        }
    });

    globals.socket.on('highlightCard', (data) => {
        var myHandDiv = document.querySelectorAll('.your-hand');

        myHandDiv[globals.selectedCard].classList.remove('selected');
        globals.selectedCard = data.index;
        myHandDiv[globals.selectedCard].classList.add('selected');
        
        CalloutHandler.displayCallout(globals.selectedCard, myHand[globals.selectedCard].getColor(), buttonValue);
    });

    globals.socket.on('updateButtonValue', (data) => {
        buttonValue = data.buttonValue;
        CalloutHandler.updateCallout(buttonValue);
    });

    globals.socket.on('correctMove', (data) => {
        globals.myTurn = data.yourTurn;
        var index = data.guessTarget;
        var enemyHandDivs = $('.enemy-hand');
        var myHandDivs = $('.your-hand');

        if(globals.myTurn) {
            Animations.highlightFadeOutTo('correct', enemyHandDivs[index])

            $(enemyHandDivs[index]).html(globals.myGuessValue);
            $(enemyHandDivs[index]).addClass('open');

            Animations.flipCardAnimation($($('.enemy-hand')[index]), enemyHand[index]);
        } else {
            $(myHandDivs[index]).removeClass('closed');
            $(myHandDivs[index]).addClass('open');

            Animations.highlightFadeOutTo('correct', myHandDivs[index]);
        }
    });

    globals.socket.on('wrongMove', (data) => {
        const nextDeckTop = new AlgoCard(data.nextDeckTop.number, data.nextDeckTop.color);
        const insertIndex = data.insertIndex;
        var cardToInsert = globals.deckTop;
        globals.myTurn = data.yourTurn;

        if(!globals.myTurn) {
            Animations.highlightFadeOutTo('wrong', $('.enemy-hand')[globals.selectedCard]);

            myHand.splice(insertIndex, 0, cardToInsert);
            CardDivManager.createAndAnimateCardDiv(cardToInsert, insertIndex, 'your-hand', 'open');
            $('#my-username').removeClass('player-turn');
            $('#enemy-username').addClass('player-turn');
            $('.enemy-hand-container').addClass('no-pointer-events');
            $('#pick-array').addClass('pick-inactive');
            dealer.removeClass('highlight-dealer');
        } else {
            Animations.highlightFadeOutTo('wrong', $('.your-hand')[globals.selectedCard]);

            cardToInsert.setNumber(data.value);
            enemyHand.splice(insertIndex, 0, cardToInsert);
            CardDivManager.createAndAnimateCardDiv(cardToInsert, insertIndex, 'enemy-hand', 'open');
            $('#my-username').addClass('player-turn');
            $('#enemy-username').removeClass('player-turn');
            $('.enemy-hand-container').removeClass('no-pointer-events');
            $('#pick-array').removeClass('pick-inactive');
            dealer.addClass('highlight-dealer');

            CalloutHandler.removeCallout();
        }

        Helpers.setDeckTopDiv(nextDeckTop);
        globals.deckTop = nextDeckTop;
    });

    globals.socket.on('gameEnded', (data) => {
        var wonGame = data.wonGame;

        if(wonGame) {
            console.log('nice you win');
        } else {
            console.log('loser');
        }
    });

    // EVENT LISTENERS

    Helpers.addReadyButtonEventListener();
    Helpers.addDealerEventListener();
    Helpers.addButtonEventListeners();
});