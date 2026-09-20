// ============================================================
// Community Medicine Examination System
// UI Helper Functions
// Version 1.0
// ============================================================


// ------------------------------------------------------------
// Main Container
// ------------------------------------------------------------

function getAppContainer() {

    return document.getElementById("app-content");

}


// ------------------------------------------------------------
// Replace Main Content
// ------------------------------------------------------------

function renderPage(html) {

    const container = getAppContainer();

    container.innerHTML = html;

    container.scrollTop = 0;

    // Default to branding; exam views re-assert exam mode immediately
    // after, so a home-type screen can never inherit a stale exam bar.
    setBrandHeader();

    updateExamExitWidget();

    // Any screen change (including navigating away entirely) clears a
    // black screen left on from the previous section — it's a purely
    // visual, per-screen toggle (js/navigation.js's "b" handler), not
    // state that should follow the candidate into Home/Summary/Admin.
    hideBlackoutOverlay();

}


// ------------------------------------------------------------
// Black Screen (toggled by pressing "b" during an exam section —
// see js/navigation.js's keydown listener)
// ------------------------------------------------------------

function hideBlackoutOverlay() {

    const overlay = document.getElementById("examBlackoutOverlay");

    if (overlay) overlay.style.display = "none";

}

function isBlackoutVisible() {

    const overlay = document.getElementById("examBlackoutOverlay");

    return Boolean(overlay) && overlay.style.display === "flex";

}

function showBlackoutOverlay() {

    const overlay = document.getElementById("examBlackoutOverlay");

    if (overlay) overlay.style.display = "flex";

}

// Pressing "b" both blacks the screen AND pauses (js/navigation.js's
// keydown listener) — a black screen with the exam clock still
// silently running behind it would be a worse trap than either
// control alone. Driven by the overlay's own current visibility
// (not examPaused) so it still does the right thing if the two were
// ever pried apart by the separate PAUSE button — e.g. paused via the
// button, then "b" pressed: syncs the screen to black rather than
// fighting the button's pause.
function toggleBlackoutAndPause() {

    if (isBlackoutVisible()) {

        hideBlackoutOverlay();

        resumeExam();

    }

    else {

        showBlackoutOverlay();

        pauseExam();

    }

}


// ------------------------------------------------------------
// Exam Exit / Home Widgets
//
// Two fixed, always-in-DOM controls (index.html) shown only while one
// of the five exam sections is on screen. Home (bottom-left) returns
// to the question-selection screen, abandoning the current picks —
// Previous/arrow-key navigation already covers stepping back through
// sections one at a time, so this is for choosing different questions
// entirely. Exit (bottom-right) ends the session outright: it tries
// window.close(), falling back to the Access screen (re-locking the
// app behind the access code) if the browser won't allow a script-
// driven close on this tab. Both use the same checkbox-gates-button
// two-step confirmation rather than a native confirm() dialog, since
// either can be reached mid-timer during a live exam, and both re-arm
// to unchecked/disabled on every screen change so a stray tick never
// carries over to a different screen.
// ------------------------------------------------------------

const EXAM_SECTION_VIEWS = [

    "clinical",

    "epidemiology",

    "biostatistics",

    "ospe",

    "spotter"

];

function armExamWidget(widgetId, checkboxId, buttonId) {

    const widget = document.getElementById(widgetId);

    if (!widget) return;

    widget.style.display =
        EXAM_SECTION_VIEWS.indexOf(appState.currentView) !== -1 ? "flex" : "none";

    const checkbox = document.getElementById(checkboxId);

    const button = document.getElementById(buttonId);

    if (checkbox) checkbox.checked = false;

    if (button) button.disabled = true;

}

function updateExamExitWidget() {

    armExamWidget("examExitWidget", "examExitConfirm", "examExitBtn");

    armExamWidget("examHomeWidget", "examHomeConfirm", "examHomeBtn");

    armPauseWidget();

}

// A plain single-click toggle rather than armExamWidget()'s checkbox
// pattern — pausing is reversible/non-destructive, unlike Exit/Home.
// Every render (i.e. every section change, which can't happen while
// actually paused since navigation is blocked) resets it to "not
// paused" as a safety net, same spirit as resetSectionTimerLatches().
function armPauseWidget() {

    const btn = document.getElementById("examPauseBtn");

    if (!btn) return;

    btn.style.display =
        EXAM_SECTION_VIEWS.indexOf(appState.currentView) !== -1 ? "inline-block" : "none";

    resumeExamTimers();

    btn.textContent = "PAUSE";

}

