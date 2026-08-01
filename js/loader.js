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