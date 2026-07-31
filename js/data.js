import { examSections } from './config.js';

export async function loadQuestions() {
  const response = await fetch('./data/questions.json');
  if (!response.ok) throw new Error('Unable to load questions.');
  return response.json();
}

export function buildSelectionMap(questions) {
  return examSections.reduce((acc, section) => {
    acc[section] = questions.filter((q) => q.category.toLowerCase() === section).length;
    return acc;
  }, {});
}
