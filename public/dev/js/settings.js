import * as Sounds from "./audio.js";

const settingsModal = $("#settings-modal");
const volumeSlider = $("#volumeSlider");
const volumeIcon = $("#volumeIcon");
let volumeStatus = undefined;

function addSettingsEventListener() {
    setInitialVolume();

    $("#settingsButton").click(() => {
        settingsModal.removeClass("display-none");

        setTimeout(() => {
            settingsModal.addClass("settings-modal-fade-in");
        }, 50);
    });

    $("#closeButton").click(() => {
        settingsModal.removeClass("settings-modal-fade-in");

        setTimeout(() => {
            settingsModal.addClass("display-none");
        }, 500);
    });

    volumeSlider.on("pointerup touchend", () => {
        const volume = volumeSlider.val();
        localStorage.setItem("volume", JSON.stringify({ volume: volume }));
        volumeStatus = getVolumeStatusFromVolume(volume);
        setVolumeIcon();

        Sounds.setSoundsVolume(volumeSlider.val());
        Sounds.playCorrectSound();
    });
}

function setInitialVolume() {
    let storedVolume = localStorage.getItem("volume");

    if (storedVolume === null) {
        volumeStatus = 2;
    } else {
        storedVolume = JSON.parse(storedVolume);
        volumeStatus = getVolumeStatusFromVolume(storedVolume.volume);
        volumeSlider.attr("value", `${storedVolume.volume}`);
        Sounds.setSoundsVolume(storedVolume.volume);
        setVolumeIcon();
    }
}

function setVolumeIcon() {
    volumeIcon.removeClass("fa-volume-high");
    volumeIcon.removeClass("fa-volume-low");
    volumeIcon.removeClass("fa-volume-xmark");

    if (volumeStatus === 0) {
        volumeIcon.addClass("fa-volume-xmark");
    } else if (volumeStatus === 1) {
        volumeIcon.addClass("fa-volume-low");
    } else {
        volumeIcon.addClass("fa-volume-high");
    }
}

function getVolumeStatusFromVolume(volume) {
    if (volume <= 0.1) {
        return 0;
    }

    if (volume <= 50) {
        return 1;
    }

    return 2;
}

export { addSettingsEventListener };
