// ============================================================
// Community Medicine Examination System
// Data Loader
// Version 1.0
// ============================================================


// ------------------------------------------------------------
// Load Application Data
// ------------------------------------------------------------

async function loadApplicationData() {

    try {

        // ----------------------------
        // Offline / pendrive path
        //
        // "Rebuild Data.html" can generate data/data-embedded.js, which
        // defines EMBEDDED_APP_DATA as a plain <script> global. When
        // present, use it directly — no fetch() at all, so the app
        // works from a bare file:// double-click with no server.
        //
        // The committed data/data-embedded.js is an inert placeholder
        // (defines nothing), so on a normal http(s) deployment this
        // branch is simply skipped and fetch() below runs exactly as
        // before.
        // ----------------------------

        if (typeof EMBEDDED_APP_DATA !== "undefined") {

            appData.questions = EMBEDDED_APP_DATA.questions;

            appData.settings = EMBEDDED_APP_DATA.settings;

            console.log("Application data loaded (embedded).");

            console.log(appData);

            return;

        }


        // ----------------------------
        // Questions
        // ----------------------------

        const questionsResponse = await fetch("data/questions.json");

        if (!questionsResponse.ok) {

            throw new Error("Unable to load questions.json");

        }

        appData.questions = await questionsResponse.json();


        // ----------------------------
        // Settings
        // ----------------------------

        const settingsResponse = await fetch("data/settings.json");

        if (!settingsResponse.ok) {

            throw new Error("Unable to load settings.json");

        }

        appData.settings = await settingsResponse.json();


        console.log("Application data loaded.");

        console.log(appData);

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to load application data.\n\n" +
            error.message
        );

    }

}


// ------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------

function getQuestions(section) {

    return appData.questions[section];

}


function getQuestion(section, number) {

    return appData.questions[section].find(

        q => Number(q.Question_No) === Number(number)

    );

}


function getSetting(name) {

    return appData.settings[name];

}

function getSetting(name) {
    return appData.settings[name];
}