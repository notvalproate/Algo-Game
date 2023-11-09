const PORT = 31415;
const HOST = 'localhost';

$(document).ready(function() {

   
$('#playButton').click(function(event) {
    console.log(event);
    event.preventDefault();

    const socket = io(`https://${HOST}:${PORT}`, {
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