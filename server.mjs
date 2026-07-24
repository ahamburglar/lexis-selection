import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execFileAsync = promisify(execFile);
const PORT = Number(process.env.PORT || 5173);
const ADMIN_REFRESH_TOKEN = process.env.ADMIN_REFRESH_TOKEN || "";

const brandFile = path.join(__dirname, "brands.json");
const productCacheFile = path.join(__dirname, "work", "product-cache.json");
const brandList = JSON.parse(await fs.readFile(brandFile, "utf8"));
const targetBrands = new Set(brandList.map((brand) => brand.name));
const brandCollections = [...new Set(brandList.flatMap((brand) => brand.collections || []))];

const stores = [
  {
    source: "Tiptoe Boutique",
    baseUrl: "https://tiptoeboutique.com",
    mode: "collections",
    collections: [
      "last-look-outlet",
      ...brandCollections,
    ],
  },
  {
    source: "Pacifier Kids",
    baseUrl: "https://pacifierkids.com",
    mode: "all-products",
  },
  {
    source: "Buttons and Bows NY",
    baseUrl: "https://buttonsandbowsny.com",
    mode: "all-products",
  },
  {
    source: "Ladida",
    baseUrl: "https://www.ladida.com",
    mode: "collections",
    collections: [
      "sale",
      ...brandCollections,
    ],
  },
  {
    source: "South Coast Baby Co",
    baseUrl: "https://south-coast-baby-co.myshopify.com",
    mode: "all-products",
  },
  {
    source: "Design Life Kids",
    baseUrl: "https://www.designlifekids.com",
    mode: "all-products",
  },
  {
    source: "Bella Kids NY",
    baseUrl: "https://www.bellakidsny.com",
    mode: "all-products",
  },
  {
    source: "Boutique Little",
    baseUrl: "https://www.boutiquelittle.com",
    mode: "all-products",
  },
  {
    source: "Little K Co",
    baseUrl: "https://littlekco.com",
    mode: "all-products",
  },
  {
    source: "Village Maternity",
    baseUrl: "https://villagematernity.com",
    mode: "all-products",
  },
  {
    source: "Tiny Apple",
    baseUrl: "https://www.tinyapple.net",
    mode: "all-products",
  },
  {
    source: "The Front Shop",
    baseUrl: "https://www.thefrontshop.com",
    mode: "all-products",
  },
  {
    source: "Ele Ella",
    baseUrl: "https://eleella.com",
    mode: "all-products",
  },
  {
    source: "Little Red Planet",
    baseUrl: "https://thelittleredplanet.com",
    mode: "all-products",
  },
  {
    source: "Panda and Cub",
    baseUrl: "https://pandaandcub.com",
    mode: "all-products",
  },
  {
    source: "Little Rags and Riches",
    baseUrl: "https://www.littleragsandriches.com",
    mode: "all-products",
  },
  {
    source: "Faded Floral Boutique",
    baseUrl: "https://fadedfloralboutique.com",
    mode: "all-products",
  },
  {
    source: "Hello Alyss",
    baseUrl: "https://www.hello-alyss.com",
    mode: "all-products",
  },
  {
    source: "Little Loungers",
    baseUrl: "https://littleloungers.com",
    mode: "all-products",
  },
  {
    source: "Millie Bo Peep",
    baseUrl: "https://www.milliebopeep.com",
    mode: "all-products",
  },
  {
    source: "Sanna Baby and Child",
    baseUrl: "https://sannababyandchild.com",
    mode: "all-products",
  },
  {
    source: "Le Petit Kids",
    baseUrl: "https://lepetitkids.com",
    mode: "all-products",
  },
  {
    source: "Born Yesterday Kids",
    baseUrl: "https://bornyesterdaykids.com",
    mode: "all-products",
  },
  {
    source: "Stoopher",
    baseUrl: "https://stoopher.com",
    mode: "all-products",
  },
  {
    source: "Cotton Candy Kidz",
    baseUrl: "https://cottoncandykidz.com",
    mode: "all-products",
  },
  {
    source: "Kid Biz",
    baseUrl: "https://kidbizkid.com",
    mode: "all-products",
  },
  {
    source: "Mini Dreamers",
    baseUrl: "https://www.minidreamers.com",
    mode: "all-products",
  },
  {
    source: "Bears Closet Boutique",
    baseUrl: "https://bearsclosetboutique.com",
    mode: "all-products",
  },
  {
    source: "Kids Atelier",
    baseUrl: "https://www.kidsatelier.com",
    mode: "all-products",
  },
  {
    source: "Bdazzle",
    baseUrl: "https://shopbdazzle.com",
    mode: "all-products",
  },
  {
    source: "Little Dreamers Boutique",
    baseUrl: "https://littledreamers.boutique",
    mode: "all-products",
  },
  {
    source: "Honeypie Kids",
    baseUrl: "https://www.honeypiekids.com",
    mode: "all-products",
  },
  {
    source: "Skipper Scout",
    baseUrl: "https://skipperscout.com",
    mode: "all-products",
  },
  {
    source: "The Shoppe Miami",
    baseUrl: "https://theshoppemiami.com",
    mode: "all-products",
  },
  {
    source: "Oh Baby St Pete",
    baseUrl: "https://ohbabystp.com",
    mode: "all-products",
  },
  {
    source: "Coucou Kids",
    baseUrl: "https://shopcoucoukids.com",
    mode: "all-products",
  },
  {
    source: "My Oh My Kids",
    baseUrl: "https://myohmykids.com",
    mode: "all-products",
  },
  {
    source: "Jam Baby",
    baseUrl: "https://shopjambaby.com",
    mode: "all-products",
  },
  {
    source: "Tottini",
    baseUrl: "https://tottini.com",
    mode: "all-products",
  },
  {
    source: "Little Waves Kids",
    baseUrl: "https://littlewaveskids.com",
    mode: "all-products",
  },
  {
    source: "Whoopi Kids",
    baseUrl: "https://whoopikids.com",
    mode: "all-products",
  },
  {
    source: "Wee Mondine",
    baseUrl: "https://weemondine.com",
    mode: "all-products",
  },
  {
    source: "Shan and Toad",
    baseUrl: "https://shanandtoad.com",
    mode: "all-products",
  },
  {
    source: "Milomoo Baby",
    baseUrl: "https://milomoobaby.com",
    mode: "all-products",
  },
  {
    source: "Little Big Penguin",
    baseUrl: "https://littlebigpenguin.com",
    mode: "all-products",
  },
  {
    source: "Young Timers NY",
    baseUrl: "https://www.youngtimersny.com",
    mode: "all-products",
  },
  {
    source: "Spilled Milk",
    baseUrl: "https://getspilledmilk.com",
    mode: "all-products",
  },
  {
    source: "Milk + Bots",
    baseUrl: "https://milkbots.com",
    mode: "all-products",
  },
  {
    source: "Wrightsville Ave",
    baseUrl: "https://wrightsvilleave.com",
    mode: "all-products",
  },
  {
    source: "Mom Loves Me",
    baseUrl: "https://momlovesme.us",
    mode: "all-products",
    pages: 5,
    onlyTargetBrands: true,
  },
  {
    source: "Flying Ryno",
    baseUrl: "https://www.flyingryno.com",
    mode: "all-products",
  },
  {
    source: "Maison Baby & Kids",
    baseUrl: "https://maisonbabyandkids.com",
    mode: "all-products",
    pages: 5,
    onlyTargetBrands: true,
  },
  {
    source: "Childrensalon",
    baseUrl: "https://www.childrensalon.com",
    mode: "childrensalon-sale",
    currency: "USD",
    pages: 5,
  },
  {
    source: "Maisonette",
    baseUrl: "https://www.maisonette.com",
    mode: "all-products",
  },
  {
    source: "Enjoy Kids US",
    baseUrl: "https://enjoykidsus.com",
    mode: "all-products",
  },
  {
    source: "Smallable",
    baseUrl: "https://www.smallable.com",
    mode: "smallable-sale",
    currency: "USD",
    pages: 3,
  },
];

