// ============================================================
// Community Medicine Examination System
// Admin — Question Bank
//
// Prints every question in one section at the chosen level, either as
// a candidate-safe question bank (no answers) or, on request, with the
// answer key included as a marking sheet. Also offers Display Testing:
// an on-screen, unfiltered walk-through of every question for visual
// QA, with an optional UG-only toggle.
// ============================================================

const ADMIN_SECTIONS = [

    { key: "clinical",      label: "Clinical Case"  },

    { key: "epidemiology",  label: "Epidemiology"   },

    { key: "biostatistics", label: "Biostatistics"  },

    { key: "ospe",          label: "OSPE"           },

    { key: "spotter",       label: "Spotter"        }

];


function renderAdminScreen() {

    appState.currentView = "admin";

    renderPage(`

        <section class="home-screen">

            <div class="home-card">

                <h2>Question Bank</h2>

                <p>Print every question in a section, with or without the answer key — or walk through them on screen for display testing.</p>

                <div class="selector-grid">

                    <div class="selector">

                        <label>Section</label>

                        <select id="adminSection">

                            ${ADMIN_SECTIONS.map(function(section){

                                return `<option value="${section.key}">${section.label}</option>`;

                            }).join("")}

                        </select>

                    </div>

                    <div class="selector">

                        <label>Examination Level</label>

                        <select id="adminLevel">
                            <option value="UG">Undergraduate</option>
                            <option value="PG">Postgraduate</option>
                        </select>

                    </div>

                    <div class="selector">

                        <label>Questions Included</label>

                        <div id="adminCount">—</div>

                    </div>

                </div>

                <div class="selector" id="adminSpotterScopeWrap" style="display:none;">

                    <label>Display Testing Scope (Spotter only)</label>

                    <select id="adminSpotterScope">

                        ${Object.keys(SPOTTER_PREVIEW_GROUPS).map(function(key){

                            return `<option value="${key}">${SPOTTER_PREVIEW_GROUPS[key].label}</option>`;

                        }).join("")}

                    </select>

                </div>

                <div class="selector">

                    <label>
                        <input type="checkbox" id="adminPreviewUGOnly">
                        Display Testing: UG only (hides Difficult items and Sub-Question C)
                    </label>

                </div>

                <div class="home-actions">

                    <button
                        id="adminBackToAccess"
                        class="start-button print-button">

                        BACK

                    </button>

                    <button
                        id="adminPrint"
                        class="start-button">

                        PRINT / SAVE PDF

                    </button>

                </div>

                <div class="home-actions home-actions--print">

                    <button
                        id="adminPrintWithAnswers"
                        class="start-button print-button">

                        PRINT WITH ANSWER KEY

                    </button>

                    <button
                        id="adminDisplayTesting"
                        class="start-button print-button">

                        DISPLAY TESTING

                    </button>

                </div>

            </div>

        </section>

    `);

    const sectionSelect = document.getElementById("adminSection");

    const levelSelect = document.getElementById("adminLevel");

    const spotterScopeWrap = document.getElementById("adminSpotterScopeWrap");

    function refreshCount() {

        document.getElementById("adminCount").textContent =

            countAdminQuestions(

                sectionSelect.value,

                levelSelect.value

            ) + " items";

        spotterScopeWrap.style.display =
            sectionSelect.value === "spotter" ? "block" : "none";

    }

    sectionSelect.onchange = refreshCount;

    levelSelect.onchange = refreshCount;

    document
        .getElementById("adminPrint")
        .onclick = function(){

            printSectionBankToPDF(

                sectionSelect.value,

                levelSelect.value

            );

        };

    document
        .getElementById("adminPrintWithAnswers")
        .onclick = function(){

            printSectionBankToPDF(

                sectionSelect.value,

                levelSelect.value,

                true

            );

        };

    document
        .getElementById("adminDisplayTesting")
        .onclick = function(){

            renderAdminPreview(

                sectionSelect.value,

                document.getElementById("adminSpotterScope").value,

                document.getElementById("adminPreviewUGOnly").checked

            );

        };

    document
        .getElementById("adminBackToAccess")
        .onclick = renderPasswordScreen;

    refreshCount();

}


// ------------------------------------------------------------
// How many items the current filter yields — shown before printing
// so an empty or unexpectedly small selection is obvious.
//
// Mirrors the eligibility rule used throughout the app: UG never
// sees anything marked Difficult.
// ------------------------------------------------------------

function countAdminQuestions(sectionKey, level) {

    const isUGLevel = level === "UG";

    if (sectionKey === "spotter") {

        return appData.questions.spotter.filter(

            s =>

                s.Item_Type === "Spotter_Slide" &&

                (!isUGLevel || s.Difficulty !== "Difficult")

        ).length;

    }

    return (appData.questions[sectionKey] || []).filter(

        q =>

            q.Item_Type === "Question" &&

            (!isUGLevel || q.Difficulty !== "Difficult")

    ).length;

}
