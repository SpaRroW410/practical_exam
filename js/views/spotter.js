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
// Header Screen
// ============================================================

function showSpotterHeader() {

    const header =

        appData.questions.spotter.find(

            x =>

                x.Item_Type === "Section_Header"

        );


    pauseSectionTimer();

    updateSectionTimer("");


    renderPage(`

        ${renderTimerHeader()}

        <section class="exam-screen">

            <div class="section-header">

                <h2>

                    ${header.Title}

                </h2>

                <div class="scenario">

                    Spotter Set :
                    ${appState.exam.spotter}

                    <br><br>

                    Number of Stations :
                    ${spotterSlides.length}

                    <br><br>

                    Time per Station :

                    ${

                        isPG()

                        ?

                        appData.settings.Spotter_Time_PG_Sec

                        :

                        appData.settings.Spotter_Time_UG_Sec

                    }

                    Seconds

                    <br><br>

                    Reserve Time :

                    ${

                        appData.settings.Reserve_Time_Sec

                    }

                    Seconds

                    <br><br>

                    Total Marks :

                    ${

                        spotterSlides.length *
                        (isPG() ? 3 : 2)

                    }

                </div>

            </div>

            ${renderNavigationButtons(

                true,

                true

            )}

        </section>

    `);


    attachNavigationEvents();


    document

        .getElementById("previousButton")

        .onclick = previousSection;


    document

        .getElementById("nextButton")

        .onclick = function(){

            showSpotterSlide();

        };

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
    // Question C
    // --------------------------------------------------------

    let questionC = "";

    if (

        isPG()

        &&

        slide.Sub_Question_C

    ) {

        questionC = `

            <div class="question">

                <strong>C.</strong>

                ${slide.Sub_Question_C}

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

            <img

                src="images/spotter/${slide.Image_File}"

                alt="Spotter Image"

                class="spotter-image"

            >

        `;

    }

    else {

        imageHTML = `

            <div class="spotter-placeholder">

                No Image

            </div>

        `;

    }

    // --------------------------------------------------------
    // Render
    // --------------------------------------------------------

    renderPage(`

        ${renderTimerHeader()}

        <section class="exam-screen">

            <div class="spotter-progress">

                Spotter

                ${currentSpotterIndex + 1}

                of

                ${spotterSlides.length}

            </div>

            <h2>

                ${slide.Title}

            </h2>

            <div class="spotter-layout">

                <div class="spotter-left">

                    <div class="question">

                        <strong>A.</strong>

                        ${slide.Sub_Question_A}

                        <span class="marks">

                            (${slide.Marks_A})

                        </span>

                    </div>

                    <div class="question">

                        <strong>B.</strong>

                        ${slide.Sub_Question_B}

                        <span class="marks">

                            (${slide.Marks_B})

                        </span>

                    </div>

                    ${questionC}

                </div>

                <div class="spotter-right">

                    ${imageHTML}

                </div>

            </div>

            ${renderNavigationButtons(true,true)}

        </section>

    `);

    attachNavigationEvents();

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

        ${renderTimerHeader()}

        <section class="exam-screen reserve-screen">

            <div class="reserve-container">

                <h1>

                    RESERVE TIME

                </h1>

                <p>

                    Please wait for the next section.

                </p>

            </div>

        </section>

    `);

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