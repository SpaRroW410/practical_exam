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
                            <option value="UG" ${appState.examLevel === "UG" ? "selected" : ""}>Undergraduate</option>
                            <option value="PG" ${appState.examLevel === "PG" ? "selected" : ""}>Postgraduate</option>
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

                <div class="home-actions home-actions--print">

                    <button
                        id="printPaper"
                        class="start-button print-button">

                        PRINT QUESTION PAPER

                    </button>

                    <button
                        id="printPaperKey"
                        class="start-button print-button">

                        PRINT WITH ANSWER KEY

                    </button>

                </div>

                <div class="home-actions home-actions--print">

                    <button
                        id="addToExclusion"
                        class="start-button print-button">

                        ADD TO EXCLUSION

                    </button>

                    <button
                        id="refreshExclusion"
                        class="start-button print-button">

                        REFRESH EXCLUSION LIST

                    </button>

                </div>

                <div id="usedQuestionsTable"></div>

                <div class="home-actions home-actions--print">

                    <button
                        id="exportExclusion"
                        class="start-button print-button">

                        EXPORT LIST (JSON)

                    </button>

                    <button
                        id="importExclusionBtn"
                        class="start-button print-button">

                        IMPORT LIST (JSON)

                    </button>

                    <input
                        type="file"
                        id="importExclusionFile"
                        accept="application/json"
                        style="display:none;">

                </div>

            </div>

        </section>

    `);

    populateQuestionDropdowns();

    renderUsedQuestionsTable();

    document
        .getElementById("randomSet")
        .addEventListener("click", randomizeSelections);

    document
        .getElementById("startExam")
        .addEventListener("click", startExam);

    // Printing before the exam uses whatever is currently selected in
    // the dropdowns, so mirror those into appState first.
    document
        .getElementById("printPaper")
        .addEventListener("click", function(){

            applySelectionToState();

            printExamToPDF(false);

        });

    document
        .getElementById("printPaperKey")
        .addEventListener("click", function(){

            applySelectionToState();

            printExamToPDF(true);

        });

    document
        .getElementById("examLevel")
        .addEventListener("change", function(){

            appState.examLevel = this.value;

            populateQuestionDropdowns();

        });

    // --------------------------------------------------------
    // Exclusion List
    // --------------------------------------------------------

    document
        .getElementById("addToExclusion")
        .addEventListener("click", function(){

            applySelectionToState();

            markCurrentSelectionUsed();

            renderHome();

        });

    document
        .getElementById("refreshExclusion")
        .addEventListener("click", function(){

            if (!confirm("Clear the entire \"previously used\" exclusion list?")) {
                return;
            }

            clearUsedLog();

            renderHome();

        });

    document
        .getElementById("exportExclusion")
        .addEventListener("click", function(){

            downloadJSONFile("used_questions.json", exportUsedLogJSON());

        });

    document
        .getElementById("importExclusionBtn")
        .addEventListener("click", function(){

            document.getElementById("importExclusionFile").click();

        });

    document
        .getElementById("importExclusionFile")
        .addEventListener("change", function(event){

            const file = event.target.files[0];

            if (!file) return;

            const reader = new FileReader();

            reader.onload = function(){

                try {

                    const obj = JSON.parse(reader.result);

                    importUsedLogFromObject(obj);

                    renderHome();

                }

                catch (error) {

                    console.error(error);

                    alert("Could not read this file as a used-questions JSON export.\n\n" + error.message);

                }

            };

            reader.readAsText(file);

            event.target.value = "";

        });

}

// ------------------------------------------------------------
// "Previously Used" Table
// ------------------------------------------------------------

function renderUsedQuestionsTable() {

    const container = document.getElementById("usedQuestionsTable");

    if (!container) return;

    const log = loadUsedLog();

    function formatList(values) {

        return values.length
            ? values.slice().sort((a, b) => a - b).join(", ")
            : "None";

    }

    container.innerHTML = `

        <table class="used-questions-table">
            <tr><th>Section</th><th>Previously Used</th></tr>
            <tr><td>Clinical</td><td>${formatList(log.clinical)}</td></tr>
            <tr><td>Epidemiology</td><td>${formatList(log.epidemiology)}</td></tr>
            <tr><td>Biostatistics</td><td>${formatList(log.biostatistics)}</td></tr>
            <tr><td>OSPE</td><td>${formatList(log.ospe)}</td></tr>
            <tr><td>Spotter Sets</td><td>${formatList(log.spotterSets)}</td></tr>
        </table>

    `;

}

// ------------------------------------------------------------
// Small download helper (Blob + anchor-click, same pattern used by
// tools/rebuild.js's downloadFile() for the offline rebuild tool).
// ------------------------------------------------------------

function downloadJSONFile(filename, content) {

    const blob = new Blob([content], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = filename;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

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

        const randomOption =
            document.createElement("option");

        randomOption.value = "random";

        randomOption.textContent = "Random";

        spotterSelect.appendChild(randomOption);

        getEligibleSpotterSetNumbers().forEach(function(setNo){

            const option =
                document.createElement("option");

            option.value = setNo;

            option.textContent = setNo;

            spotterSelect.appendChild(option);

        });

        // "Random" is listed first for visibility, but a numbered set
        // stays the default so behaviour is unchanged unless it is
        // deliberately chosen.
        if (spotterSelect.options.length > 1) {

            spotterSelect.selectedIndex = 1;

        }

    }

}

// ------------------------------------------------------------
// Random Set
// Picks a random valid option in every dropdown except
// Examination Level, which stays a manual choice. Prefers options not
// already in the "previously used" exclusion log; if every option in a
// dropdown is already used, falls back to the full option list rather
// than getting stuck (same graceful-fallback pattern used elsewhere in
// this app for the domain-random Spotter draw).
// ------------------------------------------------------------

function randomIndexPool(length) {

    const pool = [];

    for (let i = 0; i < length; i++) pool.push(i);

    return pool;

}

function pickUnusedOrFallbackIndex(select, isUsedFn) {

    const eligible = [];

    for (let i = 0; i < select.options.length; i++) {

        if (!isUsedFn(select.options[i].value)) eligible.push(i);

    }

    const pool = eligible.length > 0 ? eligible : randomIndexPool(select.options.length);

    return pool[Math.floor(Math.random() * pool.length)];

}

function randomizeSelections() {

    FILTERED_SECTIONS.forEach(function(section){

        const select =
            document.getElementById(section);

        if(!select || select.options.length === 0)
            return;

        select.selectedIndex =
            pickUnusedOrFallbackIndex(select, value => isQuestionUsed(section, value));

    });

    const spotterSelect =
        document.getElementById("spotter");

    if(spotterSelect && spotterSelect.options.length > 0){

        // "random" is never considered used, so it always stays in the
        // eligible pool alongside any not-yet-used numbered sets.
        spotterSelect.selectedIndex =
            pickUnusedOrFallbackIndex(
                spotterSelect,
                value => value !== "random" && isSpotterSetUsed(value)
            );

    }

}