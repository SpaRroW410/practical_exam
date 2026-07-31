export function homeTemplate(sectionConfig) {
  return `
    <div class="home-screen card">
      <h1>Community Medicine</h1>
      <h2>Exam Presentation System</h2>
      ${sectionConfig.map((section) => `
        <div class="selector">
          <label>${section.label}</label>
          <select id="${section.id}">
            ${Array.from({ length: 15 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
          </select>
        </div>
      `).join('')}
      <button id="startExam" class="start-btn">Start Exam</button>
    </div>
  `;
}
