const grid = document.querySelector("#grid");
const template = document.querySelector("#cardTemplate");
const searchInput = document.querySelector("#searchInput");
const searchPanel = document.querySelector("#searchPanel");
const toggleSearchButton = document.querySelector("#toggleSearchButton");
const brandList = document.querySelector("#brandList");
const brandToggleArea = document.querySelector("#brandToggleArea");
const brandSummary = document.querySelector("#brandSummary");
const toggleBrandsButton = document.querySelector("#toggleBrandsButton");
const clearBrandsButton = document.querySelector("#clearBrandsButton");
const sourceList = document.querySelector("#sourceList");
const sourceToggleArea = document.querySelector("#sourceToggleArea");
const sourceSummary = document.querySelector("#sourceSummary");
const toggleSourcesButton = document.querySelector("#toggleSourcesButton");
const clearSourcesButton = document.querySelector("#clearSourcesButton");
const adminUnlockButton = document.querySelector("#adminUnlockButton");
const refreshButton = document.querySelector("#refreshButton");
const stopRefreshButton = document.querySelector("#stopRefreshButton");
const countEl = document.querySelector("#count");
const updatedEl = document.querySelector("#updated");
const womenOnlyButton = document.querySelector("#womenOnlyButton");
const newOnlyButton = document.querySelector("#newOnlyButton");
const priceDropsButton = document.querySelector("#priceDropsButton");
const progressWrap = document.querySelector("#progressWrap");
const progressFill = document.querySelector("#progressFill");
const progressText = document.querySelector("#progressText");
const refreshReport = document.querySelector("#refreshReport");
const reportStats = document.querySelector("#reportStats");
const reportDetails = document.querySelector("#reportDetails");
const reportToggleButton = document.querySelector("#reportToggleButton");
const reportDetailsButton = document.querySelector("#reportDetailsButton");
const promoBoard = document.querySelector("#promoBoard");
const promoList = document.querySelector("#promoList");
const promoCount = document.querySelector("#promoCount");
const promoToggleButton = document.querySelector("#promoToggleButton");
const backgroundRemovedImageCache = new Map();
const imageProcessObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      imageProcessObserver.unobserve(entry.target);
      processCardImage(entry.target);
    }
  }, { rootMargin: "900px 0px" })
  : null;

