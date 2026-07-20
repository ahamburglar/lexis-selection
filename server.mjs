import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execFileAsync = promisify(execFile);
const PORT = Number(process.env.PORT || 5173);

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
    promoNote: "Extra 30% off code may apply. Not included in price.",
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
    source: "Bluefly",
    baseUrl: "https://www.bluefly.com",
    mode: "all-products",
    pages: 5,
    onlyTargetBrands: true,
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
    source: "Shop Simon",
    baseUrl: "https://shop.simon.com",
    mode: "all-products",
    pages: 5,
    onlyTargetBrands: true,
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
    variants: (product.variants || []).map((variant) => ({
      title: variant.title || "",
      option1: variant.option1 || "",
      option2: variant.option2 || "",
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
    .replaceAll("&pound;", "£")
    .replaceAll("&nbsp;", " ")
    .replace(/<[^>]*>/g, "")
    .trim();
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
  const brand = normalizeBrand(product.vendor);
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
      const size = variant.option2 || variant.option1 || variant.title || "";
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
    sources: storeBatches.map(({ store, products }) => ({ source: store.source, scanned: products.length })),
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
  const priceComparisons = new Map(
    (Array.isArray(cache.priceComparisons) ? cache.priceComparisons : []).map((comparison) => [comparison.id, comparison]),
  );
  return cache.items
    .map(({ store, product }) => {
      const find = productToFind(product, store, minDiscount);
      if (find) find.isNew = newFindIds.has(find.id);
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
      scanned: scannedBySource.get(store.source) || 0,
    })),
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

async function fetchFreshProductCache(onStore, { previousCache = null, minDiscount = 0.4 } = {}) {
  const storeBatches = [];
  let completed = 0;

  for (const store of stores) {
    let products = [];
    let error = null;
    try {
      products = await fetchStoreProducts(store);
    } catch (fetchError) {
      error = fetchError;
      console.warn(`Failed to fetch ${store.source}: ${fetchError.message}`);
    }

    completed += 1;
    const batch = { store, products };
    storeBatches.push(batch);
    if (onStore) {
      await onStore({
        store,
        products,
        error,
        completed,
        total: stores.length,
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

async function cachedStoreProducts(force = false, minDiscount = 0.4) {
  if (!force) {
    const freshCache = await loadFreshDailyCache();
    if (freshCache) return freshCache;
  }

  if (productCacheRefresh) return productCacheRefresh;

  const previousCache = await readProductCacheFile();
  productCacheRefresh = fetchFreshProductCache(null, { previousCache, minDiscount });

  try {
    return await productCacheRefresh;
  } finally {
    productCacheRefresh = null;
  }
}

async function latestFinds({ force = false, minDiscount = 0.7 } = {}) {
  const cached = await cachedStoreProducts(force, minDiscount);
  return snapshotFromCache(cached, minDiscount);
}

async function streamFinds(res, { force = false, minDiscount = 0.7 } = {}) {
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
  send({ type: "start", total: stores.length });
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
  }, { previousCache, minDiscount });
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/finds/stream") {
    try {
      const requestedDiscount = Number.parseFloat(url.searchParams.get("minDiscount") || "0.7");
      const minDiscount = Number.isFinite(requestedDiscount) ? Math.min(Math.max(requestedDiscount, 0.3), 0.9) : 0.7;
      await streamFinds(res, {
        force: url.searchParams.get("refresh") === "1",
        minDiscount,
      });
    } catch (error) {
      if (!res.headersSent) res.writeHead(500, { "content-type": "application/x-ndjson; charset=utf-8" });
      res.end(`${JSON.stringify({ type: "fatal", error: error.message })}\n`);
    }
    return;
  }

  if (url.pathname === "/api/finds") {
    try {
      const requestedDiscount = Number.parseFloat(url.searchParams.get("minDiscount") || "0.7");
      const minDiscount = Number.isFinite(requestedDiscount) ? Math.min(Math.max(requestedDiscount, 0.3), 0.9) : 0.7;
      const data = await latestFinds({
        force: url.searchParams.get("refresh") === "1",
        minDiscount,
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
