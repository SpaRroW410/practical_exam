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
// Start Examination
// ------------------------------------------------------------

function startExam(){

    // -----------------------------
    // Examination Level
    // -----------------------------

    appState.examLevel =
        document.getElementById("examLevel").value;


    // -----------------------------
    // Selected Questions
    // -----------------------------

    appState.exam.clinical =
        Number(document.getElementById("clinical").value);

    appState.exam.epidemiology =
        Number(document.getElementById("epidemiology").value);

    appState.exam.biostatistics =
        Number(document.getElementById("biostatistics").value);

    appState.exam.ospe =
        Number(document.getElementById("ospe").value);

    appState.exam.spotter =
        Number(document.getElementById("spotter").value);


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