// ============================================================
// Community Medicine Examination System
// OSPE Renderer
// ============================================================

let ospeTimerStarted = false;

function renderOSPE() {

    appState.currentView = "ospe";

    showOSPEHeader();

}


// ============================================================
// Header
// ============================================================

function showOSPEHeader() {

    const header = appData.questions.ospe.find(
        x => x.Item_Type === "Section_Header"
    );

    pauseSectionTimer();

    updateSectionTimer("");

    renderPage(`

        ${renderTimerHeader(header.Title)}

        <section class="exam-screen">

            <div class="section-header">

                ${renderSectionInfo("ospe", header)}

            </div>

            ${renderNavigationButtons(true,true)}

        </section>

    `);

    attachNavigationEvents();

    document.getElementById("previousButton").onclick =
        previousSection;

    document.getElementById("nextButton").onclick =
        showOSPEQuestion;

}


// ============================================================
// Question
// ============================================================

function showOSPEQuestion() {

    const question = appData.questions.ospe.find(

        q =>

            q.Item_Type === "Question" &&

            Number(q.Question_No) ===
            Number(appState.exam.ospe)

    );

    if (!question) {

        alert("OSPE station not found.");

        return;

    }

    const marks = getDisplayMarks(question);

    let html = `

        ${renderTimerHeader("OSPE Station")}

        <section class="exam-screen">

            <div class="scenario">

                ${question.Scenario_or_Stem}

            </div>

    `;

    const hasImage = Boolean(

        question.Image_File &&

        question.Image_File !== ""

    );

    if (hasImage) {

        html += `

            <div class="question-image">

                <img

                    src="images/ospe/${question.Image_File}"

                    alt="OSPE Image">

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

    fitQuestionLayout(

        hasImage ? document.querySelector(".question-image") : null

    );

    if (!ospeTimerStarted) {

        startSectionTimer(

            Number(appData.settings.OSPE_Time_Min) * 60,

            Number(appData.settings.Warning_Normal_Sec)

        );

        ospeTimerStarted = true;

    }

    else {

        resumeSectionTimer();

    }

    document.getElementById("previousButton").onclick =
        function () {

            pauseSectionTimer();

            showOSPEHeader();

        };

    document.getElementById("nextButton").onclick =
        function () {

            stopSectionTimer();

            ospeTimerStarted = false;

            nextSection();

        };

}