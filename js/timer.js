// ============================================================
// Community Medicine Examination System
// Timer
// Version 1.1 (Frozen)
// ============================================================

let overallInterval = null;
let sectionInterval = null;

let beepPlayed = false;


// ------------------------------------------------------------
// Timer State
// ------------------------------------------------------------

let sectionRemaining = 0;

let sectionWarning = 0;

let sectionCallback = null;

let sectionPaused = false;


// ------------------------------------------------------------
// Format Time
// ------------------------------------------------------------

function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );

}


// ------------------------------------------------------------
// Overall Timer
// ------------------------------------------------------------

function startOverallTimer() {

    stopOverallTimer();

    overallInterval = setInterval(function () {

        appState.timer.overall++;

        updateOverallTimer(
            formatTime(appState.timer.overall)
        );

    }, 1000);

}


function stopOverallTimer() {

    if (overallInterval) {

        clearInterval(overallInterval);

        overallInterval = null;

    }

}


// ------------------------------------------------------------
// Section Timer
// ------------------------------------------------------------

function startSectionTimer(seconds, warningSeconds, onComplete = null) {

    stopSectionTimer();

    sectionRemaining = seconds;

    sectionWarning = warningSeconds;

    sectionCallback = onComplete;

    sectionPaused = false;

    beepPlayed = false;

    updateSectionTimer(
        formatTime(sectionRemaining)
    );

    sectionInterval = setInterval(runSectionTimer, 1000);

}


function runSectionTimer() {

    if (sectionPaused)
        return;

    sectionRemaining--;

    appState.timer.section = sectionRemaining;

    updateSectionTimer(
        formatTime(sectionRemaining)
    );

    // Warning

    if (sectionRemaining <= sectionWarning) {

        const timer =
            document.getElementById("sectionTimer");

        if (timer) {

            timer.classList.add("timer-warning");

        }

        if (!beepPlayed) {

            playBeep();

            beepPlayed = true;

        }

    }

    // Finished

    if (sectionRemaining <= 0) {

        stopSectionTimer();

        if (typeof sectionCallback === "function") {

            sectionCallback();

        }

    }

}


// ------------------------------------------------------------
// Pause
// ------------------------------------------------------------

function pauseSectionTimer() {

    sectionPaused = true;

}


// ------------------------------------------------------------
// Resume
// ------------------------------------------------------------

function resumeSectionTimer() {

    sectionPaused = false;

}


// ------------------------------------------------------------
// Stop
// ------------------------------------------------------------

function stopSectionTimer() {

    if (sectionInterval) {

        clearInterval(sectionInterval);

        sectionInterval = null;

    }

    sectionRemaining = 0;

    sectionPaused = false;

    beepPlayed = false;

}


// ------------------------------------------------------------
// Reset
// ------------------------------------------------------------

function resetTimers() {

    stopOverallTimer();

    stopSectionTimer();

    appState.timer.overall = 0;

    appState.timer.section = 0;

    updateOverallTimer("00:00");

    updateSectionTimer("");

}


// ------------------------------------------------------------
// Beep
// ------------------------------------------------------------

function playBeep() {

    try {

        const audio = new Audio("audio/beep.mp3");

        audio.play();

    }

    catch {

        console.log("Unable to play beep.");

    }

}