export function initializeNavigation({ questionCount, onSelectAnswer, onGoToQuestion, onFinishExam, onRestartExam }) {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const questionCard = document.getElementById('questionCard');
  let currentIndex = 0;
  const lastIndex = Math.max(questionCount - 1, 0);

  function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= lastIndex;
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateButtons();
      onGoToQuestion(currentIndex);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < lastIndex) {
      currentIndex += 1;
      updateButtons();
      onGoToQuestion(currentIndex);
    }
  });

  submitBtn.addEventListener('click', onFinishExam);

  questionCard.addEventListener('click', (event) => {
    const button = event.target.closest('.option-btn');
    if (!button) return;
    const optionIndex = Number(button.getAttribute('data-option-index'));
    onSelectAnswer(currentIndex, optionIndex);
  });

  updateButtons();
}
