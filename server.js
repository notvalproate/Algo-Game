const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();


// If you dont have the .env file (since it is in .gitignore), create a .env file and set port and host to what you wish.
const PORT = process.env.PORT;
const HOST = process.env.HOST;

const app = express();
const socket_server = require('http').Server(app);
const io = require('socket.io')(socket_server);

var roomsList = [];


// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/static')));

// View engine and views path
app.set('view engine','ejs');
app.set('views', path.join(__dirname, '/views'));


// GET routes to render appropriate screen. Redirected to wait and play through the socket.io room.
// Need to not allow the user to directly put http://localhost:58617/wait or http://localhost:58617/roomkey/play and access the page.
app.get('/', (req, res) => {
    res.render('index');
});

// POST routes
app.post('/', (req, res) => {
    res.render('play', { roomKey: req.body.roomKey, username: req.body.username });
});


// Socket routes
io.on('connection', (socket) => {
    const username = socket.handshake.query.username;
    const roomKey = socket.handshake.query.roomKey;

    console.log(`-User [${username}] connected to lobby [${roomKey}]`);

    if (io.sockets.adapter.rooms.get(roomKey) === undefined) {
        socket.join(roomKey);
        roomsList.push({
            roomKey: roomKey,
            users: [username],
        });
            
        socket.emit('joinLobby', roomKey);
    } else if (io.sockets.adapter.rooms.get(roomKey).size === 1) {
        socket.join(roomKey);
        const roomToJoin = roomsList.find((room) => room.roomKey === roomKey);
        roomToJoin.users.push(username);

        console.log(roomToJoin);

        socket.emit('joinLobby', roomKey);
    } else {
        socket.emit('lobbyFull', roomKey);
    }

    //io.sockets.in(roomKey).emit('test', users);
});


// Run Server using the http socket server created (previous mistake was doing app.listen(), thats why it didn't work)
socket_server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
