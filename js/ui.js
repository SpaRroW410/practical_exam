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
// Display Marks (UG sees A+B only, redistributed to the full
// section total; PG sees the curated A/B/C split)
// ------------------------------------------------------------

function getDisplayMarks(question) {

    if (isPG()) {

        return {
            A: question.Marks_A,
            B: question.Marks_B,
            C: question.Marks_C
        };

    }

    const half = question.Total_Marks / 2;

    return {
        A: half,
        B: half,
        C: null
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
// .exam-screen, but Spotter passes its left column so that column's own
// bounds drive the fit rather than the whole screen's.
// ------------------------------------------------------------

const MIN_TEXT_SIZE = 24;

function fitQuestionLayout(imageWrap, measureContainer) {

    const examScreen =
        measureContainer || document.querySelector(".exam-screen");

    if (!examScreen) return;

    const targets = examScreen.querySelectorAll(

        ".scenario, .question, .plot-instruction"

    );

    if (targets.length === 0) return;

    const maxSize = imageWrap ? 24 : 44;

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