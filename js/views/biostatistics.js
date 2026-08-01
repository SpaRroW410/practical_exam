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

    updateSectionTimer("");

    renderPage(`

        ${renderTimerHeader()}

        <section class="exam-screen">

            <div class="section-header">

                <h2>${header.Title}</h2>

                <div class="scenario">

                    ${renderSectionInfo("biostatistics", header)}

                </div>

            </div>

            ${renderNavigationButtons(true,true)}

        </section>

    `);

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

    let html = `

        ${renderTimerHeader()}

        <section class="exam-screen">

            <h2>

                Biostatistics Question ${question.Question_No}

            </h2>

            <h3>

                ${question.Title}

            </h3>

            <div class="scenario">

                ${question.Scenario_or_Stem}

            </div>

    `;

    // --------------------------------------------------------
    // Plot Instruction
    // --------------------------------------------------------

    if (

        question.Plot_Instruction &&

        question.Plot_Instruction !== ""

    ) {

        html += `

            <div class="plot-instruction">

                <strong>Plot Instruction</strong>

                <br><br>

                ${question.Plot_Instruction}

            </div>

        `;

    }

    html += `

            <div class="question">

                <strong>A.</strong>

                ${question.Sub_Question_A}

                <span class="marks">

                    (${marks.A})

                </span>

            </div>

            <div class="question">

                <strong>B.</strong>

                ${question.Sub_Question_B}

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

                ${question.Sub_Question_C}

                <span class="marks">

                    (${marks.C})

                </span>

            </div>

        `;

    }

    if (

        question.Image_File &&

        question.Image_File !== ""

    ) {

        html += `

            <div class="question-image">

                <img

                    src="images/biostatistics/${question.Image_File}"

                    alt="Biostatistics Image">

                <div class="image-caption">

                    ${question.Image_Caption ?? ""}

                </div>

            </div>

        `;

    }

    html += `

            ${renderNavigationButtons()}

        </section>

    `;

    renderPage(html);

    attachNavigationEvents();

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