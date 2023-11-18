// Imports
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();


// Rooms modules
const RoomListHandler = require('./modules/roomListHandler.js');
const SocketHandler = require('./modules/socketsHandler.js');


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


// GET routes
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
    
    SocketHandler.init(io, roomsHandler);
    var socketHandler = new SocketHandler(socket, username, roomKey);
    
    socketHandler.connectToGameRoom();
    
    socket.on('disconnect', () => {
        socketHandler.disconnect();
    });

    socket.on('readyConfirmation', (data) => {
        socketHandler.readyConfirmation(data.ready);
    });

    socket.on('getGameSetup', () => {
        socketHandler.getGameSetup();
    });

    socketHandler.updateLobby();
});


// Run Server using the http socket server created.
socket_server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
