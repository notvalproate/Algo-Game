const { Game } = require('./game.js');

class Room {
    // LOBBY SETUP

    constructor(roomKey, username) {
        this.roomKey = roomKey;
        this.users = [ { username: username, ready: false } ];
        this.numberOfPlayersReady = 0;

        this.game = undefined;
    } 

    addUser(username) {
        this.users.push({ username: username, ready: false });
        this.displayRoom();
    }

    removeUser(username) {
        const index = this.users.findIndex(user => user.username === username);
        this.users.splice(index, 1);
        this.numberOfPlayersReady = this.users[0].ready + 0;
    }

    // GAME SETUP

    getGameSetup(username) {
        return this.game.getGameSetup(username);
    }

    // GAME LOGIC

    makeGuess(target, value) {
        return this.game.makeGuess(target, value);
    }

    // SETTERS

    setReady(username, readyStatus) {
        const index = this.users.findIndex(user => user.username === username);
        this.users[index].ready = readyStatus;

        this.numberOfPlayersReady = this.users[0].ready + 0;
        if(this.users.length === 2) { this.numberOfPlayersReady += this.users[1].ready; }

        if(this.numberOfPlayersReady === 2) {
            this.users[0].ready = this.users[1].ready = false;
            this.game = new Game(this.users[0].username, this.users[1].username);
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
        return this.game.getActiveTurn(username);
    }

    getHiddenAndVisibleDeckTop() {
        return this.game.getHiddenAndVisibleDeckTop();
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