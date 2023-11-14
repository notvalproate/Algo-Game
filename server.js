const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();


// If you dont have the .env file (since it is in .gitignore), create a .env file and set port to what you wish.
const PORT = process.env.PORT;

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


// GET routes to render index.ejs
app.get('/', (req, res) => {
    res.render('index', { roomKey: undefined, full: false });
});

app.get('/:roomKey/play', (req, res) => {
    const roomKey = req.params.roomKey;
    const roomToJoin = roomsList.find((room) => room.roomKey === roomKey)

    if(roomToJoin === undefined || roomToJoin.users.length < 2) {
        res.render('index', { roomKey: roomKey, full: false });
    } else {
        res.render('index', { roomKey: undefined, full: true });
    }
});


// POST routes
app.post('/', (req, res) => {
    const roomKey = req.body.roomKey;
    const username = req.body.username;
    const roomToJoin = roomsList.find((room) => room.roomKey === roomKey);

    if(roomToJoin === undefined) {
        res.render('play', { roomKey: roomKey, username: username, enemyUsername: '...' , numberOfPlayersReady: 0});
    } else if(roomToJoin.users.length == 1) {
        res.render('play', { roomKey: roomKey, username: username, enemyUsername: roomToJoin.users[0] , numberOfPlayersReady: 0});
    } else {
        res.render('index', { roomKey: undefined, full: true });
    }
});

function logWithTime(string) {
    const date = new Date();
    const dd = [date.getHours(), date.getMinutes(), date.getSeconds()].map((a)=>(a < 10 ? '0' + a : a));
    console.log(`[${dd.join(':')}]${string}`);
}

// Socket routes
io.on('connection', (socket) => {
    const username = socket.handshake.query.username;
    const roomKey = socket.handshake.query.roomKey;

    if (io.sockets.adapter.rooms.get(roomKey) === undefined) {
        logWithTime(`[+] Room [${roomKey}] was created!`);

        roomsList.push({
            roomKey: roomKey,
            users: [{ username: username, ready: false }],
            numberOfPlayersReady: 0
        });

        console.log(roomsList[roomsList.length - 1]);
    } else if (io.sockets.adapter.rooms.get(roomKey).size === 1) {
        const roomToJoin = roomsList.find((room) => room.roomKey === roomKey);
        roomToJoin.users.push({ username: username, ready: false });
        
        console.log(roomToJoin);
    }
    
    socket.join(roomKey);
    logWithTime(`[+] User [${username}] connected to lobby [${roomKey}]`);

    const roomIndex = roomsList.findIndex(room => room.roomKey === roomKey);
    const userIndex = roomsList[roomIndex].users.findIndex(user => user.username === username);

    socket.on('disconnect', () => {
        logWithTime(`[-] User [${username}] disconnected from lobby [${roomKey}]`);

        if(roomsList[roomIndex].users.length === 1) {
            logWithTime(`[-] Room [${roomKey}] was destroyed!`)
            roomsList.splice(roomIndex, 1);
        } else {
            roomsList[roomIndex].users.splice(userIndex, 1);
        }
        
        io.sockets.in(roomKey).emit('lobbyUpdate', roomsList.find((room) => room.roomKey === roomKey));
    });

    socket.on('readyConfirmation', (data) => {
        const isPlayerReady = data.ready;

        roomsList[roomIndex].users[userIndex].ready = isPlayerReady;

        if(isPlayerReady) {
            roomsList[roomIndex].numberOfPlayersReady++;
        } else {
            roomsList[roomIndex].numberOfPlayersReady--;
        }

        io.sockets.in(roomKey).emit('readyUpdate', { userList: roomsList[roomIndex].users, readyCount: roomsList[roomIndex].numberOfPlayersReady });

        if (roomsList[roomIndex].numberOfPlayersReady === 2) {
            io.sockets.in(roomKey).emit('startGame');
        }
    });

    io.sockets.in(roomKey).emit('lobbyUpdate', roomsList.find((room) => room.roomKey === roomKey));
});


// Run Server using the http socket server created (previous mistake was doing app.listen(), thats why it didn't work)
socket_server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
