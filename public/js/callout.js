// Module that handles the callout display

import * as Animations from './animations.js';
import { globals } from './play.js';

function displayCallout(index, color, value) {
    if(!globals.myTurn) {
        if($('.guess-callout')) {
            $('.guess-callout').remove();
        }

        const calloutDiv = $('<div>');
        calloutDiv.addClass('guess-callout');
        calloutDiv.addClass(color);
        calloutDiv.html(value);

        $($('.your-hand')[index]).prepend(calloutDiv);
        
        Animations.hoverCalloutAnimation(calloutDiv);
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

