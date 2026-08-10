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

    let html = "";

    html += buildPrintableSummaryPage();

    html += buildPrintPage(
        buildStandardSectionBlock(
            "clinical",
            "Clinical Case",
            appState.exam.clinical
        ) +
        buildStandardSectionBlock(
            "epidemiology",
            "Epidemiology",
            appState.exam.epidemiology
        )
    );

    html += buildPrintPage(
        buildStandardSectionBlock(
            "biostatistics",
            "Biostatistics",
            appState.exam.biostatistics
        ) +
        buildStandardSectionBlock(
            "ospe",
            "OSPE",
            appState.exam.ospe
        )
    );

    html += buildSpotterPages();

    return html;

}


function buildPrintPage(content) {

    return `

        <div class="print-page">

            ${content}

        </div>

    `;

}


function buildPrintableSummaryPage() {

    const clinicalQuestion = getQuestion("clinical", appState.exam.clinical);
    const epiQuestion = getQuestion("epidemiology", appState.exam.epidemiology);
    const biostatQuestion = getQuestion("biostatistics", appState.exam.biostatistics);
    const ospeQuestion = getQuestion("ospe", appState.exam.ospe);

    const selectedQuestions = `
        <ul>
            <li>Clinical Case: ${clinicalQuestion ? clinicalQuestion.Question_No : "N/A"}</li>
            <li>Epidemiology: ${epiQuestion ? epiQuestion.Question_No : "N/A"}</li>
            <li>Biostatistics: ${biostatQuestion ? biostatQuestion.Question_No : "N/A"}</li>
            <li>OSPE: ${ospeQuestion ? ospeQuestion.Question_No : "N/A"}</li>
            <li>Spotter Set: ${appState.exam.spotter}</li>
        </ul>
    `;

    const totalTime = typeof formatTime === "function"
        ? formatTime(appState.timer.overall)
        : appState.timer.overall;

    const summaryContent = `

        <div class="print-section">

            <h2>Exam Summary</h2>

            <div class="print-summary-meta">

                <p><strong>Exam Level:</strong> ${appState.examLevel === "PG" ? "Postgraduate" : "Undergraduate"}</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Total Time:</strong> ${totalTime}</p>

                <h3>Selected Questions</h3>
                ${selectedQuestions}

            </div>

        </div>

    `;

    return buildPrintPage(summaryContent);

}


function buildAnswerKeyBlock(item) {

    if (!item) {
        return "";
    }

    const answers = [];

    if (item.Answer_Key_A) {
        answers.push(`<div><strong>Answer Key A:</strong> ${item.Answer_Key_A}</div>`);
    }

    if (item.Answer_Key_B) {
        answers.push(`<div><strong>Answer Key B:</strong> ${item.Answer_Key_B}</div>`);
    }

    // Sub-question C is PG-only (see the isPG() gates on the question
    // and spotter blocks), so printing its answer key for UG would give
    // away the answer to a question that was never asked.
    if (isPG() && item.Answer_Key_C) {
        answers.push(`<div><strong>Answer Key C:</strong> ${item.Answer_Key_C}</div>`);
    }

    if (answers.length === 0) {
        return "";
    }

    return `

        <div class="print-answer-key">

            <strong>Answer Key</strong>
            ${answers.join("")}

        </div>

    `;

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

    html += buildAnswerKeyBlock(question);

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


function buildSpotterPages() {

    loadSpotterSlides();

    if (!spotterSlides.length) {
        return buildPrintPage(`

            <div class="print-section">

                <h2>Spotter Set ${appState.exam.spotter}</h2>
                <p>No spotter stations found for this set.</p>

            </div>

        `);
    }

    const pageSize = 4;
    const pageCount = Math.ceil(spotterSlides.length / pageSize);
    let html = "";

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {

        const pageSlides = spotterSlides.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        let pageContent = `

            <div class="print-section">

                <h2>Spotter Set ${appState.exam.spotter}</h2>
                <p>Number of Stations: ${spotterSlides.length}</p>
                <p>Page ${pageIndex + 1} of ${pageCount}</p>

            </div>

        `;

        pageSlides.forEach(function (slide, index) {

            pageContent += `

                <div class="print-spotter-station">

                    <h3>Spotter ${pageIndex * pageSize + index + 1}</h3>

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

                pageContent += `

                    <div class="print-question-item">

                        <strong>C.</strong>
                        ${slide.Sub_Question_C}
                        <span class="print-marks">(${slide.Marks_C})</span>

                    </div>

                `;

            }

            pageContent += buildAnswerKeyBlock(slide);

            if (slide.Image_File && slide.Image_File !== "") {

                pageContent += `

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

            pageContent += `</div>`;

        });

        html += buildPrintPage(pageContent);

    }

    return html;

}

