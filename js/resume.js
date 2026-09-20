// ============================================================
// Community Medicine Examination System
// Crash / Resume Recovery
// Version 1.0
//
// If the tab reloads mid-exam (crash, accidental refresh, power loss),
// a small snapshot in localStorage lets the coordinator resume roughly
// where they left off instead of restarting from section 1. Follows
// the same localStorage pattern as js/usage-log.js — single key,
// try/catch around JSON.parse, removeItem for "nothing saved".
//
// Deliberately single-run/single-machine: unlike the exclusion log,
// this is never seeded or merged, just overwritten by the latest
// snapshot and cleared whenever the run genuinely ends.
// ============================================================


const EXAM_RESUME_KEY = "cme_exam_resume";


// ------------------------------------------------------------
// Save / Load / Clear
// ------------------------------------------------------------

// Spotter's own position (currentSpotterIndex/reserveMode, js/views/
// spotter.js) lives outside appState entirely — only meaningful, and
// only read here, while Spotter is the current section.
function saveResumeState() {

    const onSpotter = currentSectionName() === "spotter";

    const snapshot = {

        currentSection: appState.currentSection,

        examLevel: appState.examLevel,

        exam: appState.exam,

        randomSpotterSlides: appState.randomSpotterSlides,

        sectionSequence: appState.sectionSequence,

        timerOverall: appState.timer.overall,

        spotterIndex: onSpotter ? currentSpotterIndex : null,

        spotterReserve: onSpotter ? reserveMode : false

    };

    localStorage.setItem(EXAM_RESUME_KEY, JSON.stringify(snapshot));

}

function loadResumeState() {

    const raw = localStorage.getItem(EXAM_RESUME_KEY);

    if (!raw) return null;

    try {

        return JSON.parse(raw);

    }

    catch (error) {

        console.error("Corrupt resume state, discarding.", error);

        return null;

    }

}

function clearResumeState() {

    localStorage.removeItem(EXAM_RESUME_KEY);

}


// ------------------------------------------------------------
// Resume Prompt — shown after a correct access code when a saved
// run exists (see js/password.js's attemptAccess()).
// ------------------------------------------------------------

function renderResumePrompt(saved) {

    appState.currentView = "resumePrompt";

    const included =
        (saved.sectionSequence ||
            SECTION_ORDER.slice(0, -1).filter(key => saved.exam[key] !== null))
        .concat(["summary"]);

    const sectionKey = included[saved.currentSection];

    const sectionLabel = SECTION_NAMES[sectionKey] || "the exam";

    renderPage(`

        <section class="home-screen">

            <div class="home-card">

                <h2>Resume Interrupted Exam?</h2>

                <p>
                    An exam appears to have been interrupted at
                    <strong>${sectionLabel}</strong>
                    (${saved.examLevel === "PG" ? "Postgraduate" : "Undergraduate"}).
                </p>

                <div class="home-actions">

                    <button
                        id="resumeExamBtn"
                        class="start-button">

                        RESUME EXAM

                    </button>

                    <button
                        id="startFreshBtn"
                        class="start-button print-button">

                        START FRESH

                    </button>

                </div>

            </div>

        </section>

    `);

    document
        .getElementById("resumeExamBtn")
        .onclick = function(){

            resumeExamRun(saved);

        };

    document
        .getElementById("startFreshBtn")
        .onclick = function(){

            clearResumeState();

            renderHome();

        };

}


// ------------------------------------------------------------
// Resume Exam Run
// ------------------------------------------------------------

function resumeExamRun(saved) {

    appState.currentSection = saved.currentSection;

    appState.examLevel = saved.examLevel;

    appState.exam = saved.exam;

    appState.randomSpotterSlides = saved.randomSpotterSlides;

    appState.sectionSequence = saved.sectionSequence;

    appState.timer.overall = saved.timerOverall || 0;

    appState.timer.section = 0;

    appState.timer.running = false;

    resumeExamTimers();

    // Written sections resume to their Header screen (the normal
    // renderCurrentSection() entry point) — only Spotter's exact
    // slide/reserve position needs restoring here, since losing
    // progress there means re-sitting several already-timed stations,
    // not just one extra click.
    if (currentSectionName() === "spotter" && saved.spotterIndex !== null) {

        currentSpotterIndex = saved.spotterIndex;

        reserveMode = saved.spotterReserve;

        skipSpotterHeaderOnResume = true;

    }

    // Paint the restored value immediately — startOverallTimer()'s own
    // first tick is up to 1s away, which would otherwise leave the
    // header showing a stale "00:00" until then.
    updateOverallTimer(formatTime(appState.timer.overall));

    startOverallTimer();

    renderCurrentSection();

}
