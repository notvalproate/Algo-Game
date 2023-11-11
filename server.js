const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();


// If you dont have the .env file (since it is in .gitignore), create a .env file and set port and host to what you wish.
const PORT = process.env.PORT;
const HOST = process.env.HOST;

const app = express();

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
app.post('/:roomKey/play', (req, res) => {
    res.render('play', { roomKey: req.data.roomKey, username: req.data.username });
});


// Socket routes
const socket_server = require('http').Server(app);
const io = require('socket.io')(socket_server);

io.on('connection', (socket) => {
    console.log('User connected');

    const roomKey = data.roomKey;
    const username = data.username;

    users = 0;

    if (io.sockets.adapter.rooms.get(roomKey) === undefined) {
        console.log('Pushed new room');

        socket.join(roomKey);
        roomsList.push({
            roomKey: roomKey,
            users: [username],
        });
        users = io.sockets.adapter.rooms.get(roomKey).size;
            
        socket.emit('joinLobby', roomKey);
    } else if (io.sockets.adapter.rooms.get(roomKey).size === 1) {
        console.log('Trying to join existing room')
    
        socket.join(roomKey);
        const roomToJoin = roomsList.find((room) => room.roomKey === roomKey);
        roomToJoin.users.push(username);

        users = io.sockets.adapter.rooms.get(roomKey).size;
        console.log(roomToJoin);

        socket.emit('joinLobby', roomKey);
    } else {
        console.log('Trying to join a full room')
    
        socket.emit('lobbyFull', roomKey);
    }

    //io.sockets.in(roomKey).emit('test', users);
    console.log('Total users in room ' + roomKey + ': ' + users);
});


// Run Server using the http socket server created (previous mistake was doing app.listen(), thats why it didn't work)
socket_server.listen(PORT, HOST, () => {
    console.log(`Server running at https://${HOST}:${PORT}`);
});
