$(document).ready(function() {

var socket = io({
    query: {
        username: username,
        roomKey: roomKey
    }
});

socket.on('joinLobby', (data) => {
    console.log('joined lobby ' + data);
});

socket.on('lobbyFull', (data) => {
    console.log('the room ' + data + ' is full!');
});

});
