document.addEventListener("DOMContentLoaded", () => {
  const state = {
    view: "week",
    recipes: [
      { id: "alb", title: "Albóndigas", timeMin: 90, ingredients: ["Carne 500g", "Huevo 1", "Pan rallado"], steps: ["Mezclar", "Formar", "Cocer"] },
      { id: "gaz", title: "Gazpacho", timeMin: 15, ingredients: ["Tomate 1kg", "Pepino", "Ajo"], steps: ["Triturar", "Enfriar"] }
    ]
  };

  const $ = (sel) => document.querySelector(sel);

  function render() {
    const root = $("#root");
    if (!root) return;

    root.innerHTML = `
      <header class="topbar">
        <div class="title">Mi Cocina</div>
        <nav class="tabs">
          <button class="tab ${state.view === "week" ? "active" : ""}" data-view="week">Semana</button>
          <button class="tab ${state.view === "recipes" ? "active" : ""}" data-view="recipes">Recetas</button>
        </nav>
      </header>

      <main class="content">
        ${state.view === "week" ? renderWeek() : renderRecipes()}
      </main>
    `;

    root.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.view = btn.getAttribute("data-view");
        render();
      });
    });
  }

  function renderWeek() {
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return `
      <section class="card">
        <h2>Semana (base)</h2>
        <p class="muted">Ahora mismo es una maqueta. Luego metemos Comida/Cena con 2 platos + turno.</p>
        <div class="week-grid">
          ${days.map(d => `
            <div class="day">
              <div class="day-title">${d}</div>
              <div class="slot"><span>Comida</span><button class="mini">+ Plato</button></div>
              <div class="slot"><span>Cena</span><button class="mini">+ Plato</button></div>
              <div class="slot"><span>Turno</span>
                <select class="select">
                  <option>Mañana</option><option>Tarde</option><option>Dobla</option><option>Guardia</option><option>Libre</option>
                </select>
              </div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderRecipes() {
    const items = [...state.recipes].sort((a,b) => a.title.localeCompare(b.title, "es"));
    return `
      <section class="card">
        <div class="row">
          <h2>Recetas</h2>
          <button class="primary">+ Añadir</button>
        </div>
        <div class="list">
          ${items.map(r => `
            <button class="recipe" data-id="${r.id}">
              <div class="recipe-title">${r.title}</div>
              <div class="recipe-meta">${r.timeMin} min · ${r.ingredients.length} ingredientes</div>
            </button>
          `).join("")}
        </div>
        <p class="muted">Siguiente: mini-ficha y receta completa.</p>
      </section>
    `;
  }

  render();
});
