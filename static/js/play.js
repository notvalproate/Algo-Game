const { AlgoCard } = require("algoCard");
const { ObjectArray_to_AlgoCardArray } = require("algoCard");
const ejs = require('ejs');

var myHand = [];
var enemyHand = [];

$(document).ready(function() {

    const readyButton = $('#ready-button');
    const you = $('#you');
    const enemy = $('#enemy');
    var ready = false;
    var myTurn = undefined;
    var deckTop = undefined;

    if(numberOfPlayersReady == 1) {
        enemy.addClass('player-ready');
    }

    window.history.pushState(null, '', `/${roomKey}/play`);
    
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

    readyButton.click(() => {
        if(!ready) {
            ready = true;
        } else {
            ready = false;
        }
        socket.emit('readyConfirmation', { ready: ready });
    });

    socket.on('startGame', () => {
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

        socket.emit('getGameSetup');
    });

    socket.on('setupGame', (data) => {
        myTurn = data.yourTurn;
        deckTop = new AlgoCard(data.deckTop.number, data.deckTop.color);

        myHand = ObjectArray_to_AlgoCardArray(data.yourHand);
        enemyHand = ObjectArray_to_AlgoCardArray(data.enemyHand);

        console.log(myHand , enemyHand);

        for(var i = 0; i < myHand.length; i++) {
            addCardDiv(myHand[i], i, 'you' , 1);
        }

        for(var i = 0; i < enemyHand.length; i++) {
            addCardDiv(enemyHand[i], i, 'enemy' , 1);
        }

        setDeckTop(deckTop);
    });

});


function stubDealer(){
    // Get new cards from server here;
    var cardThatCame = new AlgoCard(5, 'black');
    var indexThatCame = 1;

    addCardDiv(cardThatCame, indexThatCame, 'you', 0);
}


// Utility Functions

function deepCopy(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function setDeckTop(card) {
    dealer = $('#dealer');
    if(card.getNumber() !== null) {
        dealer.html(card.getNumber());
    }   

    dealer.css({
        "background-color": card.getColor(),
        "color": invertColor(card.getColor()),
    });
}

function addCardDiv (card, pos, playerType, flag) {
    if(playerType === 'enemy'){
        var parentDiv = $("#enemyDeck");
        var newDiv = createDiv(pos, playerType, enemyHand.length);
        newDiv.html(card.getNumber());
        // parentDiv.append(newDiv);
        if(flag == 1){
            parentDiv.append(newDiv);
            console.log("card appended");
        }else{
            newDiv.css({
                "visibility": "hidden",
            });
            $("#divenemy" + (pos+1)).before(newDiv);
        }
        
    } else {
        var parentDiv = $("#yourDeck");
        var newDiv = createDiv(pos, playerType, myHand.length);
        newDiv.html(card.getNumber());
        // parentDiv.append(newDiv);
        if(flag == 1){
            parentDiv.append(newDiv);
            console.log("card appended");
        }else{
            newDiv.css({
                "visibility": "hidden",
            });
            $("#divyou" + (pos+1)).before(newDiv);
        }
    }

    newDiv.css({
        "background-color": card.getColor(),
        "color": invertColor(card.getColor())
    });
}


function createDiv(pos, playerType, n){
    var i = pos;
    if(i != n-1){
        for(var j=n-1; j>=i ; j--){
            $("#div"+ playerType + j).attr('id', "div" + playerType +(j+1));
        }
    }
    
    var newDiv = $("<div>");
    newDiv.attr('id', "div" + playerType + pos); 
    newDiv.addClass("card");
    newDiv.addClass("closed");
    return newDiv;
}

function invertColor(color){
    if(color == 'black'){
        return 'white';
    }
    return 'black';
}


// Kunal's FrontEnd
function anime(playerType, pos){
    const dealerPos = $('#dealer').offset();
    const victimPos = $("#div" + playerType + pos).offset();

    const translateDir = {
        Y: dealerPos.top - victimPos.top,
        X: dealerPos.left - victimPos.left
    };

    console.log(victimPos);

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