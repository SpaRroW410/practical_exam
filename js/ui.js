const questionCard = document.getElementById('questionCard');
const answeredCount = document.getElementById('answeredCount');
const remainingCount = document.getElementById('remainingCount');
const progressBar = document.getElementById('progressBar');
const categoryList = document.getElementById('categoryList');
const resultModal = document.getElementById('resultModal');
const resultSummary = document.getElementById('resultSummary');
const resultList = document.getElementById('resultList');
const closeModal = document.getElementById('closeModal');

export function renderQuestion(question, index, selectedIndex) {
  if (!question) return;
  const isAnswered = selectedIndex !== null && selectedIndex !== undefined;
  questionCard.hidden = false;
  questionCard.innerHTML = `
    <div class="question-header">
      <h2>${question.question}</h2>
      <span class="badge">${question.category} • Q${index + 1}</span>
    </div>
    <img src="${question.image}" alt="${question.category} illustration" style="max-width:100%; border-radius:16px; margin-bottom:14px;" />
    <div class="option-list">
      ${question.options
        .map((option, optionIndex) => {
          let className = 'option-btn';
          if (selectedIndex === optionIndex) className += ' selected';
          return `<button class="${className}" data-option-index="${optionIndex}">${option}</button>`;
        })
        .join('')}
    </div>
    ${isAnswered ? `<div class="explanation">${question.explanation}</div>` : ''}
  `;
}

export function renderCategoryList(questions) {
  const categories = [...new Set(questions.map((q) => q.category))];
  categoryList.innerHTML = categories
    .map((category) => {
      const count = questions.filter((q) => q.category === category).length;
      return `
        <button class="category-chip active">
          <span>${category}</span>
          <span class="category-meta">${count} questions</span>
        </button>
      `;
    })
    .join('');
}

export function updateStats(questions, selectedAnswers) {
  const answered = selectedAnswers.filter((answer) => answer !== null).length;
  const remaining = questions.length - answered;
  answeredCount.textContent = answered;
  remainingCount.textContent = remaining;
  progressBar.style.width = `${(answered / questions.length) * 100}%`;
}

export function updateTimer(timeLeft) {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

export function renderResults(questions, selectedAnswers, isRestart = false) {
  if (!questions || !selectedAnswers) {
    resultModal.hidden = true;
    return;
  }

  const score = questions.reduce((total, q, index) => {
    return total + (selectedAnswers[index] === q.correctIndex ? 1 : 0);
  }, 0);

  resultSummary.textContent = `You scored ${score} out of ${questions.length}.`;
  resultList.innerHTML = questions
    .map((q, index) => {
      const status = selectedAnswers[index] === q.correctIndex ? '✓ Correct' : '✗ Incorrect';
      return `<li>${q.question} — ${status}</li>`;
    })
    .join('');

  resultModal.hidden = false;

  if (isRestart) {
    resultModal.hidden = true;
  }
}

closeModal.addEventListener('click', () => {
  resultModal.hidden = true;
  window.location.reload();
});