let productCache = { at: 0, items: [], sources: [] };
let productCacheRefresh = null;

function compactProduct(product) {
  return {
    id: product.id || "",
    title: product.title || "",
    handle: product.handle || product.id || "",
    vendor: product.vendor || "",
    product_type: product.product_type || "",
    tags: Array.isArray(product.tags) ? product.tags : [],
    url: product.url || "",
    image: product.image?.src ? { src: product.image.src } : undefined,
    images: (product.images || []).slice(0, 1).map((image) => ({ src: image.src || "" })),
    options: (product.options || []).map((option, index) => ({
      name: option.name || String(option),
      position: option.position || index + 1,
    })),
    variants: (product.variants || []).map((variant) => ({
      title: variant.title || "",
      option1: variant.option1 || "",
      option2: variant.option2 || "",
      option3: variant.option3 || "",
      price: variant.price ?? "",
      compare_at_price: variant.compare_at_price ?? "",
      available: Boolean(variant.available),
    })),
  };
}

function cacheIsUsable(cache) {
  return cache && Number.isFinite(cache.at) && Array.isArray(cache.items) && Array.isArray(cache.sources);
}

function localDateKey(time = Date.now()) {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function cacheIsFreshToday(cache) {
  return cacheIsUsable(cache) && localDateKey(cache.at) === localDateKey();
}

async function readProductCacheFile() {
  try {
    const text = await fs.readFile(productCacheFile, "utf8");
    const cache = JSON.parse(text);
    return cacheIsUsable(cache) ? cache : null;
  } catch (error) {
    if (error.code !== "ENOENT") console.warn(`Could not read local product cache: ${error.message}`);
    return null;
  }
}

async function writeProductCacheFile(cache) {
  await fs.mkdir(path.dirname(productCacheFile), { recursive: true });
  await fs.writeFile(productCacheFile, JSON.stringify(cache), "utf8");
}

function normalizeBrand(vendor = "") {
  const lower = vendor.toLowerCase().trim();
  for (const brand of brandList) {
    if ((brand.matches || [brand.name]).some((match) => lower.includes(match.toLowerCase()))) {
      return brand.name;
    }
  }
  return vendor;
}

function normalizeBrandText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function detectProductBrand(product) {
  const vendorBrand = normalizeBrand(product.vendor);
  if (targetBrands.has(vendorBrand)) return vendorBrand;

  const title = normalizeBrandText(product.title);
  const candidates = brandList
    .flatMap((brand) => (brand.matches || [brand.name]).map((match) => ({ brand: brand.name, match: normalizeBrandText(match) })))
    .filter((candidate) => candidate.match)
    .sort((a, b) => b.match.length - a.match.length);

  for (const { brand, match } of candidates) {
    if (title === match || title.startsWith(`${match} `) || title.includes(` ${match} `)) return brand;
  }

  return vendorBrand;
}

function toMoney(value) {
  const parsed = Number.parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function productMaxDisplayDiscount(product) {
  const discounts = (product.variants || [])
    .map((variant) => {
      const sale = toMoney(variant.price);
      const original = toMoney(variant.compare_at_price);
      if (!original || sale === null || original <= sale) return null;
      return displayDiscount(1 - sale / original);
    })
    .filter((discount) => discount !== null);
  return discounts.length ? Math.max(...discounts) : null;
}

function shouldReplaceDuplicateProduct(existingProduct, candidateProduct) {
  const existingDiscount = productMaxDisplayDiscount(existingProduct);
  const candidateDiscount = productMaxDisplayDiscount(candidateProduct);
  if (candidateDiscount === null) return existingDiscount === null;
  if (existingDiscount === null) return true;
  return candidateDiscount < existingDiscount;
}

function imageUrl(product) {
  const src = product.images?.[0]?.src || product.image?.src || "";
  if (!src) return "";
  return src.startsWith("//") ? `https:${src}` : src;
}

function decodeHtml(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&pound;", "£")
    .replaceAll("&nbsp;", " ")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function cleanPromoText(value = "") {
  const originalNote = decodeHtml(value);
  let note = originalNote
    .replace(/\\u0026/g, "&")
    .replace(/\\u002[27]/g, "'")
    .replace(/\\u003[cC][^>]*\\u003[eE]/g, " ")
    .replace(/\\u003[cC]\/[^>]*\\u003[eE]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b(Skip to content|Search|Account|Menu|Log in)\b/gi, "")
    .trim()
  const promoSnippet = bestPromoSnippet(note);
  if (promoSnippet) note = promoSnippet;
  const cutoffPatterns = [
    /\b(?:shop now|shop the|new baby boxes|new arrivals|navigation|popular products|all collections|shop by category|home new arrivals|same day dispatched|instagram|facebook|pause slideshow|play slideshow|newsletter signup|sign up to receive|currency|sign in|my wish lists|no reviews|regular price|sale price)\b/i,
    /\b(?:baby girl|baby boy|baby girls|baby boys|girls tees|girls clothing|boys clothing|kids \(|newborn|tween clothing|clothing baby)\b/i,
    /\/\/[a-z0-9.-]+/i,
  ];
  for (const pattern of cutoffPatterns) {
    const match = note.match(pattern);
    if (match?.index > 0) note = note.slice(0, match.index).trim();
  }
  if (/^\s*[$£€]?\s*\d+(?:\.\d+)?\b/.test(note) && /\b(?:regular price|sale price|no reviews)\b/i.test(originalNote)) return "";
  note = note
    .replace(/\b((?:free\s+(?:u\.?s\.?a?\.?\s+)?shipping|(?:summer|end of season|sample)?\s*sale|(?:up to\s+)?\d{1,2}%\s+off)[^.!?]{0,80})\s+\1\b/gi, "$1")
    .replace(/\bWHOLESALE\s+/gi, "")
    .replace(/(\b\d{1,2}%\s*off\s+sale\b).*/i, "$1")
    .replace(/(\bfree\s+(?:u\.?s\.?a?\.?\s+|us\s+)?shipping\b.*?[$£€]?\s*\d+(?:\.\d+)?\+?).*/i, "$1")
    .replace(/\*+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 110);
  if (!note || note.length < 8) return "";
  if (/[{};=]|=>|\b(function|return|var|let|const|catch|decodeURI|component|script|shopify)\b/i.test(note)) return "";
  if (/\b(?:regular price|sale price|no reviews)\b/i.test(note)) return "";
  return note;
}

function bestPromoSnippet(value = "") {
  const text = value.replace(/\s+/g, " ").trim();
  const patterns = [
    /\bfree\s+(?:u\.?s\.?a?\.?\s+|us\s+)?shipping\b[^.!?]{0,80}\b(?:orders?|over|above|on|with)?[^.!?]{0,30}(?:[$£€]?\s*\d+(?:\.\d+)?\+?)/i,
    /\b(?:you\s+are\s*)?[$£€]?\s*\d+(?:\.\d+)?\s+away\s+from\s+free\s+shipping\b/i,
    /\border\s*[$£€]?\s*\d+(?:\.\d+)?[^.!?]{0,60}\bship(?:s|ping)?\b[^.!?]{0,30}(?:[$£€]\s*\d+|\bfree\b)/i,
    /\b(?:check\s+out\s+)?(?:end\s+of\s+season|summer|sample|past\s+season|warehouse|final|fw\d{2})?[^.!?]{0,24}\bsale\b[^.!?]{0,50}\b(?:up\s+to\s+)?\d{1,2}%\s*off\b/i,
    /\b(?:up\s+to\s+)?\d{1,2}%\s*off\b[^.!?]{0,45}\b(?:sale|past\s+season|summer\s+collections|first\s+purchase|first\s+order)?\b/i,
    /\b(?:use\s+code|with\s+code|promo\s+code|code)\s*[:\-]?\s*[A-Z0-9]{3,20}\b[^.!?]{0,50}/i,
    /\b(?:buy|get)\s+\d+[^.!?]{0,80}\b(?:off|free|sale|discount)\b/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return "";
}

function promoTextLooksUseful(note = "") {
  if (!note) return false;
  if (/\baway\s+from\s+free\s+shipping\b/i.test(note)) {
    return /[$£€]?\s*\d+(?:\.\d+)?/.test(note);
  }
  if (/\bqualif(?:y|ies)\s+for\s+free\s+shipping\b/i.test(note)) return false;
  if (/\byou\s+are\b[^.!?\n]{0,80}\bfree\s+shipping\b|\bfree\s+shipping\b[^.!?\n]{0,80}\byou\s+are\b/i.test(note)) {
    return /[$£€]?\s*\d+(?:\.\d+)?/.test(note);
  }
  if (/\bfree\s+(?:u\.?s\.?a?\.?\s+)?shipping\b/i.test(note)) {
    return /(?:[$£€]\s*\d+|\borders?\s*(?:over|above|of|on|at|>=)?\s*[$£€]?\s*\d+|\bordr\s*[$£€]?\s*\d+|\b(?:minimum|min)\s+(?:order|purchase)\b)/i.test(note);
  }
  if (/\border\s*[$£€]?\s*\d+[^.!?\n]{0,60}\bship(?:s|ping)?\b[^.!?\n]{0,30}(?:[$£€]\s*\d+|\bfree\b)/i.test(note)) return true;
  if (/\b(first order|first purchase|extra|additional|buy\s+\d+|code\s*:|use code|with code|promo code|sample sale)\b/i.test(note)) return true;
  if (/\b(?:take|save|get|up\s+to|sale\s+up\s+to)\s+\d{1,2}%\s+off\b/i.test(note)) return true;
  if (/\b\d{1,2}%\s+off\b[^.!?\n]{0,60}\b(?:sale|sample sale|first purchase|first order)\b/i.test(note)) return true;
  if (/\b(?:sale|discount|promo)\b[^.!?\n]{0,80}\b(?:[$£€]\s*\d+|\d{1,2}%\s*off|code|extra|additional|buy\s+\d+)\b/i.test(note)) return true;
  return false;
}

function sanitizePromoNote(value = "") {
  if (/buy\s+2\s+sale\s+items,\s*40%\s+off\s+in\s+cart/i.test(value)) return "";
  const parts = value
    .split(/\s+[·•]\s+|\s+\|\s+|(?:\s{2,})/)
    .map(cleanPromoText)
    .filter(promoTextLooksUseful)
    .sort((a, b) => promoQualityScore(b) - promoQualityScore(a));
  return [...new Set(parts.map((part) => part.replace(/\s+([,.])/g, "$1")))].slice(0, 1).join(" · ");
}

function sanitizeStorePromoNote(storeOrSource, value = "") {
  const note = sanitizePromoNote(value);
  const source = typeof storeOrSource === "string" ? storeOrSource : storeOrSource?.source;
  if (!note) return "";
  if (source !== "South Coast Baby Co") return note;

  const concreteStorePromo = /\bfree\s+(?:u\.?s\.?a?\.?\s+|us\s+)?shipping\b[^.!?]{0,100}(?:[$£€]?\s*\d+(?:\.\d+)?\+?|orders?|over|above|minimum|min)|\b[$£€]?\s*\d+(?:\.\d+)?\s+away\s+from\s+free\s+shipping\b|\b(?:use\s+code|with\s+code|promo\s+code|code)\s*[:\-]?\s*[A-Z0-9]{3,20}\b|\b(?:buy|get)\s+\d+[^.!?]{0,80}\b(?:off|free|sale|discount)\b|\b(?:up\s+to|take|save|get|extra|additional|sale)\s+\d{1,2}%\s*off\b|\b\d{1,2}%\s*off\b/i;
  return concreteStorePromo.test(note) ? note : "";
}

function promoQualityScore(note = "") {
  let score = 0;
  if (/\bfree\s+(?:u\.?s\.?a?\.?\s+)?shipping\b/i.test(note)) score += 5;
  if (/\b(?:orders?|over|above)\b[^.!?]{0,40}[$£€]?\s*\d+/i.test(note)) score += 4;
  if (/\b(?:up to\s+)?\d{1,2}%\s*off\b/i.test(note)) score += 5;
  if (/\b(?:code|first purchase|first order|buy\s+\d+|extra|additional)\b/i.test(note)) score += 3;
  if (/\b(?:shop now|navigation|new arrivals|all collections|regular price|sale price|no reviews)\b/i.test(note)) score -= 8;
  score -= Math.max(0, note.length - 70) / 10;
  return score;
}

function safeDecodeUriText(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function promoAttributeText(html = "") {
  return [
    ...html.matchAll(/(?:src|srcset|data-[\w-]+|alt|title|aria-label)=["']([^"']+)["']/gi),
  ].map((match) => decodeHtml(safeDecodeUriText(match[1]).replace(/[_-]+/g, " "))).join(" ");
}

function promoSearchText(html = "") {
  const searchableHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ");
  return `${searchableHtml.replace(/<[^>]+>/g, " ")} ${promoAttributeText(html)}`;
}

function keywordPromoCandidates(text = "") {
  const candidates = [];
  const normalized = text
    .replace(/\s+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
  const keywordPattern = /\b(?:sale|extra|additional|shipping|ship(?:s|ping)?|discount|promo|code|off|clearance|sample)\b/gi;

  for (const match of normalized.matchAll(keywordPattern)) {
    const start = Math.max(0, match.index - 28);
    const end = Math.min(normalized.length, match.index + 90);
    const snippet = normalized
      .slice(start, end)
      .split(/(?:\s+[|·•]\s+)|(?<=[.!?])\s+/)
      .find((part) => new RegExp(match[0], "i").test(part)) || normalized.slice(start, end);
    const note = cleanPromoText(snippet);
    if (promoTextLooksUseful(note) && !candidates.some((candidate) => candidate.toLowerCase() === note.toLowerCase())) {
      candidates.push(note);
    }
    if (candidates.length >= 3) break;
  }

  return candidates;
}

function extractPromoNote(html = "") {
  const candidates = [];
  const text = promoSearchText(html);
  const patterns = [
    /(?:buy|get)\s+\d+[^.!?\n]{0,90}(?:off|free|sale|discount)/gi,
    /(?:extra|additional|take|save|get|up\s+to|sale\s+up\s+to)\s+\d{1,2}%\s+off[^.!?\n]{0,80}/gi,
    /check\s+out[^.!?\n]{0,80}\d{1,2}%\s+off[^.!?\n]{0,80}/gi,
    /(?:summer|sample|clearance|warehouse|final|end\s+of\s+season)?\s*sale[^.!?\n]{0,80}\d{1,2}%\s+off[^.!?\n]{0,80}/gi,
    /\d{1,2}%\s+off[^.!?\n]{0,80}(?:sale|sample sale|first purchase|first order)/gi,
    /\d{1,2}%\s+off\s+(?:your\s+)?first\s+order[^.!?\n]{0,60}/gi,
    /first\s+order[^.!?\n]{0,60}\d{1,2}%\s+off/gi,
    /\d{1,2}%\s+off\s+first\s+purchase[^.!?\n]{0,60}/gi,
    /first\s+purchase[^.!?\n]{0,60}\d{1,2}%\s+off/gi,
    /(?:use\s+code|with\s+code|code)\s*[:\-]?\s*[A-Z0-9]{3,20}[^.!?\n]{0,60}/gi,
    /free\s+(?:u\.?s\.?a?\.?\s+)?shipping[^.!?\n|]{0,100}/gi,
    /you\s+are\s*[$£€]?\s*\d+(?:\.\d+)?[^.!?\n|]{0,80}free\s+shipping/gi,
    /[$£€]?\s*\d+(?:\.\d+)?\s+away\s+from\s+free\s+shipping/gi,
    /orders?\s*[$£€]?\s*\d+(?:\.\d+)?[^.!?\n|]{0,60}ship(?:s|ping)?[^.!?\n|]{0,40}(?:[$£€]\s*\d+|\bfree\b)/gi,
    /orders?\s+(?:over|above|of|on|at)\s*[$£€]?\s*\d+(?:\.\d+)?[^.!?\n|]{0,60}/gi,
    /sale[^.!?\n]{0,50}(?:extra|additional|code|buy|get)\b[^.!?\n]{0,60}/gi,
  ];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const note = cleanPromoText(match[0]);
      if (promoTextLooksUseful(note) && !candidates.some((candidate) => candidate.toLowerCase() === note.toLowerCase())) {
        candidates.push(note);
      }
      if (candidates.length >= 2) break;
    }
    if (candidates.length >= 2) break;
  }

  for (const note of keywordPromoCandidates(text)) {
    if (!candidates.some((candidate) => candidate.toLowerCase() === note.toLowerCase())) candidates.push(note);
    if (candidates.length >= 3) break;
  }

  return sanitizePromoNote(candidates.join(" · "));
}

function promoMissReason(html = "") {
  const text = cleanPromoText(promoSearchText(html));
  if (!text) return "Homepage loaded, but no readable promo text was found.";
  if (/\bfree\s+(?:u\.?s\.?a?\.?\s+)?shipping\b/i.test(text)) {
    return "Only generic free shipping text found; no threshold or condition detected.";
  }
  if (/\b(?:sale|extra|additional|shipping|ship(?:s|ping)?|discount|promo|code|off|clearance|sample)\b/i.test(text)) {
    return "Promo-like keywords found, but no clear amount, code, or shipping threshold was detected.";
  }
  if (/<img\b/i.test(html)) {
    return "No usable promo text found; any promo may be image-only or rendered by scripts.";
  }
  return "No sale, extra discount, code, or shipping promo text found on the homepage.";
}

function extractImagePromoNote(html = "", store) {
  const hints = store.promoImageHints || [];
  if (!hints.length) return "";

  const imageText = [
    ...html.matchAll(/(?:src|srcset|data-[\w-]+|alt|title|aria-label)=["']([^"']+)["']/gi),
  ].map((match) => decodeHtml(match[1]).replace(/\s+/g, " "));

  const notes = [];
  for (const hint of hints) {
    const pattern = typeof hint.pattern === "string" ? new RegExp(hint.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : hint.pattern;
    if (imageText.some((text) => pattern.test(text))) notes.push(hint.note);
  }

  return sanitizePromoNote(notes.join(" · "));
}

async function fetchStorePromoNote(store) {
  if (store.promoNote) {
    return { promoNote: store.promoNote, promoStatus: "found", promoReason: "Manual store note." };
  }
  try {
    const response = await fetch(store.baseUrl, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!response.ok) {
      return { promoNote: "", promoStatus: "failed", promoReason: `Homepage returned ${response.status}.` };
    }
    const html = await response.text();
    const promoNote = sanitizeStorePromoNote(store, [
      extractImagePromoNote(html, store),
      extractPromoNote(html),
    ].filter(Boolean).join(" · "));
    return {
      promoNote,
      promoStatus: promoNote ? "found" : "not_found",
      promoReason: promoNote ? "Detected from homepage text or image metadata." : promoMissReason(html),
    };
  } catch {
    return { promoNote: "", promoStatus: "failed", promoReason: "Homepage could not be loaded." };
  }
}

function scoreSize(size = "") {
  const lower = size.toLowerCase();
  const match = lower.match(/(\d+)\s*y|^(\d+)$|(\d+)-(\d+)/);
  const value = match ? Number(match[1] || match[2] || match[3]) : null;
  if (value !== null && value >= 3 && value <= 6) return 2;
  if (lower.includes("4") || lower.includes("5") || lower.includes("6")) return 2;
  if (lower.includes("3") || lower.includes("7") || lower.includes("8")) return 1;
  return 0;
}

function looksLikeVariantSize(value = "") {
  const lower = String(value).trim().toLowerCase();
  if (!lower || lower === "default title") return false;
  return /\bone\s+size\b/.test(lower)
    || /\b(?:xs|s|m|l|xl|xxl|small|medium|large)\b/.test(lower)
    || /\b\d+\s*(?:m|mo|mos|month|months|y|yr|yrs|year|years)\b/.test(lower)
    || /\b\d+\s*-\s*\d+\s*(?:m|mo|mos|month|months|y|yr|yrs|year|years)?\b/.test(lower)
    || /^\d+(?:\s*\([a-z]\))?$/.test(lower);
}

function variantSize(product, variant) {
  const optionNames = (product.options || []).map((option) => String(option.name || option).toLowerCase());
  const sizeOptionIndex = optionNames.findIndex((name) => /\b(size|age|shoe)\b/.test(name));
  if (sizeOptionIndex >= 0) {
    const namedSize = variant[`option${sizeOptionIndex + 1}`];
    if (namedSize) return namedSize;
  }

  const optionValues = [variant.option1, variant.option2, variant.option3].filter(Boolean);
  return optionValues.find(looksLikeVariantSize) || variant.option2 || variant.option1 || variant.title || "";
}

function inferGender(product) {
  const text = [
    product.title,
    product.vendor,
    product.product_type,
    ...(product.tags || []),
  ].join(" ").toLowerCase();

  const hasGirls = /\b(girl|girls)\b/.test(text) || text.includes("baby girl");
  const hasBoys = /\b(boy|boys)\b/.test(text) || text.includes("baby boy");
  if (hasGirls && !hasBoys) return "girls";
  if (hasBoys && !hasGirls) return "boys";
  return "neutral";
}

function isShoeProduct(product) {
  const text = [product.title, product.product_type, ...(product.tags || [])].join(" ").toLowerCase();
  return /\b(shoe|shoes|sandal|sandals|sneaker|sneakers|boot|boots|loafer|loafers|mary jane|slipper|slippers)\b/.test(text);
}

function isExplicitAdultProduct(product) {
  const text = [product.title, product.product_type, ...(product.tags || [])].join(" ").toLowerCase();
  return /\b(women|womens|woman|ladies|lady|adult|adults|men|mens|men's)\b/.test(text);
}

function isAdultClothingSize(size = "") {
  const lower = size.toLowerCase().trim();
  const withoutChildAges = lower
    .replace(/\b\d+\s*-\s*\d+\s*(?:m|mos?|months?|y|yrs?|years?)\b/g, "")
    .replace(/\b\d+\s*(?:m|mos?|months?|y|yrs?|years?)\b/g, "");
  if (/\b(?:xs|s|m|l|xl|xxl|small|medium|large)\b/.test(withoutChildAges)) return true;

  const numbers = [...withoutChildAges.matchAll(/\b(\d{2})\b/g)].map((match) => Number(match[1]));
  return numbers.some((value) => value >= 30 && value <= 50);
}

function displayDiscount(discount) {
  return Math.round(discount * 100) / 100;
}

function productToFind(product, store, minDiscount) {
  const brand = detectProductBrand(product);
  if (!targetBrands.has(brand)) return null;
  if (isExplicitAdultProduct(product)) return null;

  const shoeProduct = isShoeProduct(product);

  const variants = (product.variants || [])
    .map((variant) => {
      let sale = toMoney(variant.price);
      const original = toMoney(variant.compare_at_price);
      let discount = original && sale !== null && original > sale ? 1 - sale / original : null;
      if (store.source === "Ladida" && original && discount !== null && displayDiscount(discount) >= 0.7) {
        sale = original * 0.5;
        discount = 0.5;
      }
      const size = variantSize(product, variant);
      return {
        sale,
        original,
        discount,
        available: Boolean(variant.available),
        size,
        sizeScore: scoreSize(size),
      };
    })
    .filter((variant) => (
      variant.available
      && variant.discount !== null
      && displayDiscount(variant.discount) >= minDiscount
      && (shoeProduct || !isAdultClothingSize(variant.size))
    ));

  if (!variants.length) return null;

  variants.sort((a, b) => b.sizeScore - a.sizeScore || b.discount - a.discount || a.sale - b.sale);
  const best = variants[0];
  const sizes = [...new Set(variants.map((variant) => variant.size).filter(Boolean))];
  const sizeOptions = variants
    .filter((variant) => variant.size)
    .map((variant) => ({
      size: variant.size,
      salePrice: variant.sale,
      originalPrice: variant.original,
      discount: variant.discount,
    }));
  const source = store.source;

  return {
    id: `${source}:${product.handle}`,
    source,
    brand,
    title: product.title,
    category: product.product_type || "",
    gender: inferGender(product),
    salePrice: best.sale,
    originalPrice: best.original,
    currency: store.currency || "USD",
    discount: best.discount,
    promoNote: store.promoNote || "",
    sizes,
    sizeOptions,
    bestSize: best.size,
    image: imageUrl(product),
    url: product.url || `${store.baseUrl}/products/${product.handle}`,
    score: Math.max(...variants.map((v) => v.sizeScore)),
  };
}

async function fetchShopifyProducts(store) {
  const products = [];
  const paths = store.mode === "collections"
    ? store.collections.map((collection) => `/collections/${collection}/products.json`)
    : ["/products.json"];
  const pageCount = store.pages || 20;

  for (const productPath of paths) {
    for (let page = 1; page <= pageCount; page += 1) {
      const url = `${store.baseUrl}${productPath}?limit=250&page=${page}`;
      const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
      if (!response.ok) break;
      const json = await response.json();
      const batch = json.products || [];
      if (!batch.length) break;
      products.push(...(
        store.onlyTargetBrands
          ? batch.filter((product) => targetBrands.has(normalizeBrand(product.vendor)))
          : batch
      ));
      if (batch.length < 250) break;
    }
  }
  return products;
}

async function fetchChildrensalonProducts(store) {
  const products = [];
  const pageCount = store.pages || 3;
  for (let page = 1; page <= pageCount; page += 1) {
    const url = `${store.baseUrl}/sale${page === 1 ? "" : `?p=${page}`}`;
    const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!response.ok) break;
    const html = await response.text();
    const items = html.match(/<li\s+data-product-code="[\s\S]*?<\/li>/g) || [];
    for (const item of items) {
      const code = item.match(/data-product-code="([^"]+)"/)?.[1];
      const title = decodeHtml(item.match(/data-product-name="([^"]+)"/)?.[1] || item.match(/<h2 class="product-name[^"]*">([\s\S]*?)<\/h2>/)?.[1] || "");
      const vendor = decodeHtml(item.match(/<div class="designer">([\s\S]*?)<\/div>/)?.[1] || "");
      const href = item.match(/<a href="([^"]+)"/)?.[1] || "";
      const img = item.match(/<img\s+src="([^"]+)"/)?.[1] || "";
      const oldPrice = toMoney(item.match(/old-price[\s\S]*?<span class="price">([^<]+)<\/span>/)?.[1]);
      const salePrice = toMoney(item.match(/special-price[\s\S]*?<span class="price">([^<]+)<\/span>/)?.[1]);
      if (!code || !title || !vendor || !href || !oldPrice || !salePrice) continue;
      products.push({
        id: code,
        title,
        handle: code,
        vendor,
        product_type: "",
        url: href.startsWith("http") ? href : `${store.baseUrl}${href}`,
        images: [{ src: img }],
        variants: [{
          title: "Size unknown",
          price: String(salePrice),
          compare_at_price: String(oldPrice),
          available: true,
        }],
      });
    }
  }
  return products;
}

async function fetchSmallableProducts(store) {
  const products = [];
  const pageCount = store.pages || 3;
  for (let page = 1; page <= pageCount; page += 1) {
    const url = `${store.baseUrl}/en/page/soldes-enfant-bebe-ado${page === 1 ? "" : `?page=${page}`}`;
    const { stdout: html } = await execFileAsync("curl", ["-L", "-s", "--max-time", "20", "-A", "Mozilla/5.0", url], {
      maxBuffer: 6 * 1024 * 1024,
    });
    if (!html) break;
    const items = html.match(/data-testid="ProductCard_container"[\s\S]*?(?=data-testid="ProductCard_container"|<\/main>|<\/script>)/g) || [];
    for (const item of items) {
      const href = item.match(/href="([^"]*\/en\/product\/[^"]+)"/)?.[1] || "";
      const vendor = decodeHtml(item.match(/ProductCard_brand__[^\"]*"[^>]*>\s*<strong>([\s\S]*?)<\/strong>/)?.[1] || "");
      const title = decodeHtml(item.match(/data-testid="ProductCard_title"[^>]*title="([^"]+)"/)?.[1] || item.match(/aria-label="Navigate to ([^"]+)"/)?.[1] || "");
      const img = item.match(/<img[^>]+src="([^"]+)"/)?.[1] || "";
      const salePrice = toMoney(item.match(/ProductCard_salePrice__[^\"]*"[^>]*>([^<]+)<\/span>/)?.[1]);
      const oldPrice = toMoney(item.match(/ProductCard_initialPrice__[^\"]*"[^>]*>([^<]+)<\/span>/)?.[1]);
      if (!href || !vendor || !title || !salePrice || !oldPrice) continue;
      const code = href.match(/-(\d+)(?:\?|$)/)?.[1] || href;
      products.push({
        id: code,
        title,
        handle: code,
        vendor,
        product_type: "",
        url: href.startsWith("http") ? href : `${store.baseUrl}${href}`,
        images: [{ src: img }],
        variants: [{
          title: "Size unknown",
          price: String(salePrice),
          compare_at_price: String(oldPrice),
          available: true,
        }],
      });
    }
  }
  return products;
}

async function fetchStoreProducts(store) {
  if (store.mode === "childrensalon-sale") return fetchChildrensalonProducts(store);
  if (store.mode === "smallable-sale") return fetchSmallableProducts(store);
  return fetchShopifyProducts(store);
}

function findIdsFromCache(cache, minDiscount) {
  if (!cacheIsUsable(cache)) return new Set();
  return new Set(findsFromCache(cache, minDiscount).map((find) => find.id));
}

function priceComparisonsFromCaches(currentCache, previousCache, minDiscount) {
  if (!cacheIsUsable(currentCache) || !cacheIsUsable(previousCache)) return [];
  const previousById = new Map(
    findsFromCache(previousCache, minDiscount).map((find) => [find.id, find]),
  );
  return findsFromCache(currentCache, minDiscount)
    .map((find) => {
      const previous = previousById.get(find.id);
      if (!previous) return null;
      const priceDelta = find.salePrice - previous.salePrice;
      return {
        id: find.id,
        previousSalePrice: previous.salePrice,
        previousDiscount: previous.discount,
        previousOriginalPrice: previous.originalPrice,
        priceDelta,
        compareDate: localDateKey(previousCache.at),
      };
    })
    .filter(Boolean);
}

function buildScanReport(cache, minDiscount, finds = null) {
  const visibleFinds = finds || findsFromCache(cache, minDiscount);
  const sources = cache.sources || [];
  const refreshedSources = sources.filter((source) => source.scanStatus !== "cached");
  const promoFound = sources.filter((source) => sanitizeStorePromoNote(source.source, source.promoNote || "")).length;
  const failedStores = sources.filter((source) => source.scanStatus === "failed" || source.promoStatus === "failed");
  const noPromoStores = sources.filter((source) => !sanitizeStorePromoNote(source.source, source.promoNote || "") && source.promoStatus !== "failed");
  const newCount = visibleFinds.filter((find) => find.isNew).length;
  const priceDropCount = visibleFinds.filter((find) => find.priceComparison?.priceDelta < -0.01).length;

  return {
    totalStores: stores.length,
    completedStores: sources.length,
    refreshedStores: refreshedSources.length,
    failedStores: failedStores.length,
    productsScanned: cache.items.length,
    finds: visibleFinds.length,
    newFinds: newCount,
    priceDrops: priceDropCount,
    promoFound,
    promoMissing: Math.max(0, stores.length - promoFound),
    noPromoStores: noPromoStores.map((source) => ({
      source: source.source,
      reason: source.promoReason || "No promo found.",
    })),
    failedStoreDetails: failedStores.map((source) => ({
      source: source.source,
      reason: source.scanReason || source.promoReason || "Scan failed.",
    })),
  };
}

function cacheFromStoreBatches(storeBatches, { at = Date.now(), previousCache = null, minDiscount = 0.4 } = {}) {
  const byStoreAndHandle = new Map();
  for (const { store, products } of storeBatches) {
    for (const product of products) {
      const compact = compactProduct(product);
      const key = `${store.source}:${compact.handle}`;
      const existing = byStoreAndHandle.get(key);
      if (!existing || shouldReplaceDuplicateProduct(existing.product, compact)) {
        byStoreAndHandle.set(key, { store, product: compact });
      }
    }
  }

  const cache = {
    at,
    items: [...byStoreAndHandle.values()],
    sources: storeBatches.map(({ store, products, promoResult, error, scanStatus, scanReason, scannedCount }) => ({
      source: store.source,
      baseUrl: store.baseUrl,
      scanned: scannedCount ?? products.length,
      scanStatus: scanStatus || (error ? "failed" : "ok"),
      scanReason: scanReason || (error ? error.message : ""),
      promoNote: store.promoNote || sanitizeStorePromoNote(store, promoResult?.promoNote || ""),
      promoStatus: store.promoNote ? "found" : (promoResult?.promoStatus || "not_found"),
      promoReason: store.promoNote ? "Manual store note." : (promoResult?.promoReason || "Promo scan did not run."),
    })),
  };

  if (previousCache) {
    const previousFindIds = findIdsFromCache(previousCache, minDiscount);
    cache.newFindIds = findsFromCache(cache, minDiscount)
      .filter((find) => !previousFindIds.has(find.id))
      .map((find) => find.id);
    cache.priceComparisons = priceComparisonsFromCaches(cache, previousCache, minDiscount);
  } else {
    cache.newFindIds = [];
    cache.priceComparisons = [];
  }

  return cache;
}

function findsFromCache(cache, minDiscount) {
  const newFindIds = new Set(Array.isArray(cache.newFindIds) ? cache.newFindIds : []);
  const promoNotes = new Map((cache.sources || []).map((source) => [source.source, sanitizeStorePromoNote(source.source, source.promoNote || "")]));
  const staticPromoNotes = new Map(stores.map((store) => [store.source, store.promoNote || ""]));
  const priceComparisons = new Map(
    (Array.isArray(cache.priceComparisons) ? cache.priceComparisons : []).map((comparison) => [comparison.id, comparison]),
  );
  return cache.items
    .map(({ store, product }) => {
      const find = productToFind(product, store, minDiscount);
      if (find) find.isNew = newFindIds.has(find.id);
      if (find && (staticPromoNotes.get(find.source) || promoNotes.get(find.source))) {
        find.promoNote = staticPromoNotes.get(find.source) || promoNotes.get(find.source);
      }
      if (find && priceComparisons.has(find.id)) find.priceComparison = priceComparisons.get(find.id);
      return find;
    })
    .filter(Boolean)
    .sort((a, b) => (
      Number(b.isNew) - Number(a.isNew)
      || Number(b.priceComparison?.priceDelta < -0.01) - Number(a.priceComparison?.priceDelta < -0.01)
      || b.score - a.score
      || b.discount - a.discount
      || a.salePrice - b.salePrice
    ));
}

function snapshotFromCache(cache, minDiscount) {
  const finds = findsFromCache(cache, minDiscount);
  const scannedBySource = new Map((cache.sources || []).map((source) => [source.source, source.scanned]));
  const promoBySource = new Map((cache.sources || []).map((source) => [source.source, sanitizeStorePromoNote(source.source, source.promoNote || "")]));
  const sourceDetails = new Map((cache.sources || []).map((source) => [source.source, source]));
  return {
    updatedAt: new Date(cache.at).toISOString(),
    cacheDate: localDateKey(cache.at),
    scanned: cache.items.length,
    count: finds.length,
    minDiscount,
    finds,
    brands: brandList.map((brand) => ({ brand: brand.name, type: brand.type || "clothes" })),
    sources: stores.map((store) => ({
      source: store.source,
      baseUrl: store.baseUrl,
      scanned: scannedBySource.get(store.source) || 0,
      promoNote: store.promoNote || promoBySource.get(store.source),
      scanStatus: sourceDetails.get(store.source)?.scanStatus || "pending",
      scanReason: sourceDetails.get(store.source)?.scanReason || "",
      promoStatus: store.promoNote ? "found" : (sourceDetails.get(store.source)?.promoStatus || "not_found"),
      promoReason: store.promoNote ? "Manual store note." : (sourceDetails.get(store.source)?.promoReason || "Not scanned yet."),
    })),
    report: buildScanReport(cache, minDiscount, finds),
  };
}

async function loadFreshDailyCache() {
  if (cacheIsFreshToday(productCache)) return productCache;

  const diskCache = await readProductCacheFile();
  if (cacheIsFreshToday(diskCache)) {
    productCache = diskCache;
    return productCache;
  }

  return null;
}

function cachedBatchForStore(store, previousCache) {
  if (!previousCache) return null;
  const previousSource = (previousCache.sources || []).find((source) => source.source === store.source);
  const products = (previousCache.items || [])
    .filter((item) => item.store?.source === store.source)
    .map((item) => item.product)
    .filter(Boolean);
  if (!previousSource && !products.length) return null;
  return {
    store,
    products,
    scannedCount: previousSource?.scanned ?? products.length,
    scanStatus: "cached",
    scanReason: "Kept from previous cache; store was not selected for refresh.",
    promoResult: {
      promoNote: previousSource?.promoNote || "",
      promoStatus: previousSource?.promoStatus || (previousSource?.promoNote ? "found" : "not_found"),
      promoReason: previousSource?.promoReason || "Kept from previous cache.",
    },
  };
}

async function fetchFreshProductCache(onStore, { previousCache = null, minDiscount = 0.4, selectedSources = null } = {}) {
  const selectedSourceSet = selectedSources?.size ? selectedSources : null;
  const storesToRefresh = selectedSourceSet ? stores.filter((store) => selectedSourceSet.has(store.source)) : stores;
  const storeBatches = selectedSourceSet
    ? stores
      .filter((store) => !selectedSourceSet.has(store.source))
      .map((store) => cachedBatchForStore(store, previousCache))
      .filter(Boolean)
    : [];
  let completed = 0;

  for (const store of storesToRefresh) {
    let products = [];
    let error = null;
    let promoResult = { promoNote: "", promoStatus: "not_found", promoReason: "Promo scan did not run." };
    try {
      const result = await Promise.allSettled([
        fetchStoreProducts(store),
        fetchStorePromoNote(store),
      ]);
      if (result[0].status === "fulfilled") products = result[0].value;
      else throw result[0].reason;
      if (result[1].status === "fulfilled") promoResult = result[1].value;
      else promoResult = { promoNote: "", promoStatus: "failed", promoReason: result[1].reason?.message || "Promo scan failed." };
    } catch (fetchError) {
      error = fetchError;
      console.warn(`Failed to fetch ${store.source}: ${fetchError.message}`);
    }

    completed += 1;
    const batch = { store, products, promoResult, error };
    storeBatches.push(batch);
    if (onStore) {
      await onStore({
        store,
        products,
        error,
        completed,
        total: storesToRefresh.length,
        cache: cacheFromStoreBatches(storeBatches, { previousCache, minDiscount }),
      });
    }
  }

  productCache = cacheFromStoreBatches(storeBatches, { previousCache, minDiscount });
  await writeProductCacheFile(productCache).catch((error) => {
    console.warn(`Could not write local product cache: ${error.message}`);
  });
  return productCache;
}

async function cachedStoreProducts(force = false, minDiscount = 0.4, selectedSources = null) {
  if (!force) {
    const freshCache = await loadFreshDailyCache();
    if (freshCache) return freshCache;
  }

  if (productCacheRefresh && !selectedSources?.size) return productCacheRefresh;

  const previousCache = await readProductCacheFile();
  productCacheRefresh = fetchFreshProductCache(null, { previousCache, minDiscount, selectedSources });

  try {
    return await productCacheRefresh;
  } finally {
    productCacheRefresh = null;
  }
}

async function latestFinds({ force = false, minDiscount = 0.7, selectedSources = null } = {}) {
  const cached = await cachedStoreProducts(force, minDiscount, selectedSources);
  return snapshotFromCache(cached, minDiscount);
}

async function streamFinds(res, { force = false, minDiscount = 0.7, selectedSources = null } = {}) {
  res.writeHead(200, {
    "content-type": "application/x-ndjson; charset=utf-8",
    "cache-control": "no-store",
  });
  const send = (payload) => res.write(`${JSON.stringify(payload)}\n`);

  if (!force) {
    const freshCache = await loadFreshDailyCache();
    if (freshCache) {
      send({ type: "cache", data: snapshotFromCache(freshCache, minDiscount) });
      res.end();
      return;
    }
  }

  const previousCache = await readProductCacheFile();
  const refreshTotal = selectedSources?.size ? stores.filter((store) => selectedSources.has(store.source)).length : stores.length;
  send({ type: "start", total: refreshTotal });
  const finalCache = await fetchFreshProductCache(async ({ store, products, error, completed, total, cache }) => {
    send({
      type: "store",
      source: store.source,
      completed,
      total,
      scanned: products.length,
      error: error ? error.message : "",
      data: snapshotFromCache(cache, minDiscount),
    });
  }, { previousCache, minDiscount, selectedSources });
  send({ type: "done", data: snapshotFromCache(finalCache, minDiscount) });
  res.end();
}

async function sendStatic(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.join(__dirname, "public", safePath);
  if (!filePath.startsWith(path.join(__dirname, "public"))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
    res.writeHead(200, { "content-type": types[ext] || "application/octet-stream" });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

function selectedSourcesFromUrl(url) {
  const value = url.searchParams.get("sources") || "";
  const requested = value
    .split("|")
    .map((source) => source.trim())
    .filter(Boolean);
  const validSources = new Set(stores.map((store) => store.source));
  const selected = requested.filter((source) => validSources.has(source));
  return selected.length ? new Set(selected) : null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const forceRefresh = url.searchParams.get("refresh") === "1";
  const refreshToken = req.headers["x-admin-refresh-token"] || url.searchParams.get("adminToken") || "";
  const refreshAllowed = !ADMIN_REFRESH_TOKEN || refreshToken === ADMIN_REFRESH_TOKEN;
  const selectedSources = selectedSourcesFromUrl(url);

  if (url.pathname === "/api/finds/stream") {
    try {
      if (forceRefresh && !refreshAllowed) {
        res.writeHead(401, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" });
        res.end(`${JSON.stringify({ type: "fatal", error: "Admin unlock required to refresh." })}\n`);
        return;
      }
      const requestedDiscount = Number.parseFloat(url.searchParams.get("minDiscount") || "0.7");
      const minDiscount = Number.isFinite(requestedDiscount) ? Math.min(Math.max(requestedDiscount, 0.3), 0.9) : 0.7;
      await streamFinds(res, {
        force: forceRefresh,
        minDiscount,
        selectedSources,
      });
    } catch (error) {
      if (!res.headersSent) res.writeHead(500, { "content-type": "application/x-ndjson; charset=utf-8" });
      res.end(`${JSON.stringify({ type: "fatal", error: error.message })}\n`);
    }
    return;
  }

  if (url.pathname === "/api/finds") {
    try {
      if (forceRefresh && !refreshAllowed) {
        res.writeHead(401, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
        res.end(JSON.stringify({ error: "Admin unlock required to refresh." }));
        return;
      }
      const requestedDiscount = Number.parseFloat(url.searchParams.get("minDiscount") || "0.7");
      const minDiscount = Number.isFinite(requestedDiscount) ? Math.min(Math.max(requestedDiscount, 0.3), 0.9) : 0.7;
      const data = await latestFinds({
        force: forceRefresh,
        minDiscount,
        selectedSources,
      });
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify(data));
    } catch (error) {
      res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  await sendStatic(res, url.pathname);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Kidswear finder running at http://localhost:${PORT}`);
});
