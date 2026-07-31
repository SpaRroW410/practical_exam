import { renderQuestion, renderCategoryList, renderResults, updateStats, updateTimer } from './ui.js';
import { startTimer, stopTimer, resetTimer } from './timer.js';
import { initializeNavigation } from './navigation.js';
import { showLoader, hideLoader } from './loader.js';

let questions = [];
let currentIndex = 0;
let selectedAnswers = [];
let isSubmitted = false;
let navigationController = null;

async function loadQuestions() {
  showLoader();
  try {
    const response = await fetch('./data/questions.json');
    if (!response.ok) {
      throw new Error('Unable to load questions.');
    }
    questions = await response.json();
    selectedAnswers = new Array(questions.length).fill(null);
    navigationController = initializeNavigation({
      questionCount: questions.length,
      onSelectAnswer: selectAnswer,
      onGoToQuestion: goToQuestion,
      onFinishExam: finishExam,
      onRestartExam: restartExam,
    });
    renderCategoryList(questions);
    renderQuestion(questions[currentIndex], currentIndex, selectedAnswers[currentIndex]);
    updateStats(questions, selectedAnswers);
    hideLoader();
    startTimer(15 * 60, (timeLeft) => {
      updateTimer(timeLeft);
      if (timeLeft === 0) {
        finishExam();
      }
    });
  } catch (error) {
    hideLoader();
    document.getElementById('questionCard').innerHTML = `<p>${error.message}</p>`;
  }
}

function selectAnswer(index, answerIndex) {
  if (isSubmitted) return;
  currentIndex = index;
  selectedAnswers[currentIndex] = answerIndex;
  renderQuestion(questions[currentIndex], currentIndex, selectedAnswers[currentIndex]);
  updateStats(questions, selectedAnswers);
}

function goToQuestion(index) {
  if (index < 0 || index >= questions.length) return;
  currentIndex = index;
  renderQuestion(questions[currentIndex], currentIndex, selectedAnswers[currentIndex]);
}

function finishExam() {
  isSubmitted = true;
  stopTimer();
  renderResults(questions, selectedAnswers);
}

function restartExam() {
  currentIndex = 0;
  selectedAnswers = new Array(questions.length).fill(null);
  isSubmitted = false;
  resetTimer(15 * 60);
  renderQuestion(questions[currentIndex], currentIndex, selectedAnswers[currentIndex]);
  updateStats(questions, selectedAnswers);
  renderResults(null, null, true);
}

function init() {
  loadQuestions();
}

init();
