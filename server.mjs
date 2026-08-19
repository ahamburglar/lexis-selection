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
const STORE_REFRESH_CONCURRENCY = Math.max(1, Number(process.env.STORE_REFRESH_CONCURRENCY || 3) || 3);
const STORE_REFRESH_JITTER_MS = Math.max(0, Number(process.env.STORE_REFRESH_JITTER_MS || 1000) || 1000);
const DEFAULT_SALE_COLLECTIONS = [
  "sale",
  "sales",
  "clearance",
  "outlet",
  "last-chance",
  "final-sale",
  "warehouse-sale",
];

const brandFile = path.join(__dirname, "brands.json");
const productCacheFile = path.join(__dirname, "work", "product-cache.json");
const productCacheTempFile = path.join(__dirname, "work", "product-cache.tmp.json");
const clickEventsFile = path.join(__dirname, "work", "click-events.jsonl");
const snapshotFile = path.join(__dirname, "deploy", "snapshot.json");
const brandList = JSON.parse(await fs.readFile(brandFile, "utf8"));
const targetBrands = new Set(brandList.map((brand) => brand.name));
const brandCollections = [...new Set(brandList.flatMap((brand) => brand.collections || []))];
const excludedBrandMatches = [
  "rock your baby",
  "rock-your-baby",
].map(normalizeBrandText);
const boutiqueAdultWomenBrands = new Set([
  "Louise Misha",
  "Emile et Ida",
  "Louis Louise",
  "FUB",
  "Gray Label",
  "Tiny Cottons",
  "Rylee+Cru",
  "Caramel",
  "Oilily",
  "Petit Bateau",
  "The New Society",
  "SISSEL EDELBO",
  "Mabli",
  "Bonton",
  "Bebe Organic",
]);

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
    source: "Hello Little Crew",
    baseUrl: "https://hellolittlecrew.com",
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
    mode: "collections",
    collections: ["sale"],
    pages: 2,
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
    source: "Ellou",
    baseUrl: "https://www.shopellou.com",
    mode: "all-products",
  },
  {
    source: "Little-ish",
    baseUrl: "https://shop.little-ish.com",
    mode: "all-products",
  },
  {
    source: "Klade Children's Boutique",
    baseUrl: "https://kladechildren.com",
    mode: "all-products",
  },
  {
    source: "Willkie's",
    baseUrl: "https://shopwillkies.com",
    mode: "all-products",
  },
  {
    source: "Threadfare",
    baseUrl: "https://www.threadfare.com",
    mode: "all-products",
  },
  {
    source: "Fussy Mussy",
    baseUrl: "https://fussymussycb.com",
    mode: "all-products",
  },
  {
    source: "Alexa James Baby",
    baseUrl: "https://www.alexajbaby.com",
    mode: "all-products",
  },
  {
    source: "Marigold Modern",
    baseUrl: "https://shop.marigoldmodern.com",
    mode: "all-products",
  },
  {
    source: "Murray & Finn",
    baseUrl: "https://murrayandfinn.com",
    mode: "all-products",
  },
  {
    source: "Cub Shrub",
    baseUrl: "https://cubshrub.com",
    mode: "all-products",
  },
  {
    source: "Broomtail Kids",
    baseUrl: "https://broomtailkids.com",
    mode: "all-products",
  },
  {
    source: "Danrie",
    baseUrl: "https://shopdanrie.com",
    mode: "all-products",
  },
  {
    source: "Smoochie Baby",
    baseUrl: "https://smoochiebaby.com",
    mode: "all-products",
  },
  {
    source: "Dreams of Cuteness",
    baseUrl: "https://www.dreamsofcuteness.com",
    mode: "all-products",
  },
  {
    source: "Ely's & Co",
    baseUrl: "https://elysandco.com",
    mode: "all-products",
  },
  {
    source: "Two Tulips",
    baseUrl: "https://twotulips.com",
    mode: "all-products",
  },
  {
    source: "Smallable",
    baseUrl: "https://www.smallable.com",
    mode: "smallable-sale",
    currency: "USD",
    pages: 3,
  },
  {
    source: "Paducah Kids",
    baseUrl: "https://paducahkids.com",
    mode: "all-products",
  },
  {
    source: "State of Kid",
    baseUrl: "https://stateofkid.com",
    mode: "all-products",
  },
  {
    source: "Pi Baby",
    baseUrl: "https://pibaby.com",
    mode: "all-products",
  },
  {
    source: "Owen and Sage",
    baseUrl: "https://owenandsage.com",
    mode: "all-products",
  },
  {
    source: "Hooray Shoppe",
    baseUrl: "https://hoorayshoppe.com",
    mode: "all-products",
  },
  {
    source: "The Blue Beret",
    baseUrl: "https://www.theblueberet.com",
    mode: "all-products",
  },
  {
    source: "Hazel and Fawn",
    baseUrl: "https://hazelandfawn.com",
    mode: "all-products",
  },
  {
    source: "Baby Braithwaite",
    baseUrl: "https://babybraithwaite.com",
    mode: "all-products",
  },
  {
    source: "Lively Kid",
    baseUrl: "https://livelykid.com",
    mode: "all-products",
  },
  {
    source: "Collins and Conley",
    baseUrl: "https://collinsandconley.com",
    mode: "all-products",
  },
  {
    source: "The Ridge Kids",
    baseUrl: "https://theridgekids.com",
    mode: "all-products",
  },
  {
    source: "Kodomo Boston",
    baseUrl: "https://www.kodomoboston.com",
    mode: "all-products",
  },
  {
    source: "Yoya NYC",
    baseUrl: "https://yoyanyc.com",
    mode: "all-products",
  },
  {
    source: "The Little Things",
    baseUrl: "https://shopthelittlethings.com",
    mode: "ecwid-homepage",
  },
  {
    source: "Black Wagon",
    baseUrl: "https://blackwagon.com",
    mode: "all-products",
  },
  {
    source: "Tiny Hanger",
    baseUrl: "https://www.tinyhanger.com",
    mode: "lightspeed-homepage",
  },
  {
    source: "Hopscotch Kids",
    baseUrl: "https://hopscotchkids.com",
    mode: "all-products",
  },
  {
    source: "The Red Balloon Co.",
    baseUrl: "https://theredballoon.com",
    mode: "all-products",
  },
  {
    source: "BIEN BIEN",
    baseUrl: "https://bienbienshop.com",
    mode: "all-products",
  },
  {
    source: "The Boys and the Babe",
    baseUrl: "https://theboysandthebabe.com",
    mode: "all-products",
  },
  {
    source: "Petit Loup",
    baseUrl: "https://petitloup.com",
    mode: "all-products",
  },
  {
    source: "Sadie & Co",
    baseUrl: "https://shopsadieco.com",
    mode: "all-products",
  },
  {
    source: "Flying Colors Baby",
    baseUrl: "https://www.flyingcolorsbaby.com",
    mode: "all-products",
  },
  {
    source: "Buttons Bebe",
    baseUrl: "https://buttonsbebe.com",
    mode: "all-products",
  },
  {
    source: "Macaroni Kids",
    baseUrl: "https://macaronikids.com",
    mode: "all-products",
  },
  {
    source: "Childsplay Clothing",
    baseUrl: "https://www.childsplayclothing.com",
    mode: "all-products",
  },
  {
    source: "Mini Ruby",
    baseUrl: "https://miniruby.com",
    mode: "all-products",
  },
  {
    source: "Blubelle Baby",
    baseUrl: "https://blubellebaby.com",
    mode: "all-products",
  },
  {
    source: "Les Mini",
    baseUrl: "https://shoplesmini.com",
    mode: "all-products",
  },
  {
    source: "The Little NY",
    baseUrl: "https://thelittleny.com",
    mode: "all-products",
  },
  {
    source: "Lolini",
    baseUrl: "https://shoplolini.com",
    mode: "all-products",
  },
  {
    source: "Rama Baby",
    baseUrl: "https://ramababy.com",
    mode: "all-products",
  },
  {
    source: "Fritz and Gigi",
    baseUrl: "https://www.fritzandgigi.com",
    mode: "all-products",
  },
  {
    source: "Tuesday's Child",
    baseUrl: "https://www.tuesdayschild.com",
    mode: "all-products",
  },
  {
    source: "Flamingo Baby and Child",
    baseUrl: "https://flamingobabyandchild.com",
    mode: "all-products",
  },
  {
    source: "Jelly Beanz Kids",
    baseUrl: "https://www.jellybeanzkids.com",
    mode: "all-products",
  },
  {
    source: "Elegant Child NY",
    baseUrl: "https://elegantchildny.com",
    mode: "all-products",
  },
  {
    source: "Luibelle",
    baseUrl: "https://luibelle.com",
    mode: "all-products",
  },
  {
    source: "Ruboland",
    baseUrl: "https://ruboland.com",
    mode: "all-products",
  },
  {
    source: "All The Little Bows",
    baseUrl: "https://allthelittlebows.com",
    mode: "all-products",
  },
  {
    source: "Cocoleto",
    baseUrl: "https://cocoleto.com",
    mode: "all-products",
  },
  {
    source: "English Rabbit",
    baseUrl: "https://englishrabbit.com",
    mode: "all-products",
  },
  {
    source: "The Spotted Goose",
    baseUrl: "https://www.thespottedgoose.com",
    mode: "all-products",
  },
  {
    source: "ATLR Paris",
    baseUrl: "https://atlrparis.com",
    mode: "all-products",
  },
  {
    source: "The Little Being",
    baseUrl: "https://thelittlebeing.com",
    mode: "all-products",
    quickUsesAllProducts: true,
    quickPages: 2,
  },
  {
    source: "Shoppe Balloo",
    baseUrl: "https://shoppeballoo.com",
    mode: "all-products",
  },
  {
    source: "Dearly",
    baseUrl: "https://welovedearly.com",
    mode: "all-products",
  },
  {
    source: "Jean + Hadley",
    baseUrl: "https://www.jeanandhadley.com",
    mode: "wix-sale-page",
    salePath: "/sale",
  },
  {
    source: "SK Boutique",
    baseUrl: "https://shopskboutique.com",
    mode: "all-products",
  },
  {
    source: "Thistle and Wren",
    baseUrl: "https://www.thistleandwren.com",
    mode: "all-products",
  },
];

