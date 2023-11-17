const AlgoCard = require("algoCard").AlgoCard;
const ejs = require('ejs');

var myHand = [];
var enemyHand = [];

$(document).ready(function() {

    const readyButton = $('#ready-button');
    const you = $('#you');
    const enemy = $('#enemy');
    var ready = false;

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

        socket.emit('getHands');
    });

    socket.on('setHands', (data) => {
        myHand = convert_ObjectArray_to_AlgoCardArray(data.yourHand);
        enemyHand = convert_ObjectArray_to_AlgoCardArray(data.enemyHand);

        for(var i = 0; i < myHand.length; i++) {
            addCardDiv(myHand[i], i, 'you');
        }

        for(var i = 0; i < enemyHand.length; i++) {
            addCardDiv(enemyHand[i], i, 'enemy');
        }
    });
    
});


//Utility Functions

function convert_ObjectArray_to_AlgoCardArray(arr) {
    for(var i = 0; i < arr.length; i++) {
        arr[i] = new AlgoCard(arr[i]);
    }
    return arr;
}

function deepCopy(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function addCardDiv (card, pos, playerType) {

    if(playerType === 'enemy'){
        var parentDiv = $("#enemyDeck");
        var newDiv = createDiv(card, pos, playerType, enemyHand.length);
        newDiv.html(card.getNumber());
        parentDiv.append(newDiv);
        
    } else {
        var parentDiv = $("#yourDeck");
        var newDiv = createDiv(card, pos, playerType, myHand.length);
        newDiv.html(card.getNumber());
        parentDiv.append(newDiv);
    }

    newDiv.css({
        "background-color": card.getColor(),
        "color": invertColor(card.getColor())
    });
}


function createDiv(pos, playerType){
    var newDiv = $("<div>");
    newDiv.attr('id', "div" + playerType + pos); 
    newDiv.attr('class', "served-card"); 
    return newDiv;       
}

function invertColor(color){
    if(color == 'black'){
        return 'white';
    }
    return 'black';
}


// Kunal's FrontEnd
// function generateCards() {
//     const cards = [];

//     function shuffleArray(array) {
//         for (let i = array.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             [array[i], array[j]] = [array[j], array[i]];
//         }
//     }

//     for (let set = 0; set < 2; set++) {
//         for (let number = 0; number < 12; number++) {
//             const cardNumber = number;
//             const cardColor = set === 0 ? 'black' : 'white';
//             const position = null;
//             const playertype = '';

//             cards.push({
//                 number: cardNumber,
//                 color: cardColor,
//                 pos: position,
//                 playerType: playertype
//             });
//         }
//     }

//     shuffleArray(cards);

//     return cards;
// }


// const generatedCards = generateCards();

// var myHandTemp = [];
// var enemyHandTemp = []; 

// function testsum() {
//     cardAllocator({number: null, color: '#ffffff', pos: 0, playerType: 'enemy'});
//     cardAllocator({number: null, color: '#000000', pos: 1, playerType: 'enemy'});
//     cardAllocator({number: null, color: '#ffffff', pos: 2, playerType: 'enemy'});
//     cardAllocator({number: null, color: '#000000', pos: 3, playerType: 'enemy'});
//     cardAllocator({number: null, color: '#ffffff', pos: 2, playerType: 'enemy'});
//     cardAllocator({number: '1', color: '#000000', pos: 0, playerType: 'you'});
//     cardAllocator({number: '2', color: '#ffffff', pos: 1, playerType: 'you'});
//     cardAllocator({number: '4', color: '#000000', pos: 2, playerType: 'you'});
//     cardAllocator({number: '6', color: '#ffffff', pos: 3, playerType: 'you'});
//     cardAllocator({number: '3', color: '#000000', pos: 2, playerType: 'you'});
// };

// testsum();

// function cardAllocator(card){
//     if (card.playerType == 'enemy'){
//         enemyHandTemp.splice(card.pos, 0, card);
//         var i = card.pos + 1;
//         while(i < enemyHandTemp.length){
//             enemyHandTemp[i].pos++;
//             i++;
//         }
//     }
//     if (card.playerType == 'you'){
//         myHandTemp.splice( card.pos, 0, card);
//         var i = card.pos + 1;
//         while(i < myHandTemp.length){
//             myHandTemp[i].pos++;
//             i++;
//         }
//     }
//     addCardDiv(card);
// }


// function addCardDiv (card) {

//     if(card.playerType === 'enemy'){

//         var parentDiv = $("#enemyDeck");

//         var newDiv = creatDiv(card, enemyHandTemp.length);
        
//         newDiv.css({
//             "background-color": card.color,
//             "color": oppColor(card.color)
//         });

//         newDiv.html(card.number);

//         if(card.pos == enemyHandTemp.length-1){
//             parentDiv.append(newDiv);
//         }else{
//              $("#divenemy" + (card.pos+1)).before(newDiv);
//         }
        
//     }else{
//         var parentDiv = $("#youDeck");

//         var newDiv = creatDiv(card, myHandTemp.length);

//         newDiv.css({
//             "background-color": card.color,
//             "color": oppColor(card.color)
//         });

//         newDiv.html(card.number);

//         if(card.pos == myHandTemp.length-1){
//             parentDiv.append(newDiv);
//         }else{
//              $("#divyou" + (card.pos+1)).before(newDiv);
//         }
//     }

//     newDiv.css({
//         'height': '80%',
//         'width': '70px',
//         'borderRadius': '10px',
//         'font-size': '40px',
//         'display': 'flex',
//         'justify-content': 'space-around',
//         'align-items': 'center'
//     });

// }




// function creatDiv(card, n){
//     var i = card.pos;
//     if(i != n-1){
//         for(var j=n-1; j>=i ; j--){
//             $("#div"+ card.playerType + j).attr('id', "div" + card.playerType +(j+1));
//         }

//     }
    
//     var newDiv = jQuery("<div>");
//     newDiv.attr('id', "div" + card.playerType + i); 
//     newDiv.attr('class', "divCard"); 
//     return newDiv;       
// }



    