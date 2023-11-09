$(document).ready(function() {

$('#playButton').click(function(event) {
    event.preventDefault();

    var socket = io({
        query: {
            roomKey: $('#roomKey').val(),
            username: $('#username').val()
        }
    });

    socket.on('redirect', (url) => {
        window.location.href = url;
    });

    socket.on('error', (message) => {
        alert(message);
    });
});

});
