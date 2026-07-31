const loader = document.getElementById('loader');
const questionCard = document.getElementById('questionCard');

export function showLoader() {
  loader.hidden = false;
  questionCard.hidden = true;
}

export function hideLoader() {
  loader.hidden = true;
  questionCard.hidden = false;
}
