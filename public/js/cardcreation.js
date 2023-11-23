// Module that handles all card div creation

import { globals } from './play.js';
import * as Animations from './animations.js';

function createInitialHands(myHand, enemyHand) {
    for(let i = 0; i < myHand.length; i++) {
        createAndAnimateCardDiv(myHand[i], i, 'your-hand', 'closed');
    }

    for(let i = 0; i < enemyHand.length; i++) {
        createAndAnimateCardDiv(enemyHand[i], i, 'enemy-hand', 'closed');
    }
}

function createAndAnimateCardDiv(card, pos, hand, state) {
    const cardDiv = createCardDiv(card, state);

    addCardDivToHand(cardDiv, pos, hand);

    if(hand === 'enemy-hand') {
        updateEnemyHandEventListeners(pos);
    }

    Animations.drawCardAnimation(cardDiv, card);
}

function createCardDiv(card, state) {
    const cardDiv = $('<div>');
    cardDiv.addClass("card");
    cardDiv.addClass(state);
    cardDiv.addClass(card.getColor());
    cardDiv.html(card.getNumber());

    return cardDiv;
}

function addCardDivToHand(cardDiv, pos, hand) {
    const handDivs = $(`.${hand}`);
    const handLength = handDivs.length;

    cardDiv.addClass(hand);

    if(pos === handLength) {
        let parentDiv = $('#yourHand');
        if(hand === 'enemy-hand') {
            parentDiv = $('#enemyHand');
        }
        parentDiv.append(cardDiv);
    } else {
        $(handDivs[pos]).before(cardDiv);
    }
}

function updateEnemyHandEventListeners(pos) {
    const handDivs = $(".enemy-hand");

    for(let i = pos; i < handDivs.length; i++) {
        const cardDiv = $(handDivs[i]);
        
        if(cardDiv.hasClass('open')) {
            continue;
        }

        cardDiv.click(() => {
            if(globals.myTurn) {
                const selectedCardDiv = $($(".enemy-hand")[globals.selectedCard]);
    
                selectedCardDiv.removeClass('selected');
                cardDiv.addClass('selected');
    
                globals.selectedCard = i;
                globals.socket.emit("selectCard", { guessTarget: globals.selectedCard });
            }
        })
    }
}

export {
    createInitialHands,
    createAndAnimateCardDiv,
}