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

                <div class="selector-grid">

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

                </div>

                <div class="home-actions">

                    <button
                        id="randomSet"
                        class="start-button">

                        RANDOM SET

                    </button>

                    <button
                        id="startExam"
                        class="start-button">

                        START EXAM

                    </button>

                </div>

            </div>

        </section>

    `);

    populateQuestionDropdowns();

    document
        .getElementById("randomSet")
        .addEventListener("click", randomizeSelections);

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

// ------------------------------------------------------------
// Spotter sets are filtered by the SET's header Difficulty
// (not per individual spotter slide).
// ------------------------------------------------------------

function getEligibleSpotterSetNumbers() {

    return appData.questions.spotter

        .filter(x => x.Item_Type === "Section_Header")

        .filter(h => !isUG() || h.Difficulty !== "Difficult")

        .map(h => Number(String(h.Set_No).replace(/[^\d]/g, "")))

        .sort((a, b) => a - b);

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

        getEligibleSpotterSetNumbers().forEach(function(setNo){

            const option =
                document.createElement("option");

            option.value = setNo;

            option.textContent = setNo;

            spotterSelect.appendChild(option);

        });

    }

}

// ------------------------------------------------------------
// Random Set
// Picks a random valid option in every dropdown except
// Examination Level, which stays a manual choice.
// ------------------------------------------------------------

function randomizeSelections() {

    FILTERED_SECTIONS.forEach(function(section){

        const select =
            document.getElementById(section);

        if(!select || select.options.length === 0)
            return;

        select.selectedIndex =
            Math.floor(Math.random() * select.options.length);

    });

    const spotterSelect =
        document.getElementById("spotter");

    if(spotterSelect && spotterSelect.options.length > 0){

        spotterSelect.selectedIndex =
            Math.floor(Math.random() * spotterSelect.options.length);

    }

}