let allFinds = [];
let allBrands = [];
let brandTypes = new Map();
let allSources = [];
let sourcePromos = [];
let sourceHomeUrls = new Map();
let selectedBrands = new Set();
let selectedSources = new Set();
let brandsOpen = false;
let sourcesOpen = false;
let searchOpen = false;
let promosOpen = false;
let reportOpen = false;
let reportDetailsOpen = false;
let latestReportData = null;
let womenOnly = false;
let newOnly = false;
let priceDropsOnly = false;
let loadedMinDiscount = 0.4;
let activeLoadController = null;
let refreshInProgress = false;
let refreshBackupData = null;
let latestCompleteData = null;
const adminRefreshTokenKey = "lexiMomAdminRefreshToken";
const favoriteBrands = ["Billieblush", "Floss", "Wynken", "Emile et Ida"];
const brandStyleCollections = [
  {
    id: "my-picks",
    label: "My picks",
    brands: favoriteBrands,
  },
  {
    id: "french",
    label: "French",
    brands: [
      "Louise Misha",
      "Bonpoint",
      "Bonton",
      "Emile et Ida",
      "Louis Louise",
      "Jacadi",
      "Petit Bateau",
      "Nellystella",
      "C'era Una Volta",
      "Noralee",
    ],
  },
  {
    id: "nordic",
    label: "Nordic minimal",
    brands: [
      "Konges Slojd",
      "Wheat",
      "Mini A Ture",
      "1+ In The Family",
      "Bebe Organic",
      "FUB",
      "Gray Label",
      "Liewood",
      "Mabli",
      "MarMar Copenhagen",
      "Organic Zoo",
      "Silly Silas",
    ],
  },
  {
    id: "arty",
    label: "Colorful / arty",
    brands: [
      "Bobo Choses",
      "Mini Rodini",
      "Tiny Cottons",
      "The Animals Observatory",
      "Beau Loves",
      "Billieblush",
      "Floss",
      "Oilily",
      "Raspberry Plum",
      "Stella",
      "The New Society",
      "Wynken",
      "Huxbaby",
    ],
  },
  {
    id: "heirloom",
    label: "Boho / heirloom",
    brands: [
      "Apolina",
      "Misha and Puff",
      "Caramel",
      "Donsje",
      "SISSEL EDELBO",
      "Kalinka",
      "Boheme",
      "Bebe Organic",
      "Tutu Du Monde",
    ],
  },
  {
    id: "dressy",
    label: "Sweet dress-up",
    brands: [
      "Tutu Du Monde",
      "Noralee",
      "Petite Hailey",
      "Nellystella",
      "Billieblush",
      "Bonpoint",
    ],
  },
  {
    id: "shoes",
    label: "Shoes",
    brands: [
      "Old Soles",
      "See Kai Run",
      "Bisgaard",
      "Bundgaard",
      "Donsje",
    ],
  },
];
let brandSearchQuery = "";
let sourceSearchQuery = "";
const usualSources = [
  "Tiptoe Boutique",
  "Pacifier Kids",
  "Buttons and Bows NY",
  "Ladida",
  "South Coast Baby Co",
  "Bella Kids NY",
];
const bigStoreSources = [
  "Childrensalon",
  "Maisonette",
  "Smallable",
];
const trustedStoreSources = new Set([
  "Buttons and Bows NY",
  "Pacifier Kids",
  "Enjoy Kids US",
  "Tiptoe Boutique",
  "Village Maternity",
  "Little K Co",
  "Boutique Little",
  "Ladida",
  "Bdazzle",
  "Stoopher",
  "Little Big Penguin",
  "Mom Loves Me",
]);
const storeHomeUrls = new Map([
  ["Tiptoe Boutique", "https://tiptoeboutique.com"],
  ["Pacifier Kids", "https://pacifierkids.com"],
  ["Buttons and Bows NY", "https://buttonsandbowsny.com"],
  ["Ladida", "https://www.ladida.com"],
  ["South Coast Baby Co", "https://south-coast-baby-co.myshopify.com"],
  ["Design Life Kids", "https://www.designlifekids.com"],
  ["Bella Kids NY", "https://www.bellakidsny.com"],
  ["Boutique Little", "https://www.boutiquelittle.com"],
  ["Little K Co", "https://littlekco.com"],
  ["Village Maternity", "https://villagematernity.com"],
  ["Tiny Apple", "https://www.tinyapple.net"],
  ["The Front Shop", "https://www.thefrontshop.com"],
  ["Ele Ella", "https://eleella.com"],
  ["Little Red Planet", "https://thelittleredplanet.com"],
  ["Panda and Cub", "https://pandaandcub.com"],
  ["Little Rags and Riches", "https://www.littleragsandriches.com"],
  ["Faded Floral Boutique", "https://fadedfloralboutique.com"],
  ["Hello Alyss", "https://www.hello-alyss.com"],
  ["Hello Little Crew", "https://hellolittlecrew.com"],
  ["Little Loungers", "https://littleloungers.com"],
  ["Millie Bo Peep", "https://www.milliebopeep.com"],
  ["Sanna Baby and Child", "https://sannababyandchild.com"],
  ["Le Petit Kids", "https://lepetitkids.com"],
  ["Born Yesterday Kids", "https://bornyesterdaykids.com"],
  ["Stoopher", "https://stoopher.com"],
  ["Cotton Candy Kidz", "https://cottoncandykidz.com"],
  ["Kid Biz", "https://kidbizkid.com"],
  ["Mini Dreamers", "https://www.minidreamers.com"],
  ["Bears Closet Boutique", "https://bearsclosetboutique.com"],
  ["Kids Atelier", "https://www.kidsatelier.com"],
  ["Bdazzle", "https://shopbdazzle.com"],
  ["Little Dreamers Boutique", "https://littledreamers.boutique"],
  ["Honeypie Kids", "https://www.honeypiekids.com"],
  ["Skipper Scout", "https://skipperscout.com"],
  ["The Shoppe Miami", "https://theshoppemiami.com"],
  ["Oh Baby St Pete", "https://ohbabystp.com"],
  ["Coucou Kids", "https://shopcoucoukids.com"],
  ["My Oh My Kids", "https://myohmykids.com"],
  ["Jam Baby", "https://shopjambaby.com"],
  ["Tottini", "https://tottini.com"],
  ["Little Waves Kids", "https://littlewaveskids.com"],
  ["Whoopi Kids", "https://whoopikids.com"],
  ["Wee Mondine", "https://weemondine.com"],
  ["Shan and Toad", "https://shanandtoad.com"],
  ["Milomoo Baby", "https://milomoobaby.com"],
  ["Little Big Penguin", "https://littlebigpenguin.com"],
  ["Young Timers NY", "https://www.youngtimersny.com"],
  ["Spilled Milk", "https://getspilledmilk.com"],
  ["Milk + Bots", "https://milkbots.com"],
  ["Wrightsville Ave", "https://wrightsvilleave.com"],
  ["Mom Loves Me", "https://momlovesme.us"],
  ["Flying Ryno", "https://www.flyingryno.com"],
  ["Maison Baby & Kids", "https://maisonbabyandkids.com"],
  ["Childrensalon", "https://www.childrensalon.com"],
  ["Maisonette", "https://www.maisonette.com"],
  ["Enjoy Kids US", "https://enjoykidsus.com"],
  ["Ellou", "https://www.shopellou.com"],
  ["Little-ish", "https://shop.little-ish.com"],
  ["Klade Children's Boutique", "https://kladechildren.com"],
  ["Willkie's", "https://shopwillkies.com"],
  ["Threadfare", "https://www.threadfare.com"],
  ["Fussy Mussy", "https://fussymussycb.com"],
  ["Alexa James Baby", "https://www.alexajbaby.com"],
  ["Marigold Modern", "https://shop.marigoldmodern.com"],
  ["Murray & Finn", "https://murrayandfinn.com"],
  ["Cub Shrub", "https://cubshrub.com"],
  ["Broomtail Kids", "https://broomtailkids.com"],
  ["Danrie", "https://shopdanrie.com"],
  ["Smoochie Baby", "https://smoochiebaby.com"],
  ["Dreams of Cuteness", "https://www.dreamsofcuteness.com"],
  ["Ely's & Co", "https://elysandco.com"],
  ["Two Tulips", "https://twotulips.com"],
  ["Smallable", "https://www.smallable.com"],
]);
function promoSortRank(item) {
  const note = displayPromoNote(item.promoNote || "", item.source).toLowerCase();
  if (!note) return { group: 3, value: Number.POSITIVE_INFINITY };
  const percent = note.match(/\b(\d{1,2})%\s*off\b/);
  const mentionsShipping = /\b(?:free\s+(?:u\.?s\.?a?\.?\s+)?shipping|ship(?:s|ping)?)\b/.test(note);
  if (percent && !mentionsShipping) return { group: 0, value: -Number(percent[1]) };
  if (/\b(code|buy\s+\d+|extra|additional|take|save|get)\b/.test(note) && percent) {
    return { group: 0, value: -Number(percent[1]) };
  }
  if (mentionsShipping) {
    const threshold = note.match(/orders?\s*(?:over|above|of|on|at|>=)?\s*[$£€]?\s*(\d+(?:\.\d+)?)/)
      || note.match(/[$£€]?\s*(\d+(?:\.\d+)?)\s+away\s+from\s+free\s+shipping/)
      || note.match(/[$£€]\s*(\d+(?:\.\d+)?)/);
    return { group: 1, value: threshold ? Number(threshold[1]) : Number.POSITIVE_INFINITY };
  }
  return { group: 2, value: 0 };
}

function sortPromos(a, b) {
  const rankA = promoSortRank(a);
  const rankB = promoSortRank(b);
  return rankA.group - rankB.group
    || rankA.value - rankB.value
    || a.source.localeCompare(b.source);
}

