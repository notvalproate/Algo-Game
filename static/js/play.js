$(document).ready(function() {

var socket = io({
    roomKey: $("#roomkey").html
});

socket.on('joinLobby', (data) => {
    console.log('joined lobby ' + data);
});

socket.on('lobbyFull', (data) => {
    console.log('the room ' + data + ' is full!');
});

});
