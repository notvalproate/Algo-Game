const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const PORT = process.env.PORT || 31415;
const HOST = process.env.HOST || 'localhost';
const app = express();

var rooms_ = [];

//Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/static')));

//View engine
app.set('view engine','ejs');
app.set('views', path.join(__dirname, '/views'));

// GET routes
app.get('/', (req, res) => {
    render_options = {
        message: undefined
    };
    res.render('index', render_options);
})

app.get('/wait', (req, res) => {
    res.render('wait');
})

app.get('/:roomKey/play', (req, res) => {
    const roomKey = req.params.roomKey;
    res.render('play', { roomKey: roomKey });
})

// Socket routes
const socket_server = require('http').Server(app);
const io = require('socket.io')(socket_server);

io.on('connection', (socket) => {
    const roomKey = socket.handshake.query.roomKey;
    const username = socket.handshake.query.username;


    socket.join(roomKey);

    const users = io.sockets.adapter.rooms.get(roomKey).size;

    if (users === 1) {
        rooms_.push({
            roomKey: roomKey,
            users: [username],
        });
        socket.emit('redirect', '/wait');
    } else if (users === 2) {
        const room = rooms_.find((room) => room.roomKey === roomKey);
        room.users.push(username);
        socket.emit('redirect', `/${roomKey}/play`);
    } else {
        socket.emit('error', 'The room is already full');
    }
});

// POST routes
app.post('/register', (req, res) => {
    console.log(req.body)
    res.redirect('/');
})

// Run Server
app.listen(PORT, HOST, () => {
    console.log(`Server running at https://${HOST}:${PORT}`);
})