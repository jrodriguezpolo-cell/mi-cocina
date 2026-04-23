document.addEventListener("DOMContentLoaded", () => {
  const state = {
    buildHash: "cargando",
    view: "week",
    expandedRecipeId: null,
    activeRecipeId: null,
    recipeChecks: {},
    recipes: [
      {
        id: "alb",
        title: "Albóndigas",
        category: "Carne",
        timeMin: 90,
        ingredients: [
          { qty: 500, unit: "g", name: "Carne picada" },
          { qty: 1, unit: "ud", name: "Huevo" },
          { name: "Pan rallado" }
        ],
        steps: ["Mezclar ingredientes", "Formar albóndigas", "Cocinar hasta que queden hechas"]
      },
      {
        id: "gaz",
        title: "Gazpacho",
        category: "Verdura",
        timeMin: 15,
        ingredients: [
          { qty: 1, unit: "kg", name: "Tomate" },
          { qty: 1, unit: "ud", name: "Pepino" },
          { name: "Ajo" }
        ],
        steps: ["Triturar todos los ingredientes", "Enfriar antes de servir"]
      }
    ]
  };

  const $ = (sel) => document.querySelector(sel);
  const BUILD_FALLBACK = "bb87948";

  function getRecipe(recipeId) {
    return state.recipes.find((recipe) => recipe.id === recipeId);
  }

  function formatIngredient(ingredient) {
    if (!ingredient) return "";
    if (typeof ingredient === "string") return ingredient;

    const parts = [];
    const qty = ingredient.qty ?? ingredient.quantity;
    const unit = ingredient.unit;
    const name = ingredient.name || ingredient.title || "";

    if (qty) parts.push(String(qty));
    if (unit) parts.push(unit);

    if (parts.length && name) return `${parts.join(" ")} · ${name}`;
    return name || parts.join(" ");
  }

  function summarizeIngredients(ingredients) {
    if (!Array.isArray(ingredients) || !ingredients.length) return "Pendiente de completar";
    return ingredients.map((ingredient) => formatIngredient(ingredient)).filter(Boolean).join(", ");
  }

  function openRecipeModal(recipeId) {
    if (!getRecipe(recipeId)) return;
    state.activeRecipeId = recipeId;
    render();
  }

  function closeRecipeModal() {
    state.activeRecipeId = null;
    render();
  }

  function toggleRecipeStep(recipeId, stepIndex) {
    if (!state.recipeChecks[recipeId]) state.recipeChecks[recipeId] = {};
    state.recipeChecks[recipeId][stepIndex] = !state.recipeChecks[recipeId][stepIndex];
  }

  function renderRecipeModal() {
    const recipe = getRecipe(state.activeRecipeId);
    if (!recipe) return "";

    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
    const checks = state.recipeChecks[recipe.id] || {};

    return `
      <div class="modal-overlay" data-close-modal>
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="recipe-modal-title">${recipe.title}</h2>
              <div class="modal-time">Tiempo total: ${recipe.timeMin || 0} min</div>
            </div>
            <span class="category-badge modal-category">${recipe.category || "Otro"}</span>
          </div>

          <div class="modal-body">
            <section class="modal-section">
              <h3 class="modal-section-title">Ingredientes</h3>
              ${ingredients.length ? `
                <div class="modal-stack">
                  ${ingredients.map((ingredient) => `
                    <div class="modal-item">${formatIngredient(ingredient)}</div>
                  `).join("")}
                </div>
              ` : `
                <div class="muted">Pendiente de completar</div>
              `}
            </section>

            <section class="modal-section">
              <h3 class="modal-section-title">Pasos</h3>
              ${steps.length ? `
                <div class="checklist">
                  ${steps.map((step, index) => `
                    <label class="check-item">
                      <input type="checkbox" data-step-toggle="${recipe.id}:${index}" ${checks[index] ? "checked" : ""}>
                      <span>${step}</span>
                    </label>
                  `).join("")}
                </div>
              ` : `
                <div class="muted">Pendiente de completar</div>
              `}
            </section>
          </div>

          <div class="modal-actions">
            <button class="primary close-modal" data-close-modal-button>Cerrar</button>
          </div>
        </div>
      </div>
    `;
  }

  function refreshBuildHash() {
    fetch("https://api.github.com/repos/jrodriguezpolo-cell/mi-cocina/commits/main", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("build");
        return response.json();
      })
      .then((data) => {
        state.buildHash = (data.sha || BUILD_FALLBACK).slice(0, 7);
        render();
      })
      .catch(() => {
        state.buildHash = BUILD_FALLBACK;
        render();
      });
  }

  window.openRecipeModal = openRecipeModal;

  function render() {
    const root = $("#root");
    if (!root) return;

    document.body.classList.toggle("modal-open", Boolean(state.activeRecipeId));

    root.innerHTML = `
      <header class="topbar">
        <div class="topbar-head">
          <div class="title">Mi Cocina</div>
          <div class="build-badge">Build: ${state.buildHash}</div>
        </div>
        <nav class="tabs">
          <button class="tab ${state.view === "week" ? "active" : ""}" data-view="week">Semana</button>
          <button class="tab ${state.view === "recipes" ? "active" : ""}" data-view="recipes">Recetas</button>
        </nav>
      </header>

      <main class="content">
        ${state.view === "week" ? renderWeek() : renderRecipes()}
      </main>

      ${renderRecipeModal()}
    `;

    root.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.view = btn.getAttribute("data-view");
        state.expandedRecipeId = null;
        render();
      });
    });

    root.querySelectorAll("[data-recipe-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const recipeId = btn.getAttribute("data-recipe-toggle");
        state.expandedRecipeId = state.expandedRecipeId === recipeId ? null : recipeId;
        render();
      });
    });

    root.querySelectorAll("[data-open-recipe]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openRecipeModal(btn.getAttribute("data-open-recipe"));
      });
    });

    root.querySelectorAll("[data-step-toggle]").forEach((input) => {
      input.addEventListener("change", () => {
        const [recipeId, stepIndex] = input.getAttribute("data-step-toggle").split(":");
        toggleRecipeStep(recipeId, Number(stepIndex));
      });
    });

    root.querySelectorAll("[data-close-modal-button]").forEach((btn) => {
      btn.addEventListener("click", closeRecipeModal);
    });

    root.querySelectorAll("[data-close-modal]").forEach((overlay) => {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeRecipeModal();
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
            <div class="recipe-item">
              <button class="recipe" data-recipe-toggle="${r.id}" aria-expanded="${state.expandedRecipeId === r.id}">
                <div class="recipe-title">${r.title}</div>
                <div class="recipe-meta">${r.timeMin} min · ${Array.isArray(r.ingredients) ? r.ingredients.length : 0} ingredientes</div>
              </button>
              ${state.expandedRecipeId === r.id ? `
                <div class="recipe-details">
                  <div class="recipe-details-main">
                    <div class="recipe-summary">${summarizeIngredients(r.ingredients)}</div>
                    <div class="recipe-total">Total: ${r.timeMin} min</div>
                  </div>
                  <div class="recipe-details-side">
                    <span class="category-badge">${r.category || "Otro"}</span>
                    <button class="open-recipe" data-open-recipe="${r.id}">Abrir ficha</button>
                  </div>
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
        <p class="muted">Siguiente: mini-ficha y receta completa.</p>
      </section>
    `;
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.activeRecipeId) closeRecipeModal();
  });

  refreshBuildHash();
  render();
});
