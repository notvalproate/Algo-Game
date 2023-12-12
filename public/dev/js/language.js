const languageModal = $('#language-modal');

const supportedLanguages = ['en', 'ja'];

function addLanguageEventListeners() {
    $('#language-button').click(() => {
        languageModal.removeClass('display-none');
    
        setTimeout(() => {
            languageModal.addClass('language-modal-fade-in');
        }, 50);
    });

    for(let i = 0; i < supportedLanguages.length; i++) {
        const lang = supportedLanguages[i];

        $(`#${lang}Option`).click(() => {
            languageModal.removeClass('language-modal-fade-in');
    
            localStorage.setItem('lang', lang);
    
            setTimeout(() => {
                languageModal.addClass('display-none');
            }, 500);
        });
    }
}

export {
    addLanguageEventListeners,
}