// Each written section latches "timer already started" in its own
// module-level variable and never clears it itself except when moving
// on to the next section — exiting or going Home mid-exam can leave
// one of these stuck true, which would silently stop that section's
// timer from starting (it would just resume instead) on the run that
// follows. Shared by both widgets below.
function resetSectionTimerLatches() {

    clinicalTimerStarted = false;

    epidemiologyTimerStarted = false;

    biostatisticsTimerStarted = false;

    ospeTimerStarted = false;

    spotterTimerStarted = false;

}

document.addEventListener("DOMContentLoaded", function(){

    const exitCheckbox = document.getElementById("examExitConfirm");

    const exitButton = document.getElementById("examExitBtn");

    if (exitCheckbox && exitButton) {

        exitCheckbox.addEventListener("change", function(){

            exitButton.disabled = !exitCheckbox.checked;

        });

        exitButton.addEventListener("click", function(){

            if (!exitCheckbox.checked) return;

            resetTimers();

            resetSectionTimerLatches();

            clearResumeState();

            resumeExamTimers();

            window.close();

            // Browsers only allow script-driven window.close() on a
            // tab/window that was itself opened by script; for a
            // normally-navigated tab it's silently ignored, so fall
            // back to the Access screen instead of a dead-end message —
            // that re-locks the app behind the access code for whoever
            // uses it next, rather than leaving the exam-in-progress
            // screen sitting open.
            setTimeout(function(){

                renderPasswordScreen();

            }, 200);

        });

    }

    const homeCheckbox = document.getElementById("examHomeConfirm");

    const homeButton = document.getElementById("examHomeBtn");

    if (homeCheckbox && homeButton) {

        homeCheckbox.addEventListener("change", function(){

            homeButton.disabled = !homeCheckbox.checked;

        });

        homeButton.addEventListener("click", function(){

            if (!homeCheckbox.checked) return;

            resetTimers();

            resetSectionTimerLatches();

            clearResumeState();

            resumeExamTimers();

            renderHome();

        });

    }

    // ----------------------------------------------------------
    // Pause / Resume
    //
    // pauseExam()/resumeExam() (below) do the actual work and are
    // shared with js/navigation.js's "b" handler (toggleBlackoutAndPause()
    // in this file), so pausing via the button and pausing via a black
    // screen stay in sync rather than fighting each other.
    // ----------------------------------------------------------

    const pauseButton = document.getElementById("examPauseBtn");

    if (pauseButton) {

        pauseButton.addEventListener("click", function(){

            if (!examPaused) pauseExam();

            else resumeExam();

        });

    }

});


// Freezes both timers (examPaused, js/timer.js) and blocks Previous/
// Next — both the on-screen buttons (native `disabled` suppresses even
// a programmatic .click()) and, as a second line of defense covering
// paths that don't go through those buttons (e.g. Spotter's Reserve-
// screen auto-advance), the keyboard shortcuts (js/navigation.js's
// keydown listener checks examPaused directly). Each button's disabled
// state is restored on resume rather than force-enabled, since
// Previous/Next aren't always both enabled to begin with
// (isFirstSection(), Spotter's image-preload gate, etc). Guarded by
// examPaused itself so calling either twice in a row (e.g. the button
// AND "b" both used) can't clobber the remembered disabled state with
// the already-paused values.

let pausedPreviousDisabled = false;

let pausedNextDisabled = false;

function pauseExam() {

    if (examPaused) return;

    pauseExamTimers();

    const previousButton = document.getElementById("previousButton");

    const nextButton = document.getElementById("nextButton");

    if (previousButton) {

        pausedPreviousDisabled = previousButton.disabled;

        previousButton.disabled = true;

    }

    if (nextButton) {

        pausedNextDisabled = nextButton.disabled;

        nextButton.disabled = true;

    }

    const pauseButton = document.getElementById("examPauseBtn");

    if (pauseButton) pauseButton.textContent = "RESUME";

}

