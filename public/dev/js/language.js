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
            localStorage.setItem('lang', lang);
            setPageLanguage(lang);

            languageModal.removeClass('language-modal-fade-in');
            setTimeout(() => {
                languageModal.addClass('display-none');
            }, 500);
        });
    }
}

function checkAndSetPageLanguage() {
    const lang = localStorage.getItem('lang');

    if(lang === null) {
        setPageLanguage('en');
        return;
    }

    setPageLanguage(lang);
}

function setPageLanguage(lang) {
    fetch(`../../assets/languages/${lang}.json`)
        .then(response => response.json())
        .then((json) => {
            const langContent = json.content;

            console.log(langContent);
        });
}

export {
    addLanguageEventListeners,
    checkAndSetPageLanguage,
}