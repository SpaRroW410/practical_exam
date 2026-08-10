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
// Build Timer Header
// ------------------------------------------------------------

function renderTimerHeader(title = "") {

    const titleMarkup = title

        ? `<div class="exam-header-title">${title}</div>`

        : `<div class="exam-header-title exam-header-title--empty"></div>`;

    return `

        <div class="exam-header">

            ${titleMarkup}

            <div class="exam-header-timers">

                <div class="timer-box">

                    <div class="timer-label">

                        Overall Timer

                    </div>

                    <div
                        id="overallTimer"
                        class="timer-value">

                        ${formatTime(appState.timer.overall)}

                    </div>

                </div>

                <div class="timer-box">

                    <div class="timer-label">

                        Section Timer

                    </div>

                    <div
                        id="sectionTimer"
                        class="timer-value">

                        00:00

                    </div>

                </div>

            </div>

        </div>

    `;

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

function renderSectionInfo(section, header) {

    const timeMin =
        appData.settings[SECTION_TIME_SETTING[section]];

    return `

        Time: ${timeMin} Minutes<br>
        Total Marks: ${header.Total_Marks} Marks<br>
        Instructions: Answer all sub-questions carefully.

    `;

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

            siblingsHeight += child.getBoundingClientRect().height;

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
// Fit Question Text
//
// For questions with no image, .scenario/.question otherwise sit at a
// fixed size regardless of how much (or little) room is left on screen.
// Binary-searches for the largest font-size in [MIN,MAX] at which the
// text still fits .exam-screen without overflowing.
// ------------------------------------------------------------

function fitQuestionText(hasImage) {

    if (hasImage) return;

    const examScreen = document.querySelector(".exam-screen");

    if (!examScreen) return;

    const targets =
        examScreen.querySelectorAll(".scenario, .question");

    if (targets.length === 0) return;

    const MIN_SIZE = 18;

    const MAX_SIZE = 44;

    function fits(size) {

        targets.forEach(function(el){

            el.style.fontSize = size + "px";

        });

        return examScreen.scrollHeight <= examScreen.clientHeight;

    }

    if (!fits(MIN_SIZE)) return;

    let lo = MIN_SIZE;

    let hi = MAX_SIZE;

    let best = MIN_SIZE;

    for (let i = 0; i < 8; i++) {

        const mid = Math.round((lo + hi) / 2);

        if (fits(mid)) {

            best = mid;

            lo = mid + 1;

        }

        else {

            hi = mid - 1;

        }

    }

    fits(best);

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