function resumeExam() {

    if (!examPaused) return;

    resumeExamTimers();

    const previousButton = document.getElementById("previousButton");

    const nextButton = document.getElementById("nextButton");

    if (previousButton) previousButton.disabled = pausedPreviousDisabled;

    if (nextButton) nextButton.disabled = pausedNextDisabled;

    const pauseButton = document.getElementById("examPauseBtn");

    if (pauseButton) pauseButton.textContent = "PAUSE";

    // Safety net: resuming (by any path) never leaves the screen
    // black while the exam is actually running again.
    hideBlackoutOverlay();

}


// ------------------------------------------------------------
// Update Overall Timer
// ------------------------------------------------------------

function updateOverallTimer(text) {

    const timer = document.getElementById("overallTimer");

    if (timer) {

        timer.textContent = text;

    }

}


// ------------------------------------------------------------
// Update Section Timer
// ------------------------------------------------------------

function updateSectionTimer(text) {

    const timer = document.getElementById("sectionTimer");

    if (timer) {

        timer.textContent = text;

    }

}


// ------------------------------------------------------------
// Show Error
// ------------------------------------------------------------

function showError(message) {

    renderPage(`

        <section class="home-screen">

            <div class="home-card">

                <h2>Error</h2>

                <p>${message}</p>

            </div>

        </section>

    `);

}


// ------------------------------------------------------------
// Newlines To Line Breaks
//
// Alt+Enter in the Excel question bank survives into questions.json as
// \r\n, but HTML collapses whitespace — so numbered sub-parts would run
// together into one sentence without this.
// ------------------------------------------------------------

function nl2br(text) {

    if (text === null || text === undefined) return "";

    return String(text).replace(/\r\n|\r|\n/g, "<br>");

}


// ------------------------------------------------------------
// Header Modes
//
// One bar for the whole app: branding on the home/access/summary
// screens, section title + timers during the exam. The timer elements
// live permanently in #app-header rather than being re-created on every
// render, so their values survive screen changes.
// ------------------------------------------------------------

function setExamHeader(title) {

    const header = document.getElementById("app-header");

    if (header) {

        header.classList.add("exam-mode");

    }

    const examTitle = document.getElementById("examTitle");

    if (examTitle) {

        examTitle.textContent = title || "";

    }

}

function setBrandHeader() {

    const header = document.getElementById("app-header");

    if (header) {

        header.classList.remove("exam-mode");

    }

    const examTitle = document.getElementById("examTitle");

    if (examTitle) {

        examTitle.textContent = "";

    }

}


// ------------------------------------------------------------
// Display Marks (UG sees A+B only, redistributed to whatever's left
// after the Plot's own marks; PG sees the curated A/B/C split, plus
// the same Plot marks). Marks_Plot only exists on Biostatistics rows
// (every other section's question.Marks_Plot is undefined, so
// plotMarks is 0 there and this behaves exactly as before).
// ------------------------------------------------------------

// isPGOverride lets a caller ask "what would PG/UG see" independently
// of the real running exam's level (js/views/admin-preview.js's
// Display Testing and js/views/admin-rebuild.js's live preview both
// have their own, unrelated level pickers) — omitted, it falls back
// to the real isPG(), unchanged for every other call site.
function getDisplayMarks(question, isPGOverride) {

    const pg = isPGOverride !== undefined ? isPGOverride : isPG();

    const plotMarks = question.Marks_Plot || 0;

    if (pg) {

        return {
            A: question.Marks_A,
            B: question.Marks_B,
            C: question.Marks_C,
            Plot: question.Marks_Plot ?? null
        };

    }

    // UG: use the curated override when present (set via Admin >
    // Rebuild Data); fall back to the historical even-split of
    // (Total_Marks - Plot) for any row not yet migrated/curated.
    if (question.Marks_A_UG != null && question.Marks_B_UG != null) {

        return {
            A: question.Marks_A_UG,
            B: question.Marks_B_UG,
            C: null,
            Plot: plotMarks || null
        };

    }

    const half = (question.Total_Marks - plotMarks) / 2;

    return {
        A: half,
        B: half,
        C: null,
        Plot: question.Marks_Plot ?? null
    };

}


// ------------------------------------------------------------
// Section Info (time + total marks), computed live instead of
// a static placeholder string
// ------------------------------------------------------------

