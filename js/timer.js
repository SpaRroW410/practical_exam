import { timerDuration } from './config.js';

let timerId = null;
let remainingTime = timerDuration;

export function startTimer(onTick) {
  stopTimer();
  remainingTime = timerDuration;
  onTick(remainingTime);
  timerId = setInterval(() => {
    remainingTime -= 1;
    onTick(remainingTime);
    if (remainingTime <= 0) {
      stopTimer();
    }
  }, 1000);
}

export function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}
