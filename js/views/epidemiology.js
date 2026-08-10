// ============================================================
// Community Medicine Examination System
// Epidemiology Renderer
// ============================================================

let epidemiologyTimerStarted = false;

function renderEpidemiology() {

    appState.currentView = "epidemiology";

    showEpidemiologyHeader();

}


// ============================================================
// Header
// ============================================================

function showEpidemiologyHeader() {

    const header = appData.questions.epidemiology.find(
        x => x.Item_Type === "Section_Header"
    );

    pauseSectionTimer();

    updateSectionTimer("");

    renderPage(`

        ${renderTimerHeader(header.Title)}

        <section class="exam-screen">

            <div class="section-header">

                <div class="scenario">

                    ${renderSectionInfo("epidemiology", header)}

                </div>

            </div>

            ${renderNavigationButtons(true, true)}

        </section>

    `);

    attachNavigationEvents();

    document
        .getElementById("previousButton")
        .onclick = previousSection;

    document
        .getElementById("nextButton")
        .onclick = function () {

            showEpidemiologyQuestion();

        };

}



// ============================================================
// Question
// ============================================================

function showEpidemiologyQuestion() {

    const question = appData.questions.epidemiology.find(

        q =>

            q.Item_Type === "Question" &&

            Number(q.Question_No) ===
            Number(appState.exam.epidemiology)

    );

    if (!question) {

        alert("Epidemiology question not found.");

        return;

    }

    const marks = getDisplayMarks(question);

    let html = `

        ${renderTimerHeader("Epidemiology Question")}

        <section class="exam-screen">

            <div class="scenario">

                ${question.Scenario_or_Stem}

            </div>

    `;

    if (question.Image_File) {

        html += `

            <div class="question-image">

                <img

                    src="images/epidemiology/${question.Image_File}"

                    alt="Epidemiology Image">

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

    if (isPG() && question.Sub_Question_C) {

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

    if (!epidemiologyTimerStarted) {

        startSectionTimer(

            Number(appData.settings.Epidemiology_Time_Min) * 60,

            Number(appData.settings.Warning_Normal_Sec)

        );

        epidemiologyTimerStarted = true;

    }

    else {

        resumeSectionTimer();

    }

    document
        .getElementById("previousButton")
        .onclick = function () {

            pauseSectionTimer();

            showEpidemiologyHeader();

        };

    document
        .getElementById("nextButton")
        .onclick = function () {

            stopSectionTimer();

            epidemiologyTimerStarted = false;

            nextSection();

        };

}