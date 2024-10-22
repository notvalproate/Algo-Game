// Import scss to build for webpack
import "../scss/styles.scss";

import * as LanguageHandler from "./language.js";

$(document).ready(function () {
    $(".main-bg").addClass("fade-in");

    setTimeout(() => {
        $("header").removeClass("header-out");
        $("footer").removeClass("footer-out");
    }, 1000);

    setTimeout(() => {
        $(".login").addClass("fade-in");
    }, 1400);

    $("#username").on("input", (e) => {
        e.target.value = removeSpaces(e.target.value);
    });

    $("#roomKey").on("input", (e) => {
        e.target.value = removeSpaces(e.target.value);
    });

    $("#playButton").on("click", (event) => {
        const usernameVal = $("#username").val();
        const roomKeyVal = $("#roomKey").val();

        localStorage.setItem("prevUsername", usernameVal);

        if (usernameVal === "" || roomKeyVal === "") {
            return;
        }

        event.preventDefault();

        $(".login").removeClass("fade-in");

        setTimeout(() => {
            $("header").addClass("header-out");
            $("footer").addClass("footer-out");
        }, 400);

        setTimeout(() => {
            $("#playForm").submit();
        }, 1500);
    });

    // SET PREVIOUS PUT USERNAME
    const prevUsername = localStorage.getItem("prevUsername");

    if (prevUsername !== null) {
        $("#username").val(prevUsername);
    }

    // LANGUAGE STUFF - LATER TO BE PUT INTO SEPERATE MODULE

    LanguageHandler.addLanguageEventListeners(() => {});
    LanguageHandler.checkAndSetPageLanguage();
});

function removeSpaces(str) {
    return str.replace(/ /g, "");
}
