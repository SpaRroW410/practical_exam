// ============================================================
// Community Medicine Examination System
// Spotter Renderer
// Version 1.0
// ============================================================


// ============================================================
// Spotter State
// ============================================================

let currentSpotterIndex = 0;

let spotterSlides = [];

let spotterTimerStarted = false;

let reserveMode = false;


// ============================================================
// Entry Point
// ============================================================

function renderSpotter() {

    appState.currentView = "spotter";

    reserveMode = false;

    currentSpotterIndex = 0;

    spotterTimerStarted = false;

    loadSpotterSlides();

    showSpotterHeader();

}



// ============================================================
// Load Slides
// ============================================================

function loadSpotterSlides() {

    const allSlides =
        appData.questions.spotter;

    const selectedSet =
        "Set " + appState.exam.spotter;

    const setSlides =

        allSlides.filter(

            slide =>

                slide.Item_Type === "Spotter_Slide" &&

                slide.Set_No === selectedSet

        );


    const sequence = (

        isPG()

            ? appData.settings.PG_Spotter_Slides

            : appData.settings.UG_Spotter_Slides

    )

    .split(",")

    .map(

        x => Number(x.trim())

    );


    spotterSlides = [];


    sequence.forEach(function(number){

        const slide =

            setSlides.find(

                s =>

                    Number(

                        String(s.Spotter_No)

                        .replace(/[^\d]/g,"")

                    ) === number

            );

        if(slide){

            spotterSlides.push(slide);

        }

    });

}



// ============================================================
// Preload Images
// ============================================================
//
// Each station's image previously only started downloading once its
// timer had already begun. Preloading the whole set while the info
// screen is showing means the timer never eats into image-load time.

function preloadSpotterImages(slides, onProgress, onComplete) {

    const imageSlides = slides.filter(
        s => s.Image_File && s.Image_File !== ""
    );

    if (imageSlides.length === 0) {

        onComplete();

        return;

    }

    let settledCount = 0;

    function markSettled() {

        settledCount++;

        onProgress(settledCount, imageSlides.length);

        if (settledCount >= imageSlides.length) {

            onComplete();

        }

    }

    imageSlides.forEach(function(slide){

        const img = new Image();

        img.onload = markSettled;

        img.onerror = markSettled;

        img.src = "images/spotter/" + slide.Image_File;

    });

}


// ============================================================
// Header Screen
// ============================================================

function showSpotterHeader() {

    const header =

        appData.questions.spotter.find(

            x =>

                x.Item_Type === "Section_Header"

        );


    pauseSectionTimer();

    updateSectionTimer("00:00");


    const imageCount = spotterSlides.filter(
        s => s.Image_File && s.Image_File !== ""
    ).length;


    renderPage(`

        <section class="exam-screen">

            <div class="section-header">

                ${renderInfoTiles([

                    {
                        label: "Spotter Set",
                        value: appState.exam.spotter
                    },

                    {
                        label: "Stations",
                        value: spotterSlides.length
                    },

                    {
                        label: "Time / Station",
                        value: isPG()
                            ? appData.settings.Spotter_Time_PG_Sec
                            : appData.settings.Spotter_Time_UG_Sec,
                        unit: "Seconds"
                    },

                    {
                        label: "Reserve Time",
                        value: appData.settings.Reserve_Time_Sec,
                        unit: "Seconds"
                    },

                    {
                        label: "Total Marks",
                        value: spotterSlides.length * (isPG() ? 3 : 2),
                        unit: "Marks"
                    }

                ])}

                ${renderInstructionNote(

                    header.Scenario_or_Stem

                    || "Each station is timed. The slide advances automatically when the station timer ends."

                )}

                ${

                    imageCount > 0

                    ? `<div id="spotterPreloadStatus" class="spotter-preload-status">Loading images... 0/${imageCount}</div>`

                    : ""

                }

            </div>

            ${renderNavigationButtons(

                true,

                imageCount === 0

            )}

        </section>

    `);


    setExamHeader(header.Title);


    attachNavigationEvents();


    document

        .getElementById("previousButton")

        .onclick = previousSection;


    document

        .getElementById("nextButton")

        .onclick = function(){

            showSpotterSlide();

        };


    if (imageCount > 0) {

        preloadSpotterImages(

            spotterSlides,

            function(loaded, total){

                const status =
                    document.getElementById("spotterPreloadStatus");

                if (status) {

                    status.textContent =
                        "Loading images... " + loaded + "/" + total;

                }

            },

            function(){

                const status =
                    document.getElementById("spotterPreloadStatus");

                if (status) {

                    status.textContent = "Images ready.";

                }

                const nextButton =
                    document.getElementById("nextButton");

                if (nextButton) {

                    nextButton.disabled = false;

                }

            }

        );

    }

}

// ============================================================
// Display Current Spotter Slide
// ============================================================

