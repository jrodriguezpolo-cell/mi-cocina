document.addEventListener("DOMContentLoaded", () => {
  const WEEKDAY_SHORT = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const CATEGORY_OPTIONS = ["Legumbre", "Pescado", "Verdura", "Carne", "Otro"];
  const WORK_STATUS_OPTIONS = ["Mañana", "Tarde", "Dobla", "Guardia", "Libre"];
  const DEFAULT_PREFS = {
    repeatWindowWeeks: 2,
    quotas: { Legumbre: 2, Pescado: 2, Verdura: 3, Carne: 2, Otro: 5 },
    comensalesPorDefecto: 5
  };
  const DEFAULT_WEEK_TEMPLATE = [
    { lunch: ["alb", "gaz"], dinner: [null, null], workStatus: "Mañana" },
    { lunch: ["gaz", null], dinner: ["alb", null], workStatus: "Tarde" },
    { lunch: [null, null], dinner: ["gaz", null], workStatus: "Dobla" },
    { lunch: ["alb", null], dinner: [null, null], workStatus: "Guardia" },
    { lunch: ["gaz", null], dinner: [null, null], workStatus: "Mañana" },
    { lunch: ["alb", null], dinner: [null, null], workStatus: "Libre" },
    { lunch: [null, null], dinner: [null, null], workStatus: "Libre" }
  ];
  const RECIPES_STORAGE_KEY = "miCocina_recipes_v1";
  const PLANS_STORAGE_KEY = "miCocina_plans_v1";
  const PREFS_STORAGE_KEY = "miCocina_prefs_v1";
  const MINI_CARD_PREVIEW_LIMIT = 8;
  const NUTRITION_DB = {
    "arroz": { basis: "100g", kcal: 130, p: 2.7, c: 28, f: 0.3 },
    "pasta": { basis: "100g", kcal: 131, p: 5, c: 25, f: 1.1 },
    "pollo": { basis: "100g", kcal: 165, p: 31, c: 0, f: 3.6 },
    "pimiento": { basis: "100g", kcal: 31, p: 1, c: 6, f: 0.3 },
    "limon": { basis: "100g", kcal: 29, p: 1.1, c: 9, f: 0.3 },
    "yogur": { basis: "100g", kcal: 59, p: 3.5, c: 3.3, f: 0.4 },
    "aceite": { basis: "100g", kcal: 884, p: 0.0, c: 0.0, f: 100.0 },
    "cebolla": { basis: "100g", kcal: 40, p: 1.1, c: 9.3, f: 0.1 },
    "huevo": { basis: "100g", kcal: 143, p: 13.0, c: 1.1, f: 9.5 },
    "ajo": { basis: "100g", kcal: 149, p: 6.4, c: 33.1, f: 0.5 },
    "sal": { basis: "100g", kcal: 0, p: 0.0, c: 0.0, f: 0.0 },
    "perejil": { basis: "100g", kcal: 36, p: 3.0, c: 6.3, f: 0.8 },
    "vinagre": { basis: "100ml", kcal: 3, p: 0.0, c: 0.1, f: 0.0 },
    "harina": { basis: "100g", kcal: 364, p: 10.0, c: 76.0, f: 1.0 },
    "caldo": { basis: "100g", kcal: 250, p: 10.0, c: 20.0, f: 15.0 },
    "guisantes": { basis: "100g", kcal: 81, p: 5.4, c: 14.5, f: 0.4 },
    "zanahoria": { basis: "100g", kcal: 41, p: 0.9, c: 9.6, f: 0.2 },
    "leche": { basis: "100ml", kcal: 47, p: 3.3, c: 4.8, f: 1.6 },
    "tomate frito": { basis: "100g", kcal: 85, p: 1.5, c: 10.0, f: 4.0 },
    "vino blanco": { basis: "100ml", kcal: 70, p: 0.0, c: 2.5, f: 0.0 },
    "azucar": { basis: "100g", kcal: 387, p: 0.0, c: 100.0, f: 0.0 },
    "patata": { basis: "100g", kcal: 77, p: 2.0, c: 17.0, f: 0.1 },
    "atun": { basis: "100g", kcal: 116, p: 26.0, c: 0.0, f: 1.0 },
    "laurel": { basis: "100g", kcal: 313, p: 7.6, c: 75.0, f: 8.4 },
    "garbanzos": { basis: "100g", kcal: 164, p: 8.9, c: 27.4, f: 2.6 },
    "tomate": { basis: "100g", kcal: 18, p: 0.9, c: 3.9, f: 0.2 }
  };
  const DEFAULT_RECIPES = [
    {
      id: "alb",
      title: "Albóndigas",
      category: "Carne",
      allowLunch: true,
      allowDinner: true,
      isWildcard: false,
      isActive: true,
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
      allowLunch: true,
      allowDinner: true,
      isWildcard: false,
      isActive: true,
      timeMin: 15,
      ingredients: [
        { qty: 1, unit: "kg", name: "Tomate" },
        { qty: 1, unit: "ud", name: "Pepino" },
        { name: "Ajo" }
      ],
      steps: ["Triturar todos los ingredientes", "Enfriar antes de servir"]
    },
    {
      id: "len",
      title: "Lentejas",
      category: "Legumbre",
      allowLunch: true,
      allowDinner: false,
      isWildcard: false,
      isActive: true,
      timeMin: 55,
      ingredients: [{ name: "Lentejas" }, { name: "Zanahoria" }, { name: "Patata" }],
      steps: ["Cocer las lentejas", "Añadir verduras", "Reposar antes de servir"]
    },
    {
      id: "gar",
      title: "Garbanzos guisados",
      category: "Legumbre",
      allowLunch: true,
      allowDinner: false,
      isWildcard: false,
      isActive: true,
      timeMin: 60,
      ingredients: [{ name: "Garbanzos" }, { name: "Tomate" }, { name: "Pimiento" }],
      steps: ["Preparar sofrito", "Cocer garbanzos", "Dejar espesar"]
    },
    {
      id: "ata",
      title: "Ensalada con atun",
      category: "Pescado",
      allowLunch: false,
      allowDinner: true,
      isWildcard: false,
      isActive: true,
      timeMin: 12,
      ingredients: [{ name: "Lechuga" }, { name: "Atun" }, { name: "Tomate" }],
      steps: ["Cortar verduras", "Añadir atun", "Aliñar al gusto"]
    },
    {
      id: "sal",
      title: "Salmon a la plancha",
      category: "Pescado",
      allowLunch: false,
      allowDinner: true,
      isWildcard: false,
      isActive: true,
      timeMin: 20,
      ingredients: [{ name: "Salmon" }, { name: "Limon" }, { name: "Especias" }],
      steps: ["Sazonar salmon", "Marcar a la plancha", "Servir con limon"]
    },
    {
      id: "pol",
      title: "Pollo al horno",
      category: "Carne",
      allowLunch: true,
      allowDinner: false,
      isWildcard: false,
      isActive: true,
      timeMin: 70,
      ingredients: [{ name: "Pollo" }, { name: "Patata" }, { name: "Ajo" }],
      steps: ["Preparar bandeja", "Hornear", "Reposar unos minutos"]
    },
    {
      id: "ver",
      title: "Verduras salteadas",
      category: "Verdura",
      allowLunch: false,
      allowDinner: true,
      isWildcard: false,
      isActive: true,
      timeMin: 18,
      ingredients: [{ name: "Calabacin" }, { name: "Pimiento" }, { name: "Cebolla" }],
      steps: ["Cortar verduras", "Saltear", "Ajustar sal"]
    },
    {
      id: "pas",
      title: "Pasta con tomate",
      category: "Otro",
      allowLunch: true,
      allowDinner: true,
      isWildcard: false,
      isActive: true,
      timeMin: 25,
      ingredients: [{ name: "Pasta" }, { name: "Tomate" }, { name: "Queso" }],
      steps: ["Cocer pasta", "Preparar salsa", "Mezclar y servir"]
    },
    {
      id: "arr",
      title: "Arroz a la cubana",
      category: "Otro",
      allowLunch: true,
      allowDinner: false,
      isWildcard: true,
      isActive: true,
      timeMin: 30,
      ingredients: [{ name: "Arroz" }, { name: "Tomate" }, { name: "Huevo" }],
      steps: ["Cocer arroz", "Freir huevo", "Servir con tomate"]
    },
    {
      id: "tor",
      title: "Tortilla francesa",
      category: "Otro",
      allowLunch: false,
      allowDinner: true,
      isWildcard: false,
      isActive: true,
      timeMin: 10,
      ingredients: [{ name: "Huevo" }, { name: "Sal" }],
      steps: ["Batir huevos", "Cuajar en sarten"]
    },
    {
      id: "mer",
      title: "Merluza al horno",
      category: "Pescado",
      allowLunch: true,
      allowDinner: true,
      isWildcard: false,
      isActive: true,
      timeMin: 35,
      ingredients: [{ name: "Merluza" }, { name: "Patata" }, { name: "Ajo" }],
      steps: [
        { text: "Precalentar el horno", tempC: 200, minutes: 10, note: "Calor arriba y abajo" },
        { text: "Hornear la merluza", tempC: 200, minutes: 18, note: "Dar la vuelta a mitad si el corte es grueso" },
        { text: "Reposo", minutes: 3 }
      ]
    },
    {
      id: "ens",
      title: "Ensalada templada",
      category: "Verdura",
      allowLunch: false,
      allowDinner: true,
      isWildcard: false,
      isActive: true,
      timeMin: 15,
      ingredients: [{ name: "Brotes" }, { name: "Setas" }, { name: "Queso" }],
      steps: ["Saltear setas", "Montar ensalada", "Aliñar"]
    },
    {
      id: "cre",
      title: "Crema de calabacin",
      category: "Verdura",
      allowLunch: true,
      allowDinner: true,
      isWildcard: false,
      isActive: true,
      timeMin: 28,
      ingredients: [{ name: "Calabacin" }, { name: "Patata" }, { name: "Cebolla" }],
      steps: [
        { text: "Cocer verduras", minutes: 18, heat: "medio" },
        { text: "Triturar", minutes: 4, note: "Anadir agua si queda muy espesa" },
        { text: "Ajustar textura", minutes: 2 }
      ]
    },
    {
      id: "cer",
      title: "Cerdo con pimientos",
      category: "Carne",
      allowLunch: true,
      allowDinner: false,
      isWildcard: false,
      isActive: true,
      timeMin: 32,
      ingredients: [{ name: "Cerdo" }, { name: "Pimientos" }, { name: "Cebolla" }],
      steps: ["Marcar carne", "Añadir verduras", "Terminar coccion"]
    },
    {
      id: "hum",
      title: "Hummus con crudites",
      category: "Legumbre",
      allowLunch: true,
      allowDinner: false,
      isWildcard: false,
      isActive: true,
      timeMin: 14,
      ingredients: [{ name: "Garbanzos" }, { name: "Tahini" }, { name: "Zanahoria" }],
      steps: ["Triturar hummus", "Preparar crudites", "Servir frio"]
    }
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
    const defaultPeople = DEFAULT_PREFS.comensalesPorDefecto;
    return {
      lunch: [null, null],
      dinner: [null, null],
      workStatus: "Mañana",
      lunchPeople: defaultPeople,
      dinnerPeople: defaultPeople,
      lunchPeopleOverridden: false,
      dinnerPeopleOverridden: false
    };
  }

  function getDefaultPeopleByWorkStatus(workStatus, defaultPeople) {
    if (workStatus === "Guardia") return { lunchPeople: 4, dinnerPeople: 4 };
    if (workStatus === "Dobla") return { lunchPeople: 4, dinnerPeople: defaultPeople };
    return { lunchPeople: defaultPeople, dinnerPeople: defaultPeople };
  }

  function getNormalizedDefaultPeople(workStatus, prefs = DEFAULT_PREFS) {
    const defaultPeople = Number.isFinite(Number(prefs?.comensalesPorDefecto)) ? Math.max(1, Number(prefs.comensalesPorDefecto)) : 5;
    return getDefaultPeopleByWorkStatus(workStatus || "Mañana", defaultPeople);
  }

  function normalizeRecipeId(id, index) {
    if (id || id === 0) return String(id);
    return `recipe-${Date.now()}-${index}`;
  }

  function normalizeStep(step) {
    if (typeof step === "string") return { text: step };
    return {
      text: step?.text || "",
      minutes: step?.minutes,
      tempC: step?.tempC,
      heat: step?.heat,
      note: step?.note || ""
    };
  }

  function normalizeRecipe(recipe, index) {
    return {
      id: normalizeRecipeId(recipe?.id, index),
      title: String(recipe?.title || "").trim(),
      category: CATEGORY_OPTIONS.includes(recipe?.category) ? recipe.category : "Otro",
      allowLunch: recipe?.allowLunch !== false,
      allowDinner: recipe?.allowDinner !== false,
      isWildcard: Boolean(recipe?.isWildcard),
      isActive: recipe?.isActive !== false,
      servingsBase: Number.isFinite(Number(recipe?.servingsBase)) ? Math.max(1, Number(recipe.servingsBase)) : 5,
      kcalPerServing: recipe?.kcalPerServing === "" || recipe?.kcalPerServing === null || recipe?.kcalPerServing === undefined
        ? null
        : (Number.isFinite(Number(recipe?.kcalPerServing)) ? Math.max(0, Number(recipe.kcalPerServing)) : null),
      timeMin: Number.isFinite(Number(recipe?.timeMin)) ? Math.max(0, Number(recipe.timeMin)) : 0,
      ingredients: Array.isArray(recipe?.ingredients)
        ? recipe.ingredients.filter((ingredient) => Boolean(formatIngredient(ingredient).trim()))
        : [],
      steps: Array.isArray(recipe?.steps)
        ? recipe.steps.map(normalizeStep).filter((stepEntry) => stepEntry.text.trim())
        : []
    };
  }

  function normalizeRecipes(recipes) {
    return Array.isArray(recipes) ? recipes.map((recipe, index) => normalizeRecipe(recipe, index)) : [];
  }

  function normalizePrefs(prefs) {
    return {
      repeatWindowWeeks: Number.isFinite(Number(prefs?.repeatWindowWeeks)) ? clamp(Number(prefs.repeatWindowWeeks), 1, 4) : DEFAULT_PREFS.repeatWindowWeeks,
      quotas: {
        ...DEFAULT_PREFS.quotas,
        ...Object.fromEntries(
          CATEGORY_OPTIONS.map((category) => [
            category,
            Number.isFinite(Number(prefs?.quotas?.[category])) ? clamp(Number(prefs.quotas[category]), 0, 28) : DEFAULT_PREFS.quotas[category]
          ])
        )
      },
      comensalesPorDefecto: Number.isFinite(Number(prefs?.comensalesPorDefecto))
        ? Math.max(1, Number(prefs.comensalesPorDefecto))
        : DEFAULT_PREFS.comensalesPorDefecto
    };
  }

  function loadStoredPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      if (!raw) return normalizePrefs(DEFAULT_PREFS);
      return normalizePrefs(JSON.parse(raw));
    } catch (error) {
      return normalizePrefs(DEFAULT_PREFS);
    }
  }

  function normalizeDayPlan(dayPlan, prefs = DEFAULT_PREFS) {
    const lunch = Array.isArray(dayPlan?.lunch) ? dayPlan.lunch.slice(0, 2).map((recipeId) => (recipeId ? String(recipeId) : null)) : [];
    const dinner = Array.isArray(dayPlan?.dinner) ? dayPlan.dinner.slice(0, 2).map((recipeId) => (recipeId ? String(recipeId) : null)) : [];
    const workStatus = dayPlan?.workStatus || "Mañana";
    const defaults = getNormalizedDefaultPeople(workStatus, prefs);

    while (lunch.length < 2) lunch.push(null);
    while (dinner.length < 2) dinner.push(null);

    return {
      lunch,
      dinner,
      workStatus,
      lunchPeople: Number.isFinite(Number(dayPlan?.lunchPeople)) ? Math.max(1, Number(dayPlan.lunchPeople)) : defaults.lunchPeople,
      dinnerPeople: Number.isFinite(Number(dayPlan?.dinnerPeople)) ? Math.max(1, Number(dayPlan.dinnerPeople)) : defaults.dinnerPeople,
      lunchPeopleOverridden: Boolean(dayPlan?.lunchPeopleOverridden),
      dinnerPeopleOverridden: Boolean(dayPlan?.dinnerPeopleOverridden)
    };
  }

  function normalizeWeekPlan(plan, prefs = DEFAULT_PREFS) {
    const normalizedDays = {};
    const sourceDays = plan?.days && typeof plan.days === "object" ? plan.days : {};

    Object.entries(sourceDays).forEach(([dateISO, dayPlan]) => {
      normalizedDays[dateISO] = normalizeDayPlan(dayPlan, prefs);
    });

    return { days: normalizedDays };
  }

  function loadStoredPlans(prefs = DEFAULT_PREFS) {
    try {
      const raw = localStorage.getItem(PLANS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};

      return Object.fromEntries(
        Object.entries(parsed).map(([weekStartISO, plan]) => [weekStartISO, normalizeWeekPlan(plan, prefs)])
      );
    } catch (error) {
      return {};
    }
  }

  function createRecipeDraft(recipe) {
    const source = recipe || {};
    const ingredients = Array.isArray(source.ingredients)
      ? source.ingredients.map((ingredient) => formatIngredient(ingredient)).filter(Boolean).join("\n")
      : "";
    const steps = Array.isArray(source.steps)
      ? source.steps.map((step) => normalizeStep(step).text.trim()).filter(Boolean).join("\n")
      : "";

    return {
      id: source.id ? String(source.id) : "",
      title: source.title || "",
      category: CATEGORY_OPTIONS.includes(source.category) ? source.category : "Otro",
      timeMin: source.timeMin || source.timeMin === 0 ? String(source.timeMin) : "",
      servingsBase: source.servingsBase || 5,
      kcalPerServing: source.kcalPerServing || source.kcalPerServing === 0 ? String(source.kcalPerServing) : "",
      ingredients,
      steps,
      allowLunch: source.allowLunch !== false,
      allowDinner: source.allowDinner !== false,
      isWildcard: Boolean(source.isWildcard),
      isActive: source.isActive !== false
    };
  }

  function buildRecipeFromDraft(draft) {
    const title = String(draft.title || "").trim();
    const timeValue = Number(draft.timeMin);

    return normalizeRecipe({
      id: draft.id || `recipe-${Date.now()}`,
      title,
      category: CATEGORY_OPTIONS.includes(draft.category) ? draft.category : "Otro",
      timeMin: Number.isFinite(timeValue) ? timeValue : 0,
      servingsBase: 5,
      kcalPerServing: draft.kcalPerServing === "" ? null : Number(draft.kcalPerServing),
      ingredients: String(draft.ingredients || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      steps: String(draft.steps || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      allowLunch: Boolean(draft.allowLunch),
      allowDinner: Boolean(draft.allowDinner),
      isWildcard: Boolean(draft.isWildcard),
      isActive: Boolean(draft.isActive)
    }, 0);
  }

  function loadStoredRecipes() {
    try {
      const raw = localStorage.getItem(RECIPES_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const normalized = normalizeRecipes(parsed);
      return normalized.length ? normalized : null;
    } catch (error) {
      return null;
    }
  }

  function formatIngredient(ingredient) {
    if (!ingredient) return "";
    if (typeof ingredient === "string") return ingredient;

    const parts = [];
    const qty = ingredient.qty ?? ingredient.quantity;
    const unit = ingredient.unit;
    const name = ingredient.name || ingredient.title || "";

    if (qty || qty === 0) parts.push(String(qty));
    if (unit) parts.push(unit);

    if (parts.length && name) return `${parts.join(" ")} · ${name}`;
    return name || parts.join(" ");
  }

  function normalizeIngredientName(name) {
    if (!name || typeof name !== "string") return "";
    let normalized = name.toLowerCase().trim();
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const aliasMap = {
      "aceite de oliva": "aceite",
      "avecrem": "caldo",
      "caldo concentrado": "caldo",
      "tomatefrito": "tomate frito"
    };
    
    if (aliasMap[normalized]) return aliasMap[normalized];
    
    if (normalized.endsWith("s") && normalized.length > 3) {
      const singular = normalized.slice(0, -1);
      if (NUTRITION_DB[singular]) return singular;
    }
    return normalized;
  }

  function calculateRecipeNutrition(recipe) {
    if (!recipe || !Array.isArray(recipe.ingredients)) {
      return { kcal: null, p: null, c: null, f: null, warnings: [] };
    }

    let totalKcal = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const warnings = [];
    let hasComputedAny = false;

    recipe.ingredients.forEach((ingredient) => {
      const qty = ingredient.qty ?? ingredient.quantity;
      const unit = ingredient.unit;
      const name = ingredient.name || "";

      const normalized = normalizeIngredientName(name);
      const nutritionData = NUTRITION_DB[normalized];

      if (!nutritionData) {
        if (name) warnings.push(`"${name}" no en tabla`);
        return;
      }

      const supportedUnits = {
        "g": 1, "gr": 1, "gramos": 1,
        "ml": 1, "mililitros": 1
      };

      if (!qty || qty < 0 || !unit || !supportedUnits[unit.toLowerCase()]) {
        if (name) warnings.push(`${name}: sin cantidad/unidad`);
        return;
      }

      hasComputedAny = true;
      const qtyInBase = Number(qty);
      const factor = qtyInBase / 100;

      totalKcal += nutritionData.kcal * factor;
      totalProtein += nutritionData.p * factor;
      totalCarbs += nutritionData.c * factor;
      totalFat += nutritionData.f * factor;
    });

    return {
      kcal: hasComputedAny ? Math.round(totalKcal) : null,
      p: hasComputedAny ? Math.round(totalProtein * 10) / 10 : null,
      c: hasComputedAny ? Math.round(totalCarbs * 10) / 10 : null,
      f: hasComputedAny ? Math.round(totalFat * 10) / 10 : null,
      warnings: warnings
    };
  }


  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getCurrentMonthISO() {
    const today = new Date();
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  }

  function monthISOToDate(monthISO) {
    const [year, month] = String(monthISO).split("-").map(Number);
    return new Date(year, (month || 1) - 1, 1);
  }

  function formatMonthLabel(monthISO) {
    const monthDate = monthISOToDate(monthISO);
    return `${MONTH_SHORT[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
  }

  function shiftMonthISO(monthISO, delta) {
    const monthDate = monthISOToDate(monthISO);
    monthDate.setMonth(monthDate.getMonth() + delta, 1);
    return `${monthDate.getFullYear()}-${pad(monthDate.getMonth() + 1)}`;
  }

  function isDateInMonth(dateISO, monthISO) {
    return dateISO.startsWith(`${monthISO}-`);
  }

  function formatWeekRangeShort(weekStartISO) {
    const start = fromISODate(weekStartISO);
    const end = addDays(start, 6);
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    const startLabel = `${start.getDate()} ${MONTH_SHORT[start.getMonth()]}`;
    const endLabel = sameMonth ? `${end.getDate()} ${MONTH_SHORT[end.getMonth()]}` : `${end.getDate()} ${MONTH_SHORT[end.getMonth()]}`;
    return `Semana ${startLabel}-${endLabel} ${end.getFullYear()}`;
  }

  const initialPrefs = loadStoredPrefs();

  const state = {
    buildHash: "53d7cd7",
    view: "week",
    weekStartISO: getCurrentWeekStartISO(),
    expandedRecipeId: null,
    expandedIngredientsAll: false,
    activeModal: null,
    activeRecipeId: null,
    infoMessage: "",
    selectorOpen: { open: false, dateISO: "", meal: "lunch", index: 0 },
    recipeQuery: "",
    prefQuery: "",
    pendingWeekScroll: true,
    recipeChecks: {},
    plans: loadStoredPlans(initialPrefs),
    prefs: initialPrefs,
    toastMessage: "",
    historyMonthISO: getCurrentMonthISO(),
    historyDetail: { type: "", value: "" },
    recipeDeleteId: null,
    activeRecipeContext: null,
    recipeEditor: {
      mode: "create",
      draft: createRecipeDraft()
    },
    recipes: loadStoredRecipes() || normalizeRecipes(DEFAULT_RECIPES)
  };

  const $ = (sel) => document.querySelector(sel);
  const BUILD_FALLBACK = "53d7cd7";
  let toastTimer = null;

  function saveRecipes() {
    try {
      localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(state.recipes));
    } catch (error) {
      showToast("No se pudo guardar en este navegador");
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(state.prefs));
    } catch (error) {
      showToast("No se pudieron guardar las preferencias");
    }
  }

  function savePlans() {
    try {
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(state.plans));
    } catch (error) {
      showToast("No se pudo guardar el historico");
    }
  }

  function ensureWeekPlan(weekStartISO, template) {
    if (state.plans[weekStartISO]) return state.plans[weekStartISO];

    const weekStartDate = fromISODate(weekStartISO);
    const days = {};

    for (let index = 0; index < 7; index += 1) {
      const dateISO = toISODate(addDays(weekStartDate, index));
      const templateDay = template && template[index];
      const workStatus = templateDay?.workStatus || "Mañana";
      const defaultPeople = getNormalizedDefaultPeople(workStatus);
      days[dateISO] = {
        lunch: templateDay?.lunch ? [...templateDay.lunch] : [null, null],
        dinner: templateDay?.dinner ? [...templateDay.dinner] : [null, null],
        workStatus,
        lunchPeople: defaultPeople.lunchPeople,
        dinnerPeople: defaultPeople.dinnerPeople,
        lunchPeopleOverridden: false,
        dinnerPeopleOverridden: false
      };
    }

    state.plans[weekStartISO] = { days };
    savePlans();
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

  function formatOccurrenceDate(dateISO) {
    const date = fromISODate(dateISO);
    const weekdayIndex = (date.getDay() + 6) % 7;
    return `${WEEKDAY_SHORT[weekdayIndex]} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  function getMealLabel(meal) {
    return meal === "dinner" ? "Cena" : "Comida";
  }

  function getMealIcon(meal) {
    return meal === "dinner" ? "🌙" : "🍽️";
  }

  function getPlateLabel(index) {
    return `P${Number(index) + 1}`;
  }

  function isCurrentWeek(weekStartISO) {
    return weekStartISO === getCurrentWeekStartISO();
  }

  function getRecipe(recipeId) {
    return state.recipes.find((recipe) => recipe.id === recipeId);
  }

  function getRecipeCategory(recipeId) {
    return getRecipe(recipeId)?.category || "Otro";
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
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

  function summarizeIngredients(ingredients) {
    if (!Array.isArray(ingredients) || !ingredients.length) return "Pendiente de completar";
    return ingredients.map((ingredient) => formatIngredient(ingredient)).filter(Boolean).join(", ");
  }

  function getIngredientLines(recipe, showAll) {
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.map(formatIngredient).filter(Boolean) : [];
    if (showAll || ingredients.length <= MINI_CARD_PREVIEW_LIMIT) {
      return { items: ingredients, hasMore: false };
    }
    return {
      items: ingredients.slice(0, MINI_CARD_PREVIEW_LIMIT),
      hasMore: true
    };
  }

  function openRecipeModal(recipeId, context = null) {
    if (!getRecipe(recipeId)) return;
    state.activeModal = "recipe";
    state.activeRecipeId = recipeId;
    state.activeRecipeContext = context;
    state.selectorOpen = { open: false, dateISO: "", meal: "lunch", index: 0 };
    render();
  }

  function openRecipeEditor(mode, recipeId) {
    const recipe = recipeId ? getRecipe(recipeId) : null;
    state.activeModal = "recipe-editor";
    state.activeRecipeId = recipe ? recipe.id : null;
    state.recipeEditor = {
      mode,
      draft: createRecipeDraft(recipe)
    };
    render();
  }

  function openToolsModal() {
    state.activeModal = "tools";
    state.infoMessage = "";
    render();
  }

  function openHistoryStatsModal() {
    state.activeModal = "history-stats";
    render();
  }

  function openHistoryRecipeDetail(recipeId) {
    state.historyDetail = { type: "recipe", value: recipeId };
    state.activeModal = "history-recipe-detail";
    render();
  }

  function openHistoryCategoryDetail(category) {
    state.historyDetail = { type: "category", value: category };
    state.activeModal = "history-category-detail";
    render();
  }

  function openWeekQuickSummaryModal() {
    state.activeModal = "history-week-summary";
    render();
  }

  function openRecipeDeleteModal(recipeId) {
    if (!getRecipe(recipeId)) return;
    state.recipeDeleteId = recipeId;
    state.activeModal = "recipe-delete";
    render();
  }

  function openPreferencesModal() {
    state.activeModal = "preferences";
    state.prefQuery = "";
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
    state.activeRecipeContext = null;
    state.recipeQuery = "";
    state.selectorOpen = { open: true, dateISO, meal, index };
    render();
  }

  function closeActiveModal() {
    state.activeModal = null;
    state.activeRecipeId = null;
    state.activeRecipeContext = null;
    state.recipeDeleteId = null;
    state.infoMessage = "";
    state.selectorOpen = { open: false, dateISO: "", meal: "lunch", index: 0 };
    state.recipeQuery = "";
    state.prefQuery = "";
    state.recipeEditor = {
      mode: "create",
      draft: createRecipeDraft()
    };
    render();
  }

  function closeHistoryStatsModal() {
    state.activeModal = "tools";
    render();
  }

  function closeHistoryDetailModal() {
    state.activeModal = "history-stats";
    state.historyDetail = { type: "", value: "" };
    render();
  }

  function goToWeek(weekStartISO) {
    if (!weekStartISO) return;
    state.weekStartISO = weekStartISO;
    state.view = "week";
    state.pendingWeekScroll = true;
    ensureWeekPlan(state.weekStartISO);
    state.activeModal = null;
    state.historyDetail = { type: "", value: "" };
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
    savePlans();
    closeActiveModal();
  }

  function clearRecipeSlot(dateISO, meal, index) {
    assignRecipeToSlot(dateISO, meal, index, null);
  }

  function removeRecipeFromPlans(recipeId) {
    let didChange = false;

    Object.values(state.plans).forEach((plan) => {
      Object.values(plan.days || {}).forEach((dayPlan) => {
        ["lunch", "dinner"].forEach((meal) => {
          const slots = Array.isArray(dayPlan?.[meal]) ? dayPlan[meal] : [];
          slots.forEach((slotRecipeId, index) => {
            if (slotRecipeId !== recipeId) return;
            dayPlan[meal][index] = null;
            didChange = true;
          });
        });
      });
    });

    if (didChange) savePlans();
  }

  function deleteRecipe(recipeId) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return;

    state.recipes = state.recipes.filter((item) => item.id !== recipeId);
    if (state.expandedRecipeId === recipeId) {
      state.expandedRecipeId = null;
      state.expandedIngredientsAll = false;
    }
    delete state.recipeChecks[recipeId];
    removeRecipeFromPlans(recipeId);
    saveRecipes();
    closeActiveModal();
    showToast("Receta eliminada");
  }

  function updateRecipePreference(recipeId, field, checked) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return;
    recipe[field] = checked;
    saveRecipes();
    render();
  }

  function updateRepeatWindow(delta) {
    state.prefs.repeatWindowWeeks = clamp(state.prefs.repeatWindowWeeks + delta, 1, 4);
    savePrefs();
    render();
  }

  function updateQuota(category, delta) {
    if (!state.prefs.quotas[category] && state.prefs.quotas[category] !== 0) return;
    state.prefs.quotas[category] = clamp(state.prefs.quotas[category] + delta, 0, 28);
    savePrefs();
    render();
  }

  function updateDefaultPeople(delta) {
    state.prefs.comensalesPorDefecto = Math.max(1, state.prefs.comensalesPorDefecto + delta);

    Object.values(state.plans).forEach((plan) => {
      Object.values(plan.days || {}).forEach((dayPlan) => {
        const defaults = getNormalizedDefaultPeople(dayPlan.workStatus, state.prefs);
        if (!dayPlan.lunchPeopleOverridden) dayPlan.lunchPeople = defaults.lunchPeople;
        if (!dayPlan.dinnerPeopleOverridden) dayPlan.dinnerPeople = defaults.dinnerPeople;
      });
    });

    savePrefs();
    savePlans();
    render();
  }

  function getDayPeople(dayPlan, meal) {
    return meal === "dinner" ? dayPlan.dinnerPeople : dayPlan.lunchPeople;
  }

  function updateDayPeople(dateISO, meal, delta) {
    const weekPlan = getWeekPlan(state.weekStartISO);
    if (!weekPlan.days[dateISO]) weekPlan.days[dateISO] = createEmptyDayPlan();
    const dayPlan = weekPlan.days[dateISO];
    const peopleField = meal === "dinner" ? "dinnerPeople" : "lunchPeople";
    const overrideField = meal === "dinner" ? "dinnerPeopleOverridden" : "lunchPeopleOverridden";

    dayPlan[peopleField] = Math.max(1, Number(dayPlan[peopleField] || 1) + delta);
    dayPlan[overrideField] = true;
    savePlans();
    render();
  }

  function resetDayPeople(dateISO) {
    const weekPlan = getWeekPlan(state.weekStartISO);
    if (!weekPlan.days[dateISO]) weekPlan.days[dateISO] = createEmptyDayPlan();
    const dayPlan = weekPlan.days[dateISO];
    const defaults = getNormalizedDefaultPeople(dayPlan.workStatus, state.prefs);

    dayPlan.lunchPeople = defaults.lunchPeople;
    dayPlan.dinnerPeople = defaults.dinnerPeople;
    dayPlan.lunchPeopleOverridden = false;
    dayPlan.dinnerPeopleOverridden = false;
    savePlans();
    render();
  }

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    state.toastMessage = message;
    render();
    toastTimer = setTimeout(() => {
      state.toastMessage = "";
      render();
    }, 2200);
  }

  function getWeekRecipeIds(weekStartISO) {
    const plan = state.plans[weekStartISO];
    if (!plan) return [];

    return Object.values(plan.days).flatMap((dayPlan) => [
      ...(Array.isArray(dayPlan.lunch) ? dayPlan.lunch : []),
      ...(Array.isArray(dayPlan.dinner) ? dayPlan.dinner : [])
    ]).filter(Boolean);
  }

  function getRecentRecipeIds(weekStartISO) {
    const recentRecipeIds = new Set();

    for (let offset = 1; offset <= state.prefs.repeatWindowWeeks; offset += 1) {
      const previousWeekISO = toISODate(addDays(fromISODate(weekStartISO), -7 * offset));
      getWeekRecipeIds(previousWeekISO).forEach((recipeId) => {
        const recipe = getRecipe(recipeId);
        if (recipe && !recipe.isWildcard) recentRecipeIds.add(recipeId);
      });
    }

    return recentRecipeIds;
  }

  function countWeekCategories(weekPlan) {
    const counts = Object.fromEntries(CATEGORY_OPTIONS.map((category) => [category, 0]));

    Object.values(weekPlan.days).forEach((dayPlan) => {
      [...dayPlan.lunch, ...dayPlan.dinner].filter(Boolean).forEach((recipeId) => {
        counts[getRecipeCategory(recipeId)] += 1;
      });
    });

    return counts;
  }

  function pickRandom(items) {
    if (!items.length) return null;
    return items[Math.floor(Math.random() * items.length)];
  }

  function getPreferredCategories(categoryCounts) {
    const underQuota = CATEGORY_OPTIONS.filter((category) => categoryCounts[category] < state.prefs.quotas[category]);
    return underQuota.length ? underQuota : CATEGORY_OPTIONS;
  }

  function getCandidateRecipes(slotType, preferredCategories, recentRecipeIds, usedThisWeek) {
    const basePool = state.recipes.filter((recipe) => {
      if (!recipe.isActive) return false;
      return slotType === "lunch" ? recipe.allowLunch : recipe.allowDinner;
    });
    const byPreferred = (recipes) => recipes.filter((recipe) => preferredCategories.includes(recipe.category || "Otro"));
    const avoidRecent = (recipes) => recipes.filter((recipe) => recipe.isWildcard || !recentRecipeIds.has(recipe.id));
    const avoidWeekRepeat = (recipes) => recipes.filter((recipe) => !usedThisWeek.has(recipe.id));

    const levels = [
      { degraded: false, recipes: avoidWeekRepeat(avoidRecent(byPreferred(basePool))) },
      { degraded: true, recipes: avoidRecent(byPreferred(basePool)) },
      { degraded: true, recipes: avoidWeekRepeat(byPreferred(basePool)) },
      { degraded: true, recipes: byPreferred(basePool) },
      { degraded: true, recipes: avoidWeekRepeat(avoidRecent(basePool)) },
      { degraded: true, recipes: avoidRecent(basePool) },
      { degraded: true, recipes: basePool }
    ];

    return levels.find((level) => level.recipes.length) || { degraded: true, recipes: [] };
  }

  function autocompleteWeek() {
    const weekPlan = getWeekPlan(state.weekStartISO);
    const recentRecipeIds = getRecentRecipeIds(state.weekStartISO);
    const categoryCounts = countWeekCategories(weekPlan);
    const usedThisWeek = new Set(getWeekRecipeIds(state.weekStartISO));
    const slots = [];
    const rulesUsed = [];

    getWeekDates(state.weekStartISO).forEach(({ dateISO }) => {
      const dayPlan = weekPlan.days[dateISO] || createEmptyDayPlan();
      if (!weekPlan.days[dateISO]) weekPlan.days[dateISO] = dayPlan;

      dayPlan.lunch.forEach((recipeId, index) => {
        if (!recipeId) slots.push({ dateISO, meal: "lunch", index });
      });
      dayPlan.dinner.forEach((recipeId, index) => {
        if (!recipeId) slots.push({ dateISO, meal: "dinner", index });
      });
    });

    slots.forEach((slot) => {
      const preferredCategories = getPreferredCategories(categoryCounts);
      const candidateSet = getCandidateRecipes(slot.meal, preferredCategories, recentRecipeIds, usedThisWeek);
      const recipe = pickRandom(candidateSet.recipes);

      if (!recipe) return;

      weekPlan.days[slot.dateISO][slot.meal][slot.index] = recipe.id;
      categoryCounts[recipe.category || "Otro"] += 1;
      usedThisWeek.add(recipe.id);
      if (candidateSet.degraded) rulesUsed.push(`${slot.dateISO}-${slot.meal}-${slot.index}`);
    });

    console.log("Autocompletar semana", { weekStartISO: state.weekStartISO, rulesUsed });
    savePlans();
    render();
    showToast(rulesUsed.length ? "Semana completada con ajustes" : "Semana completada");
  }

  function toggleRecipeStep(recipeId, stepIndex) {
    if (!state.recipeChecks[recipeId]) state.recipeChecks[recipeId] = {};
    state.recipeChecks[recipeId][stepIndex] = !state.recipeChecks[recipeId][stepIndex];
  }

  function updateRecipeDraftField(field, value) {
    state.recipeEditor.draft[field] = value;
  }

  function submitRecipeEditor() {
    const recipeDraft = state.recipeEditor.draft;
    const recipeTitle = recipeDraft.title.trim();

    if (!recipeTitle) {
      showToast("El titulo es obligatorio");
      return;
    }

    const existingByTitle = findRecipeByTitle(recipeTitle);
    if (existingByTitle && existingByTitle.id !== recipeDraft.id) {
      showToast("Ya existe una receta con ese titulo");
      return;
    }

    const recipeToSave = buildRecipeFromDraft(recipeDraft);
    const existingIndex = state.recipes.findIndex((recipe) => recipe.id === recipeToSave.id);

    if (existingIndex >= 0) {
      state.recipes[existingIndex] = recipeToSave;
    } else {
      state.recipes.push(recipeToSave);
    }

    state.recipes.sort((left, right) => left.title.localeCompare(right.title, "es"));
    state.expandedRecipeId = recipeToSave.id;
    state.expandedIngredientsAll = false;
    saveRecipes();
    closeActiveModal();
    showToast(existingIndex >= 0 ? "Receta actualizada" : "Receta creada");
  }

  function renderRecipeModal() {
    const recipe = getRecipe(state.activeRecipeId);
    if (!recipe || state.activeModal !== "recipe") return "";

    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const steps = Array.isArray(recipe.steps) ? recipe.steps.map(normalizeStep) : [];
    const checks = state.recipeChecks[recipe.id] || {};
    const contextDayPlan = state.activeRecipeContext?.dateISO ? getWeekPlan(state.weekStartISO).days[state.activeRecipeContext.dateISO] : null;
    const contextPeople = contextDayPlan && state.activeRecipeContext?.meal ? getDayPeople(contextDayPlan, state.activeRecipeContext.meal) : null;
    const kcalPerServing = recipe.kcalPerServing;
    const kcalTotal = kcalPerServing !== null && contextPeople ? kcalPerServing * contextPeople : null;

    const nutrition = calculateRecipeNutrition(recipe);
    const hasNutrition = nutrition.kcal !== null;
    const incompleteEstimate = nutrition.warnings.length > 0 || nutrition.kcal === null;

    return `
      <div class="modal-overlay" data-close-modal>
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="recipe-modal-title">${escapeHTML(recipe.title)}</h2>
              <div class="modal-time">Tiempo total: ${recipe.timeMin || 0} min</div>
              <div class="modal-time">Raciones base: ${recipe.servingsBase || 5}</div>
              ${kcalPerServing !== null ? `<div class="modal-time">Kcal/ración: ${kcalPerServing}</div>` : ""}
              ${kcalTotal !== null ? `<div class="modal-time">Kcal total (${contextPeople} comensales): ${kcalTotal}</div>` : ""}
            </div>
            <span class="category-badge modal-category">${recipe.category || "Otro"}</span>
          </div>

          <div class="modal-body">
            <section class="modal-section">
              <h3 class="modal-section-title">Ingredientes</h3>
              ${ingredients.length ? `
                <div class="modal-stack">
                  ${ingredients.map((ingredient) => `
                    <div class="modal-item">${escapeHTML(formatIngredient(ingredient))}</div>
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
                        <span class="check-copy">
                        <span>${escapeHTML(step.text)}</span>
                        ${(step.minutes || step.tempC || step.heat) ? `
                          <span class="step-chips">
                            ${step.minutes ? `<span class="step-chip">⏱ ${step.minutes} min</span>` : ""}
                            ${step.tempC ? `<span class="step-chip">🌡 ${step.tempC}ºC</span>` : ""}
                            ${step.heat ? `<span class="step-chip">🔥 ${step.heat}</span>` : ""}
                          </span>
                        ` : ""}
                        ${step.note ? `<span class="step-note">${escapeHTML(step.note)}</span>` : ""}
                      </span>
                    </label>
                  `).join("")}
                </div>
              ` : `
                <div class="muted">Pendiente de completar</div>
              `}
            </section>

            <section class="modal-section">
              <h3 class="modal-section-title">Nutrición (estimada)</h3>
              ${hasNutrition ? `
              <div class="nutrition-info">
                <div class="nutrition-row">
                  <span>Kcal total:</span>
                  <strong>${nutrition.kcal}</strong>
                </div>
                <div class="nutrition-row">
                  <span>Proteínas:</span>
                  <strong>${nutrition.p}g</strong>
                </div>
                <div class="nutrition-row">
                  <span>Carbohidratos:</span>
                  <strong>${nutrition.c}g</strong>
                </div>
                <div class="nutrition-row">
                  <span>Grasas:</span>
                  <strong>${nutrition.f}g</strong>
                </div>
                ${nutrition.warnings.length > 0 ? `
                <div class="nutrition-warning">
                  <small>⚠ Estimación incompleta: ${nutrition.warnings.join(", ")}</small>
                </div>
                ` : ""}
              </div>
              ` : `
              <div class="nutrition-warning">
                <small>Estimación incompleta (faltan cantidades/unidades o ingredientes no incluidos)</small>
                ${nutrition.warnings.length > 0 ? `<small style="display: block; margin-top: 8px; color: var(--muted);">${nutrition.warnings.join(", ")}</small>` : ""}
              </div>
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

  function renderRecipeEditorModal() {
    if (state.activeModal !== "recipe-editor") return "";

    const { draft, mode } = state.recipeEditor;
    const heading = mode === "edit" ? "Editar receta" : "Nueva receta";

    return `
      <div class="modal-overlay" data-close-modal>
        <div class="modal-card modal-card-editor" role="dialog" aria-modal="true" aria-labelledby="recipe-editor-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="recipe-editor-title">${heading}</h2>
              <div class="modal-time">Rellena lo importante y guardamos en este iPhone con localStorage</div>
            </div>
          </div>

          <div class="modal-body modal-body-editor">
            <section class="modal-section editor-grid">
              <label class="field">
                <span class="field-label">Titulo</span>
                <input class="field-input" type="text" value="${escapeHTML(draft.title)}" data-editor-field="title" placeholder="Ej. Merluza con verduras" required>
              </label>

              <label class="field">
                <span class="field-label">Categoria</span>
                <select class="field-input" data-editor-field="category">
                  ${CATEGORY_OPTIONS.map((category) => `
                    <option value="${category}" ${draft.category === category ? "selected" : ""}>${category}</option>
                  `).join("")}
                </select>
              </label>

              <label class="field">
                <span class="field-label">Tiempo total (min)</span>
                <input class="field-input" type="number" min="0" inputmode="numeric" value="${escapeHTML(draft.timeMin)}" data-editor-field="timeMin" placeholder="0">
              </label>
            </section>

            <section class="modal-section editor-grid">
              <div class="field">
                <span class="field-label">Raciones base</span>
                <div class="field-static">5</div>
              </div>

              <label class="field">
                <span class="field-label">Kcal por ración</span>
                <input class="field-input" type="number" min="0" inputmode="numeric" value="${escapeHTML(draft.kcalPerServing)}" data-editor-field="kcalPerServing" placeholder="Opcional">
              </label>
            </section>

            <section class="modal-section">
              <label class="field">
                <span class="field-label">Ingredientes</span>
                <textarea class="field-input field-textarea" rows="7" data-editor-field="ingredients" placeholder="1 linea por ingrediente">${escapeHTML(draft.ingredients)}</textarea>
              </label>
            </section>

            <section class="modal-section">
              <label class="field">
                <span class="field-label">Pasos</span>
                <textarea class="field-input field-textarea" rows="7" data-editor-field="steps" placeholder="1 linea por paso">${escapeHTML(draft.steps)}</textarea>
              </label>
            </section>

            <section class="modal-section">
              <h3 class="modal-section-title">Uso</h3>
              <div class="editor-check-grid">
                <label class="editor-check">
                  <input type="checkbox" data-editor-check="allowLunch" ${draft.allowLunch ? "checked" : ""}>
                  <span>Comida</span>
                </label>
                <label class="editor-check">
                  <input type="checkbox" data-editor-check="allowDinner" ${draft.allowDinner ? "checked" : ""}>
                  <span>Cena</span>
                </label>
                <label class="editor-check">
                  <input type="checkbox" data-editor-check="isWildcard" ${draft.isWildcard ? "checked" : ""}>
                  <span>Comodin</span>
                </label>
                <label class="editor-check">
                  <input type="checkbox" data-editor-check="isActive" ${draft.isActive ? "checked" : ""}>
                  <span>Activa en automenú</span>
                </label>
              </div>
            </section>
          </div>

          <div class="modal-actions modal-actions-editor">
            <button class="primary editor-submit" data-save-recipe>${mode === "edit" ? "Guardar cambios" : "Guardar receta"}</button>
            <button class="open-recipe editor-cancel" data-close-modal-button>Cancelar</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderRecipeDeleteModal() {
    if (state.activeModal !== "recipe-delete") return "";

    const recipe = getRecipe(state.recipeDeleteId);
    if (!recipe) return "";

    return `
      <div class="modal-overlay" data-close-modal>
        <div class="modal-card modal-card-compact" role="dialog" aria-modal="true" aria-labelledby="recipe-delete-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="recipe-delete-title">Eliminar receta</h2>
              <div class="modal-time">${escapeHTML(recipe.title)}</div>
            </div>
          </div>

          <div class="modal-body modal-body-compact">
            <div class="modal-item">¿Eliminar esta receta? Esta acción no se puede deshacer.</div>
          </div>

          <div class="modal-actions modal-actions-stack">
            <button class="danger" data-confirm-delete-recipe="${recipe.id}">Eliminar</button>
            <button class="primary close-modal" data-close-modal-button>Cancelar</button>
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
                <span class="tool-subtitle">Anti-repeticion, cuotas y reglas por receta</span>
              </button>
              <button class="tool-item" data-tool-action="history-stats">
                <span class="tool-title">Histórico y estadísticas</span>
                <span class="tool-subtitle">Resumen mensual por recetas, categorias y semanas guardadas</span>
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

  function getOccurrencesForMonth(monthISO) {
    const occurrences = [];
    const weeksInMonth = [];

    Object.entries(state.plans)
      .sort(([leftWeekISO], [rightWeekISO]) => leftWeekISO.localeCompare(rightWeekISO))
      .forEach(([weekStartISO, plan]) => {
        const days = plan?.days && typeof plan.days === "object" ? plan.days : {};
        let weekHasMonthDay = false;

        Object.entries(days).forEach(([dateISO, dayPlan]) => {
          if (!isDateInMonth(dateISO, monthISO)) return;
          weekHasMonthDay = true;

          ["lunch", "dinner"].forEach((meal) => {
            const slots = Array.isArray(dayPlan?.[meal]) ? dayPlan[meal] : [];
            slots.forEach((recipeId, index) => {
              if (!recipeId) return;
              occurrences.push({
                weekStartISO,
                dateISO,
                recipeId: String(recipeId),
                meal,
                index
              });
            });
          });
        });

        if (weekHasMonthDay) weeksInMonth.push(weekStartISO);
      });

    return { occurrences, weeksInMonth };
  }

  function getMonthlyStats(monthISO) {
    const { occurrences, weeksInMonth } = getOccurrencesForMonth(monthISO);
    const countsByRecipeId = new Map();
    const countsByCategory = new Map(CATEGORY_OPTIONS.map((category) => [category, 0]));

    occurrences.forEach((occurrence) => {
      countsByRecipeId.set(occurrence.recipeId, (countsByRecipeId.get(occurrence.recipeId) || 0) + 1);
      const recipe = getRecipe(occurrence.recipeId);
      if (!recipe) return;
      const category = recipe.category || "Otro";
      countsByCategory.set(category, (countsByCategory.get(category) || 0) + 1);
    });

    const topRecipes = [...countsByRecipeId.entries()]
      .map(([recipeId, count]) => {
        const recipe = getRecipe(recipeId);
        return {
          recipeId,
          count,
          title: recipe ? recipe.title : "Receta eliminada"
        };
      })
      .sort((left, right) => right.count - left.count || left.title.localeCompare(right.title, "es"))
      .slice(0, 10);

    return {
      occurrences,
      topRecipes,
      countsByCategory,
      weeksInMonth
    };
  }

  function groupOccurrencesByWeek(occurrences) {
    const groups = new Map();

    [...occurrences]
      .sort((left, right) => left.dateISO.localeCompare(right.dateISO) || left.meal.localeCompare(right.meal) || left.index - right.index)
      .forEach((occurrence) => {
        if (!groups.has(occurrence.weekStartISO)) groups.set(occurrence.weekStartISO, []);
        groups.get(occurrence.weekStartISO).push(occurrence);
      });

    return [...groups.entries()].map(([weekStartISO, items]) => ({
      weekStartISO,
      items
    }));
  }

  function getCurrentWeekStats() {
    const weekPlan = getWeekPlan(state.weekStartISO);
    const occurrences = [];
    const countsByCategory = new Map(CATEGORY_OPTIONS.map((category) => [category, 0]));
    const countsByRecipeId = new Map();

    Object.entries(weekPlan.days || {})
      .sort(([leftDateISO], [rightDateISO]) => leftDateISO.localeCompare(rightDateISO))
      .forEach(([dateISO, dayPlan]) => {
        ["lunch", "dinner"].forEach((meal) => {
          const slots = Array.isArray(dayPlan?.[meal]) ? dayPlan[meal] : [];
          slots.forEach((recipeId, index) => {
            if (!recipeId) return;
            const safeRecipeId = String(recipeId);
            occurrences.push({ weekStartISO: state.weekStartISO, dateISO, recipeId: safeRecipeId, meal, index });
            countsByRecipeId.set(safeRecipeId, (countsByRecipeId.get(safeRecipeId) || 0) + 1);
            const recipe = getRecipe(safeRecipeId);
            if (!recipe) return;
            const category = recipe.category || "Otro";
            countsByCategory.set(category, (countsByCategory.get(category) || 0) + 1);
          });
        });
      });

    const topRecipes = [...countsByRecipeId.entries()]
      .map(([recipeId, count]) => ({
        recipeId,
        count,
        title: getRecipe(recipeId)?.title || "Receta eliminada"
      }))
      .sort((left, right) => right.count - left.count || left.title.localeCompare(right.title, "es"))
      .slice(0, 10);

    return { occurrences, countsByCategory, topRecipes };
  }

  function renderHistoryStatsModal() {
    if (state.activeModal !== "history-stats") return "";

    const monthLabel = formatMonthLabel(state.historyMonthISO);
    const monthlyStats = getMonthlyStats(state.historyMonthISO);

    return `
      <div class="modal-overlay" data-history-overlay>
        <div class="modal-card modal-card-history" role="dialog" aria-modal="true" aria-labelledby="history-stats-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="history-stats-title">Histórico y estadísticas</h2>
              <div class="modal-time">Contando plato 1 y plato 2 de comida y cena</div>
            </div>
          </div>

          <div class="modal-body">
            <section class="modal-section">
              <div class="history-month-picker">
                <button class="week-nav" data-history-month="-1" aria-label="Mes anterior">◀</button>
                <div class="history-month-label">${monthLabel}</div>
                <button class="week-nav" data-history-month="1" aria-label="Mes siguiente">▶</button>
              </div>
              <button class="tool-item history-summary-button" data-open-week-summary>
                <span class="tool-title">Resumen rápido semana actual</span>
                <span class="tool-subtitle">${formatWeekRangeShort(state.weekStartISO)}</span>
              </button>
            </section>

            <section class="modal-section">
              <h3 class="modal-section-title">Recetas más repetidas del mes</h3>
              <div class="history-card-list">
                ${monthlyStats.topRecipes.length ? monthlyStats.topRecipes.map((entry) => `
                  <button class="history-row history-row-button" data-open-history-recipe="${entry.recipeId}">
                    <span class="history-row-label">${escapeHTML(entry.title)}</span>
                    <span class="history-row-value">${entry.count}</span>
                  </button>
                `).join("") : `<div class="modal-item">No hay platos guardados en este mes</div>`}
              </div>
            </section>

            <section class="modal-section">
              <h3 class="modal-section-title">Por categoría (mes)</h3>
              <div class="history-card-list">
                ${CATEGORY_OPTIONS.map((category) => `
                  <button class="history-row history-row-button" data-open-history-category="${category}">
                    <span class="history-row-label">${category}</span>
                    <span class="history-row-value">${monthlyStats.countsByCategory.get(category) || 0}</span>
                  </button>
                `).join("")}
              </div>
            </section>

            <section class="modal-section">
              <h3 class="modal-section-title">Semanas del mes</h3>
              <div class="history-weeks-list">
                ${monthlyStats.weeksInMonth.length ? monthlyStats.weeksInMonth.map((weekStartISO) => `
                  <div class="history-week-item">
                    <span class="history-week-label">${formatWeekRangeShort(weekStartISO)}</span>
                    <button class="open-recipe" data-open-history-week="${weekStartISO}">Ver</button>
                  </div>
                `).join("") : `<div class="modal-item">No hay semanas guardadas para este mes</div>`}
              </div>
            </section>
          </div>

          <div class="modal-actions">
            <button class="primary close-modal" data-close-history-button>Cerrar</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderHistoryRecipeDetailModal() {
    if (state.activeModal !== "history-recipe-detail") return "";

    const recipeId = state.historyDetail.value;
    const monthlyStats = getMonthlyStats(state.historyMonthISO);
    const recipe = getRecipe(recipeId);
    const title = recipe ? recipe.title : "Receta eliminada";
    const grouped = groupOccurrencesByWeek(monthlyStats.occurrences.filter((occurrence) => occurrence.recipeId === recipeId));

    return `
      <div class="modal-overlay" data-detail-overlay>
        <div class="modal-card modal-card-history" role="dialog" aria-modal="true" aria-labelledby="history-recipe-detail-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="history-recipe-detail-title">Detalle: ${escapeHTML(title)}</h2>
              <div class="modal-time">${formatMonthLabel(state.historyMonthISO)}</div>
            </div>
          </div>
          <div class="modal-body">
            ${grouped.length ? grouped.map((group) => `
              <section class="modal-section">
                <div class="history-group-head">
                  <span class="history-group-title">${formatWeekRangeShort(group.weekStartISO)}</span>
                  <button class="open-recipe" data-go-to-week="${group.weekStartISO}">Ver semana</button>
                </div>
                <div class="history-occurrence-list">
                  ${group.items.map((occurrence) => `
                    <div class="history-occurrence-item">
                      <span class="history-occurrence-text">${getMealIcon(occurrence.meal)} ${formatOccurrenceDate(occurrence.dateISO)} · ${getMealLabel(occurrence.meal)} · ${getPlateLabel(occurrence.index)}</span>
                    </div>
                  `).join("")}
                </div>
              </section>
            `).join("") : `<div class="modal-item">No hay ocurrencias en este mes</div>`}
          </div>
          <div class="modal-actions">
            <button class="primary" data-close-detail-button>Cerrar</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderHistoryCategoryDetailModal() {
    if (state.activeModal !== "history-category-detail") return "";

    const category = state.historyDetail.value;
    const monthlyStats = getMonthlyStats(state.historyMonthISO);
    const groupedWeeks = groupOccurrencesByWeek(
      monthlyStats.occurrences.filter((occurrence) => getRecipeCategory(occurrence.recipeId) === category)
    );

    return `
      <div class="modal-overlay" data-detail-overlay>
        <div class="modal-card modal-card-history" role="dialog" aria-modal="true" aria-labelledby="history-category-detail-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="history-category-detail-title">Categoría: ${escapeHTML(category)}</h2>
              <div class="modal-time">${formatMonthLabel(state.historyMonthISO)}</div>
            </div>
          </div>
          <div class="modal-body">
            ${groupedWeeks.length ? groupedWeeks.map((group) => `
              <section class="modal-section">
                <div class="history-group-head">
                  <span class="history-group-title">${formatWeekRangeShort(group.weekStartISO)}</span>
                  <button class="open-recipe" data-go-to-week="${group.weekStartISO}">Ver semana</button>
                </div>
                <div class="history-occurrence-list">
                  ${group.items.map((occurrence) => `
                    <div class="history-occurrence-item">
                      <span class="history-occurrence-title">${escapeHTML(getRecipe(occurrence.recipeId)?.title || "Receta eliminada")}</span>
                      <span class="history-occurrence-text">${getMealIcon(occurrence.meal)} ${formatOccurrenceDate(occurrence.dateISO)} · ${getMealLabel(occurrence.meal)} · ${getPlateLabel(occurrence.index)}</span>
                    </div>
                  `).join("")}
                </div>
              </section>
            `).join("") : `<div class="modal-item">No hay ocurrencias en este mes</div>`}
          </div>
          <div class="modal-actions">
            <button class="primary" data-close-detail-button>Cerrar</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderWeekQuickSummaryModal() {
    if (state.activeModal !== "history-week-summary") return "";

    const weekStats = getCurrentWeekStats();

    return `
      <div class="modal-overlay" data-detail-overlay>
        <div class="modal-card modal-card-history" role="dialog" aria-modal="true" aria-labelledby="history-week-summary-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="history-week-summary-title">Resumen rápido semana actual</h2>
              <div class="modal-time">${formatWeekRangeShort(state.weekStartISO)}</div>
            </div>
          </div>
          <div class="modal-body">
            <section class="modal-section">
              <h3 class="modal-section-title">Por categoría</h3>
              <div class="history-card-list">
                ${CATEGORY_OPTIONS.map((category) => `
                  <div class="history-row">
                    <span class="history-row-label">${category}</span>
                    <span class="history-row-value">${weekStats.countsByCategory.get(category) || 0}</span>
                  </div>
                `).join("")}
              </div>
            </section>
            <section class="modal-section">
              <h3 class="modal-section-title">Top recetas de la semana</h3>
              <div class="history-card-list">
                ${weekStats.topRecipes.length ? weekStats.topRecipes.map((entry) => `
                  <div class="history-row">
                    <span class="history-row-label">${escapeHTML(entry.title)}</span>
                    <span class="history-row-value">${entry.count}</span>
                  </div>
                `).join("") : `<div class="modal-item">No hay platos en esta semana</div>`}
              </div>
            </section>
          </div>
          <div class="modal-actions modal-actions-stack">
            <button class="open-recipe" data-go-to-week="${state.weekStartISO}">Ir a semana</button>
            <button class="primary" data-close-detail-button>Cerrar</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderPreferencesModal() {
    if (state.activeModal !== "preferences") return "";

    const recipes = [...state.recipes]
      .sort((a, b) => a.title.localeCompare(b.title, "es"))
      .filter((recipe) => recipe.title.toLocaleLowerCase("es").includes(state.prefQuery.trim().toLocaleLowerCase("es")));

    return `
      <div class="modal-overlay" data-close-modal>
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="preferences-modal-title">
          <div class="modal-head">
            <div>
              <h2 class="modal-title" id="preferences-modal-title">Preferencias</h2>
              <div class="modal-time">Reglas de repeticion y uso por receta</div>
            </div>
          </div>

          <div class="modal-body">
            <section class="modal-section">
              <h3 class="modal-section-title">Comensales por defecto</h3>
              <div class="prefs-stepper">
                <button class="week-nav" data-pref-people="-1" aria-label="Reducir comensales">-</button>
                <div class="week-range">${state.prefs.comensalesPorDefecto} personas</div>
                <button class="week-nav" data-pref-people="1" aria-label="Aumentar comensales">+</button>
              </div>
            </section>

            <section class="modal-section">
              <h3 class="modal-section-title">No repetir en</h3>
              <div class="prefs-stepper">
                <button class="week-nav" data-pref-repeat="-1" aria-label="Reducir semanas">-</button>
                <div class="week-range">${state.prefs.repeatWindowWeeks} semanas</div>
                <button class="week-nav" data-pref-repeat="1" aria-label="Aumentar semanas">+</button>
              </div>
            </section>

            <section class="modal-section">
              <h3 class="modal-section-title">Cuotas semanales</h3>
              <div class="quota-list">
                ${CATEGORY_OPTIONS.map((category) => `
                  <div class="quota-row">
                    <span class="quota-label">${category}</span>
                    <div class="quota-stepper">
                      <button class="mini-step" data-pref-quota="${category}:-1">-</button>
                      <span class="quota-value">${state.prefs.quotas[category]}</span>
                      <button class="mini-step" data-pref-quota="${category}:1">+</button>
                    </div>
                  </div>
                `).join("")}
              </div>
            </section>

            <section class="modal-section">
              <h3 class="modal-section-title">Recetas</h3>
              <div class="selector-search">
                <input class="selector-input" type="search" placeholder="Buscar receta" value="${state.prefQuery}" data-pref-query>
              </div>
              <div class="prefs-recipe-list">
                ${recipes.map((recipe) => `
                  <div class="prefs-recipe-item">
                    <div class="prefs-recipe-main">
                      <div class="prefs-recipe-title ${recipe.isActive ? "" : "prefs-recipe-title-muted"}">${escapeHTML(recipe.title)}</div>
                      <span class="category-badge">${recipe.category || "Otro"}</span>
                    </div>
                    <div class="prefs-toggle-row">
                      <label class="prefs-toggle">
                        <input type="checkbox" data-pref-toggle="${recipe.id}:isActive" ${recipe.isActive ? "checked" : ""}>
                        <span>${recipe.isActive ? "Activa" : "Silenciada"}</span>
                      </label>
                      <label class="prefs-toggle">
                        <input type="checkbox" data-pref-toggle="${recipe.id}:allowLunch" ${recipe.allowLunch ? "checked" : ""}>
                        <span>Comida</span>
                      </label>
                      <label class="prefs-toggle">
                        <input type="checkbox" data-pref-toggle="${recipe.id}:allowDinner" ${recipe.allowDinner ? "checked" : ""}>
                        <span>Cena</span>
                      </label>
                      <label class="prefs-toggle">
                        <input type="checkbox" data-pref-toggle="${recipe.id}:isWildcard" ${recipe.isWildcard ? "checked" : ""}>
                        <span>Comodin</span>
                      </label>
                    </div>
                  </div>
                `).join("") || `<div class="modal-item">No hay recetas para esa busqueda</div>`}
              </div>
            </section>
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
                  <span class="selector-item-title">${escapeHTML(recipe.title)}</span>
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
    requestAnimationFrame(() => {
      if (isCurrentWeek(state.weekStartISO)) {
        const todayISO = toISODate(startOfLocalDay(new Date()));
        const dayElement = document.getElementById(`day-${todayISO}`);
        if (dayElement) {
          dayElement.scrollIntoView({ block: "start", behavior: "smooth" });
        }
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  function schedulePreferencesFocus() {
    if (state.activeModal !== "preferences") return;
    requestAnimationFrame(() => {
      const input = document.querySelector("[data-pref-query]");
      if (!input) return;
      input.focus();
      const queryLength = input.value.length;
      input.setSelectionRange(queryLength, queryLength);
    });
  }

  function scheduleRecipeEditorFocus() {
    if (state.activeModal !== "recipe-editor") return;
    requestAnimationFrame(() => {
      const input = document.querySelector("[data-editor-field=\"title\"]");
      if (!input) return;
      input.focus();
      const titleLength = input.value.length;
      input.setSelectionRange(titleLength, titleLength);
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

  function updateHeaderHeight() {
    const headerEl = document.querySelector(".topbar");
    const headerHeight = headerEl ? headerEl.offsetHeight : 0;
    document.documentElement.style.setProperty("--headerH", `${headerHeight}px`);
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
        ${state.view === "week" ? `
          <div class="week-header" id="weekHeader">
            <div class="tab week-tab active">
              <button class="week-nav week-nav-tab" data-week-nav="prev" aria-label="Semana anterior">◀</button>
              <button class="week-range week-range-tab" data-view="week">${formatWeekRange(state.weekStartISO)}</button>
              <button class="week-nav week-nav-tab" data-week-nav="next" aria-label="Semana siguiente">▶</button>
            </div>
            <div class="week-header-actions">
              <button class="tab week-side-button" data-view="recipes">Recetas</button>
              <button class="primary week-side-button week-side-primary" data-autocomplete-week>Autocompletar</button>
            </div>
          </div>
        ` : `
          <nav class="tabs">
            <button class="tab ${state.view === "week" ? "active" : ""}" data-view="week">Semana</button>
            <button class="tab ${state.view === "recipes" ? "active" : ""}" data-view="recipes">Recetas</button>
          </nav>
        `}
      </header>

      <main class="content">
        ${state.view === "week" ? renderWeek() : renderRecipes()}
      </main>

      ${renderRecipeModal()}
      ${renderRecipeEditorModal()}
      ${renderRecipeDeleteModal()}
      ${renderRecipeSelectorModal()}
      ${renderToolsModal()}
      ${renderHistoryStatsModal()}
      ${renderHistoryRecipeDetailModal()}
      ${renderHistoryCategoryDetailModal()}
      ${renderWeekQuickSummaryModal()}
      ${renderPreferencesModal()}
      ${renderInfoModal()}
      ${state.toastMessage ? `<div class="toast">${state.toastMessage}</div>` : ""}
    `;

    root.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextView = btn.getAttribute("data-view");
        if (nextView === "week" && state.view !== "week") state.pendingWeekScroll = true;
        state.view = nextView;
        state.expandedRecipeId = null;
        state.expandedIngredientsAll = false;
        render();
      });
    });

    root.querySelectorAll("[data-recipe-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const recipeId = btn.getAttribute("data-recipe-toggle");
        const isOpen = state.expandedRecipeId === recipeId;
        state.expandedRecipeId = isOpen ? null : recipeId;
        state.expandedIngredientsAll = false;
        render();
      });
    });

    root.querySelectorAll("[data-open-recipe]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openRecipeModal(btn.getAttribute("data-open-recipe"));
      });
    });

    root.querySelectorAll("[data-open-editor]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const recipeId = btn.getAttribute("data-open-editor");
        openRecipeEditor(recipeId ? "edit" : "create", recipeId || "");
      });
    });

    root.querySelectorAll("[data-open-delete]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openRecipeDeleteModal(btn.getAttribute("data-open-delete") || "");
      });
    });

    root.querySelectorAll("[data-expand-ingredients]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const recipeId = btn.getAttribute("data-expand-ingredients");
        if (recipeId && recipeId === state.expandedRecipeId) {
          state.expandedIngredientsAll = true;
          render();
        }
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
        state.view = "week";
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
        if (recipeId) {
          openRecipeModal(recipeId, {
            dateISO: btn.getAttribute("data-date-iso") || "",
            meal: btn.getAttribute("data-meal") || "lunch"
          });
        }
      });
    });

    root.querySelectorAll("[data-work-status]").forEach((select) => {
      select.addEventListener("change", () => {
        const weekPlan = getWeekPlan(state.weekStartISO);
        const dateISO = select.getAttribute("data-work-status");
        if (!dateISO || !weekPlan.days[dateISO]) return;
        const dayPlan = weekPlan.days[dateISO];
        dayPlan.workStatus = select.value;
        const defaults = getNormalizedDefaultPeople(dayPlan.workStatus, state.prefs);
        if (!dayPlan.lunchPeopleOverridden) dayPlan.lunchPeople = defaults.lunchPeople;
        if (!dayPlan.dinnerPeopleOverridden) dayPlan.dinnerPeople = defaults.dinnerPeople;
        savePlans();
        render();
      });
    });

    root.querySelectorAll("[data-day-people-adjust]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [dateISO, meal, delta] = (btn.getAttribute("data-day-people-adjust") || "").split(":");
        if (!dateISO || !meal) return;
        updateDayPeople(dateISO, meal, Number(delta || 0));
      });
    });

    root.querySelectorAll("[data-day-people-reset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        resetDayPeople(btn.getAttribute("data-day-people-reset") || "");
      });
    });

    root.querySelectorAll("[data-autocomplete-week]").forEach((btn) => {
      btn.addEventListener("click", autocompleteWeek);
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
        if (action === "preferences") openPreferencesModal();
        if (action === "history-stats") openHistoryStatsModal();
      });
    });

    root.querySelectorAll("[data-history-month]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.historyMonthISO = shiftMonthISO(state.historyMonthISO, Number(btn.getAttribute("data-history-month") || 0));
        render();
      });
    });

    root.querySelectorAll("[data-open-week-summary]").forEach((btn) => {
      btn.addEventListener("click", openWeekQuickSummaryModal);
    });

    root.querySelectorAll("[data-open-history-recipe]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openHistoryRecipeDetail(btn.getAttribute("data-open-history-recipe") || "");
      });
    });

    root.querySelectorAll("[data-open-history-category]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openHistoryCategoryDetail(btn.getAttribute("data-open-history-category") || "");
      });
    });

    root.querySelectorAll("[data-open-history-week]").forEach((btn) => {
      btn.addEventListener("click", () => {
        goToWeek(btn.getAttribute("data-open-history-week") || "");
      });
    });

    root.querySelectorAll("[data-go-to-week]").forEach((btn) => {
      btn.addEventListener("click", () => {
        goToWeek(btn.getAttribute("data-go-to-week") || "");
      });
    });

    root.querySelectorAll("[data-pref-repeat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        updateRepeatWindow(Number(btn.getAttribute("data-pref-repeat") || 0));
      });
    });

    root.querySelectorAll("[data-pref-people]").forEach((btn) => {
      btn.addEventListener("click", () => {
        updateDefaultPeople(Number(btn.getAttribute("data-pref-people") || 0));
      });
    });

    root.querySelectorAll("[data-pref-quota]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [category, delta] = (btn.getAttribute("data-pref-quota") || "").split(":");
        if (category) updateQuota(category, Number(delta || 0));
      });
    });

    root.querySelectorAll("[data-pref-query]").forEach((input) => {
      input.addEventListener("input", () => {
        state.prefQuery = input.value;
        render();
      });
    });

    root.querySelectorAll("[data-pref-toggle]").forEach((input) => {
      input.addEventListener("change", () => {
        const [recipeId, field] = (input.getAttribute("data-pref-toggle") || "").split(":");
        if (recipeId && field) updateRecipePreference(recipeId, field, input.checked);
      });
    });

    root.querySelectorAll("[data-editor-field]").forEach((input) => {
      const syncDraftField = () => {
        updateRecipeDraftField(input.getAttribute("data-editor-field"), input.value);
      };
      input.addEventListener("input", syncDraftField);
      input.addEventListener("change", syncDraftField);
    });

    root.querySelectorAll("[data-editor-check]").forEach((input) => {
      input.addEventListener("change", () => {
        updateRecipeDraftField(input.getAttribute("data-editor-check"), input.checked);
      });
    });

    root.querySelectorAll("[data-save-recipe]").forEach((btn) => {
      btn.addEventListener("click", submitRecipeEditor);
    });

    root.querySelectorAll("[data-confirm-delete-recipe]").forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteRecipe(btn.getAttribute("data-confirm-delete-recipe") || "");
      });
    });

    root.querySelectorAll("[data-close-modal-button]").forEach((btn) => {
      btn.addEventListener("click", closeActiveModal);
    });

    root.querySelectorAll("[data-close-history-button]").forEach((btn) => {
      btn.addEventListener("click", closeHistoryStatsModal);
    });

    root.querySelectorAll("[data-close-detail-button]").forEach((btn) => {
      btn.addEventListener("click", closeHistoryDetailModal);
    });

    root.querySelectorAll("[data-close-modal]").forEach((overlay) => {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeActiveModal();
      });
    });

    root.querySelectorAll("[data-history-overlay]").forEach((overlay) => {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeHistoryStatsModal();
      });
    });

    root.querySelectorAll("[data-detail-overlay]").forEach((overlay) => {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeHistoryDetailModal();
      });
    });

    updateHeaderHeight();
    scheduleWeekScroll();
    scheduleSelectorFocus();
    schedulePreferencesFocus();
    scheduleRecipeEditorFocus();
  }

  function renderWeek() {
    const weekPlan = getWeekPlan(state.weekStartISO);
    const orderedWeekDates = getWeekDates(state.weekStartISO);
    const todayISO = toISODate(startOfLocalDay(new Date()));

    return `
      <section class="card week-panel" id="week-panel">
        <p class="muted">Los platos ya se pueden tocar para abrir su ficha si estan vinculados a una receta.</p>
        <div class="week-grid" id="week-days">
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
              <div class="day-meals-grid">
                <div class="slot slot-meal slot-meal-column">
                  <div class="slot-title">Comida</div>
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
                          <span class="meal-plate-title ${plate.recipeId ? "" : "meal-plate-empty"}">${plate.recipeId ? escapeHTML(plate.title) : "+ Añadir"}</span>
                        </button>
                        ${plate.recipeId ? `
                          <button class="meal-plate-view" data-view-week-recipe="${plate.recipeId}" data-date-iso="${dateISO}" data-meal="lunch">Ver</button>
                        ` : ""}
                      </div>
                    `;
                    }).join("")}
                  </div>
                </div>
                <div class="slot slot-meal slot-meal-column">
                  <div class="slot-title">Cena</div>
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
                          <span class="meal-plate-title ${plate.recipeId ? "" : "meal-plate-empty"}">${plate.recipeId ? escapeHTML(plate.title) : "+ Añadir"}</span>
                        </button>
                        ${plate.recipeId ? `
                          <button class="meal-plate-view" data-view-week-recipe="${plate.recipeId}" data-date-iso="${dateISO}" data-meal="dinner">Ver</button>
                        ` : ""}
                      </div>
                    `;
                    }).join("")}
                  </div>
                </div>
              </div>
              <div class="slot slot-turn">
                <div class="day-meta-grid">
                  <div class="day-meta-row">
                    <span class="slot-title">Turno</span>
                    <select class="select" data-work-status="${dateISO}">
                      ${WORK_STATUS_OPTIONS.map((option) => `
                        <option value="${option}" ${dayPlan.workStatus === option ? "selected" : ""}>${option}</option>
                      `).join("")}
                    </select>
                  </div>
                  <div class="day-people-grid">
                    <div class="day-people-row">
                      <span class="day-people-label">Comida</span>
                      <div class="day-people-stepper">
                        <button class="mini-step" data-day-people-adjust="${dateISO}:lunch:-1">-</button>
                        <span class="day-people-value">${dayPlan.lunchPeople}</span>
                        <button class="mini-step" data-day-people-adjust="${dateISO}:lunch:1">+</button>
                      </div>
                    </div>
                    <div class="day-people-row">
                      <span class="day-people-label">Cena</span>
                      <div class="day-people-stepper">
                        <button class="mini-step" data-day-people-adjust="${dateISO}:dinner:-1">-</button>
                        <span class="day-people-value">${dayPlan.dinnerPeople}</span>
                        <button class="mini-step" data-day-people-adjust="${dateISO}:dinner:1">+</button>
                      </div>
                    </div>
                  </div>
                  <button class="mini day-people-reset" data-day-people-reset="${dateISO}">Reset</button>
                </div>
              </div>
            </div>
          `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderRecipes() {
    const items = [...state.recipes].sort((a, b) => a.title.localeCompare(b.title, "es"));

    return `
      <section class="card">
        <div class="row row-wrap">
          <h2>Recetas</h2>
          <button class="primary" data-open-editor>+ Añadir</button>
        </div>
        <div class="list">
          ${items.map((recipe) => {
            const isExpanded = state.expandedRecipeId === recipe.id;
            const ingredientLines = getIngredientLines(recipe, isExpanded && state.expandedIngredientsAll);
            return `
              <div class="recipe-item">
                <button class="recipe" data-recipe-toggle="${recipe.id}" aria-expanded="${isExpanded}">
                  <div class="recipe-title-row">
                    <div class="recipe-title ${recipe.isActive ? "" : "recipe-title-muted"}">${escapeHTML(recipe.title)}</div>
                    ${recipe.isActive ? "" : `<span class="recipe-quiet-badge">Silenciada</span>`}
                  </div>
                  <div class="recipe-meta">${recipe.timeMin || 0} min · ${Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0} ingredientes</div>
                </button>
                ${isExpanded ? `
                  <div class="recipe-details">
                    <div class="recipe-details-main">
                      <div class="recipe-mini-head">
                        <span class="category-badge">${recipe.category || "Otro"}</span>
                        <div class="recipe-flag-row">
                          ${recipe.allowLunch ? `<span class="recipe-flag">Comida</span>` : ""}
                          ${recipe.allowDinner ? `<span class="recipe-flag">Cena</span>` : ""}
                          ${recipe.isWildcard ? `<span class="recipe-flag">Comodin</span>` : ""}
                        </div>
                      </div>
                      <div class="recipe-total">Total: ${recipe.timeMin || 0} min</div>
                      <div class="recipe-mini-section">
                        <div class="recipe-mini-label">Ingredientes</div>
                        ${ingredientLines.items.length ? `
                          <div class="recipe-ingredients-list">
                            ${ingredientLines.items.map((item) => `<div class="recipe-ingredient-line">${escapeHTML(item)}</div>`).join("")}
                          </div>
                        ` : `
                          <div class="recipe-summary">Pendiente de completar</div>
                        `}
                        ${ingredientLines.hasMore ? `<button class="recipe-link" data-expand-ingredients="${recipe.id}">Ver todos</button>` : ""}
                      </div>
                    </div>
                    <div class="recipe-details-side">
                      <button class="open-recipe" data-open-recipe="${recipe.id}">Abrir ficha</button>
                      <button class="open-recipe open-recipe-secondary" data-open-editor="${recipe.id}">Editar</button>
                      <button class="open-recipe open-recipe-danger" data-open-delete="${recipe.id}">Eliminar</button>
                    </div>
                  </div>
                ` : ""}
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      (state.activeModal === "history-recipe-detail" || state.activeModal === "history-category-detail" || state.activeModal === "history-week-summary")
    ) {
      closeHistoryDetailModal();
      return;
    }
    if (event.key === "Escape" && state.activeModal === "history-stats") {
      closeHistoryStatsModal();
      return;
    }
    if (event.key === "Escape" && state.activeModal) closeActiveModal();
  });

  window.addEventListener("resize", updateHeaderHeight);
  window.addEventListener("orientationchange", updateHeaderHeight);
  ensureWeekPlan(state.weekStartISO, DEFAULT_WEEK_TEMPLATE);
  savePrefs();
  saveRecipes();
  savePlans();
  refreshBuildHash();
  render();
});
