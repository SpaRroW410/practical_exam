export function initializeNavigation({ onStartExam }) {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('#startExam');
    if (button) {
      onStartExam();
    }
  });
}
