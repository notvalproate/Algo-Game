// Module that handles all card div creation

import { globals } from './play.js';
import * as Animations from './animations.js';

function createInitialHands(myHand, enemyHand) {
    for(let i = 0; i < myHand.length; i++) {
        createAndAnimateCardDiv(myHand[i], i, 'my', 'closed');
    }

    for(let i = 0; i < enemyHand.length; i++) {
        createAndAnimateCardDiv(enemyHand[i], i, 'enemy', 'closed');
    }
}

function createAndAnimateCardDiv(card, pos, hand, state) {
    const cardDiv = createCardDiv(card, state);

    addCardDivToHand(cardDiv, pos, hand);

    if(hand === 'enemy') {
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
    const cardDivsInHand = $(`.${hand}-card`);
    const numOfCards = cardDivsInHand.length;

    cardDiv.addClass(`${hand}-card`);

    if(pos === numOfCards) {
        let parentDiv = $('#my-hand');
        if(hand === 'enemy') {
            parentDiv = $('#enemy-hand');
        }
        parentDiv.append(cardDiv);
    } else {
        $(cardDivsInHand[pos]).before(cardDiv);
    }
}

function updateEnemyHandEventListeners(pos) {
    const cardDivsInHand = $(".enemy-card");

    for(let i = pos; i < cardDivsInHand.length; i++) {
        const cardDiv = $(cardDivsInHand[i]);
        
        if(cardDiv.hasClass('open')) {
            continue;
        }

        cardDiv.click(() => {
            if(globals.myTurn) {
                const selectedCardDiv = $($(".enemy-card")[globals.selectedCard]);
    
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