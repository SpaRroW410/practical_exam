// ============================================================
// Community Medicine Examination System
// Exam Sequence Screen
//
// Shown after START EXAM, before the exam actually begins: lets the
// coordinator reorder the 5 sections for this run (Summary always
// runs last regardless). Defaults to the standard order — SECTION_
// ORDER's first five, or whatever was last confirmed here, since
// appState.sectionSequence is sticky across runs in the same session
// (see js/config.js's activeSectionOrder()) — so leaving every
// dropdown alone reproduces today's fixed sequence exactly.
//
// Each position is a dropdown offering all 5 sections; picking a
// section already used elsewhere swaps it with whichever position
// held it, so every combination of choices is always a valid full
// permutation — no separate validation step, nothing to reject.
// ============================================================

function renderSequenceSelection() {

    appState.currentView = "sequence";

    const defaultSections = SECTION_ORDER.slice(0, -1);

    const current = appState.sectionSequence || defaultSections;

    renderPage(`

        <section class="home-screen">

            <div class="home-card">

                <h2>Exam Sequence</h2>

                <p>Choose the order sections are presented in, or keep the default below. Summary always runs last.</p>

                <div class="selector-grid">

                    ${current.map(function(sectionKey, index){

                        return `

                            <div class="selector">

                                <label>Position ${index + 1}</label>

                                <select class="sequence-position" data-position="${index}">

                                    ${defaultSections.map(function(key){

                                        return `<option value="${key}" ${key === sectionKey ? "selected" : ""}>${SECTION_NAMES[key]}</option>`;

                                    }).join("")}

                                </select>

                            </div>

                        `;

                    }).join("")}

                </div>

                <div class="home-actions">

                    <button
                        id="sequenceBack"
                        class="start-button print-button">

                        BACK

                    </button>

                    <button
                        id="sequenceBegin"
                        class="start-button">

                        BEGIN EXAM

                    </button>

                </div>

            </div>

        </section>

    `);

    const selects = Array.from(

        document.querySelectorAll(".sequence-position")

    );

    selects.forEach(function(select){

        select.dataset.previousValue = select.value;

        select.onchange = function(){

            const position = Number(select.dataset.position);

            const newValue = select.value;

            const conflict = selects.find(function(other, index){

                return index !== position && other.value === newValue;

            });

            if (conflict) {

                conflict.value = select.dataset.previousValue;

            }

            select.dataset.previousValue = newValue;

        };

    });

    document
        .getElementById("sequenceBack")
        .onclick = renderHome;

    document
        .getElementById("sequenceBegin")
        .onclick = function(){

            appState.sectionSequence = selects.map(

                select => select.value

            );

            beginExamRun();

        };

}
