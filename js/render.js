import { renderHomeView } from './views/home.js';
import { renderClinicalView } from './views/clinical.js';
import { renderEpidemiologyView } from './views/epidemiology.js';
import { renderBiostatisticsView } from './views/biostatistics.js';
import { renderOspeView } from './views/ospe.js';
import { renderSpotterView } from './views/spotter.js';
import { renderSummaryView } from './views/summary.js';

export function renderHomeScreen(state) {
  const screen = document.getElementById('setup-screen');
  screen.innerHTML = renderHomeView(state.sections);
}

export function renderExamScreen(state) {
  const examScreen = document.getElementById('exam-screen');
  examScreen.innerHTML = `
    <div class="exam-screen container">
      <div class="card">
        <h1>Exam Started</h1>
        <p class="timer">Time left: <span id="timerValue">15:00</span></p>
        <div class="exam-grid">
          ${renderClinicalView(state.selected.clinical)}
          ${renderEpidemiologyView(state.selected.epidemiology)}
          ${renderBiostatisticsView(state.selected.biostatistics)}
          ${renderOspeView(state.selected.ospe)}
          ${renderSpotterView(state.selected.spotter)}
          ${renderSummaryView(state)}
        </div>
      </div>
    </div>
  `;
}