function showSpotterSlide() {

    // --------------------------------------------------------
    // End of Set
    // --------------------------------------------------------

    if (currentSpotterIndex >= spotterSlides.length) {

        showReserveScreen();

        return;

    }

    const slide = spotterSlides[currentSpotterIndex];

    // --------------------------------------------------------
    // Timer
    // --------------------------------------------------------

    if (!spotterTimerStarted) {

        startSectionTimer(

            Number(

                isPG()

                    ? appData.settings.Spotter_Time_PG_Sec

                    : appData.settings.Spotter_Time_UG_Sec

            ),

            Number(

                appData.settings.Warning_Spotter_Sec

            ),

            nextSpotterSlide

        );

        spotterTimerStarted = true;

    }

    else {

        resumeSectionTimer();

    }

    // --------------------------------------------------------
    // Questions A/B/C
    // --------------------------------------------------------

    let questionA = `

        <div class="question">

            <strong>A.</strong>

            ${nl2br(slide.Sub_Question_A)}

            <span class="marks">

                (${slide.Marks_A})

            </span>

        </div>

    `;

    let questionB = `

        <div class="question">

            <strong>B.</strong>

            ${nl2br(slide.Sub_Question_B)}

            <span class="marks">

                (${slide.Marks_B})

            </span>

        </div>

    `;

    let questionC = "";

    if (

        isPG()

        &&

        slide.Sub_Question_C

    ) {

        questionC = `

            <div class="question">

                <strong>C.</strong>

                ${nl2br(slide.Sub_Question_C)}

                <span class="marks">

                    (${slide.Marks_C})

                </span>

            </div>

        `;

    }

    // --------------------------------------------------------
    // Image
    // --------------------------------------------------------

    let imageHTML = "";

    if (

        slide.Image_File

        &&

        slide.Image_File !== ""

    ) {

        imageHTML = `

            <div class="spotter-image-wrap">

                <img

                    src="images/spotter/${slide.Image_File}"

                    alt="Spotter Image"

                    class="spotter-image"

                >

            </div>

        `;

    }

    else {

        imageHTML = `

            <div class="spotter-image-wrap">

                <div class="spotter-placeholder">

                    No Image

                </div>

            </div>

        `;

    }

    // --------------------------------------------------------
    // Render
    // --------------------------------------------------------

    renderPage(`

        <section class="exam-screen">

            <div class="spotter-layout">

                <div class="question-subquestions">

                    ${questionA}

                    ${questionB}

                    ${questionC}

                </div>

                ${imageHTML}

            </div>

            ${renderNavigationButtons(true,true)}

        </section>

    `);

    setExamHeader(

        `Spotter ${currentSpotterIndex + 1} of ${spotterSlides.length}`

    );

    attachNavigationEvents();

    // No imageWrap: the image has its own grid column, so growing the
    // text does not steal its space. Fit against the question column.
    fitQuestionLayout(

        null,

        document.querySelector(".spotter-layout .question-subquestions"),

        64

    );

    // --------------------------------------------------------
    // Previous
    // --------------------------------------------------------

    document

        .getElementById("previousButton")

        .onclick = previousSpotterSlide;

    // --------------------------------------------------------
    // Next
    // --------------------------------------------------------

    document

        .getElementById("nextButton")

        .onclick = nextSpotterSlide;

}

// ============================================================
// Previous Spotter Slide
// ============================================================

function previousSpotterSlide() {

    pauseSectionTimer();

    if (currentSpotterIndex === 0) {

        showSpotterHeader();

        return;

    }

    currentSpotterIndex--;

    spotterTimerStarted = false;

    showSpotterSlide();

}



// ============================================================
// Next Spotter Slide
// ============================================================

function nextSpotterSlide() {

    stopSectionTimer();

    spotterTimerStarted = false;

    currentSpotterIndex++;

    if (currentSpotterIndex >= spotterSlides.length) {

        showReserveScreen();

        return;

    }

    showSpotterSlide();

}



// ============================================================
// Reserve Screen
// ============================================================

function showReserveScreen() {

    reserveMode = true;

    renderPage(`

        <section class="exam-screen reserve-screen">

            <div class="reserve-container">

                <h1>

                    RESERVE TIME

                </h1>

                <p>

                    Remain seated and wait for your paper to be collected.

                </p>

            </div>

        </section>

    `);

    setExamHeader("");

    startSectionTimer(

        Number(appData.settings.Reserve_Time_Sec),

        Number(appData.settings.Warning_Spotter_Sec),

        finishSpotter

    );

}



// ============================================================
// Finish Spotter
// ============================================================

function finishSpotter() {

    stopSectionTimer();

    reserveMode = false;

    currentSpotterIndex = 0;

    spotterSlides = [];

    spotterTimerStarted = false;

    nextSection();

}



// ============================================================
// Restart Spotter
// ============================================================

function resetSpotter() {

    currentSpotterIndex = 0;

    reserveMode = false;

    spotterSlides = [];

    spotterTimerStarted = false;

}
