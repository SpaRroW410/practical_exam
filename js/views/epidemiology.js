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

    updateSectionTimer("00:00");

    renderPage(`

        <section class="exam-screen">

            <div class="section-header">

                ${renderSectionInfo("epidemiology", header)}

            </div>

            ${renderNavigationButtons(true, true)}

        </section>

    `);

    setExamHeader(header.Title);

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

    const hasImage = Boolean(question.Image_File);

    let html = `

        <section class="exam-screen">

            ${hasImage ? `<div class="question-top">` : ""}

            <div class="scenario">

                ${nl2br(question.Scenario_or_Stem)}

            </div>

    `;

    if (hasImage) {

        html += `

            <div class="question-image">

                <img

                    src="images/epidemiology/${question.Image_File}"

                    alt="Epidemiology Image">

                <div class="image-caption">

                    ${nl2br(question.Image_Caption ?? "")}

                </div>

            </div>

            </div>

        `;

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

    if (isPG() && question.Sub_Question_C) {

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

    setExamHeader("Epidemiology Question");

    attachNavigationEvents();

    fitTwoBandLayout(hasImage);

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