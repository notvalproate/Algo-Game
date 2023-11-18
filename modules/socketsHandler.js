const { insertCardToHand } = require('./algoCard.js');
const { AlgoCard } = require('./algoCard.js');

class SocketHandler {

    static init(io, roomsHandler) {
        SocketHandler.io = io;
        SocketHandler.roomsHandler = roomsHandler;
    }


    constructor(socket, username, roomKey) {
        this.socket = socket;
        this.username = username;
        this.roomKey = roomKey;
    }


    connectToGameRoom() {

        const roomWasCreated = SocketHandler.roomsHandler.connectToRoom(this.roomKey, this.username);
        if(roomWasCreated) {
            logWithTime(`[+] Room [${this.roomKey}] was created!`);
        }

        this.socket.join(this.roomKey);
        logWithTime(`[+] User [${this.username}] connected to lobby [${this.roomKey}]`);
    }


    disconnectSocket() {
        const destroyed = SocketHandler.roomsHandler.disconnectFromRoom(this.username, this.roomKey);

        logWithTime(`[-] User [${this.username}] disconnected from lobby [${this.roomKey}]`);
        
        if(destroyed) {
            logWithTime(`[-] Room [${this.roomKey}] was destroyed!`);
        } else {
            this.emitReadyUpdate()
        }

        this.emitLobbyUpdate()
    }


    confirmReady(ready) {
        const room = SocketHandler.roomsHandler.getRoom(this.roomKey);
        const startGame = room.setReady(this.username, ready);

        this.emitReadyUpdate()

        if (startGame) {
            logWithTime(`[-] Game started in room [${this.roomKey}]!!!`);
            this.emitStartGame();
        }
    }


    setupGame() {
        const room = SocketHandler.roomsHandler.getRoom(this.roomKey);
        const [yourHand, enemyHand, yourTurn, deckTop] = room.getGameSetup(this.username);

        this.socket.emit('setupGame', { yourHand: yourHand, enemyHand: enemyHand, yourTurn: yourTurn, deckTop: deckTop });
    }


    evaluateGuess(cardPosition, guess, deckTop) {
        const room = SocketHandler.roomsHandler.getRoom(this.roomKey);
        const guessedCard = room.getUsers().find((user) => user.username !== this.username).hand[cardPosition];

        var insertableCard = new AlgoCard(deckTop.number, deckTop.color);
        const userHand = room.getUsers().find((user) => user.username === this.username).hand;
        const index = insertCardToHand(insertableCard, userHand);
        const newDeckTop = room.getDeck().splice(0, 1)[0];

        if(guessedCard.number === guess) {
            SocketHandler.io.to(this.roomKey).emit('revealEnemyCard', { guessedNumber: guessedCard.number, cardPosition: cardPosition });
            SocketHandler.io.to(this.roomKey).emit('pickDeckTop', { deckTop: newDeckTop, insertedCardPosition: index, insertedCard: insertableCard });
        }
        else {
            SocketHandler.io.to(this.roomKey).emit('pickDeckTop', { deckTop: newDeckTop, insertedCardPosition: index, insertedCard: insertableCard });
        }
    }

    
    // io Emits
    emitLobbyUpdate() {
        const room = SocketHandler.roomsHandler.getRoom(this.roomKey);
        SocketHandler.io.to(this.roomKey).emit('lobbyUpdate', room);
    }

    emitReadyUpdate() {
        const room = SocketHandler.roomsHandler.getRoom(this.roomKey);
        SocketHandler.io.to(this.roomKey).emit('readyUpdate', { userList: room.getUsers(), readyCount: room.getReadyCount() });
    }

    emitStartGame() {
        SocketHandler.io.to(this.roomKey).emit('startGame');
    }

}


// Utility functions
function logWithTime(str) {
    const date = new Date();
    const dd = [date.getHours(), date.getMinutes(), date.getSeconds()].map((a)=>(a < 10 ? '0' + a : a));
    console.log(`[${dd.join(':')}]${str}`);
}


// Exports
module.exports = SocketHandler