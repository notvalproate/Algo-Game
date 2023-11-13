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
            $('#ready-count').html('1');

            you.css({
                "color": "yellow",
                "transform": "scale(1.2)"
            });
    
            readyButton.css({
                "background-color": "#ffffff",
                "color": "#b0b0b0"
            });

            ready = true;
        }
        else {
            $('#ready-count').html('0');

            you.css({
                "color": "#b0b0b0",
                "transform": "scale(1)"
            });

            readyButton.css({
                "background-color": "#b0b0b0",
                "color": "#ffffff"
            });

            ready = false;
        }
    });
    
});
    