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

    const readyButton = document.getElementById('ready-button');
    const player = document.getElementById('player1');

    readyButton.addEventListener('click', function() {
        player.style.color = 'yellow';
        player.style.transform = 'scale(1.2)';
        readyButton.style.backgroundColor = '#ffffff';
        readyButton.style.color = 'rgb(176,176,176)';
        
    });
    
    
});
    