let productCache = null;
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
  return (
    cache
    && Number.isFinite(cache.at)
    && cache.at > 0
    && Array.isArray(cache.items)
    && Array.isArray(cache.sources)
    && cache.sources.length > 0
  );
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

async function readSavedSnapshotFile() {
  try {
    const text = await fs.readFile(snapshotFile, "utf8");
    const snapshot = JSON.parse(text);
    if (
      snapshot
      && typeof snapshot === "object"
      && Array.isArray(snapshot.finds)
      && Array.isArray(snapshot.sources)
      && Array.isArray(snapshot.brands)
    ) {
      return snapshot;
    }
    return null;
  } catch (error) {
    if (error.code !== "ENOENT") console.warn(`Could not read saved snapshot: ${error.message}`);
    return null;
  }
}

async function writeProductCacheFile(cache) {
  await fs.mkdir(path.dirname(productCacheFile), { recursive: true });
  const serialized = JSON.stringify(cache);
  await fs.writeFile(productCacheTempFile, serialized, "utf8");
  await fs.rename(productCacheTempFile, productCacheFile);
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

function productBrandSearchText(product) {
  return normalizeBrandText([
    product.handle,
    product.url,
    product.image?.src,
    product.images?.[0]?.src,
    product.title,
  ].filter(Boolean).join(" "));
}

function isExcludedBrandProduct(product) {
  const productText = productBrandSearchText(product);
  return excludedBrandMatches.some((match) => (
    productText === match
    || productText.startsWith(`${match} `)
    || productText.includes(` ${match} `)
  ));
}

function detectProductBrand(product) {
  const vendorBrand = normalizeBrand(product.vendor);
  if (targetBrands.has(vendorBrand)) return vendorBrand;

  const productText = productBrandSearchText(product);
  const candidates = brandList
    .flatMap((brand) => (brand.matches || [brand.name]).map((match) => ({ brand: brand.name, match: normalizeBrandText(match) })))
    .filter((candidate) => candidate.match)
    .sort((a, b) => b.match.length - a.match.length);

  for (const { brand, match } of candidates) {
    if (productText === match || productText.startsWith(`${match} `) || productText.includes(` ${match} `)) return brand;
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

function absoluteUrl(baseUrl, href = "") {
  if (!href) return "";
  if (href.startsWith("//")) return `https:${href}`;
  if (href.startsWith("http")) return href;
  return `${baseUrl}${href.startsWith("/") ? "" : "/"}${href}`;
}

function firstSrcFromSrcset(value = "") {
  const first = String(value).split(",")[0]?.trim().split(/\s+/)[0] || "";
  return firstSrcFromSrcsetClean(first);
}

function firstSrcFromSrcsetClean(value = "") {
  const clean = String(value).replaceAll("&amp;", "&").trim();
  return clean.startsWith("//") ? `https:${clean}` : clean;
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
  if (/\b(?:please enter a valid code|apply code|discount code\.js|social link|assets\/|sold out|in stock|shipping dis)\b/i.test(note)) {
    const cleanerSnippet = bestPromoSnippet(note.replace(/\b(?:please enter a valid code|apply code|promo code|discount code\.js|social link|assets\/remove|sold out|in stock|shipping dis|save\s*%\s*save\s*up\s*to\s*save)\b/gi, " "));
    if (cleanerSnippet) note = cleanerSnippet;
    else return "";
  }
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
    .replace(/\s+NEW$/i, "")
    .replace(/(\b\d{1,2}%\s*off\s+sale\b).*/i, "$1")
    .replace(/(\bfree\s+(?:u\.?s\.?a?\.?\s+|us\s+)?shipping\b.*?[$£€]?\s*\d+(?:\.\d+)?\+?).*/i, "$1")
    .replace(/\*+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 110);
  if (!note || note.length < 8) return "";
  if (/[{};=]|=>|\b(function|return|var|let|const|catch|decodeURI|component|script|shopify)\b/i.test(note)) return "";
  if (/\b(?:regular price|sale price|no reviews|please enter a valid code|apply code|shipping dis|discount code\.js|social link|assets\/|sold out|in stock)\b/i.test(note)) return "";
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
    .map((part) => part.replace(/^\s*d\s+([$£€]\s*\d+(?:\.\d+)?)\s+more\s+and\s+get\s+free\s+shipping!?/i, "Spend $1 more and get free shipping"))
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
    let html = "";
    try {
      const response = await fetch(store.baseUrl, { headers: { "user-agent": "Mozilla/5.0" } });
      if (!response.ok) {
        return { promoNote: "", promoStatus: "failed", promoReason: `Homepage returned ${response.status}.` };
      }
      html = await response.text();
    } catch (fetchError) {
      const { stdout } = await execFileAsync("curl", ["-L", "-s", "--max-time", "20", "-A", "Mozilla/5.0", store.baseUrl], {
        maxBuffer: 6 * 1024 * 1024,
      });
      html = stdout;
      if (!html) throw fetchError;
    }
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

  const hasWomen = /\b(women|womens|woman|ladies|lady|femme|damen|mujer)\b/.test(text);
  const hasGirls = /\b(girl|girls)\b/.test(text) || text.includes("baby girl");
  const hasBoys = /\b(boy|boys)\b/.test(text) || text.includes("baby boy");
  const hasGirlCodedClothing = /\b(dress|dresses|skirt|skirts|tutu|tutus|blouse|blouses|bikini|bikinis|swimsuit|swimsuits|tankini|tankinis|leotard|leotards|tights|maillot|maillots|hair bow|hair bows|ruffle|ruffles|ruffled|frill|frills|frilly|smock|smocked|smocking|puff sleeve|puff sleeves|flutter sleeve|flutter sleeves|one-piece swimsuit|one piece swimsuit|bathing suit|bathing suits|swim suit|swim suits)\b/.test(text);
  if (hasWomen) return "women";
  if (hasGirls && !hasBoys) return "girls";
  if (hasBoys && !hasGirls) return "boys";
  if (hasGirlCodedClothing && !hasBoys) return "girls";
  return "neutral";
}

function isShoeProduct(product) {
  const text = [product.title, product.product_type, ...(product.tags || [])].join(" ").toLowerCase();
  return /\b(shoe|shoes|sandal|sandals|sneaker|sneakers|boot|boots|snowboot|snowboots|bootie|booties|loafer|loafers|mary jane|slipper|slippers|clog|clogs|flat|flats)\b/.test(text);
}

function isAccessoryProduct(product) {
  const title = String(product.title || "").toLowerCase();
  const category = String(product.product_type || "").toLowerCase();
  const tags = (product.tags || []).join(" ").toLowerCase();
  const clothingText = [title, category].join(" ");
  const clothingPattern = /\b(apparel|clothes|clothing|dress|dresses|shirt|shirts|tee|t-shirt|tank|top|tops|blouse|sweatshirt|sweater|cardigan|pant|pants|panty|trackpant|trackpants|sweatpant|sweatpants|trouser|trousers|legging|leggings|short|shorts|skirt|bottom|bottoms|romper|rompers|onesie|bodysuit|jumpsuit|jumpsuits|playsuit|playsuits|bubble|bubbles|overall|overalls|jacket|coat|swim|rashguard|bikini|bra|sports bra|tight|tights|sock|socks|footie|footies|sleeper|sleepers|pajama|pajamas|pyjama|pyjamas|layette|set|sweatsuit|tracksuit|bloomer|bloomers|jumper|jumpers|turtleneck|roll neck|one piece|sleepy doe)\b/;
  const broadApparelCategory = /\bapparel\s*(?:&|and)\s*accessories\b/.test(category);
  const accessoryPattern = /\b(accessory|accessories|hairgoods|hair|bow|bows|bow tie|clip|clips|barrette|headband|scrunchie|ribbon|toy|toys|doll|dolls|activity|rattle|teether|pacifier|blanket|bag|bags|purse|backpack|pouch|nap mat|quilt|quilts|quilted|basket|baskets|stationery|stationary|pencil|notebook|sticker|stickers|poster|print|lunch|bottle|cup|tableware|plate|bib|swaddle|towel|bath|decor|ornament|costume|dress up|jewelry|jewellery|necklace|bracelet|ring|hat|hats|sun hat|swim hat|bucket hat|beanie|bonnet|mitten|mittens|crown)\b/;

  if (/\bcostume\b/.test(title)) return true;
  if (clothingPattern.test(clothingText)) return false;
  if (broadApparelCategory && !accessoryPattern.test(title)) return false;
  return accessoryPattern.test([title, category, tags].join(" "));
}

function isExplicitAdultProduct(product) {
  const text = [product.title, product.product_type, ...(product.tags || [])].join(" ").toLowerCase();
  return /\b(women|womens|woman|ladies|lady|adult|adults|men|mens|men's)\b/.test(text);
}

function allowsBoutiqueAdultWomen(brand) {
  return boutiqueAdultWomenBrands.has(brand);
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

function isAbnormalVariantPrice({ sale, original, discount }) {
  if (!Number.isFinite(sale) || !Number.isFinite(original) || !Number.isFinite(discount)) return true;
  if (sale <= 0 || original <= 0 || original <= sale) return true;

  const ratio = original / sale;
  return original >= 5000
    || ratio >= 50
    || (original >= 1000 && ratio >= 20)
    || (original >= 500 && displayDiscount(discount) >= 0.95);
}

function productToFind(product, store, minDiscount) {
  if (isExcludedBrandProduct(product)) return null;
  const brand = detectProductBrand(product);
  if (!targetBrands.has(brand)) return null;
  const adultProduct = isExplicitAdultProduct(product);
  if (adultProduct && !allowsBoutiqueAdultWomen(brand)) return null;

  const shoeProduct = isShoeProduct(product);
  const accessoryProduct = isAccessoryProduct(product);

  const allVariants = (product.variants || [])
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
      variant.discount !== null
      && !isAbnormalVariantPrice(variant)
      && displayDiscount(variant.discount) >= minDiscount
      && (shoeProduct || accessoryProduct || adultProduct || !isAdultClothingSize(variant.size))
    ));

  const variants = allVariants
    .filter((variant) => (
      variant.available
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
    itemType: shoeProduct ? "shoes" : (accessoryProduct ? "accessories" : "clothes"),
    gender: adultProduct && allowsBoutiqueAdultWomen(brand) ? "women" : inferGender(product),
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

async function fetchShopifyProductPaths(store, productPaths, pageCount) {
  const products = [];

  for (const productPath of productPaths) {
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

async function fetchShopifyProducts(store, minDiscount = 0.4, { refreshMode = "quick" } = {}) {
  if (store.mode === "collections") {
    const paths = store.collections.map((collection) => `/collections/${collection}/products.json`);
    return fetchShopifyProductPaths(store, paths, store.pages || 20);
  }

  if (refreshMode === "quick" && store.quickUsesAllProducts) {
    return fetchShopifyProductPaths(store, ["/products.json"], store.quickPages || store.salePages || 4);
  }

  if (store.useSaleCollectionsOnly || refreshMode === "quick") {
    const saleCollections = store.saleCollections || DEFAULT_SALE_COLLECTIONS;
    const salePaths = saleCollections.map((collection) => `/collections/${collection}/products.json`);
    return fetchShopifyProductPaths(store, salePaths, store.salePages || 4);
  }

  return fetchShopifyProductPaths(store, ["/products.json"], store.pages || 20);
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
    let html = "";
    try {
      const result = await execFileAsync("curl", ["-L", "-s", "--max-time", "30", "-A", "Mozilla/5.0", url], {
        maxBuffer: 10 * 1024 * 1024,
      });
      html = result.stdout;
    } catch (error) {
      if (products.length) break;
      throw error;
    }
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
  return hydrateSmallableSizes(products);
}

function extractSmallableAvailableSizes(html = "") {
  const options = html.match(/<li\b[^>]*id="productSize-[\s\S]*?<\/li>/g) || [];
  return options
    .map((option) => {
      if (/Sold out/i.test(option)) return "";
      const size = option.match(/ProductSizeSelector_sizeValue__[^\"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1] || "";
      return decodeHtml(size).replace(/<!--[\s\S]*?-->/g, " ").replace(/\s+/g, " ").trim();
    })
    .filter(Boolean);
}

async function fetchSmallableProductSizes(product) {
  if (!product.url) return [];
  try {
    const { stdout: html } = await execFileAsync("curl", ["-L", "-s", "--max-time", "20", "-A", "Mozilla/5.0", product.url], {
      maxBuffer: 8 * 1024 * 1024,
    });
    return [...new Set(extractSmallableAvailableSizes(html))];
  } catch {
    return [];
  }
}

async function hydrateSmallableSizes(products) {
  const hydrated = [];
  let nextIndex = 0;
  const workerCount = Math.min(4, products.length || 1);

  async function worker() {
    while (nextIndex < products.length) {
      const index = nextIndex;
      nextIndex += 1;
      const product = products[index];
      const sizes = await fetchSmallableProductSizes(product);
      if (sizes.length) {
        product.variants = sizes.map((size) => ({
          ...product.variants[0],
          title: size,
          option1: size,
        }));
      }
      hydrated[index] = product;
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return hydrated.filter(Boolean);
}

function htmlProduct({ id, title, vendor = "", productType = "", url = "", image = "", price, compareAtPrice, available = true }) {
  return {
    id: String(id || url || title),
    title: decodeHtml(title || ""),
    handle: String(id || url || title),
    vendor: decodeHtml(vendor || ""),
    product_type: decodeHtml(productType || ""),
    url,
    images: image ? [{ src: image }] : [],
    variants: [{
      title: "One size",
      price: String(price ?? ""),
      compare_at_price: String(compareAtPrice ?? ""),
      available,
    }],
  };
}

function extractJsonArrayAfterMarker(text = "", marker = "") {
  const start = text.indexOf(marker);
  if (start < 0) return [];
  const arrayStart = start + marker.length - 1;
  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = arrayStart; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaping) escaping = false;
      else if (char === "\\") escaping = true;
      else if (char === "\"") inString = false;
      continue;
    }
    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "[") depth += 1;
    else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(arrayStart, index + 1));
        } catch {
          return [];
        }
      }
    }
  }
  return [];
}

function extractJsonObjectAfterMarker(text = "", marker = "") {
  const start = text.indexOf(marker);
  if (start < 0) return null;
  const objectStart = start + marker.length - 1;
  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = objectStart; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaping) escaping = false;
      else if (char === "\\") escaping = true;
      else if (char === "\"") inString = false;
      continue;
    }
    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(objectStart, index + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function wixProductSizeMap(product) {
  const map = new Map();
  for (const option of product.options || []) {
    if (!/size/i.test(option.key || option.title || "")) continue;
    for (const selection of option.selections || []) {
      map.set(String(selection.id), selection.value || selection.description || selection.key || "");
    }
  }
  return map;
}

function slugifyWixPath(value = "") {
  return `/${normalizeBrandText(value).replace(/\s+/g, "-")}`;
}

function wixBrandPaths() {
  const paths = new Set(["/sale"]);
  for (const brand of brandList) {
    paths.add(slugifyWixPath(brand.name));
    for (const match of brand.matches || []) paths.add(slugifyWixPath(match));
  }
  return [...paths].filter((pathValue) => pathValue.length > 1);
}

function wixDiscountedVariants(product) {
  const sizeMap = wixProductSizeMap(product);
  return (product.productItems || [])
    .filter((item) => (
      item?.isVisible !== false
      && item?.hasDiscount
      && Number(item.comparePrice) > 0
      && Number(item.price) > Number(item.comparePrice)
      && (item.inventory?.status ? item.inventory.status === "in_stock" : true)
    ))
    .map((item) => {
      const size = item.optionsSelections
        ?.map((id) => sizeMap.get(String(id)))
        .filter(Boolean)
        .join(", ") || "One size";
      const quantity = Number(item.inventory?.quantity);
      const hasQuantity = Number.isFinite(quantity);
      return {
        title: size,
        option1: size,
        price: String(item.comparePrice),
        compare_at_price: String(item.price),
        available: hasQuantity ? quantity > 0 : true,
      };
    });
}

async function fetchWixPageProduct(store, listedProduct) {
  const handle = listedProduct.urlPart || listedProduct.slug || listedProduct.id || "";
  if (!handle) return listedProduct;
  const url = absoluteUrl(store.baseUrl, `/product-page/${handle}`);
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!response.ok) return [];
  const html = await response.text();
  return extractJsonObjectAfterMarker(html, `"productPage_USD_${handle}":{"catalog":{"product":{`)
    || extractJsonObjectAfterMarker(html, "\"catalog\":{\"product\":{")
    || listedProduct;
}

async function fetchWixSalePageProducts(store, minDiscount = 0.4, { refreshMode = "quick" } = {}) {
  const paths = refreshMode === "deep" ? wixBrandPaths() : [store.salePath || "/sale"];
  const products = [];
  const seenHandles = new Set();

  for (const pathValue of paths) {
    const response = await fetch(absoluteUrl(store.baseUrl, pathValue), { headers: { "user-agent": "Mozilla/5.0" } });
    if (!response.ok) continue;
    const html = await response.text();
    const list = extractJsonArrayAfterMarker(html, "\"productsWithMetaData\":{\"list\":[");

    for (const listedProduct of list) {
      const handle = listedProduct.urlPart || listedProduct.id || listedProduct.name;
      if (!handle || seenHandles.has(handle)) continue;
      seenHandles.add(handle);

      let product = listedProduct;
      let variants = wixDiscountedVariants(product);
      if (!variants.length && (!product.productItems || !product.productItems.length)) {
        product = await fetchWixPageProduct(store, listedProduct);
        variants = wixDiscountedVariants(product);
      }
      if (!variants.length) continue;
      products.push({
        id: product.id || listedProduct.id || handle,
        title: product.name || listedProduct.name || "",
        handle,
        vendor: "",
        product_type: "",
        url: absoluteUrl(store.baseUrl, `/product-page/${handle}`),
        images: product.media?.[0]?.fullUrl ? [{ src: product.media[0].fullUrl }] : [],
        variants,
      });
    }
  }

  return products;
}

async function fetchEcwidHomepageProducts(store) {
  const response = await fetch(store.baseUrl, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!response.ok) return [];
  const html = await response.text();
  const products = [];
  const items = html.match(/<div id="product-[\s\S]*?(?=<div id="product-|<\/section>|<\/main>)/g) || [];

  for (const item of items) {
    if (/ins-component__outofstock|Out of stock/i.test(item)) continue;
    const id = item.match(/id="product-([^"]+)"/)?.[1] || "";
    const href = item.match(/<a[^>]+href="([^"]+)"/)?.[1] || "";
    const title = item.match(/aria-label="([^"]+)"/)?.[1]
      || item.match(/class="ins-component__title-inner"[^>]*>([\s\S]*?)<\/div>/)?.[1]
      || "";
    const image = item.match(/<img[^>]+src="([^"]+)"/)?.[1] || firstSrcFromSrcset(item.match(/srcset="([^"]+)"/)?.[1] || "");
    const price = toMoney(item.match(/ins-component__price-value"[^>]*>([\s\S]*?)<\/div>/)?.[1]);
    const compareAtPrice = toMoney(item.match(/ins-component__price-compare"[^>]*>([\s\S]*?)<\/div>/)?.[1]);
    if (!title || price === null || compareAtPrice === null || compareAtPrice <= price) continue;
    products.push(htmlProduct({
      id,
      title,
      vendor: "",
      productType: "",
      url: absoluteUrl(store.baseUrl, href),
      image: absoluteUrl(store.baseUrl, image),
      price,
      compareAtPrice,
    }));
  }

  return products;
}

async function fetchLightspeedHomepageProducts(store) {
  const response = await fetch(store.baseUrl, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!response.ok) return [];
  const html = await response.text();
  const products = [];
  const items = html.match(/<div class="prod-card"[\s\S]*?(?=<div class="prod-card"|<\/li>)/g) || [];

  for (const item of items) {
    const href = item.match(/<a[^>]+class="prod-card__img-link"[^>]+href="([^"]+)"/)?.[1]
      || item.match(/<a[^>]+href="([^"]+)"[^>]+class="product-card__title"/)?.[1]
      || "";
    const vendor = item.match(/prod-card__brand[^>]*>([\s\S]*?)<\/a>/)?.[1] || "";
    const title = item.match(/class="product-card__title"[^>]*>([\s\S]*?)<\/a>/)?.[1]
      || item.match(/aria-label="([^"]+)"/)?.[1]
      || "";
    const image = item.match(/<img[^>]+src="([^"]+)"/)?.[1] || firstSrcFromSrcset(item.match(/srcset="([^"]+)"/)?.[1] || "");
    const prices = [...item.matchAll(/\$[\d,.]+/g)].map((match) => toMoney(match[0])).filter((value) => value !== null);
    const price = prices.length ? Math.min(...prices) : null;
    const compareAtPrice = prices.length > 1 ? Math.max(...prices) : null;
    if (!title || price === null || compareAtPrice === null || compareAtPrice <= price) continue;
    products.push(htmlProduct({
      id: href || title,
      title,
      vendor,
      productType: "",
      url: absoluteUrl(store.baseUrl, href),
      image: absoluteUrl(store.baseUrl, image),
      price,
      compareAtPrice,
    }));
  }

  return products;
}

