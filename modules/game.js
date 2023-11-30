const { AlgoCard } = require('./algoCard.js');
const { getShuffledDeck } = require('./algoCard.js');
const { sortPlayerHand } = require('./algoCard.js');
const { ObjectArray_to_AlgoCardArray } = require('./algoCard.js');
const { deepCopy } = require('./algoCard.js');

class Game {
    constructor(player1, player2) {
        this.players = [ 
            { 
                username: player1, 
                hand: [], 
                stats: {
                    openCount: 0,
                    totalGuesses: 0,
                    correctGuesses: 0,
                    correctGuessRate: 0,
                    timesStayed: 0,
                }
            }, 
            {
                username: player2, 
                hand: [],
                stats: {
                    openCount: 0,
                    totalGuesses: 0,
                    correctGuesses: 0,
                    correctGuessRate: 0,
                    timesStayed: 0,
                }

            }
        ];
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
        let wonGame = false;

        const thisPlayer = this.players[this.activeTurn];
        const enemyPlayer = this.players[enemyUserIndex];

        thisPlayer.stats.totalGuesses++;

        if(enemyPlayer.hand[target].getNumber() === value) {
            thisPlayer.stats.correctGuesses++;
            enemyPlayer.stats.openCount++;

            if(enemyPlayer.stats.openCount === enemyPlayer.hand.length) {
                thisPlayer.stats.correctGuessRate = this.getCorrectGuessRate(thisPlayer);
                enemyPlayer.stats.correctGuessRate = this.getCorrectGuessRate(enemyPlayer);

                wonGame = true;
            }

            return [true, 0, deckTopValue, wonGame];
        }
    
        const indexInsertedAt = this.insertDeckTopToActiveUser();
        this.players[this.activeTurn].stats.openCount++;
        
        this.switchTurns();

        return [false, indexInsertedAt, deckTopValue, wonGame];
    }

    holdDeckTop() {
        this.players[this.activeTurn].stats.timesStayed++;

        const insertIndex = this.insertDeckTopToActiveUser();

        this.switchTurns();

        return insertIndex;
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

    getGameEndStatus() {
        return this.ended;
    }

    getCorrectGuessRate(player) {
        return Math.round(player.stats.correctGuesses * 10000.0 / player.stats.totalGuesses) / 100;
    }
    
    getStats(username) {
        let thisPlayerStats = this.players[0].stats;
        let enemyPlayerStats = this.players[1].stats;

        if(this.players[0].username !== username) {
            [thisPlayerStats, enemyPlayerStats] = [enemyPlayerStats, thisPlayerStats];
        }

        return [thisPlayerStats, enemyPlayerStats];
    } 
}; 

module.exports = {
    Game: Game,
}