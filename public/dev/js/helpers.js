// Helper functions

import { globals } from "./play.js";

const dealtCard = $('#dealt-card');
const attackButton = $('.attack');
const holdButton = $('.hold');

const gameResult = $('.game-result');
const gameStatus = $('.game-status');
const resultModal = $('.modal-game-result');

let winText = "YOU WIN";
let loseText = "YOU LOSE";
let disconnectText = "Enemy has disconnected!";
let wonStatus = "You guessed all of <enemy>'s cards!";
let lostStatus = "<enemy> guessed all your cards!";

// MISC HELPERS

function invertColor(color){
    if(color == 'black'){
        return 'white';
    }
    return 'black';
}

function setDeckTopDiv(card) {
    const cardNumber = card.getNumber();
    const cardColor = card.getColor();

    if(cardNumber !== null) {
        dealtCard.html(cardNumber);
    } else {
        dealtCard.html("");
    }

    dealtCard.removeClass(invertColor(cardColor));
    dealtCard.addClass(cardColor);
}


// EVENT LISTENER HELPERS

function addCopyKeyButtonEventListener(roomKey) {
    let clipboard = new ClipboardJS('#copy-key', {
        text: function() {
            return `https://playalgo.com/${roomKey}/play`;
        }
    });

    clipboard.on('success', (e) => {
        e.clearSelection();
    });
}

function addReadyButtonEventListener() {
    $('#ready-button').click(() => {
        if(!globals.ready) {
            globals.ready = true;
        } else {
            globals.ready = false;
        }
        globals.socket.emit('readyConfirmation', { ready: globals.ready });
    });
}

function addReturnButtonEventListener() {
    $('#returnButton').click(() => {
        resultModal.removeClass('modal-in');
        
        applyBackToLobbyTransition();
    })
}

function addButtonEventListeners() {
    const buttons = $('.guess-button');

    for(let i = 0; i < 12; i++) {
        $(buttons[i]).click(() => {
            if(globals.myTurn) {
                $(buttons[globals.myGuessValue]).removeClass('guess-button-selected');
                globals.myGuessValue = i;
                $(buttons[globals.myGuessValue]).addClass('guess-button-selected');

                globals.socket.emit('buttonClicked', { buttonValue: globals.myGuessValue });
            }
        });
    }
}

function addDecisionsEventListener() {
    attackButton.click(() => {
        if(globals.myTurn) {
            globals.socket.emit('attackMove', { guessTarget: globals.selectedCard, guessValue: globals.myGuessValue });
        }
    });

    holdButton.click(() => {
        if(globals.myTurn) {
            globals.socket.emit('holdMove');
        }
    });
}


// DATA SETTINGS HELPERS

function setEnemyUsername(usernames) {
    let enemyUser = usernames[0];
    if(enemyUser === globals.username) {
        enemyUser = usernames[1];
    }

    if(enemyUser === null) {
        $('#enemy').html('...');
        return;
    }
    
    $('#enemy').html(enemyUser);
    $('#enemy-username').html(enemyUser);
    $('#enemy-user-hth').html(enemyUser);

    return enemyUser;
}

const guessCount = $('#guess-count');
const correcGuesses = $('#correct-guesses');
const guessRate = $('#guess-rate');
const stayCount = $('#stay-count');
const myWinCount = $('#my-win-count');
const enemyWinCount = $('#enemy-win-count');
const myCounter = $('#my-counter');
const enemyCounter = $('#enemy-counter');

function setStatsSection(stats) {
    guessCount.html(stats.totalGuesses);
    correcGuesses.html(stats.correctGuesses);
    guessRate.html(`${stats.correctGuessRate.toFixed(2)}%`);
    stayCount.html(stats.timesStayed);
    myWinCount.html(stats.wins);
    enemyWinCount.html(stats.losses);
    
    myCounter.removeClass('game-won');
    myCounter.removeClass('game-lost');
    myCounter.removeClass('tie');

    enemyCounter.removeClass('game-won');
    enemyCounter.removeClass('game-lost');
    enemyCounter.removeClass('tie');

    if(stats.wins > stats.losses) {
        myCounter.addClass('game-won');
        enemyCounter.addClass('game-lost');
    } else if (stats.wins < stats.losses) {
        myCounter.addClass('game-lost');
        enemyCounter.addClass('game-won');
    } else {
        myCounter.addClass('tie');
        enemyCounter.addClass('tie');
    }
}


// CSS CLASS MANAGING HELPERS

function applyJoinLobbyTransition() {
    setTimeout(() => {
        $("header").removeClass("header-out");
        $("footer").removeClass("footer-out");
        $(".lobby").removeClass("fade-out");
    }, 200);
}

function applyGameStartTransition() {
    $(".lobby").addClass("fade-out");
    $(".desk-wrapper").removeClass("display-none");

    setTimeout(() => {
        $("header").addClass("header-out");
        $("footer").addClass("footer-out");
    }, 1000);

    setTimeout(() => {
        $('.main-bg').removeClass('fade-in');
    }, 1500);

    setTimeout(() => {
        $(".lobby").addClass("display-none");
        $("header").addClass("display-none");
        $("footer").addClass("display-none");

        $("#ready-button").removeClass('ready-status');

        $(".desk-wrapper").addClass("fade-in");
        
        globals.ready = false;
        $('#enemy').removeClass('player-ready');
        $('#me').removeClass('player-ready');
        $('#ready-count').html('0');
    }, 2300);
}

