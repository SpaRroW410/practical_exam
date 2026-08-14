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

    // A random set is generated once at startExam and cached, so the
    // header, the slides, the print output and the summary all agree
    // and Previous/Next never reshuffles it.
    if (appState.randomSpotterSlides) {

        spotterSlides = appState.randomSpotterSlides;

        return;

    }

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
// Random Set Builder
// ============================================================
//
// Draws one slide per station position from the whole 220-slide pool
// rather than using a fixed Set_No.
//
//   UG - positions 1..10, Easy or Moderate only.
//   PG - positions 1..9, then a 10th station drawn from positions 10
//        AND 11 combined (40 candidates), any difficulty.
//
// One slide per domain: a set never carries two slides sharing a
// Domain_Category. Today every domain belongs to exactly one position,
// so the per-position draw already satisfies this and the check costs
// nothing — it is a guard that keeps the guarantee true if a domain
// ever spans more than one position.

function spotterPositionOf(slide) {

    return Number(String(slide.Spotter_No).replace(/[^\d]/g, ""));

}

function shuffled(list) {

    const out = list.slice();

    for (let i = out.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        const tmp = out[i];

        out[i] = out[j];

        out[j] = tmp;

    }

    return out;

}

function buildRandomSpotterSet() {

    const allSlides =
        appData.questions.spotter.filter(
            s => s.Item_Type === "Spotter_Slide"
        );

    const allowedDifficulty =
        isPG()
            ? null                       // PG: all difficulties open
            : ["Easy", "Moderate"];      // UG: nothing Difficult

    // Each entry is the list of positions that station may draw from.
    const stations =
        isPG()
            ? [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10, 11]]
            : [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]];

    // Slides already marked "used" (e.g. by an earlier day's Random draw
    // that was added to the exclusion list) are avoided when an
    // alternative exists, same graceful-fallback spirit as the domain
    // preference below — never blocks a pick outright.
    const excludedSlideIds = loadUsedLog().spotterSlides;

    const usedDomains = [];

    const chosen = [];

    stations.forEach(function(positions){

        const candidates = allSlides.filter(function(slide){

            if (positions.indexOf(spotterPositionOf(slide)) === -1) {
                return false;
            }

            if (allowedDifficulty &&
                allowedDifficulty.indexOf(slide.Difficulty) === -1) {
                return false;
            }

            return true;

        });

        if (candidates.length === 0) return;

        const pool = shuffled(candidates);

        function isFreeDomain(slide) {

            const domain = slide.Domain_Category;

            return !domain || usedDomains.indexOf(domain) === -1;

        }

        function isNotExcluded(slide) {

            return excludedSlideIds.indexOf(slide.Spotter_ID) === -1;

        }

        // Prefer a slide that is both a fresh domain and not previously
        // excluded; relax to just a fresh domain if none exist; relax to
        // any candidate if every one collides, rather than hand back a
        // short paper.
        let pick =
            pool.find(slide => isFreeDomain(slide) && isNotExcluded(slide)) ||
            pool.find(isFreeDomain) ||
            pool[0];

        if (pick.Domain_Category) usedDomains.push(pick.Domain_Category);

        chosen.push(pick);

    });

    return chosen;

}


// Human-readable tally, e.g. "4 Easy, 6 Moderate", so the header can
// report what the draw actually produced.
function describeDifficultyMix(slides) {

    const order = ["Easy", "Moderate", "Difficult"];

    const counts = {};

    slides.forEach(function(slide){

        counts[slide.Difficulty] = (counts[slide.Difficulty] || 0) + 1;

    });

    return order

        .filter(level => counts[level])

        .map(level => counts[level] + " " + level)

        .join(", ");

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
                        value: appState.exam.spotter === "random"
                            ? "Random"
                            : appState.exam.spotter,
                        unit: appState.exam.spotter === "random"
                            ? describeDifficultyMix(spotterSlides)
                            : ""
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
