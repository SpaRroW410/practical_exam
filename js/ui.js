export function setScreenVisibility(setupVisible, examVisible) {
  document.getElementById('setup-screen').style.display = setupVisible ? 'block' : 'none';
  document.getElementById('exam-screen').style.display = examVisible ? 'block' : 'none';
}

export function updateTimer(value) {
  const timerValue = document.getElementById('timerValue');
  if (timerValue) {
    timerValue.textContent = value;
  }
}
