// ============================================================
// Community Medicine Examination System
// Biostatistics Renderer
// ============================================================

let biostatisticsTimerStarted = false;

function renderBiostatistics() {

    appState.currentView = "biostatistics";

    showBiostatisticsHeader();

}

// ============================================================
// Header
// ============================================================

function showBiostatisticsHeader() {

    const header = appData.questions.biostatistics.find(
        x => x.Item_Type === "Section_Header"
    );

    pauseSectionTimer();

    updateSectionTimer("00:00");

    renderPage(`

        <section class="exam-screen">

            <div class="section-header">

                ${renderSectionInfo("biostatistics", header)}

            </div>

            ${renderNavigationButtons(true,true)}

        </section>

    `);

    setExamHeader(header.Title);

    attachNavigationEvents();

    document.getElementById("previousButton").onclick =
        previousSection;

    document.getElementById("nextButton").onclick =
        showBiostatisticsQuestion;

}

// ============================================================
// Question
// ============================================================

function showBiostatisticsQuestion() {

    const question = appData.questions.biostatistics.find(

        q =>

            q.Item_Type === "Question" &&

            Number(q.Question_No) ===
            Number(appState.exam.biostatistics)

    );

    if (!question) {

        alert("Biostatistics question not found.");

        return;

    }

    const marks = getDisplayMarks(question);

    const hasImage = Boolean(

        question.Image_File &&

        question.Image_File !== ""

    );

    let html = `

        <section class="exam-screen">

            ${hasImage ? `<div class="question-top">` : ""}

            <div class="scenario">

                ${nl2br(question.Scenario_or_Stem)}

            </div>

    `;

    // --------------------------------------------------------
    // Image
    // --------------------------------------------------------

    if (hasImage) {

        html += `

            <div class="question-image">

                <img

                    src="images/biostatistics/${question.Image_File}"

                    alt="Biostatistics Image">

                <div class="image-caption">

                    ${nl2br(question.Image_Caption ?? "")}

                </div>

            </div>

        `;

    }

    // --------------------------------------------------------
    // Plot Instruction
    // --------------------------------------------------------

    if (

        question.Plot_Instruction &&

        question.Plot_Instruction !== ""

    ) {

        html += `

            <div class="plot-instruction">

                <strong>Plot Instruction:</strong>
                ${nl2br(question.Plot_Instruction)}

            </div>

        `;

    }

    if (hasImage) {

        html += `</div>`;

    }

    html += `

            <div class="question-subquestions">

                <div class="question">

                    <strong>A.</strong>

                    ${nl2br(question.Sub_Question_A)}

                    <span class="marks">

                        (${marks.A})

                    </span>

                </div>

                <div class="question">

                    <strong>B.</strong>

                    ${nl2br(question.Sub_Question_B)}

                    <span class="marks">

                        (${marks.B})

                    </span>

                </div>

    `;

    if (

        isPG() &&

        question.Sub_Question_C

    ) {

        html += `

                <div class="question">

                    <strong>C.</strong>

                    ${nl2br(question.Sub_Question_C)}

                    <span class="marks">

                        (${marks.C})

                    </span>

                </div>

        `;

    }

    html += `

            </div>

    `;

    html += `

            ${renderNavigationButtons()}

        </section>

    `;

    renderPage(html);

    setExamHeader("Biostatistics Question");

    attachNavigationEvents();

    fitTwoBandLayout(hasImage);

    if (!biostatisticsTimerStarted) {

        startSectionTimer(

            Number(appData.settings.Biostatistics_Time_Min) * 60,

            Number(appData.settings.Warning_Normal_Sec)

        );

        biostatisticsTimerStarted = true;

    }

    else {

        resumeSectionTimer();

    }

    document.getElementById("previousButton").onclick =
        function () {

            pauseSectionTimer();

            showBiostatisticsHeader();

        };

    document.getElementById("nextButton").onclick =
        function () {

            stopSectionTimer();

            biostatisticsTimerStarted = false;

            nextSection();

        };

}