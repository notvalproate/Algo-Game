$(document).ready(function() {
    $('.main-bg').addClass('fade-in');

    setTimeout(() => {
        $('header').removeClass('header-out');
        $('footer').removeClass('footer-out');
    }, 1000);

    setTimeout(() => {
        $('.login').addClass('fade-in');
    }, 1400);
    
    $('#username').on('input', (e) => {
        e.target.value = removeSpaces(e.target.value);
    });

    $('#roomKey').on('input', (e) => {
        e.target.value = removeSpaces(e.target.value);
    });

    $('#playButton').on('click', (event) => {
        const usernameVal = $('#username').val();
        const roomKeyVal = $('#roomKey').val();
    
        if(usernameVal === '' || roomKeyVal === '') {
            return;
        }
        
        event.preventDefault();
    
        $('.login').removeClass('fade-in');
    
        setTimeout(() => {
            $('header').addClass('header-out');
            $('footer').addClass('footer-out');
        }, 400);
        
        setTimeout(() => {
          $('#playForm').submit();
        }, 1500);
    });
});

function removeSpaces(str){
    return str.replace(/ /g, '');
}