async function fetchStoreProducts(store, minDiscount = 0.4, { refreshMode = "quick" } = {}) {
  if (store.mode === "childrensalon-sale") return fetchChildrensalonProducts(store);
  if (store.mode === "smallable-sale") return fetchSmallableProducts(store);
  if (store.mode === "wix-sale-page") return fetchWixSalePageProducts(store, minDiscount, { refreshMode });
  if (store.mode === "ecwid-homepage") return fetchEcwidHomepageProducts(store);
  if (store.mode === "lightspeed-homepage") return fetchLightspeedHomepageProducts(store);
  return fetchShopifyProducts(store, minDiscount, { refreshMode });
}

function findIdsFromCache(cache, minDiscount) {
  if (!cacheIsUsable(cache)) return new Set();
  return new Set(findsFromCache(cache, minDiscount).map((find) => find.id));
}

function identityTitle(value = "") {
  return normalizeBrandText(value)
    .replace(/\b(?:new|sale|final sale|as is)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findIdentityKeys({ source = "", brand = "", title = "", url = "", id = "" } = {}) {
  const sourceKey = normalizeBrandText(source);
  const brandKey = normalizeBrandText(brand);
  const titleKey = identityTitle(title);
  const urlHandle = String(url || "").split("/products/")[1]?.split(/[?#]/)[0] || "";
  const idHandle = String(id || "").includes(":") ? String(id).slice(String(id).indexOf(":") + 1) : String(id || "");
  const keys = [];

  if (sourceKey && brandKey && titleKey.length >= 4) keys.push(`${sourceKey}|${brandKey}|${titleKey}`);
  if (sourceKey && titleKey.length >= 8) keys.push(`${sourceKey}|title|${titleKey}`);
  if (sourceKey && urlHandle) keys.push(`${sourceKey}|handle|${identityTitle(urlHandle)}`);
  if (sourceKey && idHandle) keys.push(`${sourceKey}|handle|${identityTitle(idHandle)}`);

  return keys.filter(Boolean);
}

function rawProductIdentityKeysFromCache(cache) {
  if (!cacheIsUsable(cache)) return new Set();
  const keys = new Set();
  for (const { store, product } of cache.items || []) {
    const source = store?.source || "";
    const brand = detectProductBrand(product);
    for (const key of findIdentityKeys({
      source,
      brand,
      title: product?.title || "",
      url: product?.url || "",
      id: `${source}:${product?.handle || product?.id || ""}`,
    })) {
      keys.add(key);
    }
  }
  return keys;
}

function hasKnownIdentity(find, knownKeys) {
  return findIdentityKeys(find).some((key) => knownKeys.has(key));
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

function formatDurationMs(ms) {
  const value = Number(ms);
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value < 1000) return `${Math.round(value)}ms`;
  const seconds = value / 1000;
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}m ${remainder}s`;
}

function buildScanReport(cache, minDiscount, finds = null) {
  const visibleFinds = finds || findsFromCache(cache, minDiscount);
  const sources = cache.sources || [];
  const sourceFetchFailed = (source) => (
    source.scanStatus === "failed"
    || source.scanStatus === "dns_failed"
    || /\bfetch failed\b|\bENOTFOUND\b|getaddrinfo|curl\b/i.test(source.scanReason || "")
    || (Number(source.scanned || 0) === 0 && /promo scan did not run/i.test(source.promoReason || ""))
  );
  const refreshedSources = sources.filter((source) => source.scanStatus !== "cached" && source.scanStatus !== "dns_failed");
  const promoFound = sources.filter((source) => sanitizeStorePromoNote(source.source, source.promoNote || "")).length;
  const failedStores = sources.filter((source) => sourceFetchFailed(source) || source.promoStatus === "failed");
  const dnsFailedStores = sources.filter((source) => source.scanStatus === "dns_failed");
  const noPromoStores = sources.filter((source) => (
    !sourceFetchFailed(source)
    && !sanitizeStorePromoNote(source.source, source.promoNote || "")
    && source.promoStatus !== "failed"
  ));
  const newCount = visibleFinds.filter((find) => find.isNew).length;
  const priceDropCount = visibleFinds.filter((find) => find.priceComparison?.priceDelta < -0.01).length;
  const slowStoreDetails = sources
    .filter((source) => Number.isFinite(Number(source.durationMs)) && Number(source.durationMs) > 0)
    .sort((a, b) => Number(b.durationMs) - Number(a.durationMs))
    .slice(0, 12)
    .map((source) => ({
      source: source.source,
      durationMs: Number(source.durationMs),
      reason: `${formatDurationMs(source.durationMs)} · scanned ${Number(source.scanned || 0)} products · ${source.scanStatus || "ok"}`,
    }));

  return {
    totalStores: stores.length,
    completedStores: sources.length,
    refreshedStores: refreshedSources.length,
    failedStores: failedStores.length,
    productsScanned: cache.items.length,
    finds: visibleFinds.length,
    newFinds: newCount,
    priceDrops: priceDropCount,
    refreshMode: cache.refreshMode || "quick",
    promoFound,
    promoMissing: Math.max(0, stores.length - promoFound),
    dnsFailedStores: dnsFailedStores.length,
    dnsFailedStoreDetails: dnsFailedStores.map((source) => ({
      source: source.source,
      reason: source.scanReason || "DNS lookup failed; previous data was kept.",
    })),
    noPromoStores: noPromoStores.map((source) => ({
      source: source.source,
      reason: source.promoReason || "No promo found.",
    })),
    failedStoreDetails: failedStores.map((source) => ({
      source: source.source,
      reason: source.scanReason || source.promoReason || "Scan failed.",
    })),
    slowStoreDetails,
  };
}

function cacheFromStoreBatches(storeBatches, { at = Date.now(), previousCache = null, minDiscount = 0.4, refreshMode = "quick" } = {}) {
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
    refreshMode,
    items: [...byStoreAndHandle.values()],
    sources: storeBatches.map(({ store, products, promoResult, error, scanStatus, scanReason, scannedCount, durationMs, scanMode }) => ({
      source: store.source,
      baseUrl: store.baseUrl,
      scanned: scannedCount ?? products.length,
      durationMs: Number.isFinite(Number(durationMs)) ? Number(durationMs) : 0,
      scanMode: scanMode || refreshMode,
      scanStatus: scanStatus || (error ? "failed" : "ok"),
      scanReason: scanReason || (error ? error.message : ""),
      promoNote: store.promoNote || sanitizeStorePromoNote(store, promoResult?.promoNote || ""),
      promoStatus: store.promoNote ? "found" : (promoResult?.promoStatus || "not_found"),
      promoReason: store.promoNote ? "Manual store note." : (promoResult?.promoReason || "Promo scan did not run."),
    })),
  };

  if (previousCache) {
    const previousFindIds = findIdsFromCache(previousCache, minDiscount);
    const previousIdentityKeys = rawProductIdentityKeysFromCache(previousCache);
    cache.newFindIds = findsFromCache(cache, minDiscount)
      .filter((find) => !previousFindIds.has(find.id) && !hasKnownIdentity(find, previousIdentityKeys))
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
  const activeStoreSources = new Set(stores.map((store) => store.source));
  const priceComparisons = new Map(
    (Array.isArray(cache.priceComparisons) ? cache.priceComparisons : []).map((comparison) => [comparison.id, comparison]),
  );
  return cache.items
    .filter(({ store }) => activeStoreSources.has(store?.source))
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
    cacheSource: cache.recoveredFromSnapshot ? "snapshot-fallback" : "live-cache",
    cacheSourceLabel: cache.recoveredFromSnapshot ? "Snapshot fallback" : "Live cache",
    scanned: cache.items.length,
    count: finds.length,
    minDiscount,
    refreshMode: cache.refreshMode || "quick",
    finds,
    brands: brandList.map((brand) => ({ brand: brand.name, type: brand.type || "clothes" })),
    sources: stores.map((store) => ({
      source: store.source,
      baseUrl: store.baseUrl,
      scanned: scannedBySource.get(store.source) || 0,
      durationMs: sourceDetails.get(store.source)?.durationMs || 0,
      scanMode: sourceDetails.get(store.source)?.scanMode || cache.refreshMode || "quick",
      promoNote: store.promoNote || promoBySource.get(store.source),
      scanStatus: sourceDetails.get(store.source)?.scanStatus || "pending",
      scanReason: sourceDetails.get(store.source)?.scanReason || "",
      promoStatus: store.promoNote ? "found" : (sourceDetails.get(store.source)?.promoStatus || "not_found"),
      promoReason: store.promoNote ? "Manual store note." : (sourceDetails.get(store.source)?.promoReason || "Not scanned yet."),
    })),
    report: buildScanReport(cache, minDiscount, finds),
  };
}

function emptySnapshot(minDiscount, reason = "No saved cache yet.") {
  return {
    updatedAt: new Date(0).toISOString(),
    cacheDate: "",
    cacheSource: "empty",
    cacheSourceLabel: "Empty",
    scanned: 0,
    count: 0,
    minDiscount,
    refreshMode: "quick",
    finds: [],
    brands: brandList.map((brand) => ({ brand: brand.name, type: brand.type || "clothes" })),
    sources: stores.map((store) => ({
      source: store.source,
      baseUrl: store.baseUrl,
      scanned: 0,
      durationMs: 0,
      scanMode: "pending",
      promoNote: store.promoNote || "",
      scanStatus: "pending",
      scanReason: reason,
      promoStatus: store.promoNote ? "found" : "not_found",
      promoReason: store.promoNote ? "Manual store note." : reason,
    })),
    report: {
      totalStores: stores.length,
      completedStores: 0,
      refreshedStores: 0,
      failedStores: 0,
      productsScanned: 0,
      finds: 0,
      newFinds: 0,
      priceDrops: 0,
      refreshMode: "quick",
      promoFound: 0,
      promoMissing: stores.length,
      noPromoStores: [],
      failedStoreDetails: [],
      slowStoreDetails: [],
    },
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

function cacheFromSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || !Array.isArray(snapshot.finds)) return null;
  const sourceDetails = new Map(
    (snapshot.sources || [])
      .filter((source) => source && source.source)
      .map((source) => [source.source, source]),
  );
  const storeBySource = new Map(stores.map((store) => [store.source, store]));

  const items = (snapshot.finds || [])
    .map((find) => {
      const store = storeBySource.get(find.source);
      const product = snapshotFindToProduct(find);
      if (!store || !product) return null;
      return { store, product };
    })
    .filter(Boolean);

  const sources = stores.map((store) => {
    const detail = sourceDetails.get(store.source) || {};
    const scanned = Number(detail.scanned);
    return {
      source: store.source,
      scanned: Number.isFinite(scanned) ? scanned : items.filter((item) => item.store.source === store.source).length,
      durationMs: Number.isFinite(Number(detail.durationMs)) ? Number(detail.durationMs) : 0,
      scanMode: detail.scanMode || snapshot.refreshMode || "cached",
      promoNote: detail.promoNote || store.promoNote || "",
      scanStatus: detail.scanStatus || "cached",
      scanReason: detail.scanReason || "Recovered from saved snapshot.",
      promoStatus: detail.promoStatus || ((detail.promoNote || store.promoNote) ? "found" : "not_found"),
      promoReason: detail.promoReason || ((detail.promoNote || store.promoNote) ? "Recovered from saved snapshot." : "Recovered from saved snapshot with no promo text."),
    };
  });

  const timestamp = Date.parse(snapshot.updatedAt || "");
  const at = Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Date.now();
  const recoveredCache = {
    at,
    items,
    sources,
    refreshMode: snapshot.refreshMode || snapshot.report?.refreshMode || "quick",
    newFindIds: [],
    priceComparisons: [],
    recoveredFromSnapshot: true,
  };
  return cacheIsUsable(recoveredCache) ? recoveredCache : null;
}

async function loadLatestAvailableCache() {
  if (cacheIsUsable(productCache)) return productCache;

  const diskCache = await readProductCacheFile();
  if (cacheIsUsable(diskCache)) {
    productCache = diskCache;
    return productCache;
  }

  const savedSnapshot = await readSavedSnapshotFile();
  const recoveredCache = cacheFromSnapshot(savedSnapshot);
  if (cacheIsUsable(recoveredCache)) {
    productCache = recoveredCache;
    await writeProductCacheFile(recoveredCache).catch((error) => {
      console.warn(`Could not rebuild local product cache from snapshot: ${error.message}`);
    });
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
    durationMs: previousSource?.durationMs || 0,
    scanMode: previousSource?.scanMode || "cached",
    scanStatus: "cached",
    scanReason: "Kept from previous cache; store was not selected for refresh.",
    promoResult: {
      promoNote: previousSource?.promoNote || "",
      promoStatus: previousSource?.promoStatus || (previousSource?.promoNote ? "found" : "not_found"),
      promoReason: previousSource?.promoReason || "Kept from previous cache.",
    },
  };
}

function snapshotFindToProduct(find) {
  const handle = String(find.id || "").includes(":")
    ? String(find.id).slice(String(find.id).indexOf(":") + 1)
    : (find.url?.split("/products/")[1]?.split(/[?#]/)[0] || find.id || find.title || "");
  const variants = (Array.isArray(find.sizeOptions) && find.sizeOptions.length ? find.sizeOptions : [{
    size: find.bestSize || find.sizes?.[0] || "Size unknown",
    salePrice: find.salePrice,
    originalPrice: find.originalPrice,
  }]).map((option) => ({
    title: option.size || "Size unknown",
    option1: option.size || "Size unknown",
    price: String(option.salePrice ?? find.salePrice ?? ""),
    compare_at_price: String(option.originalPrice ?? find.originalPrice ?? ""),
    available: true,
  }));

  return {
    id: handle,
    handle,
    title: find.title || "",
    vendor: find.brand || "",
    product_type: find.category || "",
    tags: [find.gender || ""].filter(Boolean),
    url: find.url || "",
    image: find.image ? { src: find.image } : undefined,
    images: find.image ? [{ src: find.image }] : [],
    variants,
  };
}

function previousStoreState(store, previousCache, fallbackSnapshot = null) {
  if (previousCache) {
    const previousSource = (previousCache.sources || []).find((source) => source.source === store.source) || null;
    const products = (previousCache.items || [])
      .filter((item) => item.store?.source === store.source)
      .map((item) => item.product)
      .filter(Boolean);
    if (products.length) return { previousSource, products };
    if (previousSource && previousSource.scanned > 0) return { previousSource, products };
  }

  if (fallbackSnapshot) {
    const previousSource = (fallbackSnapshot.sources || []).find((source) => source.source === store.source) || null;
    const products = (fallbackSnapshot.finds || [])
      .filter((find) => find.source === store.source)
      .map(snapshotFindToProduct)
      .filter(Boolean);
    if (previousSource || products.length) return { previousSource, products };
  }

  return null;
}

function isDnsFetchError(error) {
  const code = error?.cause?.code || error?.code || "";
  const message = `${error?.message || ""} ${error?.cause?.message || ""}`;
  return code === "ENOTFOUND" || /\bENOTFOUND\b|getaddrinfo/i.test(message);
}

function isTimeoutFetchError(error) {
  const code = error?.cause?.code || error?.code || "";
  const message = `${error?.message || ""} ${error?.cause?.message || ""}`;
  return code === "ETIMEDOUT" || code === "UND_ERR_CONNECT_TIMEOUT" || /timed?\s*out|timeout/i.test(message);
}

function isCurlTimeoutError(error) {
  const message = `${error?.message || ""} ${error?.stderr || ""}`;
  return /curl\b/i.test(message) && /--max-time|timed?\s*out|operation timed out/i.test(message);
}

function formatFetchError(error) {
  const code = error?.cause?.code || error?.code || "";
  const message = `${error?.message || ""} ${error?.cause?.message || ""}`.trim();
  if (isDnsFetchError(error)) return `DNS failed${code ? ` (${code})` : ""}`;
  if (isCurlTimeoutError(error)) return "curl timeout";
  if (isTimeoutFetchError(error)) return `request timeout${code ? ` (${code})` : ""}`;
  if (message) return message;
  return "fetch failed";
}

async function fetchFreshProductCache(onStore, { previousCache = null, minDiscount = 0.4, selectedSources = null, refreshMode = "quick" } = {}) {
  const selectedSourceSet = selectedSources?.size ? selectedSources : null;
  const fallbackSnapshot = await readSavedSnapshotFile();
  const storesToRefresh = selectedSourceSet ? stores.filter((store) => selectedSourceSet.has(store.source)) : stores;
  const storeBatches = selectedSourceSet
    ? stores
      .filter((store) => !selectedSourceSet.has(store.source))
      .map((store) => cachedBatchForStore(store, previousCache))
      .filter(Boolean)
    : [];
  let completed = 0;
  let nextStoreIndex = 0;

  async function refreshOneStore(store) {
    const startedAt = Date.now();
    let products = [];
    let error = null;
    let promoResult = { promoNote: "", promoStatus: "not_found", promoReason: "Promo scan did not run." };
    let scanStatus = "ok";
    let scanReason = "";
    let scanMode = refreshMode;
    try {
      const result = await Promise.allSettled([
        fetchStoreProducts(store, minDiscount, { refreshMode }),
        fetchStorePromoNote(store),
      ]);
      if (result[0].status === "fulfilled") products = result[0].value;
      else throw result[0].reason;
      if (result[1].status === "fulfilled") promoResult = result[1].value;
      else promoResult = { promoNote: "", promoStatus: "failed", promoReason: result[1].reason?.message || "Promo scan failed." };

      if (refreshMode === "quick" && products.length === 0 && store.mode === "all-products") {
        const previous = previousStoreState(store, previousCache, fallbackSnapshot);
        if (previous?.products?.length) {
          products = previous.products;
          promoResult = {
            promoNote: promoResult?.promoNote || previous.previousSource?.promoNote || "",
            promoStatus: promoResult?.promoStatus === "found" ? "found" : (previous.previousSource?.promoStatus || (previous.previousSource?.promoNote ? "found" : "not_found")),
            promoReason: promoResult?.promoReason || previous.previousSource?.promoReason || "Kept from previous cache after quick sale scan found no products.",
          };
          scanStatus = "cached";
          scanReason = "Quick sale scan found no products; kept previous data. Use Deep refresh for a full-store scan.";
        } else {
          scanReason = "Quick sale scan found no products. Use Deep refresh for a full-store scan.";
        }
      }
    } catch (fetchError) {
      const previous = previousStoreState(store, previousCache, fallbackSnapshot);
      if (previous) {
        products = previous.products;
        promoResult = {
          promoNote: previous.previousSource?.promoNote || "",
          promoStatus: previous.previousSource?.promoStatus || (previous.previousSource?.promoNote ? "found" : "not_found"),
          promoReason: previous.previousSource?.promoReason || "Kept from previous cache after a temporary refresh error.",
        };
        scanStatus = "cached";
        scanMode = previous.previousSource?.scanMode || refreshMode;
        scanReason = `Kept previous data after a temporary refresh error. ${formatFetchError(fetchError)}`;
      } else {
        error = fetchError;
        console.warn(`Failed to fetch ${store.source}: ${formatFetchError(fetchError)}`);
      }
    }

    completed += 1;
    const durationMs = Date.now() - startedAt;
    const batch = { store, products, promoResult, error, scanStatus, scanReason, durationMs, scanMode };
    storeBatches.push(batch);
    if (onStore) {
      await onStore({
        store,
        products,
        error,
        completed,
        total: storesToRefresh.length,
        durationMs,
        scanMode,
        cache: cacheFromStoreBatches(storeBatches, { previousCache, minDiscount, refreshMode }),
      });
    }
  }

  async function sleep(ms) {
    if (ms <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function worker() {
    while (nextStoreIndex < storesToRefresh.length) {
      const currentIndex = nextStoreIndex;
      nextStoreIndex += 1;
      const jitterMs = Math.floor(Math.random() * (STORE_REFRESH_JITTER_MS + 1));
      await sleep(jitterMs);
      await refreshOneStore(storesToRefresh[currentIndex]);
    }
  }

  const workerCount = Math.min(STORE_REFRESH_CONCURRENCY, storesToRefresh.length || 1);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  productCache = cacheFromStoreBatches(storeBatches, { previousCache, minDiscount, refreshMode });
  await writeProductCacheFile(productCache).catch((error) => {
    console.warn(`Could not write local product cache: ${error.message}`);
  });
  return productCache;
}

async function cachedStoreProducts(force = false, minDiscount = 0.4, selectedSources = null, refreshMode = "quick") {
  if (!force) {
    const savedCache = await loadLatestAvailableCache();
    if (savedCache) return savedCache;
  }

  if (productCacheRefresh && !selectedSources?.size) return productCacheRefresh;

  const previousCache = await readProductCacheFile();
  productCacheRefresh = fetchFreshProductCache(null, { previousCache, minDiscount, selectedSources, refreshMode });

  try {
    return await productCacheRefresh;
  } finally {
    productCacheRefresh = null;
  }
}

async function latestFinds({ force = false, minDiscount = 0.7, selectedSources = null, refreshMode = "quick" } = {}) {
  if (!force && !selectedSources?.size) {
    const savedCache = await loadLatestAvailableCache();
    if (savedCache) return snapshotFromCache(savedCache, minDiscount);
    const savedSnapshot = await readSavedSnapshotFile();
    if (savedSnapshot) return savedSnapshot;
  }
  const cached = await cachedStoreProducts(force, minDiscount, selectedSources, refreshMode);
  return snapshotFromCache(cached, minDiscount);
}

async function writeDeploySnapshot({ minDiscount = 0.7, force = false, refreshMode = "quick" } = {}) {
  const snapshot = await latestFinds({ force, minDiscount, refreshMode });
  await fs.mkdir(path.dirname(snapshotFile), { recursive: true });
  await fs.writeFile(snapshotFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}

async function streamFinds(res, { force = false, minDiscount = 0.7, selectedSources = null, refreshMode = "quick" } = {}) {
  res.writeHead(200, {
    "content-type": "application/x-ndjson; charset=utf-8",
    "cache-control": "no-store",
  });
  const send = (payload) => res.write(`${JSON.stringify(payload)}\n`);

  if (!force) {
    const savedCache = await loadLatestAvailableCache();
    if (savedCache) {
      send({ type: "cache", data: snapshotFromCache(savedCache, minDiscount) });
      res.end();
      return;
    }
    send({ type: "cache", data: emptySnapshot(minDiscount) });
    res.end();
    return;
  }

  const previousCache = await readProductCacheFile();
  const refreshTotal = selectedSources?.size ? stores.filter((store) => selectedSources.has(store.source)).length : stores.length;
  send({ type: "start", total: refreshTotal, refreshMode });
  const finalCache = await fetchFreshProductCache(async ({ store, products, error, completed, total, cache, durationMs, scanMode }) => {
    send({
      type: "store",
      source: store.source,
      completed,
      total,
      scanned: products.length,
      durationMs,
      scanMode,
      error: error ? error.message : "",
      data: snapshotFromCache(cache, minDiscount),
    });
  }, { previousCache, minDiscount, selectedSources, refreshMode });
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
    res.writeHead(200, {
      "content-type": types[ext] || "application/octet-stream",
      "cache-control": "no-store",
    });
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

async function readJsonRequest(req, limit = 24000) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > limit) throw new Error("Request body too large");
  }
  if (!body.trim()) return {};
  return JSON.parse(body);
}

function sanitizeClickEvent(payload = {}, req = null) {
  const filters = payload.filters && typeof payload.filters === "object" ? payload.filters : {};
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    eventType: String(payload.eventType || "click").slice(0, 80),
    source: String(payload.source || "").slice(0, 120),
    brand: String(payload.brand || "").slice(0, 120),
    title: String(payload.title || "").slice(0, 240),
    productUrl: String(payload.productUrl || payload.url || "").slice(0, 1000),
    salePrice: Number.isFinite(Number(payload.salePrice)) ? Number(payload.salePrice) : null,
    discount: Number.isFinite(Number(payload.discount)) ? Number(payload.discount) : null,
    filters,
    pageUrl: String(payload.pageUrl || "").slice(0, 1000),
    referrer: String(req?.headers?.referer || "").slice(0, 1000),
    userAgent: String(req?.headers?.["user-agent"] || "").slice(0, 500),
  };
}

async function saveLocalClickEvent(event) {
  await fs.mkdir(path.dirname(clickEventsFile), { recursive: true });
  await fs.appendFile(clickEventsFile, `${JSON.stringify(event)}\n`, "utf8");
}

async function readLocalClickEvents() {
  try {
    const text = await fs.readFile(clickEventsFile, "utf8");
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function topClickItems(events, key, limit = 8) {
  const counts = new Map();
  for (const event of events) {
    const label = String(event[key] || "").trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function clickReportFromEvents(events) {
  const now = Date.now();
  const todayKey = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const datedEvents = events.filter((event) => Number.isFinite(Date.parse(event.createdAt || "")));
  return {
    total: datedEvents.length,
    today: datedEvents.filter((event) => String(event.createdAt || "").startsWith(todayKey)).length,
    last7Days: datedEvents.filter((event) => Date.parse(event.createdAt) >= sevenDaysAgo).length,
    topStores: topClickItems(datedEvents, "source"),
    topBrands: topClickItems(datedEvents, "brand"),
    topProducts: topClickItems(datedEvents, "title"),
    recent: datedEvents
      .slice()
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 20)
      .map((event) => ({
        createdAt: event.createdAt,
        eventType: event.eventType,
        source: event.source,
        brand: event.brand,
        title: event.title,
      })),
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const forceRefresh = url.searchParams.get("refresh") === "1";
  const refreshToken = req.headers["x-admin-refresh-token"] || url.searchParams.get("adminToken") || "";
  const refreshAllowed = !ADMIN_REFRESH_TOKEN || refreshToken === ADMIN_REFRESH_TOKEN;
  const selectedSources = selectedSourcesFromUrl(url);

  if (url.pathname === "/api/clicks") {
    if (req.method !== "POST") {
      res.writeHead(405, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }
    try {
      const payload = await readJsonRequest(req);
      const event = sanitizeClickEvent(payload, req);
      await saveLocalClickEvent(event);
      res.writeHead(204, { "cache-control": "no-store" });
      res.end();
    } catch (error) {
      res.writeHead(400, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  if (url.pathname === "/api/click-report") {
    const clickReportAllowed = ADMIN_REFRESH_TOKEN ? refreshAllowed : Boolean(refreshToken);
    if (!clickReportAllowed) {
      res.writeHead(401, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify({ error: "Admin unlock required." }));
      return;
    }
    try {
      const events = await readLocalClickEvents();
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify(clickReportFromEvents(events)));
    } catch (error) {
      res.writeHead(500, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  if (url.pathname === "/api/image-proxy") {
    try {
      const src = url.searchParams.get("src") || "";
      if (!src) {
        res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
        res.end("Missing image src");
        return;
      }
      const target = new URL(src);
      if (!["http:", "https:"].includes(target.protocol)) {
        res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
        res.end("Unsupported image protocol");
        return;
      }
      const response = await fetch(target, {
        headers: {
          "user-agent": "Mozilla/5.0",
          accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      });
      if (!response.ok) {
        res.writeHead(response.status || 502, { "content-type": "text/plain; charset=utf-8" });
        res.end("Could not fetch image");
        return;
      }
      const contentType = response.headers.get("content-type") || "image/jpeg";
      if (!contentType.toLowerCase().startsWith("image/")) {
        res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
        res.end("Image proxy received non-image content");
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      res.writeHead(200, {
        "content-type": contentType,
        "cache-control": "public, max-age=86400",
      });
      res.end(Buffer.from(arrayBuffer));
    } catch {
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      res.end("Could not fetch image");
    }
    return;
  }

  if (url.pathname === "/api/finds/stream") {
    try {
      if (forceRefresh && !refreshAllowed) {
        res.writeHead(401, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" });
        res.end(`${JSON.stringify({ type: "fatal", error: "Admin unlock required to refresh." })}\n`);
        return;
      }
      const requestedDiscount = Number.parseFloat(url.searchParams.get("minDiscount") || "0.7");
      const minDiscount = Number.isFinite(requestedDiscount) ? Math.min(Math.max(requestedDiscount, 0.3), 0.9) : 0.7;
      const refreshMode = url.searchParams.get("refreshMode") === "deep" ? "deep" : "quick";
      await streamFinds(res, {
        force: forceRefresh,
        minDiscount,
        selectedSources,
        refreshMode,
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
      const refreshMode = url.searchParams.get("refreshMode") === "deep" ? "deep" : "quick";
      const data = await latestFinds({
        force: forceRefresh,
        minDiscount,
        selectedSources,
        refreshMode,
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

if (process.argv.includes("--write-snapshot")) {
  const requestedDiscount = Number.parseFloat(process.env.BUILD_MIN_DISCOUNT || "0.7");
  const minDiscount = Number.isFinite(requestedDiscount) ? Math.min(Math.max(requestedDiscount, 0.3), 0.9) : 0.7;
  const force = process.env.BUILD_FORCE_REFRESH === "1";
  const refreshMode = process.env.BUILD_REFRESH_MODE === "deep" ? "deep" : "quick";
  const snapshot = await writeDeploySnapshot({ minDiscount, force, refreshMode });
  console.log(`Wrote deploy snapshot with ${snapshot.sources?.length || 0} sources and ${snapshot.finds?.length || 0} finds.`);
} else {
  server.listen(PORT, "127.0.0.1", () => {
    console.log(`Kidswear finder running at http://localhost:${PORT}`);
  });
}
