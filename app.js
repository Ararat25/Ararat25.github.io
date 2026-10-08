const projectRoot = document.querySelector("#project-list");
const achievementRoot = document.querySelector("#achievement-list");
const filterRoot = document.querySelector("#achievement-filters");
const countRoot = document.querySelector("#achievement-count");

const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function renderProjects(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    projectRoot.innerHTML = '<p class="load-error">Проекты пока не добавлены.</p>';
    return;
  }
  projectRoot.innerHTML = projects.map((project, index) => {
    const link = typeof project.url === "string" && project.url.startsWith("https://github.com/")
      ? `<a class="project-link" href="${escapeHTML(project.url)}" target="_blank" rel="noopener noreferrer" aria-label="Открыть репозиторий ${escapeHTML(project.title)}">↗</a>`
      : "";
    const tags = Array.isArray(project.stack) ? project.stack.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("") : "";
    return `<article class="project-card ${project.featured ? "featured" : ""} ${link ? "has-link" : ""}">
      ${link}
      <div class="card-top"><span class="card-index">${String(index + 1).padStart(2, "0")}</span><span class="card-kind">${escapeHTML(project.kind)}</span></div>
      <h3>${escapeHTML(project.title)}</h3>
      <p>${escapeHTML(project.description)}</p>
      ${project.role ? `<p class="project-role">${escapeHTML(project.role)}</p>` : ""}
      <div class="project-meta" aria-label="Технологии">${tags}</div>
    </article>`;
  }).join("");
}

const filters = [
  { id: "all", label: "Все" },
  { id: "award", label: "Награды" },
  { id: "research", label: "Исследования" },
  { id: "learning", label: "Обучение" }
];
let achievements = [];
let activeFilter = "all";

function renderFilters() {
  filterRoot.innerHTML = filters.map((filter) => `<button class="filter-button" type="button" data-filter="${filter.id}" aria-pressed="${activeFilter === filter.id}">${filter.label}</button>`).join("");
  filterRoot.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      renderFilters();
      renderAchievements();
    });
  });
}

function renderAchievements() {
  const visible = activeFilter === "all" ? achievements : achievements.filter((item) => item.category === activeFilter);
  countRoot.textContent = `${visible.length} из ${achievements.length}`;
  if (!visible.length) {
    achievementRoot.innerHTML = '<p class="load-error">В этой категории пока нет записей.</p>';
    return;
  }
  achievementRoot.innerHTML = visible.map((item) => `<article class="achievement-item">
    <span class="achievement-year">${escapeHTML(item.year)}</span>
    <div><span class="achievement-category">${escapeHTML(item.categoryLabel)}</span><h3>${escapeHTML(item.title)}</h3>${item.detail ? `<p>${escapeHTML(item.detail)}</p>` : ""}</div>
  </article>`).join("");
}

async function loadPortfolio() {
  try {
    const [projectResponse, achievementResponse] = await Promise.all([
      fetch("data/projects.json"),
      fetch("data/achievements.json")
    ]);
    if (!projectResponse.ok || !achievementResponse.ok) throw new Error("Не удалось загрузить данные портфолио");
    const [projects, achievementData] = await Promise.all([projectResponse.json(), achievementResponse.json()]);
    achievements = Array.isArray(achievementData) ? achievementData : [];
    renderProjects(projects);
    renderFilters();
    renderAchievements();
  } catch (error) {
    projectRoot.innerHTML = '<p class="load-error">Не удалось загрузить проекты. Обновите страницу или проверьте файлы данных.</p>';
    achievementRoot.innerHTML = '<p class="load-error">Не удалось загрузить достижения. Обновите страницу или проверьте файл данных.</p>';
    countRoot.textContent = "";
    console.error(error);
  }
}

loadPortfolio();
