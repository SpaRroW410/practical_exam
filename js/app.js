import { loadQuestions, buildSelectionMap } from './data.js';
import { renderHomeScreen, renderExamScreen } from './render.js';
import { setScreenVisibility, updateTimer } from './ui.js';
import { startTimer, formatTime } from './timer.js';
import { initializeNavigation } from './navigation.js';

const sectionConfig = [
  { id: 'clinical', label: 'Clinical Case' },
  { id: 'epidemiology', label: 'Epidemiology' },
  { id: 'biostatistics', label: 'Biostatistics' },
  { id: 'ospe', label: 'OSPE' },
  { id: 'spotter', label: 'Spotter' },
];

const state = {
  sections: sectionConfig,
  selected: {},
  questions: [],
};

async function init() {
  try {
    const questions = await loadQuestions();
    state.questions = questions;
    state.selected = Object.fromEntries(sectionConfig.map((section) => [section.id, 1]));
    buildSelectionMap(questions);
    renderHomeScreen(state);
    setScreenVisibility(true, false);
    initializeNavigation({ onStartExam: startExam });
  } catch (error) {
    document.getElementById('setup-screen').innerHTML = `<div class="card"><p>${error.message}</p></div>`;
  }
}

function startExam() {
  sectionConfig.forEach((section) => {
    const select = document.getElementById(section.id);
    state.selected[section.id] = Number(select?.value || 1);
  });

  renderExamScreen(state);
  setScreenVisibility(false, true);
  startTimer((seconds) => {
    updateTimer(formatTime(seconds));
  });
}

init();