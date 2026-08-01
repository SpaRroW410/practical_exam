// ============================================================
// Community Medicine Examination System
// Home Screen
// Version 1.0
// ============================================================

function renderHome() {

    renderPage(`

        <section class="home-screen">

            <div class="home-card">

                <h2>Setup Examination</h2>

                <p>Select one question from each section.</p>

                <div class="selector">

                    <label>Examination Level</label>

                    <select id="examLevel">
                        <option value="UG">Undergraduate</option>
                        <option value="PG">Postgraduate</option>
                    </select>

                </div>

                <div class="selector">

                    <label>Clinical Case</label>

                    <select id="clinical"></select>

                </div>

                <div class="selector">

                    <label>Epidemiology</label>

                    <select id="epidemiology"></select>

                </div>

                <div class="selector">

                    <label>Biostatistics</label>

                    <select id="biostatistics"></select>

                </div>

                <div class="selector">

                    <label>OSPE</label>

                    <select id="ospe"></select>

                </div>

                <div class="selector">

                    <label>Spotter Set</label>

                    <select id="spotter"></select>

                </div>

                <button
                    id="startExam"
                    class="start-button">

                    START EXAM

                </button>

            </div>

        </section>

    `);

    populateQuestionDropdowns();

    document
        .getElementById("startExam")
        .addEventListener("click", startExam);

    document
        .getElementById("examLevel")
        .addEventListener("change", function(){

            appState.examLevel = this.value;

            populateQuestionDropdowns();

        });

}

// ------------------------------------------------------------
// Sections with per-question UG/PG filtering.
// Spotter keeps its own separate UG/PG mechanism
// (settings.UG_Spotter_Slides / PG_Spotter_Slides).
// ------------------------------------------------------------

const FILTERED_SECTIONS = [

    "clinical",

    "epidemiology",

    "biostatistics",

    "ospe"

];

function getEligibleQuestions(section) {

    return appData.questions[section].filter(

        q =>

            q.Item_Type === "Question" &&

            (!isUG() || q.Difficulty !== "Difficult")

    );

}

function populateQuestionDropdowns() {

    FILTERED_SECTIONS.forEach(function(section){

        const select =
            document.getElementById(section);

        if(!select) return;

        select.innerHTML = "";

        getEligibleQuestions(section).forEach(function(question){

            const option =
                document.createElement("option");

            option.value = question.Question_No;

            option.textContent = question.Question_No;

            select.appendChild(option);

        });

    });

    const spotterSelect =
        document.getElementById("spotter");

    if(spotterSelect){

        spotterSelect.innerHTML = "";

        const total =
            appData.questions.spotter.length;

        for(let i=1;i<=total;i++){

            const option =
                document.createElement("option");

            option.value = i;

            option.textContent = i;

            spotterSelect.appendChild(option);

        }

    }

}