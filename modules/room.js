const { AlgoCard } = require('./algoCard.js');
const { getShuffledDeck } = require('./algoCard.js');
const { removeNums } = require('./algoCard.js');
const { sortPlayerHand } = require('./algoCard.js');
const { ObjectArray_to_AlgoCardArray } = require('./algoCard.js');

class Room {
    constructor(roomKey, username) {
        this.roomKey = roomKey;
        this.users = [ { username: username, ready: false, hand: []} ];
        this.numberOfPlayersReady = 0;
        this.deck = undefined;
    }

    addUser(username) {
        this.users.push({ username: username, ready: false, hand: []});
        this.displayRoom();
    }

    removeUser(username) {
        const index = this.users.findIndex(user => user.username === username);
        this.users.splice(index, 1);
        this.numberOfPlayersReady = this.users[0].ready + 0;
    }

    setupGame() {
        this.deck = getShuffledDeck(24);
        this.users[0].hand.push(...this.deck.splice(0,4));
        this.users[1].hand.push(...this.deck.splice(0,4));
    }
    
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

    getRoomKey() {
        return this.roomKey;
    }

    getUsers() {
        return this.users;
    }

    getReadyCount() {
        return this.numberOfPlayersReady;
    }

    getHands(username) {
        var yourHand = sortPlayerHand( ObjectArray_to_AlgoCardArray( deepCopy(this.users[0].hand) ) );
        var enemyHand = sortPlayerHand( ObjectArray_to_AlgoCardArray( deepCopy(this.users[1].hand) ) );

        if(this.users[0].username !== username) {
            [yourHand, enemyHand] = [enemyHand, yourHand];
        }

        return [yourHand, removeNums(enemyHand)];
    }

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

// Helpers

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = Room