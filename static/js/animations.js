// Module that handles all the animations

import * as Helpers from './helpers.js';

async function drawCardAnimation(cardDiv, card) {
    const dealerOffset = $('#dealer').offset();
    const cardOffset = cardDiv.offset();

    const translateVector = {
        Y: dealerOffset.top - cardOffset.top,
        X: dealerOffset.left - cardOffset.left
    };

    defineDrawAnimation(cardDiv, card, translateVector)
    .then(() => {
        cardDiv.playKeyframe({
            name: `draw-${card.getColor()}-${card.getNumber()}`,
            duration: '0.4s',
            timingFunction: 'ease',
            delay: '0s',
            direction: 'reverse',
            fillMode: 'both',
            complete: function() {
                cardDiv.css({
                    "z-index": "10",
                });
            }
        });
    })
}

async function defineDrawAnimation(cardDiv, card, translateVector) {
    if(cardDiv.hasClass('your-hand')) {
        $.keyframe.define({
            name: `draw-${card.getColor()}-${card.getNumber()}`,
            '100%': {
                'transform': `translate(${translateVector.X}px, ${translateVector.Y}px ) `,
            }
        });
    } else {
        $.keyframe.define([{
            name: `draw-${card.getColor()}-${card.getNumber()}`,
            '0%': {
                'color': `${Helpers.invertColor(card.getColor())}`,
                'transform': 'rotateY(0deg)'
            },
            '49%':{
                'color': `${card.getColor()}`,
            },
            '100%': {
                'transform': `translate(${translateVector.X}px, ${translateVector.Y}px ) rotateY(180deg)`,
                'color': `${card.getColor()}`,
            }
        }]);
    }
}

function flipCardAnimation(cardDiv, algoCard) {
    cardDiv.playKeyframe({
        name: `flip-${algoCard.getColor()}-card`,
        duration: '0.4s',
        timingFunction: 'ease',
        delay: '0s'
    });
}

function hoverCalloutAnimation(callout) {
    callout.playKeyframe({
        name: 'hover-callout',
        duration: '2s',
        timingFunction: 'cubic-bezier(.48,.01,.49,.99)',
        iterationCount: 'infinite',
    }); 
}

function highlightFadeOutTo(state, cardDiv) {
    $(cardDiv).removeClass('selected');
    $(cardDiv).addClass(state);
    setTimeout(() => {
        $(cardDiv).removeClass(state);
    }, 400);
}

async function initAnimations() {
    $.keyframe.define({
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
    });
    
    $.keyframe.define({
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
    });

    $.keyframe.define({
        name: 'hover-callout',
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

export {
    drawCardAnimation,
    flipCardAnimation,
    hoverCalloutAnimation,
    highlightFadeOutTo,
    initAnimations
};