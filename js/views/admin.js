// ============================================================
// Community Medicine Examination System
// Admin — Question Bank
//
// Prints every question in one section at the chosen level.
// Answer keys are never included; this is a question bank for
// review, not a marking sheet.
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

                <p>Print every question in a section. Answer keys are not included.</p>

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

            </div>

        </section>

    `);

    const sectionSelect = document.getElementById("adminSection");

    const levelSelect = document.getElementById("adminLevel");

    function refreshCount() {

        document.getElementById("adminCount").textContent =

            countAdminQuestions(

                sectionSelect.value,

                levelSelect.value

            ) + " items";

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
