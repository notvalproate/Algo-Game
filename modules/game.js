const { AlgoCard } = require('./algoCard.js');
const { getShuffledDeck } = require('./algoCard.js');
const { sortPlayerHand } = require('./algoCard.js');
const { ObjectArray_to_AlgoCardArray } = require('./algoCard.js');
const { deepCopy } = require('./algoCard.js');

class Game {
    constructor(player1, player2) {
        this.players = [ { username: player1, hand: [], openCount: 0 }, { username: player2, hand: [], openCount: 0} ];
        this.deck = getShuffledDeck(24);
        this.activeTurn = Math.floor(Math.random() * 2);
        
        this.players[0].hand.push(...sortPlayerHand(this.deck.splice(0,4)));
        this.players[1].hand.push(...sortPlayerHand(this.deck.splice(0,4)));
    }

    insertDeckTopToActiveUser() {
        const cardToInsert = this.deck.splice(0, 1)[0];
        const activeUserHand = this.players[this.activeTurn].hand;
        var insertIndex = 0;

        for(;insertIndex < activeUserHand.length; insertIndex++) {
            const cardValue = activeUserHand[insertIndex].getNumber();

            if(cardValue < cardToInsert.getNumber()) {
                continue;
            }

            if(cardValue > cardToInsert.getNumber()) {
                break;
            }

            if(cardToInsert.getColor() === 'white') {
                insertIndex++;
                break;
            }

            break;
        }

        activeUserHand.splice(insertIndex, 0, cardToInsert);
        return insertIndex;
    }

    switchTurns() {
        this.activeTurn = 1 - this.activeTurn;
    }

    makeGuess(target, value) {
        const enemyUserIndex = 1 - this.activeTurn;
        const deckTopValue = this.getDeckTop().getNumber();

        if(this.players[enemyUserIndex].hand[target].getNumber() === value) {
            //handle correct what shud happen
            return [true, 0, deckTopValue];
        }
    
        const indexInsertedAt = this.insertDeckTopToActiveUser();

        this.switchTurns();

        return [false, indexInsertedAt, deckTopValue];
    }

    getGameSetup(username) {
        var yourHand =  ObjectArray_to_AlgoCardArray( deepCopy (this.players[0].hand) );
        var enemyHand = ObjectArray_to_AlgoCardArray( deepCopy (this.players[1].hand) );
        var yourTurn = this.getActiveTurn(username);

        if(this.players[0].username !== username) {
            [yourHand, enemyHand] = [enemyHand, yourHand];
        }

        return [yourHand, enemyHand, yourTurn];
    }

    getActiveTurn(username) {
        if(this.players[this.activeTurn].username === username) {
            return true;
        }
        return false;
    }

    getDeckTop() {
        return this.deck[0];
    }

    getHiddenAndVisibleDeckTop() {
        const deckTop = this.getDeckTop();
        return [new AlgoCard(null, deckTop.getColor()), new AlgoCard(deckTop.getNumber(), deckTop.getColor())];
    }

}; 

module.exports = {
    Game: Game,
}