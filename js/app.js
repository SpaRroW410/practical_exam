// ============================================================
// Community Medicine Examination System
// Main Application
// Version 1.0
// ============================================================


// ------------------------------------------------------------
// Application Startup
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", initializeApplication);


// ------------------------------------------------------------
// Initialize
// ------------------------------------------------------------

async function initializeApplication() {

    try {

        // Load JSON files
        await loadApplicationData();

        // Render Access Screen (gates entry to Home Screen)
        renderPasswordScreen();

        console.log("Application Ready");

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}


// ------------------------------------------------------------
// Read the Selection Screen Into State
//
// Shared by START EXAM and the selection screen's print buttons, so
// a printed paper always matches what starting the exam would give.
// ------------------------------------------------------------

function applySelectionToState(){

    appState.examLevel =
        document.getElementById("examLevel").value;

    appState.exam.clinical =
        Number(document.getElementById("clinical").value);

    appState.exam.epidemiology =
        Number(document.getElementById("epidemiology").value);

    appState.exam.biostatistics =
        Number(document.getElementById("biostatistics").value);

    appState.exam.ospe =
        Number(document.getElementById("ospe").value);

    const spotterChoice =
        document.getElementById("spotter").value;

    appState.exam.spotter =
        spotterChoice === "random"
            ? "random"
            : Number(spotterChoice);

    // Built once, here, so the header, slides, print output and summary
    // all show the same set and navigating back never reshuffles it.
    appState.randomSpotterSlides =
        spotterChoice === "random"
            ? buildRandomSpotterSet()
            : null;

}


// ------------------------------------------------------------
// Start Examination
// ------------------------------------------------------------

function startExam(){

    applySelectionToState();


    // -----------------------------
    // Reset Navigation
    // -----------------------------

    appState.currentSection = 0;


    // -----------------------------
    // Reset Timers
    // -----------------------------

    appState.timer.overall = 0;

    appState.timer.section = 0;

    appState.timer.running = false;


    // -----------------------------
    // Start Overall Timer
    // -----------------------------

    startOverallTimer();


    // -----------------------------
    // Display First Section
    // -----------------------------

    renderCurrentSection();

}


// ------------------------------------------------------------
// Render Current Section
// ------------------------------------------------------------

function renderCurrentSection(){

    switch(currentSectionName()){

        case "clinical":

            renderClinical();

            break;

        case "epidemiology":

            renderEpidemiology();

            break;

        case "biostatistics":

            renderBiostatistics();

            break;

        case "ospe":

            renderOSPE();

            break;

        case "spotter":

            renderSpotter();

            break;

        case "summary":

            renderSummary();

            break;

    }

}