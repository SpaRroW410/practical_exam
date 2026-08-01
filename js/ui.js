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