function displayPromoNote(value = "", source = "") {
  const originalNote = String(value || "");
  let note = originalNote
    .replace(/\s+/g, " ")
    .trim();
  if (!note) return "";

  const patterns = [
    /\bfree\s+(?:u\.?s\.?a?\.?\s+|us\s+)?shipping\b[^.!?·]{0,80}\b(?:orders?|over|above|on|with)?[^.!?·]{0,30}(?:[$£€]?\s*\d+(?:\.\d+)?\+?)/i,
    /\b(?:end\s+of\s+season|summer|sample|past\s+season|warehouse|final|fw\d{2})?[^.!?·]{0,24}\bsale\b[^.!?·]{0,50}\b(?:up\s+to\s+)?\d{1,2}%\s*off\b/i,
    /\b(?:up\s+to\s+)?\d{1,2}%\s*off\s+sale\b/i,
    /\b(?:use\s+code|with\s+code|promo\s+code|code)\s*[:\-]?\s*[A-Z0-9]{3,20}\b[^.!?·]{0,50}/i,
    /\b(?:buy|get)\s+\d+[^.!?·]{0,80}\b(?:off|free|sale|discount)\b/i,
  ];
  let matchedPattern = false;
  for (const pattern of patterns) {
    const match = note.match(pattern);
    if (match) {
      note = match[0];
      matchedPattern = true;
      break;
    }
  }
  if (source === "South Coast Baby Co" && !matchedPattern) return "";
  if (/^\s*[$£€]?\s*\d+(?:\.\d+)?\b/.test(note) && /\b(?:regular price|sale price|no reviews)\b/i.test(originalNote)) return "";

  const cutoff = note.match(/\b(?:shop now|shop the|new baby boxes|new arrivals|navigation|popular products|all collections|shop by category|home new arrivals|same day dispatched|instagram|facebook|pause slideshow|play slideshow|newsletter signup|sign up to receive|currency|sign in|my wish lists|baby girl|baby boy|baby girls|baby boys|regular price|sale price|no reviews)\b/i);
  if (cutoff?.index > 0) note = note.slice(0, cutoff.index);
  note = note
    .split("·")[0]
    .replace(/\bWHOLESALE\s+/gi, "")
    .replace(/(\b\d{1,2}%\s*off\s+sale\b).*/i, "$1")
    .replace(/(\bfree\s+(?:u\.?s\.?a?\.?\s+|us\s+)?shipping\b.*?[$£€]?\s*\d+(?:\.\d+)?\+?).*/i, "$1")
    .replace(/\*+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return note.length > 80 ? `${note.slice(0, 77).trim()}...` : note;
}

function sourceHomeUrl(source, fallbackUrl = "") {
  if (storeHomeUrls.has(source)) return storeHomeUrls.get(source);
  if (sourceHomeUrls.has(source)) return sourceHomeUrls.get(source);
  try {
    return fallbackUrl ? new URL(fallbackUrl).origin : "";
  } catch {
    return "";
  }
}

function adminRefreshToken() {
  return window.sessionStorage.getItem(adminRefreshTokenKey) || "";
}

function cloneDataSnapshot(data) {
  if (!data) return null;
  return JSON.parse(JSON.stringify(data));
}

function sourceLabelText(data) {
  const key = data?.cacheSource || "";
  if (key === "snapshot-fallback") return "Snapshot fallback";
  if (key === "live-cache") return "Live cache";
  return data?.cacheSourceLabel || "Saved";
}

function looksLikeBrokenSavedData(data) {
  if (!data || typeof data !== "object") return false;
  const updatedAt = Date.parse(data.updatedAt || "");
  const sourceCount = Array.isArray(data.sources) ? data.sources.length : 0;
  return (
    data.scanned === 0
    && data.count === 0
    && sourceCount >= 50
    && Number.isFinite(updatedAt)
    && updatedAt <= Date.parse("2000-01-01T00:00:00.000Z")
  );
}

function updateAdminControls() {
  const unlocked = Boolean(adminRefreshToken());
  refreshButton.hidden = !unlocked;
  stopRefreshButton.hidden = !unlocked;
  stopRefreshButton.disabled = !refreshInProgress;
  if (!refreshButton.disabled) refreshButton.textContent = selectedSources.size ? "Refresh selected" : "Refresh latest";
  stopRefreshButton.textContent = refreshInProgress ? "Stop refresh" : "Stop refresh";
  if (!reportToggleButton || !refreshReport) {
    adminUnlockButton.textContent = unlocked ? "Admin unlocked" : "Admin unlock";
    adminUnlockButton.classList.toggle("active", unlocked);
    return;
  }
  reportToggleButton.hidden = !unlocked || !latestReportData;
  if (!unlocked) {
    reportOpen = false;
    refreshReport.hidden = true;
  }
  adminUnlockButton.textContent = unlocked ? "Admin unlocked" : "Admin unlock";
  adminUnlockButton.classList.toggle("active", unlocked);
  reportToggleButton.classList.toggle("active", reportOpen);
  reportToggleButton.setAttribute("aria-expanded", String(reportOpen));
}

function unlockAdminRefresh() {
  const existing = adminRefreshToken();
  const token = window.prompt("Admin password for refreshing stores:", existing);
  if (token === null) return false;
  const trimmed = token.trim();
  if (!trimmed) {
    window.sessionStorage.removeItem(adminRefreshTokenKey);
    updateAdminControls();
    return false;
  }
  window.sessionStorage.setItem(adminRefreshTokenKey, trimmed);
  updateAdminControls();
  return true;
}

function lockAdminRefresh() {
  window.sessionStorage.removeItem(adminRefreshTokenKey);
  reportOpen = false;
  updateAdminControls();
}

function stopRefresh() {
  if (!activeLoadController) return;
  activeLoadController.abort();
}

const singleChoiceFilters = {
  sort: {
    value: "date-desc",
    options: [
      { value: "alpha-asc", label: "Alphabetically, A-Z" },
      { value: "alpha-desc", label: "Alphabetically, Z-A" },
      { value: "price-asc", label: "Price, low to high" },
      { value: "price-desc", label: "Price, high to low" },
      { value: "date-asc", label: "Date, old to new" },
      { value: "date-desc", label: "Date, new to old" },
    ],
    toggle: document.querySelector("#sortToggleArea"),
    summary: document.querySelector("#sortSummary"),
    hint: document.querySelector("#toggleSortButton"),
    list: document.querySelector("#sortList"),
  },
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
      { value: "accessories", label: "Accessories" },
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
      { value: "adult-any", label: "Women sizes" },
      { value: "adult-xs-s", label: "Women XS-S" },
      { value: "adult-m-l", label: "Women M-L" },
      { value: "adult-xl-plus", label: "Women XL+" },
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

function proxiedImageUrl(src = "") {
  if (!src) return "";
  return `/api/image-proxy?src=${encodeURIComponent(src)}`;
}

function backgroundAnchorSample(imageData) {
  const { data, width, height } = imageData;
  const samplePoints = [
    [0, 0],
    [Math.floor(width / 2), 0],
    [width - 1, 0],
    [0, Math.floor(height / 2)],
    [width - 1, Math.floor(height / 2)],
    [0, height - 1],
    [Math.floor(width / 2), height - 1],
    [width - 1, height - 1],
  ];
  const samples = [];
  const sample = ([x, y]) => {
    const index = (y * width + x) * 4;
    const alpha = data[index + 3];
    if (alpha < 16) return null;
    return {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
    };
  };

  for (const point of samplePoints) {
    const color = sample(point);
    if (color) samples.push({ point, color });
  }

  if (samples.length < 6) return null;

  const average = samples.reduce((total, sampleValue) => ({
    r: total.r + sampleValue.color.r,
    g: total.g + sampleValue.color.g,
    b: total.b + sampleValue.color.b,
  }), { r: 0, g: 0, b: 0 });
  const color = {
    r: average.r / samples.length,
    g: average.g / samples.length,
    b: average.b / samples.length,
  };

  const maxAnchorDistance = 24;
  const consistent = samples.every((sampleValue) => (
    Math.abs(sampleValue.color.r - color.r)
    + Math.abs(sampleValue.color.g - color.g)
    + Math.abs(sampleValue.color.b - color.b)
  ) <= maxAnchorDistance);

  if (!consistent) return null;
  return { color, points: samples.map((sampleValue) => sampleValue.point) };
}

function removeConnectedBackground(imageData) {
  const { data, width, height } = imageData;
  const background = backgroundAnchorSample(imageData);
  if (!background) return false;
  const visited = new Uint8Array(width * height);
  const queue = [];
  const threshold = 16;
  const luminanceThreshold = 245;

  const matchesBackground = (x, y) => {
    const index = (y * width + x) * 4;
    const alpha = data[index + 3];
    if (alpha < 16) return true;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const distance = Math.abs(r - background.color.r) + Math.abs(g - background.color.g) + Math.abs(b - background.color.b);
    const luminance = (r + g + b) / 3;
    return distance <= threshold || (distance <= threshold * 1.7 && luminance >= luminanceThreshold);
  };

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const flatIndex = y * width + x;
    if (visited[flatIndex]) return;
    visited[flatIndex] = 1;
    if (!matchesBackground(x, y)) return;
    queue.push(flatIndex);
  };

  for (const [x, y] of background.points) {
    push(x, y);
  }

  for (let index = 0; index < queue.length; index += 1) {
    const flatIndex = queue[index];
    const x = flatIndex % width;
    const y = Math.floor(flatIndex / width);
    const pixelIndex = flatIndex * 4;
    data[pixelIndex + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  return queue.length > 0;
}

function alphaBounds(imageData) {
  const { data, width, height } = imageData;
  let top = height;
  let left = width;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < 16) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right < left || bottom < top) {
    return { left: 0, top: 0, width, height };
  }

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

async function backgroundRemovedImageSrc(src = "") {
  if (!src) return "";
  if (backgroundRemovedImageCache.has(src)) return backgroundRemovedImageCache.get(src);

  const promise = new Promise((resolve) => {
    const proxySrc = proxiedImageUrl(src);
    const loader = new Image();
    loader.decoding = "async";
    loader.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = loader.naturalWidth;
        canvas.height = loader.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          resolve("");
          return;
        }
        context.drawImage(loader, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const backgroundRemoved = removeConnectedBackground(imageData);
        if (!backgroundRemoved) {
          resolve("");
          return;
        }
        context.putImageData(imageData, 0, 0);
        const bounds = alphaBounds(imageData);
        const targetFill = 0.82;
        const squareSize = Math.max(
          32,
          Math.ceil(Math.max(bounds.width, bounds.height) / targetFill),
        );
        const outputCanvas = document.createElement("canvas");
        outputCanvas.width = squareSize;
        outputCanvas.height = squareSize;
        const outputContext = outputCanvas.getContext("2d");
        if (!outputContext) {
          resolve(canvas.toDataURL("image/png"));
          return;
        }
        const drawWidth = bounds.width;
        const drawHeight = bounds.height;
        const drawX = Math.round((squareSize - drawWidth) / 2);
        const drawY = Math.round((squareSize - drawHeight) / 2);
        outputContext.drawImage(
          canvas,
          bounds.left,
          bounds.top,
          bounds.width,
          bounds.height,
          drawX,
          drawY,
          drawWidth,
          drawHeight,
        );
        resolve(outputCanvas.toDataURL("image/png"));
      } catch {
        resolve("");
      }
    };
    loader.onerror = () => resolve("");
    loader.src = proxySrc;
  });

  backgroundRemovedImageCache.set(src, promise);
  return promise;
}

