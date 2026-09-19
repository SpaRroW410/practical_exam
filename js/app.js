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

        // "Start Admin Mode.bat" opens index.html?mode=admin so it can
        // skip straight to Admin Access instead of the normal exam
        // Access Screen — otherwise gate entry to Home Screen as usual.
        const launchParams = new URLSearchParams(window.location.search);

        if (launchParams.get("mode") === "admin") {

            renderAdminLogin();

        }

        else {

            renderPasswordScreen();

        }

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

// A written section's dropdown offers "None" (see js/views/home.js's
// populateQuestionDropdowns()) to exclude that section from the run —
// same sentinel-value pattern as Spotter's "random" below, just null
// instead of a string, since these are otherwise plain question numbers.
function readSectionValue(id){

    const value = document.getElementById(id).value;

    return value === "none" ? null : Number(value);

}

function applySelectionToState(){

    appState.examLevel =
        document.getElementById("examLevel").value;

    appState.exam.clinical =
        readSectionValue("clinical");

    appState.exam.epidemiology =
        readSectionValue("epidemiology");

    appState.exam.biostatistics =
        readSectionValue("biostatistics");

    appState.exam.ospe =
        readSectionValue("ospe");

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
//
// Reads the Home screen's dropdowns (applySelectionToState) and hands
// off to the Sequence screen (js/views/sequence.js) rather than
// starting immediately, so the coordinator can reorder the 5 sections
// first. Split out as beginExamRun() because by the time the Sequence
// screen's BEGIN EXAM button fires, Home's own DOM (and so its
// dropdowns) no longer exists — applySelectionToState() must run here,
// while Home is still on screen, not be re-run later.
// ------------------------------------------------------------

function startExam(){

    applySelectionToState();

    if (includedSections().filter(section => section !== "spotter").length === 0) {

        alert("At least one section must be included to start the exam.");

        return;

    }

    renderSequenceSelection();

}


// ------------------------------------------------------------
// Begin Exam Run
//
// The actual start, once a sequence (default or custom) is confirmed.
// ------------------------------------------------------------

function beginExamRun(){


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

    saveResumeState();

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