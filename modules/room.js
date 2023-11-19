const { AlgoCard } = require('./algoCard.js');
const { getShuffledDeck } = require('./algoCard.js');
const { removeNums } = require('./algoCard.js');
const { sortPlayerHand } = require('./algoCard.js');
const { ObjectArray_to_AlgoCardArray } = require('./algoCard.js');
const { deepCopy } = require('./algoCard.js');

class Room {
    // LOBBY SETUP

    constructor(roomKey, username) {
        this.roomKey = roomKey;
        this.users = [ { username: username, ready: false, hand: [], openCount: 0} ];
        this.numberOfPlayersReady = 0;
        this.deck = undefined;
        this.activeTurn = undefined;
    }

    addUser(username) {
        this.users.push({ username: username, ready: false, hand: [], openCount: 0});
        this.displayRoom();
    }

    removeUser(username) {
        const index = this.users.findIndex(user => user.username === username);
        this.users.splice(index, 1);
        this.numberOfPlayersReady = this.users[0].ready + 0;
    }


    // GAME SETUP

    setupGame() {
        this.activeTurn = Math.floor(Math.random() * 2);

        this.deck = getShuffledDeck(24);
        this.users[0].hand.push(...this.deck.splice(0,4));
        this.users[1].hand.push(...this.deck.splice(0,4));
    }

    getGameSetup(username) {
        var yourHand =  ObjectArray_to_AlgoCardArray( deepCopy ( sortPlayerHand (this.users[0].hand) ) );
        var enemyHand = ObjectArray_to_AlgoCardArray( deepCopy ( sortPlayerHand (this.users[1].hand) ) );
        var yourTurn = this.getActiveTurn(username);

        if(this.users[0].username !== username) {
            [yourHand, enemyHand] = [enemyHand, yourHand];
        }

        return [yourHand, enemyHand, yourTurn];
    }


    // GAME LOGIC

    switchTurns() {
        this.activeTurn = 1 - this.activeTurn;
    }

    insertDeckTopToActiveUser() {
        const cardToInsert = this.deck.splice(0, 1)[0];
        const activeUserHand = this.users[this.activeTurn].hand;
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

    makeGuess(target, value) {
        const enemyUserIndex = 1 - this.activeTurn;
        const deckTopValue = this.getDeckTop().getNumber();

        if(this.users[enemyUserIndex].hand[target].getNumber() === value) {
            //handle correct what shud happen
            return [true, 0, deckTopValue];
        }
    
        const indexInsertedAt = this.insertDeckTopToActiveUser();

        this.switchTurns();

        return [false, indexInsertedAt, deckTopValue];
    }


    // SETTERS

    setReady(username, readyStatus) {
        const index = this.users.findIndex(user => user.username === username);
        this.users[index].ready = readyStatus;

        this.numberOfPlayersReady = this.users[0].ready + 0;
        if(this.users.length === 2) { this.numberOfPlayersReady += this.users[1].ready; }

        if(this.numberOfPlayersReady === 2) {
            this.setupGame();
            return true;
        }

        return false;
    }


    // GETTERS

    getRoomKey() {
        return this.roomKey;
    }

    getUsers() {
        return this.users;
    }

    getReadyCount() {
        return this.numberOfPlayersReady;
    }

    getActiveTurn(username) {
        if(this.users[this.activeTurn].username === username) {
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

    // DEBUG

    displayRoom() {
        var logString = `\n[ROOM: ${this.roomKey}]\n - Users:\n`;
        for(var i = 0; i < this.users.length; i++) {
            logString += `  ${i+1}. ` + this.users[i].username + `\n  Ready: ${this.users[i].ready}\n  Hand: ${this.users[i].hand}\n`;
        }
        logString += `\n - Ready Count: ${this.numberOfPlayersReady}\n`;
        logString += ` - Current Deck: ${this.deck}\n[END OF ROOM]\n`

        console.log(logString);
    }
}

module.exports = Room