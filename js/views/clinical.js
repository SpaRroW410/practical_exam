// ============================================================
// Community Medicine Examination System
// Clinical Case Renderer
// ============================================================

let clinicalTimerStarted = false;

function renderClinical() {

    appState.currentView = "clinical";

    showClinicalHeader();

}

// ============================================================
// Clinical Header
// ============================================================

function showClinicalHeader() {

    const header = appData.questions.clinical.find(
        x => x.Item_Type === "Section_Header"
    );

    // Pause timer if returning from question
    pauseSectionTimer();

    updateSectionTimer("");

    renderPage(`

        ${renderTimerHeader(header.Title)}

        <section class="exam-screen">

            <div class="section-header">

                <div class="scenario">

                    ${renderSectionInfo("clinical", header)}

                </div>

            </div>

            ${renderNavigationButtons(
                !isFirstSection(),
                true
            )}

        </section>

    `);

    attachNavigationEvents();

    document
        .getElementById("nextButton")
        .onclick = function () {

            showClinicalQuestion();

        };

}

// ============================================================
// Clinical Question
// ============================================================

function showClinicalQuestion() {

    const question = appData.questions.clinical.find(

        q =>

            q.Item_Type === "Question" &&

            Number(q.Question_No) ===
            Number(appState.exam.clinical)

    );

    if (!question) {

        alert("Clinical question not found.");

        return;

    }

    const marks = getDisplayMarks(question);

    let html = `

        ${renderTimerHeader("Clinical Case")}

        <section class="exam-screen">

            <div class="scenario">

                ${question.Scenario_or_Stem}

            </div>

    `;

    if (

        question.Image_File &&

        question.Image_File !== ""

    ) {

        html += `

            <div class="question-image">

                <img

                    src="images/clinical/${question.Image_File}"

                    alt="Clinical Image">

                <div class="image-caption">

                    ${question.Image_Caption ?? ""}

                </div>

            </div>

        `;

    }

    html += `

            <div class="question-subquestions">

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

    html += `

            </div>

    `;

    html += `

            ${renderNavigationButtons()}

        </section>

    `;

    renderPage(html);

    attachNavigationEvents();

    // ---------------------------------------
    // Timer
    // ---------------------------------------

    if (!clinicalTimerStarted) {

        startSectionTimer(

            Number(appData.settings.Clinical_Time_Min) * 60,

            Number(appData.settings.Warning_Normal_Sec)

        );

        clinicalTimerStarted = true;

    }

    else {

        resumeSectionTimer();

    }

    // ---------------------------------------
    // Previous Button
    // ---------------------------------------

    document
        .getElementById("previousButton")
        .onclick = function () {

            pauseSectionTimer();

            showClinicalHeader();

        };

    // ---------------------------------------
    // Next Button
    // ---------------------------------------

    document
        .getElementById("nextButton")
        .onclick = function () {

            stopSectionTimer();

            clinicalTimerStarted = false;

            nextSection();

        };

}