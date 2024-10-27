const languageModal = $("#language-modal");

const supportedLanguages = ["de", "en", "it", "ja"];

function addLanguageEventListeners(tempFunction) {
    $("#languageButton").click(() => {
        languageModal.removeClass("display-none");

        setTimeout(() => {
            languageModal.addClass("language-modal-fade-in");
        }, 50);
    });

    for (let i = 0; i < supportedLanguages.length; i++) {
        const lang = supportedLanguages[i];

        $(`#${lang}Option`).click(() => {
            localStorage.setItem("lang", lang);
            setPageLanguage(lang);

            languageModal.removeClass("language-modal-fade-in");
            setTimeout(() => {
                languageModal.addClass("display-none");
            }, 500);

            tempFunction();
        });
    }
}

function checkAndSetPageLanguage() {
    const lang = localStorage.getItem("lang");

    if (lang === null || lang === "en") {
        return;
    }

    setPageLanguage(lang);
}

function setPageLanguage(lang) {
    fetch(`/assets/languages/${lang}.json`)
        .then((response) => response.json())
        .then((json) => {
            const langContent = json.content;

            for (let [key, value] of Object.entries(langContent)) {
                if (key === "here") {
                    continue;
                }
                if (key === "contrib") {
                    value = `${value} <a href="https://github.com/notvalproate/Algo-Game" target="_blank">${langContent.here}</a>`;
                }
                $(`#${key}`).html(value);
            }
        });
}

export { addLanguageEventListeners, checkAndSetPageLanguage };
