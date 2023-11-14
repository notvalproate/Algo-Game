$(document).ready(function() {

    window.history.pushState(null, '', `/${roomKey}/play`);
    
    var socket = io({
        query: {
            username: username,
            roomKey: roomKey
        }
    });

    socket.on('lobbyUpdate', (roomData) => {
        if(roomData.users.length === 2) {
            var enemyuser = roomData.users[0];
            if(enemyuser === username) {
                enemyuser = roomData.users[1];
            }
            $('#enemy').html(enemyuser);
        }
        else {
            $('#enemy').html('...');
        }
    });

    const readyButton = $('#ready-button');
    const you = $('#you');
    const enemy = $('#enemy');
    var ready = false;

    readyButton.click(() => {
        if(!ready) {
            you.addClass('player-ready');
            readyButton.addClass('ready-status');
            ready = true;
        }
        else {
            you.removeClass('player-ready');
            readyButton.removeClass('ready-status')
            ready = false;
        }
    });
    
});
    