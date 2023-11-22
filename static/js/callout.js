// Module that handles the callout display

import * as Animations from './animations.js';
import { globals } from './play.js';

function displayCallout(index, color, value) {
    if(!globals.myTurn) {
        if($('.guess-callout')) {
            $('.guess-callout').remove();
        }
        
        let card = $($('.your-hand')[index]);

        var calloutDiv = $('<div>');
        calloutDiv.addClass('guess-callout');
        calloutDiv.addClass(color);
        calloutDiv.html(value);

        card.prepend(calloutDiv);
        
        Animations.hoverCalloutAnimation(calloutDiv);

        return calloutDiv;
    }
}

function removeCallout() {
    $('.guess-callout').remove();
}

function updateCallout(value) {
    $('.guess-callout').html(value);
}

export {
    displayCallout,
    removeCallout,
    updateCallout,
}

