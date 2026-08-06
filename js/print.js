// ============================================================
// Community Medicine Examination System
// Print / PDF Export
// Version 1.0
//
// Builds a hidden, print-only view of the full exam paper
// (all 5 selected items, full text) and hands off to the
// browser's native Print -> Save as PDF. No external library,
// works fully offline.
// ============================================================


// ------------------------------------------------------------
// Entry Point (called from the Summary screen button)
// ------------------------------------------------------------

function printExamToPDF() {

    const printArea =
        document.getElementById("print-area");

    if (!printArea) {

        alert("Print area not found.");

        return;

    }

    printArea.innerHTML = buildPrintableExamHTML();

    window.print();

}


// ------------------------------------------------------------
// Build Full Printable Exam HTML
// ------------------------------------------------------------

function buildPrintableExamHTML() {

    let html = `

        <div class="print-header">

            <h1>Community Medicine — Examination Paper</h1>

            <p>

                Examination Level:
                ${appState.examLevel === "PG" ? "Postgraduate" : "Undergraduate"}

                <br>

                Generated: ${new Date().toLocaleString()}

            </p>

        </div>

    `;

    html += buildStandardSectionBlock(

        "clinical",
        "Clinical Case",
        appState.exam.clinical

    );

    html += buildStandardSectionBlock(

        "epidemiology",
        "Epidemiology",
        appState.exam.epidemiology

    );

    html += buildStandardSectionBlock(

        "biostatistics",
        "Biostatistics",
        appState.exam.biostatistics

    );

    html += buildStandardSectionBlock(

        "ospe",
        "OSPE",
        appState.exam.ospe

    );

    html += buildSpotterSectionBlock();

    return html;

}


// ------------------------------------------------------------
// Standard Section (Clinical / Epidemiology / Biostatistics / OSPE)
// ------------------------------------------------------------

function buildStandardSectionBlock(sectionKey, sectionLabel, questionNo) {

    const question =
        getQuestion(sectionKey, questionNo);

    if (!question) {

        return `

            <div class="print-section">

                <h2>${sectionLabel} — Question Not Found</h2>

            </div>

        `;

    }

    const marks = getDisplayMarks(question);

    let html = `

        <div class="print-section">

            <h2>${sectionLabel} — Question ${question.Question_No}</h2>

            <div class="print-scenario">

                ${question.Scenario_or_Stem ?? ""}

            </div>

    `;

    if (question.Plot_Instruction && question.Plot_Instruction !== "") {

        html += `

            <div class="print-plot-instruction">

                <strong>Plot Instruction:</strong>
                ${question.Plot_Instruction}

            </div>

        `;

    }

    html += `

            <div class="print-question-item">

                <strong>A.</strong>
                ${question.Sub_Question_A ?? ""}
                <span class="print-marks">(${marks.A})</span>

            </div>

            <div class="print-question-item">

                <strong>B.</strong>
                ${question.Sub_Question_B ?? ""}
                <span class="print-marks">(${marks.B})</span>

            </div>

    `;

    if (isPG() && question.Sub_Question_C) {

        html += `

            <div class="print-question-item">

                <strong>C.</strong>
                ${question.Sub_Question_C}
                <span class="print-marks">(${marks.C})</span>

            </div>

        `;

    }

    if (question.Image_File && question.Image_File !== "") {

        html += `

            <div class="print-image">

                <img
                    src="images/${sectionKey}/${question.Image_File}"
                    alt="${sectionLabel} Image">

                <div class="print-image-caption">

                    ${question.Image_Caption ?? ""}

                </div>

            </div>

        `;

    }

    html += `</div>`;

    return html;

}


// ------------------------------------------------------------
// Spotter Section — all stations in the selected set
// ------------------------------------------------------------

function buildSpotterSectionBlock() {

    // Recompute the exact set of slides shown during the
    // exam (respects the UG/PG station sequence), using the
    // same logic as the live exam view.

    loadSpotterSlides();

    let html = `

        <div class="print-section">

            <h2>Spotter Set ${appState.exam.spotter}</h2>

            <p>Number of Stations: ${spotterSlides.length}</p>

    `;

    spotterSlides.forEach(function (slide, index) {

        html += `

            <div class="print-spotter-station">

                <h3>Spotter ${index + 1}</h3>

                <div class="print-question-item">

                    <strong>A.</strong>
                    ${slide.Sub_Question_A ?? ""}
                    <span class="print-marks">(${slide.Marks_A})</span>

                </div>

                <div class="print-question-item">

                    <strong>B.</strong>
                    ${slide.Sub_Question_B ?? ""}
                    <span class="print-marks">(${slide.Marks_B})</span>

                </div>

        `;

        if (isPG() && slide.Sub_Question_C) {

            html += `

                <div class="print-question-item">

                    <strong>C.</strong>
                    ${slide.Sub_Question_C}
                    <span class="print-marks">(${slide.Marks_C})</span>

                </div>

            `;

        }

        if (slide.Image_File && slide.Image_File !== "") {

            html += `

                <div class="print-image">

                    <img
                        src="images/spotter/${slide.Image_File}"
                        alt="Spotter Image">

                    <div class="print-image-caption">

                        ${slide.Image_Caption ?? ""}

                    </div>

                </div>

            `;

        }

        html += `</div>`;

    });

    html += `</div>`;

    return html;

}