function applyBackToLobbyTransition() {
    $("header").removeClass("display-none");
    $("footer").removeClass("display-none");
    $(".lobby").removeClass("display-none");

    setTimeout(() => {
        $(".desk-wrapper").removeClass("fade-in");
        $('.main-bg').addClass('fade-in');
    }, 1000);

    setTimeout(() => {
        $("header").removeClass("header-out");
        $("footer").removeClass("footer-out");
        $(".lobby").removeClass("fade-out");
        resultModal.addClass('display-none');
        $(".desk-wrapper").addClass("display-none");
        $('.enemy-disconnect').html('');
    }, 1400);
}

const myUsername = $('#my-username');
const enemyUsername = $('#enemy-username');
const enemyHandCont = $('.enemy-hand-container');
const guessArray = $('.guess-array');
const decisionWrapper = $('.decision-wrapper');

function applyTransitionToEnemyTurn() {
    myUsername.removeClass('player-turn');
    enemyUsername.addClass('player-turn');
    enemyHandCont.addClass('no-pointer-events');
    guessArray.addClass('guess-array-inactive');
    dealtCard.removeClass('highlight-dealt-card');
    decisionWrapper.addClass('decision-fade-away');
    setActionsInactive();
}

function setActionsInactive() {
    attackButton.addClass('decision-inactive');
    holdButton.addClass('decision-inactive');
}

function applyTransitionToMyTurn() {
    myUsername.addClass('player-turn');
    enemyUsername.removeClass('player-turn');
    enemyHandCont.removeClass('no-pointer-events');
    guessArray.removeClass('guess-array-inactive');
    dealtCard.addClass('highlight-dealt-card');
    decisionWrapper.removeClass('decision-fade-away');
}

function closeCardWithDelay(index, delay) {
    const cardToClose = $($('.my-card')[index]);
    setTimeout(() => {
        cardToClose.addClass('closed');
        cardToClose.removeClass('open');
    }, delay);
}

function addHighlightTo(index) {
    let myCardDivs = $('.my-card');

    $(myCardDivs[globals.selectedCard]).removeClass('selected');
    globals.selectedCard = index;
    $(myCardDivs[globals.selectedCard]).addClass('selected');
}

function removeHighlightFrom(cardDiv) {
    $(cardDiv).removeClass('selected');
}

function displayConfetti() {
    const end = Date.now() + 8 * 1000;
    let colors = ["#ffffff"];
    let originY = 0;
    let angleL = -30;
    let angleR = -150;

    colors.push("#00bb00");
    colors.push("#e0c331");
    
    (function frame() {
      confetti({
        zIndex: 999,
        particleCount: 2,
        angle: angleL,
        spread: 60,
        origin: { x: 0, y: originY },
        colors: colors,
        startVelocity: 90,
      });
    
      confetti({
        zIndex: 999,
        particleCount: 2,
        angle: angleR,
        spread: 60,
        origin: { x: 1, y: originY },
        colors: colors,
        startVelocity: 90,
      });
    
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
}

function setModalTranslations() {
    let lang = localStorage.getItem('lang');

    if(lang !== null) {
        fetch(`/assets/languages/${lang}.json`)
            .then(response => response.json())
            .then((json) => {
                const langContent = json.dynamic;
                
                winText = langContent.gameWon;
                loseText = langContent.gameLost;
                disconnectText = langContent.disconnectStatus;
                wonStatus = langContent.wonStatus;
                lostStatus = langContent.lostStatus;
            });
    }
}

function showResultModal(wonGame, enemyUsername, disconnect) {
    gameResult.removeClass('game-won');
    gameResult.removeClass('game-lost');

    if(disconnect) {
        gameResult.html(winText);
        gameStatus.html(disconnectText);
        gameResult.addClass('game-won');
    } else if(wonGame) {
        gameResult.html(winText);
        gameStatus.html(wonStatus.replace('<enemy>', enemyUsername));
        gameResult.addClass('game-won');
    } else {
        gameResult.html(loseText);
        gameStatus.html(lostStatus.replace('<enemy>', enemyUsername));
        gameResult.addClass('game-lost');
    }

    resultModal.removeClass('display-none');

    setTimeout(() => {
        resultModal.addClass('modal-in');
        if (wonGame) {
            displayConfetti();
        }
    }, 1600);
}

export {
    invertColor,
    setDeckTopDiv,

    addCopyKeyButtonEventListener,
    addReadyButtonEventListener,
    addReturnButtonEventListener,
    addButtonEventListeners,
    addDecisionsEventListener,

    setEnemyUsername,
    setStatsSection,
    setModalTranslations,
    setActionsInactive,

    applyJoinLobbyTransition,
    applyGameStartTransition,
    applyTransitionToEnemyTurn,
    applyTransitionToMyTurn,

    closeCardWithDelay,
    addHighlightTo,
    removeHighlightFrom,

    showResultModal,
}