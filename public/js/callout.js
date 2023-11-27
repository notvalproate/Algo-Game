// Module that handles the callout display

import * as Animations from './animations.js';
import { globals } from './play.js';

let calloutDiv = undefined;

function displayCallout(index, color, value) {
    if(!globals.myTurn) {
        if(globals.calloutActive) {
            calloutDiv.remove();
        }

        calloutDiv = $('<div>');
        calloutDiv.addClass('guess-callout');
        calloutDiv.addClass(color);
        calloutDiv.html(value);

        $($('.my-card')[index]).prepend(calloutDiv);
        
        globals.calloutActive = true;

        Animations.hoverCalloutAnimation(calloutDiv);
    }
}

function removeCallout() {
    calloutDiv.remove();
    globals.calloutActive = false;
}

function updateCallout(value) {
    calloutDiv.html(value);
}

export {
    displayCallout,
    removeCallout,
    updateCallout,
}

