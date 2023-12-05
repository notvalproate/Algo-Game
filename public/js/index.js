$(document).ready(function() {
    $('.main-bg').addClass('fade-in');

    setTimeout(() => {
        $('header').removeClass('header-out');
        $('footer').removeClass('footer-out');
    }, 1000);

    setTimeout(() => {
        $('.login').addClass('fade-in');
    }, 1400);
});

$('#playButton').on('click', (event) => {
    const username = $('#username').val();
    const roomKey = $('#roomKey').val();

    if(username === '' || roomKey === '') {
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

$('#username').on('keypress', (e) => {
    if (e.which == 32) {
        return false;
    }
});

$('#roomKey').on('keypress', (e) => {
    if (e.which == 32) {
        return false;
    }
});