export function summaryTemplate(state) {
  return `
    <div class="exam-card">
      <h3>Summary</h3>
      <ul>
        ${state.sections.map((section) => `<li>${section.label}: ${state.selected[section.id]}</li>`).join('')}
      </ul>
    </div>
  `;
}
