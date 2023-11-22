// Module that handles all card div creation

import { globals } from './play.js';
import * as Animations from './animations.js';

async function createInitialHands(myHand, enemyHand) {
    for(let i = 0; i < myHand.length; i++) {
        await createAndAnimateCardDiv(myHand[i], i, 'your-hand', 'closed');
    }

    for(let i = 0; i < enemyHand.length; i++) {
        await createAndAnimateCardDiv(enemyHand[i], i, 'enemy-hand', 'closed');
    }
}

async function createAndAnimateCardDiv(card, pos, hand, state) {
    const cardDiv = await createCardDiv(card, state);

    await addCardDivToHand(cardDiv, pos, hand);

    if(hand === 'enemy-hand') {
        await updateEnemyHandEventListeners(pos);
    }

    await Animations.drawCardAnimation(cardDiv, card);
}

async function createCardDiv(card, state) {
    const cardDiv = $('<div>');
    cardDiv.addClass("card");
    cardDiv.addClass(state);
    cardDiv.addClass(card.getColor());
    cardDiv.html(card.getNumber());

    return cardDiv;
}

async function addCardDivToHand(cardDiv, pos, hand) {
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

async function updateEnemyHandEventListeners(pos) {
    const handDivs = $(".enemy-hand");

    for(let i = pos; i < handDivs.length; i++) {
        const cardDiv = $(handDivs[i]);
        
        if(cardDiv.hasClass('open')) {
            continue;
        }

        cardDiv.click(() => {
            const selectedCardDiv = $($(".enemy-hand")[globals.selectedCard]);

            selectedCardDiv.removeClass('selected');
            cardDiv.addClass('selected');

            globals.selectedCard = i;
            globals.socket.emit("selectCard", { guessTarget: globals.selectedCard });
        })
    }
}

export {
    createInitialHands,
    createAndAnimateCardDiv,
}