const SECTION_TIME_SETTING = {

    clinical: "Clinical_Time_Min",

    epidemiology: "Epidemiology_Time_Min",

    biostatistics: "Biostatistics_Time_Min",

    ospe: "OSPE_Time_Min"

};

// ------------------------------------------------------------
// Info Tiles — one big, room-readable number per stat.
// The same rule lays out 2 tiles (section headers) and 5 (Spotter).
// ------------------------------------------------------------

function renderInfoTiles(tiles) {

    return `

        <div class="info-tiles">

            ${tiles.map(function(tile){

                return `

                    <div class="info-tile">

                        <div class="info-label">${tile.label}</div>

                        <div class="info-value">${tile.value}</div>

                        <div class="info-unit">${tile.unit || ""}</div>

                    </div>

                `;

            }).join("")}

        </div>

    `;

}


// ------------------------------------------------------------
// Instruction Callout
// ------------------------------------------------------------

function renderInstructionNote(text) {

    return `

        <div class="instruction-note">

            <div class="instruction-note-title">Instructions</div>

            <div class="instruction-note-body">${text}</div>

        </div>

    `;

}


function renderSectionInfo(section, header) {

    const timeMin =
        appData.settings[SECTION_TIME_SETTING[section]];

    // Sourced from the question bank so instructions stay editable in
    // the Excel file; the callout supplies its own heading, so a
    // leading "Instructions:" in the data would read twice.
    const instruction =

        String(header.Scenario_or_Stem || "")

            .replace(/^\s*Instructions?\s*:\s*/i, "")

            .trim()

        || "Answer all sub-questions carefully.";

    return renderInfoTiles([

        { label: "Time",        value: timeMin,            unit: "Minutes" },

        { label: "Total Marks", value: header.Total_Marks, unit: "Marks"   }

    ]) + renderInstructionNote(instruction);

}


// ------------------------------------------------------------
// Fit Image To Remaining Space
//
// Measures the real rendered height of every OTHER direct child of
// `container`, then sets `imageWrap`'s height to whatever's left —
// deterministic, unlike leaving it to flex-grow/shrink distribution
// (which breaks silently whenever the surrounding markup changes shape).
// ------------------------------------------------------------

function fitImageToRemainingSpace(container, imageWrap) {

    if (!container || !imageWrap) return;

    let siblingsHeight = 0;

    Array.from(container.children).forEach(function(child){

        if (child !== imageWrap) {

            const childStyle = getComputedStyle(child);

            siblingsHeight +=

                child.getBoundingClientRect().height +

                (parseFloat(childStyle.marginTop) || 0) +

                (parseFloat(childStyle.marginBottom) || 0);

        }

    });

    const gap =
        parseFloat(getComputedStyle(container).rowGap) || 0;

    const gapTotal =
        gap * (container.children.length - 1);

    const available =
        container.clientHeight - siblingsHeight - gapTotal;

    imageWrap.style.flex = "0 0 auto";

    imageWrap.style.height = Math.max(60, available) + "px";

}


// ------------------------------------------------------------
// Fit Question Layout
//
// .scenario/.question/.plot-instruction otherwise sit at a fixed size
// regardless of how much (or little) room is left on screen.
//
// `imageWrap` is passed only when the image is STACKED above/below the
// text and so competes with it for the same vertical space: text is
// sized first (binary-searched in [MIN_TEXT_SIZE,24] with the image held
// at its floor), then the image takes what's actually left. Sizing them
// independently left cases where text alone already didn't fit, so the
// image got crushed to its floor and the page still overflowed.
//
// Pass no imageWrap when the image sits in its own column (Spotter's
// 50/50) — there the grid gives the image a definite height and text
// growing does not shrink it, so text is simply grown up to 44px.
//
// `measureContainer` is the box the text must fit inside; it defaults to
// .exam-screen. Figure-bearing questions call this twice with the two
// bands of their 65:35 split, so the sub-questions size themselves
// independently of the scenario instead of sharing one size; Spotter
// passes its left column.
//
// `maxOverride` raises or lowers the ceiling for a given band.
// ------------------------------------------------------------

const MIN_TEXT_SIZE = 24;

