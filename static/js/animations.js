// Module that handles all the animations

const { AlgoCard } = require("algoCard");

function drawCardAnimation(playerType, pos, card) {
    const dealerPos = $('#dealer').offset();
    const victimPos = $($(`.${playerType}-hand`)[pos]).offset();

    const translateDir = {
        Y: dealerPos.top - victimPos.top,
        X: dealerPos.left - victimPos.left
    };

    if(playerType == 'your'){
        $.keyframe.define([{
            name: 'serve' + playerType + pos,
            '100%': {
                'transform': `translate(${translateDir.X}px, ${translateDir.Y}px ) `,
            }
        }]);
    }else{
        $.keyframe.define([{
            name: 'serve' + playerType + pos,
            '0%': {
                'color': `${invertColor(card.color)}`,
                'transform': 'rotateY(0deg)'
            },
            '49%':{
                'color': `${card.color}`
            },
            '100%': {
                'transform': `translate(${translateDir.X}px, ${translateDir.Y}px ) rotateY(180deg)`,
                'color': `${card.color}`
            }
        }]);
    }
    
    $($(`.${playerType}-hand`)[pos]).playKeyframe({
        name: 'serve' + playerType + pos,
        duration: '0.4s',
        timingFunction: 'ease',
        delay: '0s',
        direction: 'reverse',
        fillMode: 'both',
        complete: function() {
            $($(`.${playerType}-hand`)[pos]).css({
                "z-index": "10",
            });
        }
    });
}

function flipCardAnimation(cardDiv, algoCard) {
    cardDiv.playKeyframe({
        name: `flip-${algoCard.getColor()}-card`,
        duration: '0.4s',
        timingFunction: 'ease',
        delay: '0s'
    });
}

function playCalloutAnimation(callout) {
    callout.playKeyframe({
        name: 'hover',
        duration: '2s',
        timingFunction: 'cubic-bezier(.48,.01,.49,.99)',
        iterationCount: 'infinite',
    }); 
}

function initAnimations() {
    $.keyframe.define([{
        name: 'flip-white-card',
        '0%': {
            'transform': `rotateY(180deg)`,
            'color': `white`
        },
        '30%':{
            'color': `white`
        },
        '31%':{
            'color': `black`
        },
        '100%': {
            'transform': 'rotateY(0deg)'
        }
    }]);
    
    $.keyframe.define([{
        name: 'flip-black-card',
        '0%': {
            'transform': `rotateY(180deg)`,
            'color': `black`
        },
        '30%':{
            'color': `black`
        },
        '31%':{
            'color': `white`
        },
        '100%': {
            'transform': 'rotateY(0deg)'
        }
    }]);

    $.keyframe.define({
        name: 'hover',
        '0%': {
            'transform': `translate(calc(5.5vh - 50%), -110%)`,
        },
        '50%': {
            'transform': `translate(calc(5.5vh - 50%), -140%)`,
        },
        '100%': {
            'transform': `translate(calc(5.5vh - 50%), -110%)`,
        }
    });
}

function invertColor(color){
    if(color == 'black'){
        return 'white';
    }
    return 'black';
}

export {
    drawCardAnimation,
    flipCardAnimation,
    playCalloutAnimation,
    initAnimations
};