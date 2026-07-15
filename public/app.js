const grid = document.querySelector("#grid");
const template = document.querySelector("#cardTemplate");
const searchInput = document.querySelector("#searchInput");
const searchPanel = document.querySelector("#searchPanel");
const toggleSearchButton = document.querySelector("#toggleSearchButton");
const brandList = document.querySelector("#brandList");
const brandToggleArea = document.querySelector("#brandToggleArea");
const brandSummary = document.querySelector("#brandSummary");
const toggleBrandsButton = document.querySelector("#toggleBrandsButton");
const favoriteBrandsButton = document.querySelector("#favoriteBrandsButton");
const clearBrandsButton = document.querySelector("#clearBrandsButton");
const sourceList = document.querySelector("#sourceList");
const sourceToggleArea = document.querySelector("#sourceToggleArea");
const sourceSummary = document.querySelector("#sourceSummary");
const toggleSourcesButton = document.querySelector("#toggleSourcesButton");
const clearSourcesButton = document.querySelector("#clearSourcesButton");
const refreshButton = document.querySelector("#refreshButton");
const countEl = document.querySelector("#count");
const updatedEl = document.querySelector("#updated");
const newOnlyButton = document.querySelector("#newOnlyButton");
const progressWrap = document.querySelector("#progressWrap");
const progressFill = document.querySelector("#progressFill");
const progressText = document.querySelector("#progressText");

let allFinds = [];
let allBrands = [];
let brandTypes = new Map();
let allSources = [];
let selectedBrands = new Set();
let selectedSources = new Set();
let brandsOpen = false;
let sourcesOpen = false;
let searchOpen = false;
let newOnly = false;
let loadedMinDiscount = 0.4;
const favoriteBrands = ["Billieblush", "Floss", "Wynken"];
const singleChoiceFilters = {
  discount: {
    value: "0.7",
    options: [
      { value: "0.8", label: "80%+ off" },
      { value: "0.7", label: "70%+ off" },
      { value: "0.6", label: "60%+ off" },
      { value: "0.5", label: "50%+ off" },
      { value: "0.4", label: "40%+ off" },
    ],
    toggle: document.querySelector("#discountToggleArea"),
    summary: document.querySelector("#discountSummary"),
    hint: document.querySelector("#toggleDiscountButton"),
    list: document.querySelector("#discountList"),
  },
  type: {
    value: "",
    options: [
      { value: "", label: "All items" },
      { value: "clothes", label: "Clothes only" },
      { value: "shoes", label: "Shoes only" },
    ],
    toggle: document.querySelector("#typeToggleArea"),
    summary: document.querySelector("#typeSummary"),
    hint: document.querySelector("#toggleTypeButton"),
    list: document.querySelector("#typeList"),
  },
  gender: {
    value: "",
    options: [
      { value: "", label: "All" },
      { value: "girls", label: "Girls" },
      { value: "boys", label: "Boys" },
      { value: "neutral", label: "Neutral" },
    ],
    toggle: document.querySelector("#genderToggleArea"),
    summary: document.querySelector("#genderSummary"),
    hint: document.querySelector("#toggleGenderButton"),
    list: document.querySelector("#genderList"),
  },
  size: {
    value: "3-6",
    options: [
      { value: "3-6", label: "3Y-6Y" },
      { value: "", label: "Any size" },
      { value: "baby", label: "Baby / toddler" },
      { value: "7plus", label: "7Y+" },
    ],
    toggle: document.querySelector("#sizeToggleArea"),
    summary: document.querySelector("#sizeSummary"),
    hint: document.querySelector("#toggleSizeButton"),
    list: document.querySelector("#sizeList"),
  },
  shoeSize: {
    value: "target-shoes",
    options: [
      { value: "target-shoes", label: "US 7-9 / EU 23-26" },
      { value: "baby-toddler-shoes", label: "Baby/toddler US 4-6 / EU 20-22" },
      { value: "big-shoes", label: "US 10+ / EU 27+" },
      { value: "", label: "Any shoe size" },
      { value: "none", label: "Hide shoes" },
    ],
    toggle: document.querySelector("#shoeSizeToggleArea"),
    summary: document.querySelector("#shoeSizeSummary"),
    hint: document.querySelector("#toggleShoeSizeButton"),
    list: document.querySelector("#shoeSizeList"),
  },
};
let openChoiceFilter = "";

