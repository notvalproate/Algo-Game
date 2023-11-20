const { AlgoCard } = require("algoCard");
const { ObjectArray_to_AlgoCardArray } = require("algoCard");
const ejs = require('ejs');

var myHand = [];
var enemyHand = [];

var myTurn = undefined;
var ready = false;

// replace this guess value variable with an input with the actual guess
var myGuessValue = 0;
var selectedCard = 0;

var deckTop = undefined;

$(document).ready(function() {

    const readyButton = $('#ready-button');
    const you = $('#you');
    const enemy = $('#enemy');
    const dealer = $('#dealer');

    if(numberOfPlayersReady == 1) {
        enemy.addClass('player-ready');
    }

    window.history.pushState(null, '', `/${roomKey}/play`);
    

    // SOCKET.IO ONS AND EMITS

    var socket = io({
        query: {
            username: username,
            roomKey: roomKey,
        }
    });

    socket.on('lobbyUpdate', (roomData) => {
        if(roomData.users.length === 2) {
            var enemyuser = roomData.users[0].username;
            if(enemyuser === username) {
                enemyuser = roomData.users[1].username;
            }
            $('#enemy').html(enemyuser);
        }
        else {
            $('#enemy').html('...');
        }
    });

    socket.on('readyUpdate', (data) => {
        $('#ready-count').html(data.readyCount);

        var youUser = data.userList[0];

        if(data.userList.length != 1) {
            var enemyUser = data.userList[1];

            if(youUser.username != username) {
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
    })

    socket.on('startGame', (data) => {
        console.log('Game started');

        $("header").addClass("header-out");
        $("footer").addClass("footer-out");
        $(".board").addClass("fade-out");

        setInterval(() => {
            $("header").addClass("display-none");
            $("footer").addClass("display-none");
            $(".board").addClass("display-none");

            $(".desk").addClass("fade-in");
        }, 1400);

        myTurn = data.yourTurn;
        deckTop = new AlgoCard(data.deckTop.number, data.deckTop.color);
        setDeckTopDiv(deckTop);

        myHand = ObjectArray_to_AlgoCardArray(data.yourHand);
        enemyHand = ObjectArray_to_AlgoCardArray(data.enemyHand);

        // add event listener ever time a single div is added to the hand.
        createHandDivsAndAddEventListenersToEnemyHand(myHand, enemyHand, socket);

        if(myTurn) {
            $('#yourHand').addClass('highlight-hand');
            dealer.addClass('highlight-dealer');
        } else {
            $('#enemyHand').addClass('highlight-hand');
            $('#pick-array').addClass('pick-inactive');
        }
    });

    socket.on('highlightCard', (data) => {
        var myHandDiv = document.querySelectorAll('.your-hand');

        myHandDiv[selectedCard].classList.remove('selected');
        selectedCard = data.index;
        myHandDiv[selectedCard].classList.add('selected');
    })

    socket.on('wrongMove', (data) => {
        const nextDeckTop = new AlgoCard(data.nextDeckTop.number, data.nextDeckTop.color);
        const insertIndex = data.insertIndex;
        var cardToInsert = deckTop;
        myTurn = data.yourTurn;

        if(!myTurn) {
            myHand.splice(insertIndex, 0, cardToInsert);
            addCardDiv(cardToInsert, insertIndex, 'your', 0, 'open', socket);
            $('#yourHand').removeClass('highlight-hand');
            $('#enemyHand').addClass('highlight-hand');
            $('#pick-array').addClass('pick-inactive');
            dealer.removeClass('highlight-dealer');
        } else {
            var myHandDivs = document.querySelectorAll('.your-hand');
            myHandDivs[selectedCard].classList.remove('selected');
            cardToInsert.setNumber(data.value);

            enemyHand.splice(insertIndex, 0, cardToInsert);
            addCardDiv(cardToInsert, insertIndex, 'enemy', 0, 'open', socket);
            $('#yourHand').addClass('highlight-hand');
            $('#enemyHand').removeClass('highlight-hand');
            $('#pick-array').removeClass('pick-inactive');
            dealer.addClass('highlight-dealer');
        }

        setDeckTopDiv(nextDeckTop);
        deckTop = nextDeckTop;
    })

    // EVENT LISTENERS

    readyButton.click(() => {
        if(!ready) {
            ready = true;
        } else {
            ready = false;
        }
        socket.emit('readyConfirmation', { ready: ready });
    });

    dealer.click(() => {
        if(myTurn) {
            var enemyHandDivs = document.querySelectorAll('.enemy-hand');
            enemyHandDivs[selectedCard].classList.remove('selected');
            socket.emit('playMove', { guessTarget: selectedCard, guessValue: myGuessValue });
            selectedCard = 0;
        }
    })

    var buttons = document.querySelectorAll('.pick-button');

    buttons.forEach(function (item, index) {
        item.addEventListener('click', function () {
            if(myTurn) {
                buttons[myGuessValue].classList.remove('button-selected');
                myGuessValue = index;
                buttons[myGuessValue].classList.add('button-selected');
            }
        });
    });
});


// Utility Functions

function deepCopy(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function setDeckTopDiv(card) {
    dealer = $('#dealer');
    if(card.getNumber() !== null) {
        dealer.html(card.getNumber());
    } else {
        dealer.html("");
    }

    dealer.css({
        "background-color": card.getColor(),
        "color": invertColor(card.getColor()),
    });
}

async function createHandDivsAndAddEventListenersToEnemyHand(myHands, enemyHands, socket) {
    for(var i = 0; i < myHands.length; i++) {
        await addCardDiv(myHands[i], i, 'your' , 1, 'closed', socket);
    }

    for(var i = 0; i < enemyHands.length; i++) {
        await addCardDiv(enemyHands[i], i, 'enemy' , 1, 'closed', socket);
    }
}

async function addEventListnersToEnemyHand(pos, socket) {
    $($(".enemy-hand")[pos]).click(() => {
        if(myTurn) {
            var enemyCardDivs = $(".enemy-hand");
            var newCard = $(enemyCardDivs[pos]);
            var oldCard = $(enemyCardDivs[selectedCard]);
            
            oldCard.removeClass("selected");
            selectedCard = pos;
            newCard.addClass("selected");
            
            socket.emit("selectCard", { guessTarget: selectedCard });
        }
    });
}

async function addCardDiv (card, pos, playerType, appendable, state, socket) {
    var parentDiv = $(`#${playerType}Hand`);
    var newDiv = createDiv(pos, playerType, enemyHand.length, state);
    newDiv.html(card.getNumber());

    // newDiv.css({
    //     "visibility": "hidden",
    // });

    if(appendable === 1) {
        parentDiv.append(newDiv);
    } else {
        if(pos === enemyHand.length - 1 || pos === myHand.length - 1) {
            $(`.${playerType}-hand`).siblings(":last").after(newDiv);

        } else {
            $(`.${playerType}-hand`).siblings(`:eq(${pos+1})`).before(newDiv);
        }
    }

    if (playerType === 'enemy') {
        await addEventListnersToEnemyHand(pos, socket);
    }

    newDiv.css({
        // "visibility": "hidden",
        "background-color": card.getColor(),
        "color": invertColor(card.getColor())
    });

    anime(playerType, pos);
}


function createDiv(pos, playerType, n, state){
    var i = pos;
    if(i != n-1){
        for(var j=n-1; j>=i ; j--){
            $("#div"+ playerType + j).attr('id', "div" + playerType +(j+1));
        }
    }

    var newDiv = $("<div>");
    newDiv.attr('id', `div${playerType}${pos}`);
    newDiv.addClass(`${playerType}-hand`);
    newDiv.addClass("card");
    newDiv.addClass(state);
    return newDiv;
}


function invertColor(color){
    if(color == 'black'){
        return 'white';
    }
    return 'black';
}

function anime(playerType, pos){
    const dealerPos = $('#dealer').offset();
    const victimPos = $("#div" + playerType + pos).offset();

    const translateDir = {
        Y: dealerPos.top - victimPos.top,
        X: dealerPos.left - victimPos.left
    };

    $.keyframe.define([{
        name: 'serve' + playerType + pos,
        '0%': {
            'visibility': 'visible',
        },
        '100%': {
            'transform': `translate(${translateDir.X}px, ${translateDir.Y}px ) rotateY(180deg)`,
        }
    }]);
    
    $("#div" + playerType + pos).playKeyframe({
        name: 'serve' + playerType + pos,
        duration: '0.4s',
        timingFunction: 'ease',
        delay: '0s',
        direction: 'reverse',
        // fillMode: 'forwards',
        complete: function() {}
    });
}