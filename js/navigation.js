
// ============================================================
// Community Medicine Examination System
// Navigation
// Version 1.0
// ============================================================


// ------------------------------------------------------------
// Go to Next Section
// ------------------------------------------------------------

function nextSection() {

    if (appState.currentSection < activeSectionOrder().length - 1) {

        appState.currentSection++;

        renderCurrentSection();

        // Reaching Summary already clears the saved run (see
        // renderSummary()) — re-saving here would immediately undo that.
        if (currentSectionName() !== "summary") {

            saveResumeState();

        }

    }

}


// ------------------------------------------------------------
// Go to Previous Section
// ------------------------------------------------------------

function previousSection() {

    if (appState.currentSection > 0) {

        appState.currentSection--;

        renderCurrentSection();

        saveResumeState();

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
        activeSectionOrder().length - 1;

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


// ------------------------------------------------------------
// Keyboard Navigation
//
// Also drives physical slide-changer remotes: most send either the
// Left/Right arrow keys or Page Up/Page Down (which model does which
// varies by brand), so both pairs are treated as equivalent here —
// whichever one a given clicker actually emits, Next/Previous still
// works. preventDefault() is only called once we're actually about to
// substitute a click for the key — screens with no Next/Previous
// button (Sequence, Admin) keep the browser's native Page Up/Down
// scrolling untouched, since nothing here is replacing it there.
// ------------------------------------------------------------

const NEXT_KEYS = ["ArrowRight", "PageDown"];

const PREVIOUS_KEYS = ["ArrowLeft", "PageUp"];

document.addEventListener("keydown", function (event) {

    if (appState.currentView === "home")
        return;

    if (examPaused)
        return;

    if (NEXT_KEYS.indexOf(event.key) !== -1) {

        // Reserve screen has no nextButton — allow manual
        // advance to Summary before the timer runs out.

        if (typeof reserveMode !== "undefined" && reserveMode) {

            event.preventDefault();

            finishSpotter();

            return;

        }

        const btn = document.getElementById("nextButton");

        if (btn) {

            event.preventDefault();

            btn.click();

        }

    }

    if (PREVIOUS_KEYS.indexOf(event.key) !== -1) {

        const btn = document.getElementById("previousButton");

        if (btn) {

            event.preventDefault();

            btn.click();

        }

    }

});

































