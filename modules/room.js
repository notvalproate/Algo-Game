const { Game } = require('./game.js');

class Room {
    // LOBBY SETUP

    constructor(roomKey, username) {
        this.roomKey = roomKey;
        this.lastInteraction = Date.now();
        this.users = [ { username: username, ready: false, socket: undefined } ];
        this.numberOfPlayersReady = 0;

        this.game = undefined;
    } 

    addUser(username, socket) {
        this.users.push({ username: username, ready: false, socket: undefined });
        this.lastInteraction = Date.now();

        this.setSocket(1, socket);

        this.game = new Game(this.users[0].username, this.users[1].username);
        this.displayRoom();
    }

    removeUser(username) {
        const index = this.users.findIndex(user => user.username === username);
        this.lastInteraction = Date.now();
        this.users.splice(index, 1);
        this.numberOfPlayersReady = this.users[0].ready + 0;
    }

    usernameInRoom(username) {
        if(this.users[0].username === username) {
            return true;
        }
        return false;
    }

    // GAME SETUP

    getGameSetup(username) {
        return this.game.getGameSetup(username);
    }

    // GAME LOGIC

    makeGuess(target, value) {
        return this.game.makeGuess(target, value);
    }

    holdDeckTop() {
        return this.game.holdDeckTop();
    }

    // SETTERS

    setSocket(index, socket) {
        this.users[index].socket = socket;
    }

    setReady(username, readyStatus) {
        this.lastInteraction = Date.now();
        const index = this.users.findIndex(user => user.username === username);
        this.users[index].ready = readyStatus;

        this.numberOfPlayersReady = this.users[0].ready + 0;
        if(this.users.length === 2) { this.numberOfPlayersReady += this.users[1].ready; }

        if(this.numberOfPlayersReady === 2) {
            return true;
        }

        return false;
    }

    resetReadyStatus() {
        this.users[0].ready = this.users[1].ready = false;
    }

    resetGame() {
        this.game.resetGame();
    }

    // GETTERS

    getRoomKey() {
        return this.roomKey;
    }

    getUsers() {
        let users = [];
        for(let i = 0; i < this.users.length; i++) {
            users.push({ username: this.users[i].username, ready: this.users[i].ready });
        }

        return users;
    }

    getReadyCount() {
        return this.numberOfPlayersReady;
    }

    getActiveTurn(username) {
        this.lastInteraction = Date.now();

        if(this.game === undefined) {
            return false;
        }
        return this.game.getActiveTurn(username);
    }

    getHiddenAndVisibleDeckTop() {
        return this.game.getHiddenAndVisibleDeckTop();
    }

    getStats(username) {
        this.lastInteraction = Date.now();
        return this.game.getStats(username);
    }

    getGameRunning() {
        if(this.game === undefined) {
            return false;
        }
        return this.game.getGameRunning();
    }

    getTimeSinceLastInteraction() {
        if(this.lastInteraction === 0) {
            return 0;
        } else {
            return Date.now() - this.lastInteraction;
        }
    }

    // EMITS

    emitAfk() {
        if(this.game) {
            if(this.game.getGameRunningStatus()) {
                this.users[this.game.getActiveTurnIndex()].socket.emit('afk-warning');
                return;
            }
        }
        this.users[0].socket.emit('afk-warning');
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