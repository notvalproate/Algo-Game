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