document.addEventListener("DOMContentLoaded", () => {
  const state = {
    buildHash: "eb14443",
    view: "week",
    expandedRecipeId: null,
    activeModal: null,
    activeRecipeId: null,
    infoMessage: "",
    recipeChecks: {},
    weekPlan: [
      {
        day: "Lunes",
        lunch: [{ recipeId: "alb", title: "Albóndigas" }, { recipeId: "gaz", title: "Gazpacho" }],
        dinner: [{ title: "Tortilla" }, { title: "Ensalada" }]
      },
      {
        day: "Martes",
        lunch: [{ recipeId: "gaz", title: "Gazpacho" }, { title: "Pescado" }],
        dinner: [{ recipeId: "alb", title: "Albóndigas" }, { title: "Fruta" }]
      },
      {
        day: "Miércoles",
        lunch: [{ title: "Arroz" }, { title: "Verdura" }],
        dinner: [{ recipeId: "gaz", title: "Gazpacho" }, { title: "Yogur" }]
      },
      {
        day: "Jueves",
        lunch: [{ recipeId: "alb", title: "Albóndigas" }, { title: "Patata" }],
        dinner: [{ title: "Crema" }, { title: "Tostada" }]
      },
      {
        day: "Viernes",
        lunch: [{ recipeId: "gaz", title: "Gazpacho" }, { title: "Pollo" }],
        dinner: [{ title: "Sopa" }, { title: "Queso" }]
      },
      {
        day: "Sábado",
        lunch: [{ recipeId: "alb", title: "Albóndigas" }, { title: "Ensalada" }],
        dinner: [{ title: "Pizza" }, { title: "Helado" }]
      },
      {
        day: "Domingo",
        lunch: [{ title: "Paella" }, { title: "Gazpacho" }],
        dinner: [{ title: "Caldo" }, { title: "Fruta" }]
      }
    ],
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
  const BUILD_FALLBACK = "eb14443";

  function getRecipe(recipeId) {
    return state.recipes.find((recipe) => recipe.id === recipeId);
  }

  function findRecipeByTitle(title) {
    if (!title) return null;
    const normalized = title.trim().toLocaleLowerCase("es");
    return state.recipes.find((recipe) => recipe.title.trim().toLocaleLowerCase("es") === normalized) || null;
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
    state.activeModal = "recipe";
    state.activeRecipeId = recipeId;
    render();
  }

  function openToolsModal() {
    state.activeModal = "tools";
    state.infoMessage = "";
    render();
  }

  function openInfoModal(message) {
    state.activeModal = "info";
    state.infoMessage = message;
    render();
  }

  function closeActiveModal() {
    state.activeModal = null;
    state.activeRecipeId = null;
    state.infoMessage = "";
    render();
  }

  function reloadApp() {
    try {
      sessionStorage.clear();
    } catch (error) {
      // No pasa nada si sessionStorage no esta disponible.
    }
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(Date.now()));
    window.location.replace(url.toString());
  }

  function resolveRecipeId(entry) {
    if (!entry) return null;
    if (entry.recipeId && getRecipe(entry.recipeId)) return entry.recipeId;
    const matchedRecipe = findRecipeByTitle(entry.title);
    return matchedRecipe ? matchedRecipe.id : null;
  }

  function openWeekPlate(entry) {
    const recipeId = resolveRecipeId(entry);
    if (recipeId) {
      openRecipeModal(recipeId);
      return;
    }
    openInfoModal("No hay receta vinculada aun");
  }

  function toggleRecipeStep(recipeId, stepIndex) {
    if (!state.recipeChecks[recipeId]) state.recipeChecks[recipeId] = {};
    state.recipeChecks[recipeId][stepIndex] = !state.recipeChecks[recipeId][stepIndex];
  }

  function renderRecipeModal() {
    const recipe = getRecipe(state.activeRecipeId);
    if (!recipe || state.activeModal !== "recipe") return "";

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

  function renderToolsModal() {
    if (state.activeModal !== "tools") return "";

    return `
      <div class="modal-overlay" data-close-modal>
        <div class="modal-card modal-card-compact" role="dialog" aria-modal="true" aria-labelledby="tools-modal-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="tools-modal-title">Herramientas</h2>
              <div class="modal-time">Atajos utiles para esta instalacion</div>
            </div>
          </div>

          <div class="modal-body modal-body-compact">
            <div class="tool-list">
              <button class="tool-item" data-tool-action="refresh">
                <span class="tool-title">Actualizar (recarga limpia)</span>
                <span class="tool-subtitle">Recarga la app con una version nueva en la URL</span>
              </button>
              <button class="tool-item" data-tool-action="preferences">
                <span class="tool-title">Preferencias</span>
                <span class="tool-subtitle">Proximamente</span>
              </button>
            </div>
          </div>

          <div class="modal-actions">
            <button class="primary close-modal" data-close-modal-button>Cerrar</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderInfoModal() {
    if (state.activeModal !== "info") return "";

    return `
      <div class="modal-overlay" data-close-modal>
        <div class="modal-card modal-card-compact" role="dialog" aria-modal="true" aria-labelledby="info-modal-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="info-modal-title">Aviso</h2>
            </div>
          </div>

          <div class="modal-body modal-body-compact">
            <div class="modal-item">${state.infoMessage || "Proximamente"}</div>
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

    document.body.classList.toggle("modal-open", Boolean(state.activeModal));

    root.innerHTML = `
      <header class="topbar">
        <div class="topbar-head">
          <div class="title">Mi Cocina</div>
          <div class="topbar-tools">
            <div class="build-badge">Build: ${state.buildHash}</div>
            <button class="icon-button" data-open-tools aria-label="Herramientas">⚙️</button>
          </div>
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
      ${renderToolsModal()}
      ${renderInfoModal()}
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

    root.querySelectorAll("[data-open-tools]").forEach((btn) => {
      btn.addEventListener("click", openToolsModal);
    });

    root.querySelectorAll("[data-step-toggle]").forEach((input) => {
      input.addEventListener("change", () => {
        const [recipeId, stepIndex] = input.getAttribute("data-step-toggle").split(":");
        toggleRecipeStep(recipeId, Number(stepIndex));
      });
    });

    root.querySelectorAll("[data-week-recipe]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openWeekPlate({
          recipeId: btn.getAttribute("data-recipe-id") || "",
          title: btn.getAttribute("data-title") || ""
        });
      });
    });

    root.querySelectorAll("[data-tool-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-tool-action");
        if (action === "refresh") reloadApp();
        if (action === "preferences") openInfoModal("Proximamente");
      });
    });

    root.querySelectorAll("[data-close-modal-button]").forEach((btn) => {
      btn.addEventListener("click", closeActiveModal);
    });

    root.querySelectorAll("[data-close-modal]").forEach((overlay) => {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeActiveModal();
      });
    });
  }

  function renderWeek() {
    return `
      <section class="card">
        <h2>Semana (base)</h2>
        <p class="muted">Los platos ya se pueden tocar para abrir su ficha si estan vinculados a una receta.</p>
        <div class="week-grid">
          ${state.weekPlan.map((dayPlan) => `
            <div class="day">
              <div class="day-title">${dayPlan.day}</div>
              <div class="slot slot-meal">
                <span>Comida</span>
                <div class="meal-plates">
                  ${dayPlan.lunch.map((plate, index) => `
                    <button
                      class="meal-plate"
                      data-week-recipe
                      data-recipe-id="${plate.recipeId || ""}"
                      data-title="${plate.title || ""}"
                    >
                      <span class="meal-plate-index">P${index + 1}</span>
                      <span class="meal-plate-title">${plate.title || "Sin plato"}</span>
                    </button>
                  `).join("")}
                </div>
              </div>
              <div class="slot slot-meal">
                <span>Cena</span>
                <div class="meal-plates">
                  ${dayPlan.dinner.map((plate, index) => `
                    <button
                      class="meal-plate"
                      data-week-recipe
                      data-recipe-id="${plate.recipeId || ""}"
                      data-title="${plate.title || ""}"
                    >
                      <span class="meal-plate-index">P${index + 1}</span>
                      <span class="meal-plate-title">${plate.title || "Sin plato"}</span>
                    </button>
                  `).join("")}
                </div>
              </div>
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
    if (event.key === "Escape" && state.activeModal) closeActiveModal();
  });

  refreshBuildHash();
  render();
});
