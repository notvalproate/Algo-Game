const Room = require('./room.js')

class RoomListHandler {
    constructor() {
        this.roomsList = []
    };

    connectToRoom(roomKey, username) {
        const room = this.getRoom(roomKey);

        if (room === undefined) {
            this.createRoom(roomKey, username);
            return true;
        } else {
            room.addUser(username);
        }

        return false;
    }

    createRoom(roomKey, username) {
        this.roomsList.push(new Room(roomKey, username));

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

    getRoom(roomKey) {
        return this.roomsList.find((room) => room.getRoomKey() === roomKey);
    }
};

module.exports = RoomListHandler