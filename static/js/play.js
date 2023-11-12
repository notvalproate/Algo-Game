$(document).ready(function() {

window.history.pushState(null, '', `/${roomKey}/play`);

var socket = io({
    query: {
        username: username,
        roomKey: roomKey
    }
});

socket.on('joinLobby', (data) => {
    console.log('joined lobby ' + data);
});

});
