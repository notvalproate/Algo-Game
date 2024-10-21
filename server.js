// Imports
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

// Rooms modules
const RoomListHandler = require("./modules/roomListHandler.js");
const SocketHandler = require("./modules/socketsHandler.js");

// If you dont have the .env file (since it is in .gitignore), create a .env file and set port to what you wish.
const env = require("./modules/environment.js");
const PORT = env.app.PORT;
const MODE = env.app.MODE;

// Server Setup
const app = express();
let socket_server = null;

console.log(MODE)

if (MODE === "development") {
    socket_server = require("http").Server(app);
} else {
    socket_server = require('https').createServer(
        {
            key: fs.readFileSync('./ssl/key.pem'),
            cert: fs.readFileSync('./ssl/cert.pem'),
        },
        app,
    );

    const helmet = require('helmet');
    const permissionsPolicy = require("permissions-policy");
    const compression = require('compression');

    app.disable('x-powered-by');
    app.use(helmet({
        contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
            "'self'",
            'https://cdn.jsdelivr.net',
            'https://kit.fontawesome.com',
            'https://cdnjs.cloudflare.com',
            ],
            connectSrc: ["'self'", 'https://ka-f.fontawesome.com'],
        },
        }
    }));
    app.use(permissionsPolicy({
        features: {
            fullscreen: ["self"],
        },
    }));
    app.use(compression());
}

const io = require("socket.io")(socket_server);

var roomsHandler = new RoomListHandler();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

// View engine and views path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// GET routes
app.get("/", (req, res) => {
    res.render("index", { roomKey: undefined, alert: false, alertMsg: "" });
});

app.get("/:roomKey/play", (req, res) => {
    const roomKey = req.params.roomKey;
    const roomToJoin = roomsHandler.getRoom(roomKey);

    if (roomToJoin === undefined || roomToJoin.getUsers().length < 2) {
        res.render("index", { roomKey: roomKey, alert: false, alertMsg: "" });
    } else {
        res.render("index", {
            roomKey: undefined,
            alert: true,
            alertMsg: "The lobby you tried to join is already FULL!",
        });
    }
});

app.get("/howtoplay", (req, res) => {
    res.render("howto");
});

app.get("/afk", (req, res) => {
    res.render("index", {
        roomKey: undefined,
        alert: true,
        alertMsg: `You have been kicked for inactivity!`,
    });
});

// POST routes
app.post("/", (req, res) => {
    const roomKey = req.body.roomKey;
    const username = req.body.username;
    const roomToJoin = roomsHandler.getRoom(roomKey);

    if (roomKey.length === 0 || username.length === 0) {
        res.render("index", {
            roomKey: undefined,
            alert: true,
            alertMsg: `The username or room key entered was invalid!`,
        });
        return;
    }

    if (roomKey.indexOf(" ") >= 0 || username.indexOf(" ") >= 0) {
        res.render("index", {
            roomKey: undefined,
            alert: true,
            alertMsg: `The username or room key entered was invalid!`,
        });
        return;
    }

    if (roomToJoin === undefined) {
        res.render("play", {
            roomKey: roomKey,
            username: username,
            enemyUsername: "...",
            numberOfPlayersReady: 0,
        });
    } else if (roomToJoin.users.length == 1) {
        if (roomToJoin.usernameInRoom(username)) {
            res.render("index", {
                roomKey: roomKey,
                alert: true,
                alertMsg: `The username \"${username}\" is already in use in this lobby!`,
            });
        } else {
            res.render("play", {
                roomKey: roomKey,
                username: username,
                enemyUsername: roomToJoin.getUsers()[0].username,
                numberOfPlayersReady: roomToJoin.getReadyCount(),
            });
        }
    } else {
        res.render("index", {
            roomKey: undefined,
            alert: true,
            alertMsg: "The lobby you tried to join is already FULL!",
        });
    }
});

// Socket routes
io.on("connection", (socket) => {
    const username = socket.handshake.query.username;
    const roomKey = socket.handshake.query.roomKey;

    SocketHandler.init(io, roomsHandler);
    var socketHandler = new SocketHandler(socket, username, roomKey);

    socketHandler.connectToGameRoom();

    socket.on("disconnect", () => {
        socketHandler.disconnectSocket();
    });

    socket.on("readyConfirmation", (data) => {
        socketHandler.confirmReady(data);
    });

    socket.on("selectCard", (data) => {
        socketHandler.updateSelection(data);
    });

    socket.on("buttonClicked", (data) => {
        socketHandler.updateButtonClicked(data);
    });

    socket.on("attackMove", (data) => {
        socketHandler.handleAttack(data);
    });

    socket.on("holdMove", () => {
        socketHandler.handleHold();
    });

    socketHandler.emitLobbyUpdate();
});

// Handle 404 Not Found
app.use((req, res) => {
    res.status(404).render("404");
});

// Run Server using the http socket server created.
socket_server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
