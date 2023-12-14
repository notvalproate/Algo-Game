const settingsModal = $('#settings-modal');

function addSettingsEventListener() {
    $('#settingsButton').click(() => {
        settingsModal.removeClass('display-none');
    
        setTimeout(() => {
            settingsModal.addClass('settings-modal-fade-in');
        }, 50);
    });

    $('#closeButton').click(() => {
        settingsModal.removeClass('settings-modal-fade-in');

        setTimeout(() => {
            settingsModal.addClass('display-none');
        }, 500);
    });
}

export {
    addSettingsEventListener,
}