function money(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

function pct(value) {
  return `${Math.round(value * 100)}% off`;
}

function displayedDiscountValue(value) {
  return Math.round(value * 100) / 100;
}

function priceComparisonText(find) {
  const comparison = find.priceComparison;
  if (!comparison || !Number.isFinite(comparison.priceDelta)) return "";
  const delta = Math.abs(comparison.priceDelta);
  if (delta < 0.01) return "same";
  const prefix = comparison.priceDelta < 0 ? "down" : "up";
  return `${prefix} ${money(delta, find.currency)}`;
}

function choiceValue(name) {
  return singleChoiceFilters[name].value;
}

function choiceLabel(name) {
  const filter = singleChoiceFilters[name];
  return filter.options.find((option) => option.value === filter.value)?.label || "";
}

function textFor(find) {
  return [
    find.brand,
    find.title,
    find.category,
    find.source,
    find.sizes.join(" "),
  ].join(" ").toLowerCase();
}

function yearsFromSize(size = "") {
  const lower = size.toLowerCase().trim();
  const years = [];

  for (const match of lower.matchAll(/(\d+)\s*-\s*(\d+)\s*([ym])?/g)) {
    if (match[3] === "m") continue;
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (Number.isFinite(start) && Number.isFinite(end)) {
      for (let year = start; year <= end; year += 1) years.push(year);
    }
  }

  for (const match of lower.matchAll(/(\d+)\s*y\b/g)) {
    const year = Number(match[1]);
    if (Number.isFinite(year)) years.push(year);
  }

  if (!years.length && /^\d+$/.test(lower)) years.push(Number(lower));
  return [...new Set(years)];
}

function isBabySize(size = "") {
  const lower = size.toLowerCase();
  return /\b(nb|newborn|preemie)\b/.test(lower) || /\d+\s*-\s*\d+\s*m/.test(lower) || /\d+\s*m\b/.test(lower);
}

function isShoeFind(find) {
  const text = [find.title, find.category].join(" ").toLowerCase();
  return /\b(shoe|shoes|sandal|sandals|sneaker|sneakers|boot|boots|loafer|loafers|mary jane|slipper|slippers)\b/.test(text);
}

function shoeSizesFromSize(size = "") {
  const lower = size.toLowerCase();
  const sizes = [];

  for (const match of lower.matchAll(/\b(?:eu|eur|euro)\s*(\d{2})\b/g)) {
    sizes.push({ system: "eu", value: Number(match[1]) });
  }

  for (const match of lower.matchAll(/\b(?:us|usa)\s*(?:kids?|toddler|child)?\s*(\d{1,2})\b/g)) {
    sizes.push({ system: "us", value: Number(match[1]) });
  }

  if (/^\d{1,2}$/.test(lower)) {
    const value = Number(lower);
    sizes.push({ system: value >= 20 ? "eu" : "us", value });
  }

  return sizes.filter((sizeValue) => Number.isFinite(sizeValue.value));
}

function selectedShoeSizeMatches(size, find) {
  if (!isShoeFind(find)) return false;
  const filter = choiceValue("shoeSize");
  if (!filter) return true;
  if (filter === "none") return false;
  return shoeSizesFromSize(size).some(({ system, value }) => {
    if (filter === "baby-toddler-shoes") {
      if (system === "eu") return value >= 20 && value <= 22;
      if (system === "us") return value >= 4 && value <= 6;
    }
    if (filter === "target-shoes") {
      if (system === "eu") return value >= 23 && value <= 26;
      if (system === "us") return value >= 7 && value <= 9;
    }
    if (filter === "big-shoes") {
      if (system === "eu") return value >= 27;
      if (system === "us") return value >= 10;
    }
    return false;
  });
}

function sizeMatches(size, filter, find) {
  if (isShoeFind(find)) return selectedShoeSizeMatches(size, find);
  if (!filter) return true;
  const years = yearsFromSize(size);
  if (filter === "3-6") return years.some((year) => year >= 3 && year <= 6);
  if (filter === "7plus") return years.some((year) => year >= 7);
  if (filter === "baby") return isBabySize(size) || years.some((year) => year < 3);
  return true;
}

function sizeSortValue(size, find) {
  if (isShoeFind(find)) {
    const shoeSize = shoeSizesFromSize(size)[0];
    if (shoeSize) return shoeSize.system === "eu" ? shoeSize.value : shoeSize.value + 100;
  }

  const years = yearsFromSize(size);
  if (years.length) return years[0];
  if (isBabySize(size)) return -1;
  return 999;
}

function sortSizes(sizes, find) {
  return [...sizes].sort((a, b) => {
    const diff = sizeSortValue(a, find) - sizeSortValue(b, find);
    return diff || a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  });
}

function eligibleSizeOptions(find) {
  const minDiscount = Number.parseFloat(choiceValue("discount"));
  const rawOptions = Array.isArray(find.sizeOptions)
    ? find.sizeOptions
    : find.sizes.map((size) => ({ size, discount: find.discount }));
  const bestBySize = new Map();
  for (const option of rawOptions) {
    if (!option.size || displayedDiscountValue(option.discount) < minDiscount) continue;
    const current = bestBySize.get(option.size);
    if (!current || option.discount > current.discount) bestBySize.set(option.size, option);
  }
  return [...bestBySize.values()].sort((a, b) => {
    const diff = sizeSortValue(a.size, find) - sizeSortValue(b.size, find);
    return diff || a.size.localeCompare(b.size, undefined, { numeric: true, sensitivity: "base" });
  });
}

function matchingSizeOptions(find) {
  const filter = choiceValue("size");
  return eligibleSizeOptions(find).filter((option) => sizeMatches(option.size, filter, find));
}

function matchingSizes(find) {
  return matchingSizeOptions(find).map((option) => option.size);
}

function formatMatchingSizes(find) {
  const options = matchingSizeOptions(find);
  const discounts = new Set(options.map((option) => Math.round(option.discount * 100)));
  const sizes = options.map((option) => {
    if (discounts.size <= 1) return option.size;
    return `${option.size} (${pct(option.discount)})`;
  });
  return sizes.join(", ");
}

function populateFilters(finds) {
  const brands = (allBrands.length ? allBrands : [...new Set(finds.map((find) => find.brand))]).sort((a, b) => a.localeCompare(b));
  const sources = (allSources.length ? allSources : [...new Set(finds.map((find) => find.source))]).sort((a, b) => a.localeCompare(b));

  selectedBrands = new Set([...selectedBrands].filter((brand) => brands.includes(brand)));
  selectedSources = new Set([...selectedSources].filter((source) => sources.includes(source)));
  brandList.innerHTML = "";
  renderBrandDirectory(brands);
  updateBrandPanel();
  sourceList.innerHTML = "";
  renderSourceList(sources);
  updateSourcePanel();
}

function updateBrandPanel() {
  brandList.hidden = !brandsOpen;
  toggleBrandsButton.textContent = brandsOpen ? "Hide" : "Choose";
  brandToggleArea.setAttribute("aria-expanded", String(brandsOpen));
  clearBrandsButton.hidden = !selectedBrands.size;

  if (!selectedBrands.size) {
    brandSummary.textContent = "All brands";
    return;
  }

  const selected = [...selectedBrands].sort((a, b) => a.localeCompare(b));
  brandSummary.textContent = selected.length <= 3
    ? selected.join(", ")
    : `${selected.slice(0, 3).join(", ")} +${selected.length - 3} more`;
}

function toggleBrandPanel() {
  const nextOpen = !brandsOpen;
  brandsOpen = nextOpen;
  sourcesOpen = false;
  searchOpen = false;
  openChoiceFilter = "";
  updateBrandPanel();
  updateSourcePanel();
  updateSingleChoicePanels();
  updateSearchPanel();
}

function updateSourcePanel() {
  sourceList.hidden = !sourcesOpen;
  toggleSourcesButton.textContent = sourcesOpen ? "Hide" : "Choose";
  sourceToggleArea.setAttribute("aria-expanded", String(sourcesOpen));
  clearSourcesButton.hidden = !selectedSources.size;

  if (!selectedSources.size) {
    sourceSummary.textContent = "All sources";
    return;
  }

  const selected = [...selectedSources].sort((a, b) => a.localeCompare(b));
  sourceSummary.textContent = selected.length === 1
    ? selected[0]
    : `${selected[0]} +${selected.length - 1} more`;
}

function toggleSourcePanel() {
  const nextOpen = !sourcesOpen;
  sourcesOpen = nextOpen;
  brandsOpen = false;
  searchOpen = false;
  openChoiceFilter = "";
  updateBrandPanel();
  updateSourcePanel();
  updateSingleChoicePanels();
  updateSearchPanel();
}

function renderSingleChoiceList(name) {
  const filter = singleChoiceFilters[name];
  filter.list.innerHTML = "";
  for (const option of filter.options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = option.value === filter.value ? "sourceOption selected" : "sourceOption";
    button.textContent = option.label;
    button.addEventListener("click", () => {
      filter.value = option.value;
      openChoiceFilter = "";
      updateSingleChoicePanels();
      render();
    });
    filter.list.append(button);
  }
}

function updateSingleChoicePanels() {
  for (const [name, filter] of Object.entries(singleChoiceFilters)) {
    const isOpen = openChoiceFilter === name;
    filter.list.hidden = !isOpen;
    filter.hint.textContent = isOpen ? "Hide" : "Choose";
    filter.summary.textContent = choiceLabel(name);
    filter.toggle.setAttribute("aria-expanded", String(isOpen));
    renderSingleChoiceList(name);
  }
}

function toggleSingleChoicePanel(name) {
  openChoiceFilter = openChoiceFilter === name ? "" : name;
  brandsOpen = false;
  sourcesOpen = false;
  searchOpen = false;
  updateBrandPanel();
  updateSourcePanel();
  updateSingleChoicePanels();
  updateSearchPanel();
}

function updateSearchPanel() {
  searchPanel.hidden = !searchOpen;
  toggleSearchButton.classList.toggle("active", searchOpen || Boolean(searchInput.value.trim()));
  toggleSearchButton.setAttribute("aria-expanded", String(searchOpen));
  if (searchOpen) searchInput.focus();
}

function closeOpenPanels() {
  let changed = false;
  if (brandsOpen) {
    brandsOpen = false;
    changed = true;
  }
  if (sourcesOpen) {
    sourcesOpen = false;
    changed = true;
  }
  if (searchOpen) {
    searchOpen = false;
    changed = true;
  }
  if (openChoiceFilter) {
    openChoiceFilter = "";
    changed = true;
  }
  if (!changed) return;
  updateBrandPanel();
  updateSourcePanel();
  updateSingleChoicePanels();
  updateSearchPanel();
}

function renderBrandDirectory(brands) {
  const directory = document.createElement("div");
  directory.className = "brandDirectory";

  const letters = [...new Set(brands.map((brand) => brand[0].toUpperCase()).filter((letter) => /[A-Z]/.test(letter)))];
  const letterNav = document.createElement("div");
  letterNav.className = "brandLetters";

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.textContent = "ALL";
  allButton.className = selectedBrands.size ? "" : "active";
  allButton.addEventListener("click", () => {
    selectedBrands.clear();
    populateFilters(allFinds);
    render();
  });
  letterNav.append(allButton);

  for (const letter of letters) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = letter;
    button.addEventListener("click", () => {
      document.querySelector(`#brand-letter-${letter}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    letterNav.append(button);
  }

  directory.append(letterNav);

  for (const letter of letters) {
    const sectionBrands = brands.filter((brand) => brand[0].toUpperCase() === letter);
    const section = document.createElement("section");
    section.className = "brandSection";
    section.id = `brand-letter-${letter}`;

    const heading = document.createElement("div");
    heading.className = "brandLetter";
    heading.textContent = letter;

    const names = document.createElement("div");
    names.className = "brandNames";

    for (const brand of sectionBrands) {
      const button = document.createElement("button");
      const name = document.createElement("span");
      const tag = document.createElement("span");
      button.type = "button";
      button.className = selectedBrands.has(brand) ? "brandOption selected" : "brandOption";
      name.textContent = brand;
      tag.className = `brandTag ${brandTypes.get(brand) || "clothes"}`;
      tag.textContent = brandTypes.get(brand) || "clothes";
      button.append(name, tag);
      button.addEventListener("click", () => {
        if (selectedBrands.has(brand)) selectedBrands.delete(brand);
        else selectedBrands.add(brand);
        populateFilters(allFinds);
        render();
      });
      names.append(button);
    }

    section.append(heading, names);
    directory.append(section);
  }

  brandList.append(directory);
}

function renderSourceList(sources) {
  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = selectedSources.size ? "sourceOption" : "sourceOption selected";
  allButton.textContent = "All sources";
  allButton.addEventListener("click", () => {
    selectedSources.clear();
    populateFilters(allFinds);
    render();
  });
  sourceList.append(allButton);

  for (const source of sources) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = selectedSources.has(source) ? "sourceOption selected" : "sourceOption";
    button.textContent = source;
    button.addEventListener("click", () => {
      if (selectedSources.has(source)) selectedSources.delete(source);
      else selectedSources.add(source);
      populateFilters(allFinds);
      render();
    });
    sourceList.append(button);
  }
}

function setProgress(completed, total, label = "") {
  progressWrap.hidden = false;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressFill.style.width = `${percent}%`;
  progressText.textContent = label || `${completed}/${total} sources scanned`;
}

function hideProgress() {
  progressWrap.hidden = true;
  progressFill.style.width = "0%";
  progressText.textContent = "";
}

function applyData(data, labelPrefix = "Cached") {
  allFinds = data.finds;
  allBrands = (data.brands || []).map((item) => item.brand).filter(Boolean);
  brandTypes = new Map((data.brands || []).map((item) => [item.brand, item.type || "clothes"]));
  allSources = (data.sources || []).map((item) => item.source).filter(Boolean);
  populateFilters(allFinds);
  const newCount = allFinds.filter((find) => find.isNew).length;
  const priceDropCount = allFinds.filter((find) => find.priceComparison?.priceDelta < -0.01).length;
  const newText = newCount ? ` · ${newCount} new` : "";
  const priceDropText = priceDropCount ? ` · ${priceDropCount} price drops` : "";
  if (!newCount) newOnly = false;
  newOnlyButton.hidden = !newCount;
  updatedEl.textContent = `${labelPrefix} ${new Date(data.updatedAt).toLocaleString()} · scanned ${data.scanned} products${newText}${priceDropText}`;
  render();
}

function filteredFinds() {
  const query = searchInput.value.trim().toLowerCase();
  const minDiscount = Number.parseFloat(choiceValue("discount"));
  return allFinds.filter((find) => {
    const isShoe = isShoeFind(find);
    if (newOnly && !find.isNew) return false;
    if (displayedDiscountValue(find.discount) < minDiscount) return false;
    if (choiceValue("type") === "clothes" && isShoe) return false;
    if (choiceValue("type") === "shoes" && !isShoe) return false;
    if (choiceValue("gender") && find.gender !== choiceValue("gender")) return false;
    if (selectedBrands.size && !selectedBrands.has(find.brand)) return false;
    if (selectedSources.size && !selectedSources.has(find.source)) return false;
    if (!matchingSizes(find).length) return false;
    if (query && !textFor(find).includes(query)) return false;
    return true;
  });
}

function render() {
  const finds = filteredFinds();
  countEl.textContent = finds.length;
  newOnlyButton.classList.toggle("active", newOnly);
  grid.innerHTML = "";

  if (!finds.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No matching finds right now. Try clearing filters or refreshing later.";
    grid.append(empty);
    return;
  }

  for (const find of finds) {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".card");
    const imgLink = node.querySelector(".imageWrap");
    const img = node.querySelector("img");
    const openLink = node.querySelector(".openLink");

    imgLink.href = find.url;
    img.src = find.image;
    img.alt = find.title;
    node.querySelector(".source").textContent = find.source;
    const newBadge = node.querySelector(".newBadge");
    newBadge.hidden = !find.isNew;
    node.querySelector("h2").textContent = find.title;
    const gender = find.gender ? find.gender[0].toUpperCase() + find.gender.slice(1) : "Neutral";
    node.querySelector(".brand").textContent = `${find.brand} · ${find.category || "Kidswear"} · ${gender}`;
    node.querySelector(".sale").textContent = money(find.salePrice, find.currency);
    node.querySelector(".original").textContent = money(find.originalPrice, find.currency);
    node.querySelector(".discount").textContent = pct(find.discount);
    const priceChange = node.querySelector(".priceChange");
    const comparisonText = priceComparisonText(find);
    priceChange.hidden = !comparisonText;
    priceChange.textContent = comparisonText;
    priceChange.className = "priceChange";
    if (find.priceComparison?.priceDelta < -0.01) priceChange.classList.add("down");
    if (find.priceComparison?.priceDelta > 0.01) priceChange.classList.add("up");
    node.querySelector(".sizes").textContent = `Sizes: ${formatMatchingSizes(find)}`;
    openLink.href = find.url;
    card.dataset.brand = find.brand;
    card.classList.toggle("isNew", Boolean(find.isNew));
    grid.append(node);
  }
}

async function loadFinds(force = false) {
  refreshButton.disabled = true;
  refreshButton.textContent = "Refreshing...";
  updatedEl.textContent = force ? "Refreshing from stores..." : "Loading saved products...";
  if (force) {
    allFinds = [];
    render();
  }
  try {
    const params = new URLSearchParams({ minDiscount: String(loadedMinDiscount) });
    if (force) params.set("refresh", "1");
    const response = await fetch(`/api/finds/stream?${params}`);
    if (!response.ok || !response.body) throw new Error("Could not load finds");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.type === "fatal") throw new Error(event.error || "Could not load finds");
        if (event.type === "cache") {
          hideProgress();
          applyData(event.data, "Cached");
        }
        if (event.type === "start") {
          setProgress(0, event.total, `Scanning 0/${event.total} sources`);
        }
        if (event.type === "store") {
          const note = event.error ? `${event.source} skipped: ${event.error}` : `${event.source}: scanned ${event.scanned} products`;
          setProgress(event.completed, event.total, `${event.completed}/${event.total} · ${note}`);
          applyData(event.data, "Refreshing");
        }
        if (event.type === "done") {
          applyData(event.data, "Saved");
          setProgress(1, 1, "Refresh complete");
          window.setTimeout(hideProgress, 1200);
        }
      }

      if (done) break;
    }
  } catch (error) {
    grid.innerHTML = `<div class="error">${error.message}</div>`;
    updatedEl.textContent = "Could not load products.";
    hideProgress();
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = "Refresh latest";
  }
}

clearBrandsButton.addEventListener("click", () => {
  selectedBrands.clear();
  populateFilters(allFinds);
  render();
});

favoriteBrandsButton.addEventListener("click", () => {
  selectedBrands = new Set(favoriteBrands.filter((brand) => allBrands.includes(brand)));
  populateFilters(allFinds);
  render();
});

clearSourcesButton.addEventListener("click", () => {
  selectedSources.clear();
  populateFilters(allFinds);
  render();
});

newOnlyButton.addEventListener("click", () => {
  newOnly = !newOnly;
  if (newOnly) {
    selectedBrands.clear();
    selectedSources.clear();
    searchInput.value = "";
    singleChoiceFilters.discount.value = "0.4";
    singleChoiceFilters.type.value = "";
    singleChoiceFilters.gender.value = "";
    singleChoiceFilters.size.value = "";
    singleChoiceFilters.shoeSize.value = "";
    closeOpenPanels();
    populateFilters(allFinds);
    updateSingleChoicePanels();
  }
  render();
});

brandToggleArea.addEventListener("click", () => {
  toggleBrandPanel();
});

sourceToggleArea.addEventListener("click", () => {
  toggleSourcePanel();
});

toggleSearchButton.addEventListener("click", () => {
  const nextOpen = !searchOpen;
  searchOpen = nextOpen;
  brandsOpen = false;
  sourcesOpen = false;
  openChoiceFilter = "";
  updateBrandPanel();
  updateSourcePanel();
  updateSingleChoicePanels();
  updateSearchPanel();
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (
    target.closest(".brandFilter")
    || target.closest(".sourceFilter")
    || target.closest(".singleChoiceFilter")
    || target.closest(".searchFilter")
  ) {
    return;
  }
  closeOpenPanels();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeOpenPanels();
});

for (const input of [searchInput]) {
  input.addEventListener("input", render);
  input.addEventListener("change", render);
}
searchInput.addEventListener("input", updateSearchPanel);
refreshButton.addEventListener("click", () => loadFinds(true));

for (const [name, filter] of Object.entries(singleChoiceFilters)) {
  renderSingleChoiceList(name);
  filter.toggle.addEventListener("click", () => toggleSingleChoicePanel(name));
}
updateSingleChoicePanels();
loadFinds();