function processCardImage(img) {
  const originalSrc = img.dataset.originalSrc || "";
  if (!originalSrc || img.dataset.processingStarted === "1") return;
  img.dataset.processingStarted = "1";
  backgroundRemovedImageSrc(originalSrc).then((processedSrc) => {
    if (!processedSrc || !img.isConnected || img.dataset.originalSrc !== originalSrc) return;
    img.src = processedSrc;
  });
}

function queueCardImageProcessing(img) {
  if (imageProcessObserver) {
    imageProcessObserver.observe(img);
    return;
  }
  processCardImage(img);
}

function priceComparisonText(find) {
  const comparison = find.priceComparison;
  if (!comparison || !Number.isFinite(comparison.priceDelta)) return "";
  const delta = Math.abs(comparison.priceDelta);
  if (delta < 0.01) return "";
  const prefix = comparison.priceDelta < 0 ? "down" : "up";
  return `${prefix} ${money(delta, find.currency)}`;
}

function originalSortIndex(find) {
  return Number.isFinite(find.sortIndex) ? find.sortIndex : Number.MAX_SAFE_INTEGER;
}

function compareNumbers(a, b) {
  const aValue = Number.isFinite(a) ? a : Number.POSITIVE_INFINITY;
  const bValue = Number.isFinite(b) ? b : Number.POSITIVE_INFINITY;
  return aValue - bValue;
}

function compareTitles(a, b) {
  return String(a.title || "").localeCompare(String(b.title || ""));
}

function compareCurrentFeedOrder(a, b) {
  return originalSortIndex(a) - originalSortIndex(b);
}

function sortFinds(finds) {
  const sortValue = choiceValue("sort");
  const items = [...finds];
  items.sort((a, b) => {
    if (sortValue === "alpha-asc") {
      return compareTitles(a, b)
        || compareNumbers(a.salePrice, b.salePrice)
        || compareCurrentFeedOrder(a, b);
    }
    if (sortValue === "alpha-desc") {
      return compareTitles(b, a)
        || compareNumbers(a.salePrice, b.salePrice)
        || compareCurrentFeedOrder(a, b);
    }
    if (sortValue === "price-asc") {
      return compareNumbers(a.salePrice, b.salePrice)
        || compareTitles(a, b)
        || compareCurrentFeedOrder(a, b);
    }
    if (sortValue === "price-desc") {
      return compareNumbers(b.salePrice, a.salePrice)
        || compareTitles(a, b)
        || compareCurrentFeedOrder(a, b);
    }
    if (sortValue === "date-asc") {
      return compareCurrentFeedOrder(b, a)
        || compareTitles(a, b)
        || compareNumbers(a.salePrice, b.salePrice);
    }
    return compareCurrentFeedOrder(a, b)
      || compareTitles(a, b)
      || compareNumbers(a.salePrice, b.salePrice);
  });
  return items;
}

