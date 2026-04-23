document.addEventListener("DOMContentLoaded", () => {
  const WEEKDAY_SHORT = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const WORK_STATUS_OPTIONS = ["Mañana", "Tarde", "Dobla", "Guardia", "Libre"];
  const DEFAULT_WEEK_TEMPLATE = [
    { lunch: ["alb", "gaz"], dinner: [null, null], workStatus: "Mañana" },
    { lunch: ["gaz", null], dinner: ["alb", null], workStatus: "Tarde" },
    { lunch: [null, null], dinner: ["gaz", null], workStatus: "Dobla" },
    { lunch: ["alb", null], dinner: [null, null], workStatus: "Guardia" },
    { lunch: ["gaz", null], dinner: [null, null], workStatus: "Mañana" },
    { lunch: ["alb", null], dinner: [null, null], workStatus: "Libre" },
    { lunch: [null, null], dinner: [null, null], workStatus: "Libre" }
  ];

  function startOfLocalDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function toISODate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function fromISODate(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function addDays(date, days) {
    const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
  }

  function getWeekStartDate(date) {
    const current = startOfLocalDay(date);
    const dayIndex = (current.getDay() + 6) % 7;
    return addDays(current, -dayIndex);
  }

  function getCurrentWeekStartISO() {
    return toISODate(getWeekStartDate(new Date()));
  }

  function createEmptyDayPlan() {
    return {
      lunch: [null, null],
      dinner: [null, null],
      workStatus: "Mañana"
    };
  }

  const state = {
    buildHash: "8c3fe90",
    view: "week",
    weekStartISO: getCurrentWeekStartISO(),
    expandedRecipeId: null,
    activeModal: null,
    activeRecipeId: null,
    infoMessage: "",
    selectorOpen: { open: false, dateISO: "", meal: "lunch", index: 0 },
    recipeQuery: "",
    pendingWeekScroll: true,
    recipeChecks: {},
    plans: {},
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
  const BUILD_FALLBACK = "8c3fe90";

  function ensureWeekPlan(weekStartISO, template) {
    if (state.plans[weekStartISO]) return state.plans[weekStartISO];

    const weekStartDate = fromISODate(weekStartISO);
    const days = {};

    for (let index = 0; index < 7; index += 1) {
      const dateISO = toISODate(addDays(weekStartDate, index));
      const templateDay = template && template[index];
      days[dateISO] = {
        lunch: templateDay?.lunch ? [...templateDay.lunch] : [null, null],
        dinner: templateDay?.dinner ? [...templateDay.dinner] : [null, null],
        workStatus: templateDay?.workStatus || "Mañana"
      };
    }

    state.plans[weekStartISO] = { days };
    return state.plans[weekStartISO];
  }

  function getWeekPlan(weekStartISO) {
    return ensureWeekPlan(weekStartISO);
  }

  function getWeekDates(weekStartISO) {
    const weekStartDate = fromISODate(weekStartISO);
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStartDate, index);
      return {
        index,
        date,
        dateISO: toISODate(date)
      };
    });
  }

  function formatWeekRange(weekStartISO) {
    const [start, end] = [fromISODate(weekStartISO), addDays(fromISODate(weekStartISO), 6)];
    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();

    if (sameMonth) {
      return `Semana: ${start.getDate()}-${end.getDate()} ${MONTH_SHORT[end.getMonth()]} ${end.getFullYear()}`;
    }

    if (sameYear) {
      return `Semana: ${start.getDate()} ${MONTH_SHORT[start.getMonth()]}-${end.getDate()} ${MONTH_SHORT[end.getMonth()]} ${end.getFullYear()}`;
    }

    return `Semana: ${start.getDate()} ${MONTH_SHORT[start.getMonth()]} ${start.getFullYear()}-${end.getDate()} ${MONTH_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  }

  function formatDayLabel(date) {
    const weekdayIndex = (date.getDay() + 6) % 7;
    return `${WEEKDAY_SHORT[weekdayIndex]} ${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
  }

  function isCurrentWeek(weekStartISO) {
    return weekStartISO === getCurrentWeekStartISO();
  }

  function getRecipe(recipeId) {
    return state.recipes.find((recipe) => recipe.id === recipeId);
  }

  function findRecipeByTitle(title) {
    if (!title) return null;
    const normalized = title.trim().toLocaleLowerCase("es");
    return state.recipes.find((recipe) => recipe.title.trim().toLocaleLowerCase("es") === normalized) || null;
  }

  function getPlateEntry(recipeId) {
    const recipe = recipeId ? getRecipe(recipeId) : null;
    return {
      recipeId: recipe ? recipe.id : "",
      title: recipe ? recipe.title : "Sin plato"
    };
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
    state.selectorOpen = { open: false, dateISO: "", meal: "lunch", index: 0 };
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

  function openRecipeSelector(dateISO, meal, index) {
    state.activeModal = "recipe-selector";
    state.activeRecipeId = null;
    state.recipeQuery = "";
    state.selectorOpen = { open: true, dateISO, meal, index };
    render();
  }

  function closeActiveModal() {
    state.activeModal = null;
    state.activeRecipeId = null;
    state.infoMessage = "";
    state.selectorOpen = { open: false, dateISO: "", meal: "lunch", index: 0 };
    state.recipeQuery = "";
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

  function assignRecipeToSlot(dateISO, meal, index, recipeId) {
    const weekPlan = getWeekPlan(state.weekStartISO);
    if (!weekPlan.days[dateISO]) weekPlan.days[dateISO] = createEmptyDayPlan();
    weekPlan.days[dateISO][meal][index] = recipeId;
    closeActiveModal();
  }

  function clearRecipeSlot(dateISO, meal, index) {
    assignRecipeToSlot(dateISO, meal, index, null);
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

  function renderRecipeSelectorModal() {
    if (state.activeModal !== "recipe-selector" || !state.selectorOpen.open) return "";

    const recipes = [...state.recipes]
      .sort((a, b) => a.title.localeCompare(b.title, "es"))
      .filter((recipe) => recipe.title.toLocaleLowerCase("es").includes(state.recipeQuery.trim().toLocaleLowerCase("es")));

    return `
      <div class="modal-overlay" data-close-modal>
        <div class="modal-card modal-card-compact" role="dialog" aria-modal="true" aria-labelledby="recipe-selector-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="recipe-selector-title">Elegir receta</h2>
              <div class="modal-time">Selecciona una receta para este plato</div>
            </div>
          </div>

          <div class="modal-body">
            <div class="selector-search">
              <input class="selector-input" type="search" placeholder="Buscar receta" value="${state.recipeQuery}" data-recipe-query>
            </div>
            <div class="selector-list">
              ${recipes.length ? recipes.map((recipe) => `
                <button class="selector-item" data-assign-recipe="${recipe.id}">
                  <span class="selector-item-title">${recipe.title}</span>
                  <span class="selector-item-meta">${recipe.category || "Otro"} · ${recipe.timeMin || 0} min</span>
                </button>
              `).join("") : `
                <div class="modal-item">No hay recetas para esa busqueda</div>
              `}
            </div>
          </div>

          <div class="modal-actions modal-actions-stack">
            <button class="open-recipe selector-clear" data-clear-slot>Vaciar plato</button>
            <button class="primary close-modal" data-close-modal-button>Cerrar</button>
          </div>
        </div>
      </div>
    `;
  }

  function scheduleWeekScroll() {
    if (state.view !== "week" || !state.pendingWeekScroll) return;
    state.pendingWeekScroll = false;
    if (!isCurrentWeek(state.weekStartISO)) return;

    const todayISO = toISODate(startOfLocalDay(new Date()));
    requestAnimationFrame(() => {
      const dayElement = document.getElementById(`day-${todayISO}`);
      if (dayElement) {
        dayElement.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    });
  }

  function scheduleSelectorFocus() {
    if (state.activeModal !== "recipe-selector") return;
    requestAnimationFrame(() => {
      const input = document.querySelector("[data-recipe-query]");
      if (!input) return;
      input.focus();
      const queryLength = input.value.length;
      input.setSelectionRange(queryLength, queryLength);
    });
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
      ${renderRecipeSelectorModal()}
      ${renderToolsModal()}
      ${renderInfoModal()}
    `;

    root.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextView = btn.getAttribute("data-view");
        if (nextView === "week" && state.view !== "week") state.pendingWeekScroll = true;
        state.view = nextView;
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

    root.querySelectorAll("[data-week-nav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const direction = btn.getAttribute("data-week-nav") === "next" ? 7 : -7;
        const nextWeekStart = addDays(fromISODate(state.weekStartISO), direction);
        state.weekStartISO = toISODate(nextWeekStart);
        ensureWeekPlan(state.weekStartISO);
        state.pendingWeekScroll = true;
        render();
      });
    });

    root.querySelectorAll("[data-step-toggle]").forEach((input) => {
      input.addEventListener("change", () => {
        const [recipeId, stepIndex] = input.getAttribute("data-step-toggle").split(":");
        toggleRecipeStep(recipeId, Number(stepIndex));
      });
    });

    root.querySelectorAll("[data-open-recipe-selector]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openRecipeSelector(
          btn.getAttribute("data-date-iso") || "",
          btn.getAttribute("data-meal") || "lunch",
          Number(btn.getAttribute("data-index") || 0)
        );
      });
    });

    root.querySelectorAll("[data-view-week-recipe]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const recipeId = btn.getAttribute("data-view-week-recipe");
        if (recipeId) openRecipeModal(recipeId);
      });
    });

    root.querySelectorAll("[data-work-status]").forEach((select) => {
      select.addEventListener("change", () => {
        const weekPlan = getWeekPlan(state.weekStartISO);
        const dateISO = select.getAttribute("data-work-status");
        if (!dateISO || !weekPlan.days[dateISO]) return;
        weekPlan.days[dateISO].workStatus = select.value;
      });
    });

    root.querySelectorAll("[data-recipe-query]").forEach((input) => {
      input.addEventListener("input", () => {
        state.recipeQuery = input.value;
        render();
      });
    });

    root.querySelectorAll("[data-assign-recipe]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const { dateISO, meal, index } = state.selectorOpen;
        assignRecipeToSlot(dateISO, meal, index, btn.getAttribute("data-assign-recipe"));
      });
    });

    root.querySelectorAll("[data-clear-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const { dateISO, meal, index } = state.selectorOpen;
        clearRecipeSlot(dateISO, meal, index);
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

    scheduleWeekScroll();
    scheduleSelectorFocus();
  }

  function renderWeek() {
    const weekPlan = getWeekPlan(state.weekStartISO);
    const orderedWeekDates = getWeekDates(state.weekStartISO);
    const todayISO = toISODate(startOfLocalDay(new Date()));

    return `
      <section class="card">
        <div class="week-picker">
          <button class="week-nav" data-week-nav="prev" aria-label="Semana anterior">◀</button>
          <div class="week-range">${formatWeekRange(state.weekStartISO)}</div>
          <button class="week-nav" data-week-nav="next" aria-label="Semana siguiente">▶</button>
        </div>
        <p class="muted">Los platos ya se pueden tocar para abrir su ficha si estan vinculados a una receta.</p>
        <div class="week-grid">
          ${orderedWeekDates.map(({ date, dateISO }) => {
            const dayPlan = weekPlan.days[dateISO] || createEmptyDayPlan();
            const isToday = dateISO === todayISO && isCurrentWeek(state.weekStartISO);

            return `
            <div class="day" id="day-${dateISO}">
              <div class="day-head">
                <div class="day-title">${formatDayLabel(date)}</div>
                ${isToday ? `<span class="today-badge">HOY</span>` : ""}
              </div>
              <div class="day-year">${date.getFullYear()}</div>
              <div class="slot slot-meal">
                <span>Comida</span>
                <div class="meal-plates">
                  ${dayPlan.lunch.map((recipeId, index) => {
                    const plate = getPlateEntry(recipeId);
                    return `
                    <div class="meal-plate">
                      <button
                        class="meal-plate-main"
                        data-open-recipe-selector
                        data-date-iso="${dateISO}"
                        data-meal="lunch"
                        data-index="${index}"
                      >
                        <span class="meal-plate-index">P${index + 1}</span>
                        <span class="meal-plate-title ${plate.recipeId ? "" : "meal-plate-empty"}">${plate.recipeId ? plate.title : "+ Añadir"}</span>
                      </button>
                      ${plate.recipeId ? `
                        <button class="meal-plate-view" data-view-week-recipe="${plate.recipeId}">Ver</button>
                      ` : ""}
                    </div>
                  `;
                  }).join("")}
                </div>
              </div>
              <div class="slot slot-meal">
                <span>Cena</span>
                <div class="meal-plates">
                  ${dayPlan.dinner.map((recipeId, index) => {
                    const plate = getPlateEntry(recipeId);
                    return `
                    <div class="meal-plate">
                      <button
                        class="meal-plate-main"
                        data-open-recipe-selector
                        data-date-iso="${dateISO}"
                        data-meal="dinner"
                        data-index="${index}"
                      >
                        <span class="meal-plate-index">P${index + 1}</span>
                        <span class="meal-plate-title ${plate.recipeId ? "" : "meal-plate-empty"}">${plate.recipeId ? plate.title : "+ Añadir"}</span>
                      </button>
                      ${plate.recipeId ? `
                        <button class="meal-plate-view" data-view-week-recipe="${plate.recipeId}">Ver</button>
                      ` : ""}
                    </div>
                  `;
                  }).join("")}
                </div>
              </div>
              <div class="slot"><span>Turno</span>
                <select class="select" data-work-status="${dateISO}">
                  ${WORK_STATUS_OPTIONS.map((option) => `
                    <option value="${option}" ${dayPlan.workStatus === option ? "selected" : ""}>${option}</option>
                  `).join("")}
                </select>
              </div>
            </div>
          `;
          }).join("")}
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

  ensureWeekPlan(state.weekStartISO, DEFAULT_WEEK_TEMPLATE);
  refreshBuildHash();
  render();
});
