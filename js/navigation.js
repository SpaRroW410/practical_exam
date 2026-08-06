// ============================================================
// Community Medicine Examination System
// Navigation
// Version 1.0
// ============================================================


// ------------------------------------------------------------
// Go to Next Section
// ------------------------------------------------------------

function nextSection() {

    if (appState.currentSection < SECTION_ORDER.length - 1) {

        appState.currentSection++;

        renderCurrentSection();

    }

}


// ------------------------------------------------------------
// Go to Previous Section
// ------------------------------------------------------------

function previousSection() {

    if (appState.currentSection > 0) {

        appState.currentSection--;

        renderCurrentSection();

    }

}


// ------------------------------------------------------------
// First Section?
// ------------------------------------------------------------

function isFirstSection() {

    return appState.currentSection === 0;

}


// ------------------------------------------------------------
// Last Section?
// ------------------------------------------------------------

function isLastSection() {

    return appState.currentSection ===
        SECTION_ORDER.length - 1;

}


// ------------------------------------------------------------
// Attach Navigation Events
// ------------------------------------------------------------

function attachNavigationEvents() {

    const previousButton =
        document.getElementById("previousButton");

    const nextButton =
        document.getElementById("nextButton");


    if (previousButton) {

        previousButton.onclick = previousSection;

    }


    if (nextButton) {

        nextButton.onclick = nextSection;

    }

}

window.nextSection = nextSection;
window.previousSection = previousSection;
window.isFirstSection = isFirstSection;
window.isLastSection = isLastSection;
window.attachNavigationEvents = attachNavigationEvents;


// ------------------------------------------------------------
// Keyboard Navigation
// ------------------------------------------------------------

document.addEventListener("keydown", function (event) {

    if (appState.currentView === "home")
        return;

    if (event.key === "ArrowRight") {

        // Reserve screen has no nextButton — allow manual
        // advance to Summary before the timer runs out.

        if (typeof reserveMode !== "undefined" && reserveMode) {

            finishSpotter();

            return;

        }

        const btn = document.getElementById("nextButton");

        if (btn)
            btn.click();

    }

    if (event.key === "ArrowLeft") {

        const btn = document.getElementById("previousButton");

        if (btn)
            btn.click();

    }

});

































