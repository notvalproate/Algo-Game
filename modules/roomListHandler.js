const Room = require('./room.js')

class RoomListHandler {
    constructor() {
        this.roomsList = []
        this.lobbyTimeout = 150000;

        setInterval(() => {
            this.checkRoomsForInactivity();
        }, 30000);
    };

    connectToRoom(roomKey, username, socket) {
        const room = this.getRoom(roomKey);

        if (room === undefined) {
            this.createRoom(roomKey, username, socket);
            return true;
        } else {
            room.addUser(username, socket);
        }

        return false;
    }

    createRoom(roomKey, username, socket) {
        this.roomsList.push(new Room(roomKey, username));
        this.roomsList[this.roomsList.length - 1].setSocket(0, socket);

        this.roomsList[this.roomsList.length - 1].displayRoom();
    }

    destroyRoom(roomKey) {
        const index = this.roomsList.findIndex(room => room.getRoomKey() === roomKey);
        this.roomsList.splice(index, 1);
    }

    disconnectFromRoom(username, roomKey) {
        const room = this.getRoom(roomKey);
        
        if(room.getUsers().length === 1) {
            this.destroyRoom(roomKey);
            return true;
        }
        else {
            room.removeUser(username);
        }

        return false;
    }

    checkRoomsForInactivity() {
        for(let i = 0; i < this.roomsList.length; i++) {
            if(this.roomsList[i].getTimeSinceLastInteraction() >= this.lobbyTimeout) {
                this.roomsList[i].emitAfk();
            }
        }
    }

    getRoom(roomKey) {
        return this.roomsList.find((room) => room.getRoomKey() === roomKey);
    }
};

module.exports = RoomListHandler