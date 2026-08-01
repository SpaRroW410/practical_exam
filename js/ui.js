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

    getAppContainer().innerHTML = html;

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

function renderTimerHeader() {

    return `

        <div class="exam-header">

            <div class="timer-box">

                <div class="timer-label">

                    Overall Timer

                </div>

                <div
                    id="overallTimer"
                    class="timer-value">

                    00:00

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