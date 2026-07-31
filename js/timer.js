let timerId = null;
let remainingTime = 0;

export function startTimer(duration, onTick) {
  remainingTime = duration;
  if (timerId) clearInterval(timerId);
  onTick(remainingTime);
  timerId = setInterval(() => {
    remainingTime -= 1;
    onTick(remainingTime);
    if (remainingTime <= 0) {
      clearInterval(timerId);
      timerId = null;
    }
  }, 1000);
}

export function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

export function resetTimer(duration) {
  stopTimer();
  remainingTime = duration;
  document.getElementById('timer').textContent = '15:00';
}
