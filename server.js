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

app.get('/wait', (req, res) => {
    res.render('wait');
});

app.get('/:roomKey/play', (req, res) => {
    res.render('play', { roomKey: req.params.roomKey });
});


// Socket routes
const socket_server = require('http').Server(app);
const io = require('socket.io')(socket_server);

io.on('connection', (socket) => {
    const roomKey = socket.handshake.query.roomKey;
    const username = socket.handshake.query.username;

    socket.join(roomKey);

    // Currently this returns 1 everytime, hence even though two people input same room key, it returns count as 1, 
    // hence not executing line 61 onwards as we'd expect
    const users = io.sockets.adapter.rooms.get(roomKey).size;
    console.log('Total users in room ' + roomKey + ': ' + users);

    // Lmao idk i find this formatting for if blocks more cleaner and readable idk if u wanna change it back change it, I'll just go with it lol.
    if (users === 1) {
        console.log('Pushed new room')

        roomsList.push({
            roomKey: roomKey,
            users: [username],
        });
        socket.emit('redirect', '/wait');
    } 
    else if (users === 2) {
        console.log('Trying to join existing room')

        const roomToJoin = roomsList.find((room) => room.roomKey === roomKey);
        roomToJoin.users.push(username);
        socket.emit('redirect', `/${roomKey}/play`);
    }
    else {
        console.log('Trying to join a full room')

        socket.emit('error', 'The room is already full');
    }
});


// POST routes (not in use at the moment)
app.post('/register', (req, res) => {
    console.log(req.body)
    res.redirect('/');
});


// Run Server using the http socket server created (previous mistake was doing app.listen(), thats why it didn't work)
socket_server.listen(PORT, HOST, () => {
    console.log(`Server running at https://${HOST}:${PORT}`);
});