function fitQuestionLayout(imageWrap, measureContainer, maxOverride) {

    const examScreen =
        measureContainer || document.querySelector(".exam-screen");

    if (!examScreen) return;

    // .plot-instruction is intentionally excluded here: it holds a fixed
    // size of its own (css/theme.css) rather than sharing the dynamic
    // scenario/question size. It still counts toward examScreen's real
    // rendered height below, so the binary search still accounts for the
    // space it actually takes.
    //
    // .scenario-emphasized (Epidemiology/Biostatistics/OSPE's bolder,
    // larger image-question scenario) IS included: when it's the sole
    // target of the top image band's own independent fit call, this is
    // what lets it shrink below its default 29px on a long scenario
    // that would otherwise overflow the band — the safety net every
    // other target already has. It never shares a container with
    // .question, so this can't re-couple it to sub-question sizing.
    const targets = examScreen.querySelectorAll(

        ".scenario, .question"

    );

    if (targets.length === 0) return;

    // No-image questions have no competing image to share space with, so
    // their ceiling is deliberately much higher than the 44px used
    // everywhere else — on a small screen the fits() check still caps
    // them back down safely, but on a large display (e.g. a projector)
    // they now actually grow to fill it instead of stopping at a
    // laptop-sized ceiling with empty space left over.
    const maxSize =
        maxOverride || (imageWrap ? 24 : 72);

    function fits(size) {

        targets.forEach(function(el){

            el.style.fontSize = size + "px";

        });

        if (imageWrap) {

            imageWrap.style.flex = "0 0 auto";

            imageWrap.style.height = "60px";

        }

        return examScreen.scrollHeight <= examScreen.clientHeight;

    }

    let best = MIN_TEXT_SIZE;

    if (fits(MIN_TEXT_SIZE)) {

        let lo = MIN_TEXT_SIZE;

        let hi = maxSize;

        for (let i = 0; i < 6 && lo <= hi; i++) {

            const mid = Math.round((lo + hi) / 2);

            if (fits(mid)) {

                best = mid;

                lo = mid + 1;

            }

            else {

                hi = mid - 1;

            }

        }

    }

    fits(best);

    if (imageWrap) {

        fitImageToRemainingSpace(imageWrap.parentElement, imageWrap);

    }

}


// ------------------------------------------------------------
// Two-Band Question Layout
//
// With a figure, the screen is split 70:30 (css/theme.css) — image +
// scenario on top, sub-questions below — and each band is sized
// independently so the sub-questions grow to fill their share instead
// of being squeezed to the same size as the scenario.
//
// A handful of real sub-questions pack several numbered parts into one
// column and still don't fit their 30% share even at the MIN_TEXT_SIZE
// floor (e.g. OSPE Station 11's 3-part Sub_Question_A). Rather than let
// that overflow the screen, the loop below hands the sub-questions band
// more room, one step at a time, and re-fits both bands, until it
// actually fits — capped at 40:60 so this only ever bites for a genuine
// outlier; the vast majority of questions never enter the loop and keep
// the normal 70:30 split.
//
// Without a figure the question flows as one band, as before.
// ------------------------------------------------------------

function fitTwoBandLayout(hasImage) {

    if (!hasImage) {

        fitQuestionLayout(null);

        return;

    }

    const topBand = document.querySelector(".question-top");

    const subBand = document.querySelector(".question-subquestions");

    topBand.style.flex = "";

    subBand.style.flex = "";

    function fitBothBands() {

        fitQuestionLayout(

            document.querySelector(".question-image"),

            topBand,

            36

        );

        fitQuestionLayout(

            null,

            subBand,

            44

        );

    }

    fitBothBands();

    let subShare = 3;

    while (

        subBand.scrollHeight > subBand.clientHeight + 2 &&

        subShare < 6

    ) {

        subShare += 1;

        topBand.style.flex = (10 - subShare) + " 1 0";

        subBand.style.flex = subShare + " 1 0";

        fitBothBands();

    }

}


// ------------------------------------------------------------
// Build Navigation
// ------------------------------------------------------------

function renderNavigationButtons(
    showPrevious = true,
    showNext = true
) {

    return `

        <div class="navigation">

            <button
                id="previousButton"
                ${showPrevious ? "" : "disabled"}>

                Previous

            </button>

            <button
                id="nextButton"
                ${showNext ? "" : "disabled"}>

                Next

            </button>

        </div>

    `;

}