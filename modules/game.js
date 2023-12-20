const { AlgoCard } = require("./algoCard.js");
const { getShuffledDeck } = require("./algoCard.js");
const { sortPlayerHand } = require("./algoCard.js");
const { ObjectArray_to_AlgoCardArray } = require("./algoCard.js");
const { deepCopy } = require("./algoCard.js");

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
                    wins: 0,
                    losses: 0,
                },
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
                    wins: 0,
                    losses: 0,
                },
            },
        ];
        this.deck = getShuffledDeck(24);
        this.activeTurn = Math.floor(Math.random() * 2);

        this.players[0].hand.push(...sortPlayerHand(this.deck.splice(0, 4)));
        this.players[1].hand.push(...sortPlayerHand(this.deck.splice(0, 4)));

        this.running = false;
    }

    insertDeckTopToActiveUser() {
        const cardToInsert = this.deck.splice(0, 1)[0];
        const activeUserHand = this.players[this.activeTurn].hand;
        var insertIndex = 0;

        for (; insertIndex < activeUserHand.length; insertIndex++) {
            const cardValue = activeUserHand[insertIndex].getNumber();

            if (cardValue < cardToInsert.getNumber()) {
                continue;
            }

            if (cardValue > cardToInsert.getNumber()) {
                break;
            }

            if (cardToInsert.getColor() === "white") {
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

        if (enemyPlayer.hand[target].getNumber() === value) {
            thisPlayer.stats.correctGuesses++;
            enemyPlayer.stats.openCount++;

            if (enemyPlayer.stats.openCount === enemyPlayer.hand.length) {
                thisPlayer.stats.wins++;
                enemyPlayer.stats.losses++;
                thisPlayer.stats.correctGuessRate =
                    this.getCorrectGuessRate(thisPlayer);
                enemyPlayer.stats.correctGuessRate =
                    this.getCorrectGuessRate(enemyPlayer);

                wonGame = true;
                this.running = false;
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
        var yourHand = ObjectArray_to_AlgoCardArray(
            deepCopy(this.players[0].hand)
        );
        var enemyHand = ObjectArray_to_AlgoCardArray(
            deepCopy(this.players[1].hand)
        );
        var yourTurn = this.getActiveTurn(username);

        if (this.players[0].username !== username) {
            [yourHand, enemyHand] = [enemyHand, yourHand];
        }

        this.running = true;

        return [yourHand, enemyHand, yourTurn];
    }

    getActiveTurn(username) {
        if (this.players[this.activeTurn].username === username) {
            return true;
        }
        return false;
    }

    getActiveTurnIndex() {
        return this.activeTurn;
    }

    getDeckTop() {
        return this.deck[0];
    }

    getHiddenAndVisibleDeckTop() {
        const deckTop = this.getDeckTop();
        return [
            new AlgoCard(null, deckTop.getColor()),
            new AlgoCard(deckTop.getNumber(), deckTop.getColor()),
        ];
    }

    getCorrectGuessRate(player) {
        if (player.stats.totalGuesses === 0) {
            return 0;
        }
        return (
            (player.stats.correctGuesses * 100.0) / player.stats.totalGuesses
        );
    }

    getStats(username) {
        let thisPlayerStats = this.players[0].stats;
        let enemyPlayerStats = this.players[1].stats;

        if (this.players[0].username !== username) {
            [thisPlayerStats, enemyPlayerStats] = [
                enemyPlayerStats,
                thisPlayerStats,
            ];
        }

        return [thisPlayerStats, enemyPlayerStats];
    }

    getGameRunning() {
        return this.running;
    }

    resetGame() {
        const player1 = this.players[0].username;
        const player1wins = this.players[0].stats.wins;
        const player2 = this.players[1].username;
        const player2wins = this.players[1].stats.wins;

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
                    wins: player1wins,
                    losses: player2wins,
                },
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
                    wins: player2wins,
                    losses: player1wins,
                },
            },
        ];

        this.deck = getShuffledDeck(24);
        this.activeTurn = Math.floor(Math.random() * 2);

        this.players[0].hand.push(...sortPlayerHand(this.deck.splice(0, 4)));
        this.players[1].hand.push(...sortPlayerHand(this.deck.splice(0, 4)));

        this.running = false;
    }
}

module.exports = {
    Game: Game,
};