function hasAbnormalPrice(find) {
  const sale = Number(find.salePrice);
  const original = Number(find.originalPrice);
  const discount = Number(find.discount);
  if (!Number.isFinite(sale) || !Number.isFinite(original) || !Number.isFinite(discount)) return true;
  if (sale <= 0 || original <= 0 || original <= sale) return true;

  const ratio = original / sale;
  return original >= 5000
    || ratio >= 50
    || (original >= 1000 && ratio >= 20)
    || (original >= 500 && displayedDiscountValue(discount) >= 0.95);
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

function adultSizeNumbers(size = "") {
  const lower = size.toLowerCase();
  const values = [];

  for (const match of lower.matchAll(/\b(?:it|eu|fr)?\s*(3[2-9]|4\d|5\d)\b/g)) {
    const value = Number(match[1]);
    if (Number.isFinite(value)) values.push(value);
  }

  return [...new Set(values)];
}

function hasAdultLetterSize(size = "") {
  return /\b(xxs|xs|s\/m|m\/l|small|medium|large|xl|xxl|2xl|3xl|x-large)\b/i.test(size);
}

function isAdultClothingSize(size = "") {
  if (!size) return false;
  if (isBabySize(size)) return false;
  const years = yearsFromSize(size);
  if (years.some((year) => year > 0 && year < 18)) return false;
  if (hasAdultLetterSize(size)) return true;
  return adultSizeNumbers(size).length > 0;
}

function isWomenModeActive() {
  return womenOnly;
}

function hasAdultSizeOption(find) {
  return eligibleSizeOptions(find).some((option) => isAdultClothingSize(option.size));
}

function visibleChoiceOptions(name) {
  const filter = singleChoiceFilters[name];
  if (name !== "size") return filter.options;
  if (isWomenModeActive()) {
    return filter.options.filter((option) => [
      "adult-any",
      "adult-xs-s",
      "adult-m-l",
      "adult-xl-plus",
      "",
    ].includes(option.value));
  }
  return filter.options.filter((option) => !String(option.value).startsWith("adult-"));
}

function isShoeFind(find) {
  const text = [find.title, find.category].join(" ").toLowerCase();
  return /\b(shoe|shoes|sandal|sandals|sneaker|sneakers|boot|boots|snowboot|snowboots|bootie|booties|footie|footies|loafer|loafers|mary jane|slipper|slippers|clog|clogs|flat|flats)\b/.test(text);
}

function isAccessoryFind(find) {
  if (isShoeFind(find)) return false;
  if (find.itemType === "accessories") return true;
  const title = String(find.title || "").toLowerCase();
  const category = String(find.category || "").toLowerCase();
  const clothingText = [title, category].join(" ");
  const clothingPattern = /\b(apparel|clothes|clothing|dress|dresses|shirt|shirts|tee|t-shirt|tank|top|tops|blouse|sweatshirt|sweater|cardigan|pant|pants|panty|trackpant|trackpants|sweatpant|sweatpants|trouser|trousers|legging|leggings|short|shorts|skirt|bottom|bottoms|romper|rompers|onesie|bodysuit|jumpsuit|jumpsuits|playsuit|playsuits|bubble|bubbles|overall|overalls|jacket|coat|swim|rashguard|bikini|bra|sports bra|tight|tights|sock|socks|pajama|pajamas|pyjama|pyjamas|layette|set|sweatsuit|tracksuit|bloomer|bloomers|jumper|jumpers|turtleneck|roll neck|one piece|sleepy doe)\b/;
  const broadApparelCategory = /\bapparel\s*(?:&|and)\s*accessories\b/.test(category);
  const accessoryPattern = /\b(accessory|accessories|hairgoods|hair|bow|bows|bow tie|clip|clips|barrette|headband|scrunchie|ribbon|toy|toys|doll|dolls|activity|rattle|teether|pacifier|blanket|bag|bags|purse|backpack|pouch|nap mat|quilt|quilts|quilted|basket|baskets|stationery|stationary|pencil|notebook|sticker|stickers|poster|print|lunch|bottle|cup|tableware|plate|bib|swaddle|towel|bath|decor|ornament|costume|dress up|jewelry|jewellery|necklace|bracelet|ring|hat|hats|sun hat|swim hat|bucket hat|beanie|bonnet|mitten|mittens|crown)\b/;

  if (/\bcostume\b/.test(title)) return true;
  if (clothingPattern.test(clothingText)) return false;
  if (broadApparelCategory && !accessoryPattern.test(title)) return false;
  return accessoryPattern.test([title, category].join(" "));
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
  if (String(choiceValue("size")).startsWith("adult-")) return false;
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
  if (isAccessoryFind(find)) return true;
  if (isShoeFind(find)) return selectedShoeSizeMatches(size, find);
  if (!filter) return true;
  if (filter === "adult-any") return isAdultClothingSize(size);
  if (filter === "adult-xs-s") {
    if (!isAdultClothingSize(size)) return false;
    const lower = size.toLowerCase();
    const numbers = adultSizeNumbers(size);
    return /\b(xxs|xs|small)\b/.test(lower)
      || /\bs\/m\b/.test(lower)
      || numbers.some((value) => value <= 36);
  }
  if (filter === "adult-m-l") {
    if (!isAdultClothingSize(size)) return false;
    const lower = size.toLowerCase();
    const numbers = adultSizeNumbers(size);
    return /\b(medium|large)\b/.test(lower)
      || /\bm\/l\b/.test(lower)
      || numbers.some((value) => value >= 38 && value <= 42);
  }
  if (filter === "adult-xl-plus") {
    if (!isAdultClothingSize(size)) return false;
    const lower = size.toLowerCase();
    const numbers = adultSizeNumbers(size);
    return /\b(xl|xxl|2xl|3xl|x-large)\b/.test(lower)
      || numbers.some((value) => value >= 44);
  }
  const years = yearsFromSize(size);
  if (filter === "3-6") return years.some((year) => year >= 3 && year <= 6);
  if (filter === "7plus") return years.some((year) => year >= 7);
  if (filter === "baby") return isBabySize(size) || years.some((year) => year < 3);
  return true;
}

function sizeSortValue(size, find) {
  if (isAccessoryFind(find)) return 998;
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
  return eligibleSizeOptions(find).filter((option) => {
    if (isAccessoryFind(find)) return true;
    if (isWomenModeActive() && !isShoeFind(find) && !isAdultClothingSize(option.size)) return false;
    return sizeMatches(option.size, filter, find);
  });
}

function matchingSizes(find) {
  return matchingSizeOptions(find).map((option) => option.size);
}

function formatMatchingSizes(find) {
  const options = matchingSizeOptions(find);
  const discounts = new Set(options.map((option) => Math.round(option.discount * 100)));
  const sizes = options.map((option) => {
    if (/^default title$/i.test(option.size)) return "One size";
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
  for (const option of visibleChoiceOptions(name)) {
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
    if (name === "size") {
      const visibleValues = new Set(visibleChoiceOptions(name).map((option) => option.value));
      if (!visibleValues.has(filter.value)) {
        filter.value = isWomenModeActive() ? "adult-any" : "3-6";
      }
    }
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
  if (promosOpen) {
    promosOpen = false;
    changed = true;
  }
  if (reportOpen) {
    reportOpen = false;
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
  renderPromoBoard();
  if (latestReportData) renderRefreshReport(latestReportData);
}

function renderBrandDirectory(brands) {
  const directory = document.createElement("div");
  directory.className = "brandDirectory";

  const header = document.createElement("div");
  header.className = "brandPickerHeader";

  const search = document.createElement("input");
  search.type = "search";
  search.className = "brandSearch";
  search.placeholder = "Search brands...";
  search.value = brandSearchQuery;
  search.addEventListener("input", () => {
    brandSearchQuery = search.value;
    populateFilters(allFinds);
    if (brandsOpen) window.setTimeout(() => brandList.querySelector(".brandSearch")?.focus(), 0);
  });

  header.append(search);
  directory.append(header);

  const normalizedQuery = brandSearchQuery.trim().toLowerCase();
  const visibleBrands = brands.filter((brand) => !normalizedQuery || brand.toLowerCase().includes(normalizedQuery));

  const styleCollections = brandStyleCollections
    .map((collection) => ({
      ...collection,
      brands: collection.brands.filter((brand) => brands.includes(brand) && (!normalizedQuery || brand.toLowerCase().includes(normalizedQuery))),
    }))
    .filter((collection) => collection.brands.length);

  if (styleCollections.length) {
    const styleSection = document.createElement("div");
    styleSection.className = "brandStyleCollections";

    for (const collection of styleCollections) {
      const button = document.createElement("button");
      const count = document.createElement("span");
      const allSelected = collection.brands.every((brand) => selectedBrands.has(brand));
      button.type = "button";
      button.className = allSelected ? "brandStyleButton active" : "brandStyleButton";
      button.textContent = collection.label;
      count.className = "brandStyleCount";
      count.textContent = String(collection.brands.length);
      button.append(document.createTextNode(" "), count);
      button.addEventListener("click", () => {
        selectedBrands = new Set(collection.brands);
        populateFilters(allFinds);
        render();
      });
      styleSection.append(button);
    }

    directory.append(styleSection);
  }

  const letters = [...new Set(visibleBrands.map((brand) => brand[0].toUpperCase()).filter((letter) => /[A-Z]/.test(letter)))];
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

  if (!visibleBrands.length) {
    const empty = document.createElement("p");
    empty.className = "brandEmpty";
    empty.textContent = "No matching brands";
    directory.append(empty);
    const count = document.createElement("p");
    count.className = "brandCount";
    count.textContent = `0 of ${brands.length} brands`;
    directory.append(count);
    brandList.append(directory);
    return;
  }

  for (const letter of letters) {
    const sectionBrands = visibleBrands.filter((brand) => brand[0].toUpperCase() === letter);
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

  const count = document.createElement("p");
  count.className = "brandCount";
  count.textContent = visibleBrands.length === brands.length
    ? `${brands.length} brands`
    : `${visibleBrands.length} of ${brands.length} brands`;
  directory.append(count);

  brandList.append(directory);
}

function renderSourceList(sources) {
  const header = document.createElement("div");
  header.className = "sourcePickerHeader";

  const search = document.createElement("input");
  search.type = "search";
  search.className = "sourceSearch";
  search.placeholder = "Search shops...";
  search.value = sourceSearchQuery;
  search.addEventListener("input", () => {
    sourceSearchQuery = search.value;
    populateFilters(allFinds);
    if (sourcesOpen) window.setTimeout(() => sourceList.querySelector(".sourceSearch")?.focus(), 0);
  });

  header.append(search);
  sourceList.append(header);

  const quickActions = document.createElement("div");
  quickActions.className = "sourceQuickActions";

  const makeQuickButton = (label, action, active = false) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = active ? "sourceQuickButton active" : "sourceQuickButton";
    button.textContent = label;
    button.addEventListener("click", action);
    quickActions.append(button);
  };

  const selectMatchingSources = (wanted) => {
    selectedSources = new Set(wanted.filter((source) => sources.includes(source)));
    populateFilters(allFinds);
    render();
  };

  makeQuickButton("All", () => {
    selectedSources.clear();
    populateFilters(allFinds);
    render();
  }, !selectedSources.size);
  makeQuickButton("Trusted", () => selectMatchingSources([...trustedStoreSources]));
  makeQuickButton("Usuals", () => selectMatchingSources(usualSources));
  makeQuickButton("New shops", () => {
    const newerSources = sources.filter((source) => !usualSources.includes(source) && !bigStoreSources.includes(source));
    selectMatchingSources(newerSources);
  });
  makeQuickButton("Big stores", () => selectMatchingSources(bigStoreSources));

  sourceList.append(quickActions);

  const normalizedQuery = sourceSearchQuery.trim().toLowerCase();
  const visibleSources = sources
    .filter((source) => !normalizedQuery || source.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => {
      const selectedDiff = Number(selectedSources.has(b)) - Number(selectedSources.has(a));
      return selectedDiff || a.localeCompare(b);
    });

  const grid = document.createElement("div");
  grid.className = "sourceGrid";

  if (!visibleSources.length) {
    const empty = document.createElement("p");
    empty.className = "sourceEmpty";
    empty.textContent = "No matching sources";
    sourceList.append(empty);
    return;
  }

  for (const source of visibleSources) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = selectedSources.has(source) ? "sourceOption selected" : "sourceOption";
    const checkbox = document.createElement("span");
    const label = document.createElement("span");
    label.className = "sourceOptionLabel";
    checkbox.className = "sourceCheck";
    label.textContent = source;
    if (trustedStoreSources.has(source)) {
      const badge = document.createElement("span");
      badge.className = "trustedStoreBadge";
      badge.textContent = "Trusted";
      badge.title = "LexiMom has ordered here";
      label.append(document.createTextNode(" "), badge);
    }
    button.append(checkbox, label);
    button.addEventListener("click", () => {
      if (selectedSources.has(source)) selectedSources.delete(source);
      else selectedSources.add(source);
      populateFilters(allFinds);
      updateAdminControls();
      render();
    });
    grid.append(button);
  }
  sourceList.append(grid);
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

function renderPromoBoard() {
  const promos = sourcePromos
    .filter((item) => !selectedSources.size || selectedSources.has(item.source))
    .sort(sortPromos);

  if (!promos.length) promosOpen = false;
  promoToggleButton.hidden = !promos.length;
  promoToggleButton.classList.toggle("active", promosOpen);
  promoToggleButton.setAttribute("aria-expanded", String(promosOpen));
  promoBoard.hidden = !promos.length || !promosOpen;
  promoList.innerHTML = "";
  const activePromoCount = promos.filter((item) => displayPromoNote(item.promoNote, item.source)).length;
  promoCount.textContent = promos.length ? `${activePromoCount}/${promos.length}` : "";

  for (const item of promos) {
    const row = document.createElement("div");
    const cleanNote = displayPromoNote(item.promoNote, item.source);
    row.className = cleanNote ? "promoItem" : "promoItem noPromo";

    const source = item.baseUrl ? document.createElement("a") : document.createElement("strong");
    if (item.baseUrl) {
      source.href = item.baseUrl;
      source.target = "_blank";
      source.rel = "noreferrer";
    }
    source.textContent = item.baseUrl ? `${item.source} ↗` : item.source;
    if (trustedStoreSources.has(item.source)) {
      const badge = document.createElement("span");
      badge.className = "trustedStoreBadge";
      badge.textContent = "Trusted";
      badge.title = "LexiMom has ordered here";
      source.append(document.createTextNode(" "), badge);
    }

    const note = document.createElement("span");
    note.textContent = cleanNote || "No promo found";
    if (!item.promoNote && item.promoReason) {
      const reason = document.createElement("small");
      reason.textContent = item.promoReason;
      row.append(source, note, reason);
      promoList.append(row);
      continue;
    }

    row.append(source, note);
    promoList.append(row);
  }
}

function renderRefreshReport(data) {
  latestReportData = data;
  if (!refreshReport || !reportToggleButton || !reportStats || !reportDetails || !reportDetailsButton) return;
  const report = data.report;
  const sources = data.sources || [];
  const unlocked = Boolean(adminRefreshToken());
  if (!unlocked || (!report && !sources.length)) {
    refreshReport.hidden = true;
    reportToggleButton.hidden = !unlocked || !latestReportData;
    return;
  }

  const totalStores = report?.totalStores || sources.length;
  const completedStores = report?.completedStores || sources.length;
  const refreshedStores = report?.refreshedStores ?? sources.filter((source) => source.scanStatus !== "cached").length;
  const failedStores = report?.failedStores || sources.filter((source) => source.scanStatus === "failed").length;
  const promoFound = report?.promoFound ?? sources.filter((source) => source.promoNote).length;
  const promoMissing = report?.promoMissing ?? Math.max(0, totalStores - promoFound);
  const productsScanned = report?.productsScanned ?? data.scanned;
  const newFinds = report?.newFinds ?? (data.finds || []).filter((find) => find.isNew).length;
  const priceDrops = report?.priceDrops ?? (data.finds || []).filter((find) => find.priceComparison?.priceDelta < -0.01).length;
  const noPromoStores = report?.noPromoStores || sources
    .filter((source) => !source.promoNote && source.promoStatus !== "failed")
    .map((source) => ({ source: source.source, reason: source.promoReason || "No promo found." }));
  const failedStoreDetails = report?.failedStoreDetails || sources
    .filter((source) => source.scanStatus === "failed" || source.promoStatus === "failed")
    .map((source) => ({ source: source.source, reason: source.scanReason || source.promoReason || "Scan failed." }));

  reportToggleButton.hidden = false;
  reportToggleButton.classList.toggle("active", reportOpen);
  reportToggleButton.setAttribute("aria-expanded", String(reportOpen));
  refreshReport.hidden = !reportOpen;
  reportStats.innerHTML = "";
  const stats = [
    ["Stores", `${completedStores}/${totalStores}`],
    ["Refreshed", String(refreshedStores)],
    ["Products", String(productsScanned || 0)],
    ["Promos", `${promoFound}/${totalStores}`],
    ["No promo", String(promoMissing)],
    ["Failed", String(failedStores)],
    ["New", String(newFinds)],
    ["Price drops", String(priceDrops)],
  ];

  for (const [label, value] of stats) {
    const stat = document.createElement("div");
    stat.className = "reportStat";
    const strong = document.createElement("strong");
    strong.textContent = value;
    const span = document.createElement("span");
    span.textContent = label;
    stat.append(strong, span);
    reportStats.append(stat);
  }

  reportDetailsButton.hidden = !noPromoStores.length && !failedStoreDetails.length;
  reportDetailsButton.textContent = reportDetailsOpen ? "Hide details" : "Show details";
  reportDetails.hidden = !reportDetailsOpen || reportDetailsButton.hidden;
  reportDetails.innerHTML = "";

  const addGroup = (title, items, className = "") => {
    if (!items.length) return;
    const group = document.createElement("div");
    group.className = `reportGroup ${className}`.trim();
    const heading = document.createElement("h3");
    heading.textContent = title;
    const list = document.createElement("div");
    list.className = "reportList";
    for (const item of items) {
      const row = document.createElement("div");
      row.className = "reportItem";
      const href = sourceHomeUrl(item.source);
      const name = href ? document.createElement("a") : document.createElement("strong");
      name.textContent = href ? `${item.source} ↗` : item.source;
      if (href) {
        name.href = href;
        name.target = "_blank";
        name.rel = "noreferrer";
      }
      const reason = document.createElement("span");
      reason.textContent = item.reason || "No detail available.";
      row.append(name, reason);
      list.append(row);
    }
    group.append(heading, list);
    reportDetails.append(group);
  };

  addGroup("Stores that failed", failedStoreDetails, "problem");
  addGroup("Stores with no promo detected", noPromoStores);
}

function applyData(data, labelPrefix = "Cached") {
  allFinds = (data.finds || [])
    .filter((find) => !hasAbnormalPrice(find))
    .map((find, index) => ({ ...find, sortIndex: index }));
  if (labelPrefix !== "Refreshing") latestCompleteData = cloneDataSnapshot(data);
  allBrands = (data.brands || []).map((item) => item.brand).filter(Boolean);
  brandTypes = new Map((data.brands || []).map((item) => [item.brand, item.type || "clothes"]));
  allSources = (data.sources || []).map((item) => item.source).filter(Boolean);
  sourceHomeUrls = new Map(
    allFinds
      .map((find) => {
        try {
          return [find.source, new URL(find.url).origin];
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  );
  sourcePromos = (data.sources || [])
    .map((item) => ({
    source: item.source,
    baseUrl: storeHomeUrls.get(item.source) || item.baseUrl || sourceHomeUrls.get(item.source) || "",
      promoNote: displayPromoNote(item.promoNote || "", item.source),
    promoStatus: item.promoStatus || "",
    promoReason: item.promoReason || "",
    scanStatus: item.scanStatus || "",
    scanReason: item.scanReason || "",
  }))
    .filter((item) => item.source);
  populateFilters(allFinds);
  const womenCount = allFinds.filter((find) => find.gender === "women" && hasAdultSizeOption(find)).length;
  const newCount = allFinds.filter((find) => find.isNew).length;
  const priceDropCount = allFinds.filter((find) => find.priceComparison?.priceDelta < -0.01).length;
  if (!womenCount) womenOnly = false;
  const newText = newCount ? ` · ${newCount} new` : "";
  const priceDropText = priceDropCount ? ` · ${priceDropCount} price drops` : "";
  if (!newCount) newOnly = false;
  if (!priceDropCount) priceDropsOnly = false;
  womenOnlyButton.hidden = !womenCount;
  newOnlyButton.hidden = !newCount;
  priceDropsButton.hidden = !priceDropCount;
  const sourceText = sourceLabelText(data);
  updatedEl.textContent = `${labelPrefix} ${new Date(data.updatedAt).toLocaleString()} · ${sourceText} · scanned ${data.scanned} products${newText}${priceDropText}`;
  renderRefreshReport(data);
  updateAdminControls();
  renderPromoBoard();
  render();
}

function filteredFinds() {
  const query = searchInput.value.trim().toLowerCase();
  const minDiscount = Number.parseFloat(choiceValue("discount"));
  return sortFinds(allFinds.filter((find) => {
    const isShoe = isShoeFind(find);
    const isAccessory = isAccessoryFind(find);
    if (womenOnly && find.gender !== "women") return false;
    if (newOnly && !find.isNew) return false;
    if (priceDropsOnly && !(find.priceComparison?.priceDelta < -0.01)) return false;
    if (displayedDiscountValue(find.discount) < minDiscount) return false;
    if (choiceValue("type") === "clothes" && (isShoe || isAccessory)) return false;
    if (choiceValue("type") === "shoes" && !isShoe) return false;
    if (choiceValue("type") === "accessories" && !isAccessory) return false;
    if (womenOnly && isShoe) return false;
    if (choiceValue("gender") && find.gender !== choiceValue("gender")) return false;
    if (selectedBrands.size && !selectedBrands.has(find.brand)) return false;
    if (selectedSources.size && !selectedSources.has(find.source)) return false;
    if (!matchingSizes(find).length) return false;
    if (query && !textFor(find).includes(query)) return false;
    return true;
  }));
}

function render() {
  const finds = filteredFinds();
  renderPromoBoard();
  countEl.textContent = finds.length;
  womenOnlyButton.classList.toggle("active", womenOnly);
  newOnlyButton.classList.toggle("active", newOnly);
  priceDropsButton.classList.toggle("active", priceDropsOnly);
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
    img.dataset.originalSrc = find.image;
    img.alt = find.title;
    img.addEventListener("error", () => {
      card.classList.add("imageMissing");
      img.removeAttribute("src");
    }, { once: true });
    queueCardImageProcessing(img);
    const sourceLink = node.querySelector(".source");
    sourceLink.textContent = find.brand;
    sourceLink.title = `Show ${find.brand}`;
    sourceLink.addEventListener("click", () => {
      womenOnly = false;
      newOnly = false;
      priceDropsOnly = false;
      selectedBrands = new Set([find.brand]);
      searchInput.value = "";
      populateFilters(allFinds);
      updateSingleChoicePanels();
      render();
    });
    const sourceHref = sourceHomeUrl(find.source, find.url);
    const newBadge = node.querySelector(".newBadge");
    newBadge.hidden = !find.isNew;
    node.querySelector("h2").textContent = find.title;
    const storeLink = node.querySelector(".storeLink");
    storeLink.textContent = sourceHref ? `${find.source} ↗` : find.source;
    if (sourceHref) storeLink.href = sourceHref;
    else storeLink.removeAttribute("href");
    const promoNote = node.querySelector(".promoNote");
    const cleanPromoNote = displayPromoNote(find.promoNote, find.source);
    promoNote.hidden = !cleanPromoNote;
    promoNote.textContent = cleanPromoNote;
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
  if (force && !adminRefreshToken() && !unlockAdminRefresh()) return;
  if (activeLoadController) activeLoadController.abort();
  const refreshSourceNames = force ? [...selectedSources] : [];
  if (force) {
    refreshBackupData = cloneDataSnapshot(latestCompleteData);
    refreshInProgress = true;
  }
  refreshButton.disabled = true;
  refreshButton.textContent = refreshSourceNames.length ? "Refreshing selected..." : "Refreshing...";
  updatedEl.textContent = force
    ? (refreshSourceNames.length ? `Refreshing ${refreshSourceNames.length} selected store${refreshSourceNames.length === 1 ? "" : "s"}...` : "Refreshing from stores...")
    : "Loading saved products...";
  updateAdminControls();
  try {
    const params = new URLSearchParams({ minDiscount: String(loadedMinDiscount) });
    params.set("_", String(Date.now()));
    if (force) params.set("refresh", "1");
    if (force && refreshSourceNames.length) params.set("sources", refreshSourceNames.join("|"));
    const headers = {};
    if (force) headers["x-admin-refresh-token"] = adminRefreshToken();
    const controller = new AbortController();
    activeLoadController = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), force ? 60000 : 15000);
    const endpoint = force ? `/api/finds/stream?${params}` : `/api/finds?${params}`;
    const response = await fetch(endpoint, { headers, signal: controller.signal });
    window.clearTimeout(timeoutId);
    if (response.status === 401) throw new Error("Admin unlock required to refresh.");
    if (!response.ok) throw new Error("Could not load finds");

    if (!force) {
      hideProgress();
      const data = await response.json();
      if (looksLikeBrokenSavedData(data)) {
        throw new Error("Saved products did not load correctly. Please restart the local site once, then refresh this page.");
      }
      applyData(data, "Saved");
      return;
    }

    if (!response.body) throw new Error("Could not load finds");

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
          refreshBackupData = null;
          refreshInProgress = false;
        }
      }

      if (done) break;
    }
  } catch (error) {
    if (error.name === "AbortError" && force) {
      if (refreshBackupData) applyData(refreshBackupData, "Cached");
      updatedEl.textContent = "Refresh stopped. Showing the last saved results.";
      hideProgress();
      return;
    }
    if (/admin unlock|required|unauthorized/i.test(error.message)) lockAdminRefresh();
    const message = error.name === "AbortError"
      ? "Could not connect to the local server. Please restart the site and refresh this page."
      : error.message;
    grid.innerHTML = `<div class="error">${message}</div>`;
    updatedEl.textContent = "Could not load products.";
    hideProgress();
  } finally {
    activeLoadController = null;
    refreshInProgress = false;
    refreshButton.disabled = false;
    updateAdminControls();
  }
}

clearBrandsButton.addEventListener("click", () => {
  selectedBrands.clear();
  populateFilters(allFinds);
  render();
});

clearSourcesButton.addEventListener("click", () => {
  selectedSources.clear();
  populateFilters(allFinds);
  updateAdminControls();
  render();
});

womenOnlyButton.addEventListener("click", () => {
  womenOnly = !womenOnly;
  if (womenOnly) {
    newOnly = false;
    priceDropsOnly = false;
    selectedBrands.clear();
    selectedSources.clear();
    searchInput.value = "";
    singleChoiceFilters.discount.value = "0.4";
    singleChoiceFilters.type.value = "clothes";
    singleChoiceFilters.size.value = "adult-any";
    singleChoiceFilters.shoeSize.value = "none";
    closeOpenPanels();
    populateFilters(allFinds);
    updateAdminControls();
    updateSingleChoicePanels();
  } else {
    if (singleChoiceFilters.size.value.startsWith("adult-")) singleChoiceFilters.size.value = "3-6";
    if (singleChoiceFilters.shoeSize.value === "none") singleChoiceFilters.shoeSize.value = "target-shoes";
    updateSingleChoicePanels();
  }
  render();
});

newOnlyButton.addEventListener("click", () => {
  newOnly = !newOnly;
  if (newOnly) {
    womenOnly = false;
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
    updateAdminControls();
    updateSingleChoicePanels();
  }
  render();
});

priceDropsButton.addEventListener("click", () => {
  priceDropsOnly = !priceDropsOnly;
  if (priceDropsOnly) womenOnly = false;
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
    || target.closest(".promoMenu")
    || target.closest(".reportMenu")
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
adminUnlockButton.addEventListener("click", unlockAdminRefresh);
refreshButton.addEventListener("click", () => loadFinds(true));
stopRefreshButton.addEventListener("click", stopRefresh);
promoToggleButton.addEventListener("click", () => {
  promosOpen = !promosOpen;
  renderPromoBoard();
});
reportToggleButton?.addEventListener("click", () => {
  reportOpen = !reportOpen;
  renderRefreshReport(latestReportData || { sources: sourcePromos, scanned: allFinds.length, finds: allFinds });
});
reportDetailsButton?.addEventListener("click", () => {
  reportDetailsOpen = !reportDetailsOpen;
  renderRefreshReport(latestReportData || { sources: sourcePromos, scanned: allFinds.length, finds: allFinds });
});

for (const [name, filter] of Object.entries(singleChoiceFilters)) {
  renderSingleChoiceList(name);
  filter.toggle.addEventListener("click", () => toggleSingleChoicePanel(name));
}
updateSingleChoicePanels();
updateAdminControls();
loadFinds();
