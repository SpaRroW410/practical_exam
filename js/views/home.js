// ============================================================
// Community Medicine Examination System
// Home Screen
// Version 1.0
// ============================================================

function renderHome() {

    // Every other screen sets appState.currentView itself; Home never
    // did, relying entirely on it happening to still hold config.js's
    // initial default ("home") from page load. That was never actually
    // exercised before now — nothing returned to Home mid-session until
    // the Exit widget (js/ui.js) did, which broke on it: the widget's
    // visibility check saw a stale currentView and never recognized
    // that Home was showing.
    appState.currentView = "home";

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

            // A second automatic download fired in the same click can be
            // throttled by the browser as a "multiple downloads" prompt —
            // a short delay avoids that.
            setTimeout(function(){

                downloadFile(
                    "used-questions-embedded.js",
                    buildEmbeddedUsedQuestionsJS(loadUsedLog()),
                    "application/javascript"
                );

            }, 300);

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

    // Spotter_ID values (e.g. "SP004-11") are strings, not numbers, so
    // they need a plain string sort rather than formatList()'s numeric one.
    function formatStringList(values) {

        return values.length
            ? values.slice().sort().join(", ")
            : "None";

    }

    // One check covers every reason the log could be empty — nothing
    // used yet, an auto-seed that found no file/unsupported fetch/ran
    // under file://, or a deliberate REFRESH EXCLUSION LIST clear —
    // without needing to track which one happened.
    const isEmpty =

        USAGE_LOG_SECTIONS.every(section => log[section].length === 0) &&

        log.spotterSets.length === 0 &&

        log.spotterSlides.length === 0;

    container.innerHTML = `

        <table class="used-questions-table">
            <tr><th>Section</th><th>Previously Used</th></tr>
            <tr><td>Clinical</td><td>${formatList(log.clinical)}</td></tr>
            <tr><td>Epidemiology</td><td>${formatList(log.epidemiology)}</td></tr>
            <tr><td>Biostatistics</td><td>${formatList(log.biostatistics)}</td></tr>
            <tr><td>OSPE</td><td>${formatList(log.ospe)}</td></tr>
            <tr><td>Spotter Sets</td><td>${formatList(log.spotterSets)}</td></tr>
            <tr><td>Spotter Slides</td><td>${formatStringList(log.spotterSlides)}</td></tr>
        </table>

        ${isEmpty ? `<p class="used-questions-empty-note">No exclusion data present.</p>` : ""}

    `;

}

// downloadFile() itself now lives in tools/rebuild.js, loaded app-wide
// for the Admin > Rebuild Data screen (js/views/admin-rebuild.js) — this
// just wraps it with the JSON mime type this file's callers want.
function downloadJSONFile(filename, content) {

    downloadFile(filename, content, "application/json");

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

// Already-used questions/sets are left out of these dropdowns entirely
// (not just deprioritized, as RANDOM SET already did) — importing or
// adding to the exclusion list previously updated the "Previously
// Used" table but never actually kept those questions off the
// selection dropdowns. If every eligible option in a section has
// already been used, falls back to showing all of them rather than
// leaving the dropdown empty — same graceful-fallback the RANDOM SET
// button already used, now shared via unusedOrFallback() below.
function unusedOrFallback(items, isUsedFn) {

    const unused = items.filter(item => !isUsedFn(item));

    return unused.length > 0 ? unused : items;

}

function populateQuestionDropdowns() {

    FILTERED_SECTIONS.forEach(function(section){

        const select =
            document.getElementById(section);

        if(!select) return;

        select.innerHTML = "";

        const noneOption =
            document.createElement("option");

        noneOption.value = "none";

        noneOption.textContent = "None (Exclude Section)";

        select.appendChild(noneOption);

        const questions = unusedOrFallback(

            getEligibleQuestions(section),

            question => isQuestionUsed(section, question.Question_No)

        );

        questions.forEach(function(question){

            const option =
                document.createElement("option");

            option.value = question.Question_No;

            option.textContent = question.Question_No;

            select.appendChild(option);

        });

        // "None" is listed first for visibility, but a real question
        // stays the default so behaviour is unchanged unless it is
        // deliberately chosen — same pattern as Spotter's "Random" below.
        if (select.options.length > 1) {

            select.selectedIndex = 1;

        }

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

        const setNumbers = unusedOrFallback(

            getEligibleSpotterSetNumbers(),

            isSpotterSetUsed

        );

        setNumbers.forEach(function(setNo){

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

        // RANDOM SET never lands on "None" — that's an explicit,
        // deliberate choice, not something to pick for the coordinator.
        if (select.options[i].value === "none") continue;

        if (!isUsedFn(select.options[i].value)) eligible.push(i);

    }

    const pool = eligible.length > 0
        ? eligible
        : randomIndexPool(select.options.length).filter(
            i => select.options[i].value !== "none"
        );

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