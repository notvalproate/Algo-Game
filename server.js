// Imports
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();


// Rooms modules
const RoomListHandler = require('./modules/roomListHandler.js');


// If you dont have the .env file (since it is in .gitignore), create a .env file and set port to what you wish.
const PORT = process.env.PORT;


// Server Setup
const app = express();
const socket_server = require('http').Server(app);
const io = require('socket.io')(socket_server);


var roomsHandler = new RoomListHandler();


// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/static')));

// View engine and views path
app.set('view engine','ejs');
app.set('views', path.join(__dirname, '/views'));


// GET routes to render index.ejs
app.get('/', (req, res) => {
    res.render('index', { roomKey: undefined, full: false });
});

app.get('/:roomKey/play', (req, res) => {
    const roomKey = req.params.roomKey;
    const roomToJoin = roomsHandler.getRoom(roomKey);

    if(roomToJoin === undefined || roomToJoin.getUsers().length < 2) {
        res.render('index', { roomKey: roomKey, full: false });
    } else {
        res.render('index', { roomKey: undefined, full: true });
    }
});


// POST routes
app.post('/', (req, res) => {
    const roomKey = req.body.roomKey;
    const username = req.body.username;
    const roomToJoin = roomsHandler.getRoom(roomKey);

    if(roomToJoin === undefined) {
        res.render('play', { roomKey: roomKey, username: username, enemyUsername: '...' , numberOfPlayersReady: 0});
    } else if(roomToJoin.users.length == 1) {
        res.render('play', { roomKey: roomKey, username: username, enemyUsername: roomToJoin.getUsers()[0] , numberOfPlayersReady: roomToJoin.getReadyCount() });
    } else {
        res.render('index', { roomKey: undefined, full: true });
    }
});


// Socket routes
io.on('connection', (socket) => {
    const username = socket.handshake.query.username;
    const roomKey = socket.handshake.query.roomKey;
    const roomWasCreated = roomsHandler.connectToRoom(roomKey, username);

    if(roomWasCreated) {
        logWithTime(`[+] Room [${roomKey}] was created!`);
    }
    socket.join(roomKey);

    logWithTime(`[+] User [${username}] connected to lobby [${roomKey}]`);

    socket.on('disconnect', () => {
        const room = roomsHandler.getRoom(roomKey);
        const destroyed = roomsHandler.disconnectFromRoom(username, roomKey);

        logWithTime(`[-] User [${username}] disconnected from lobby [${roomKey}]`);
        
        if(destroyed) {
            logWithTime(`[-] Room [${roomKey}] was destroyed!`);
        } else {
            io.to(roomKey).emit('readyUpdate', { userList: room.getUsers(), readyCount: room.getReadyCount() });
        }

        io.to(roomKey).emit('lobbyUpdate', room);
    });

    socket.on('readyConfirmation', (data) => {
        const room = roomsHandler.getRoom(roomKey);
        const startGame = room.setReady(username, data.ready);

        io.to(roomKey).emit('readyUpdate', { userList: room.getUsers(), readyCount: room.getReadyCount() });

        if (startGame) {
            logWithTime(`[-] Game started in room [${roomKey}]!!!`);
            io.to(roomKey).emit('startGame');
        }
    });

    socket.on('getHands', () => {
        const room = roomsHandler.getRoom(roomKey);
        const [yourHand, enemyHand] = room.getHands(username);

        socket.emit('setHands', { yourHand: yourHand, enemyHand: enemyHand });
    });

    io.to(roomKey).emit('lobbyUpdate', roomsHandler.getRoom(roomKey));
});


// Run Server using the http socket server created (previous mistake was doing app.listen(), thats why it didn't work)
socket_server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


// Helper functions
function logWithTime(string) {
    const date = new Date();
    const dd = [date.getHours(), date.getMinutes(), date.getSeconds()].map((a)=>(a < 10 ? '0' + a : a));
    console.log(`[${dd.join(':')}]${string}`);
}
