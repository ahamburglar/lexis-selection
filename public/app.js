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
const clearSizesButton = document.querySelector("#clearSizesButton");
const adminUnlockButton = document.querySelector("#adminUnlockButton");
const refreshButton = document.querySelector("#refreshButton");
const deepRefreshButton = document.querySelector("#deepRefreshButton");
const stopRefreshButton = document.querySelector("#stopRefreshButton");
const countEl = document.querySelector("#count");
const updatedEl = document.querySelector("#updated");
const age3To6Button = document.querySelector("#age3To6Button");
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
const clickReport = document.querySelector("#clickReport");
const clickReportToggleButton = document.querySelector("#clickReportToggleButton");
const clickReportRefreshButton = document.querySelector("#clickReportRefreshButton");
const clickReportStats = document.querySelector("#clickReportStats");
const clickReportDetails = document.querySelector("#clickReportDetails");
const promoBoard = document.querySelector("#promoBoard");
const promoList = document.querySelector("#promoList");
const promoCount = document.querySelector("#promoCount");
const promoToggleButton = document.querySelector("#promoToggleButton");
const storeListSearch = document.querySelector("#storeListSearch");
const shuffleButton = document.querySelector("#shuffleButton");
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
let selectedSizes = new Set();
let selectedAgeFits = new Set();
let selectedGenders = new Set();
let brandsOpen = false;
let sourcesOpen = false;
let searchOpen = false;
let promosOpen = false;
let reportOpen = false;
let clickReportOpen = false;
let reportDetailsOpen = false;
let latestClickReportData = null;
let latestReportData = null;
let womenOnly = false;
let newOnly = false;
let priceDropsOnly = false;
let loadedMinDiscount = 0.4;
let activeLoadController = null;
let refreshInProgress = false;
let refreshBackupData = null;
let latestCompleteData = null;
let shuffleSeed = Math.random();
const adminRefreshTokenKey = "lexiMomAdminRefreshToken";
const favoriteBrands = ["Emile et Ida", "Floss", "Louise Misha"];
const trustedStoreTooltip = "Trusted means Lexi’s mom or her close friends have ordered from this store.";
const brandStyleCollections = [
  {
    id: "my-picks",
    label: "My picks ♥",
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
      "Bonjour",
      "Bachaa",
      "Tartine et Chocolat",
      "Maison Pimpim",
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
      "Minimalisma",
      "MarMar Copenhagen",
      "Organic Zoo",
      "Silly Silas",
      "Kuling",
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
      "Lola + The Boys",
      "Pink Chicken",
      "The Campamento",
      "Morley",
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
      "Soor Ploom",
      "Lali",
      "Petite Amalie",
      "Jamie Kay",
      "Mipounet",
      "Buho",
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
      "Maison Pimpim",
      "Tartine et Chocolat",
      "Lola + The Boys",
      "Il Gufo",
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
      "Naturino",
      "Falcotto",
      "Pom d'Api",
      "Cienta",
      "Igor",
      "Veja Kids",
      "Camper",
      "Tip Toey Joey",
      "Donsje",
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    brands: [
      "Meri Meri",
      "Maileg",
      "Ooly",
      "Super Smalls",
      "Rockahula Kids",
    ],
  },
];
let brandSearchQuery = "";
let sourceSearchQuery = "";
let storeListSearchQuery = "";
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
const newlyAddedSources = [
  "Paducah Kids",
  "State of Kid",
  "Pi Baby",
  "Owen and Sage",
  "Hooray Shoppe",
  "The Blue Beret",
  "Hazel and Fawn",
  "Baby Braithwaite",
  "Lively Kid",
  "Collins and Conley",
  "The Ridge Kids",
  "Kodomo Boston",
  "Yoya NYC",
  "The Little Things",
  "Black Wagon",
  "Tiny Hanger",
  "Hopscotch Kids",
  "The Red Balloon Co.",
  "BIEN BIEN",
  "The Boys and the Babe",
  "Petit Loup",
  "Sadie & Co",
  "Flying Colors Baby",
  "Buttons Bebe",
  "Macaroni Kids",
  "Childsplay Clothing",
  "Mini Ruby",
  "Blubelle Baby",
  "Les Mini",
  "The Little NY",
  "Lolini",
  "Rama Baby",
  "Fritz and Gigi",
  "Tuesday's Child",
  "Flamingo Baby and Child",
  "Jelly Beanz Kids",
  "Elegant Child NY",
  "Luibelle",
  "Ruboland",
  "All The Little Bows",
  "Cocoleto",
  "English Rabbit",
  "The Spotted Goose",
  "ATLR Paris",
  "The Little Being",
  "Jean + Hadley",
  "SK Boutique",
  "Thistle and Wren",
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
  "Coucou Kids",
  "Marigold Modern",
  "Mini Dreamers",
  "Ellou",
  "Milomoo Baby",
  "Buttons Bebe",
  "Broomtail Kids",
  "Hello Alyss",
  "Whoopi Kids",
  "Ele Ella",
  "ATLR Paris",
]);
const cautionStoreSources = new Set([
  "Wee Mondine",
]);
const storeHomeUrls = new Map([
  ["Tiptoe Boutique", "https://tiptoeboutique.com"],
  ["Pacifier Kids", "https://prz.io/ZD0gGBPu5"],
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
  ["Paducah Kids", "https://paducahkids.com"],
  ["State of Kid", "https://stateofkid.com"],
  ["Pi Baby", "https://pibaby.com"],
  ["Owen and Sage", "https://owenandsage.com"],
  ["Hooray Shoppe", "https://hoorayshoppe.com"],
  ["The Blue Beret", "https://www.theblueberet.com"],
  ["Hazel and Fawn", "https://hazelandfawn.com"],
  ["Baby Braithwaite", "https://babybraithwaite.com"],
  ["Lively Kid", "https://livelykid.com"],
  ["Collins and Conley", "https://collinsandconley.com"],
  ["The Ridge Kids", "https://theridgekids.com"],
  ["Kodomo Boston", "https://www.kodomoboston.com"],
  ["Yoya NYC", "https://yoyanyc.com"],
  ["The Little Things", "https://shopthelittlethings.com"],
  ["Black Wagon", "https://blackwagon.com"],
  ["Tiny Hanger", "https://www.tinyhanger.com"],
  ["Hopscotch Kids", "https://hopscotchkids.com"],
  ["The Red Balloon Co.", "https://theredballoon.com"],
  ["BIEN BIEN", "https://bienbienshop.com"],
  ["The Boys and the Babe", "https://theboysandthebabe.com"],
  ["Petit Loup", "https://petitloup.com"],
  ["Sadie & Co", "https://shopsadieco.com"],
  ["Flying Colors Baby", "https://www.flyingcolorsbaby.com"],
  ["Buttons Bebe", "https://buttonsbebe.com"],
  ["Macaroni Kids", "https://macaronikids.com"],
  ["Childsplay Clothing", "https://www.childsplayclothing.com"],
  ["Mini Ruby", "https://miniruby.com"],
  ["Blubelle Baby", "https://blubellebaby.com"],
  ["Les Mini", "https://shoplesmini.com"],
  ["The Little NY", "https://thelittleny.com"],
  ["Lolini", "https://shoplolini.com"],
  ["Rama Baby", "https://ramababy.com"],
  ["Fritz and Gigi", "https://www.fritzandgigi.com"],
  ["Tuesday's Child", "https://www.tuesdayschild.com"],
  ["Flamingo Baby and Child", "https://flamingobabyandchild.com"],
  ["Jelly Beanz Kids", "https://www.jellybeanzkids.com"],
  ["Elegant Child NY", "https://elegantchildny.com"],
  ["Luibelle", "https://luibelle.com"],
  ["Ruboland", "https://ruboland.com"],
  ["All The Little Bows", "https://allthelittlebows.com"],
  ["Cocoleto", "https://cocoleto.com"],
  ["English Rabbit", "https://englishrabbit.com"],
  ["The Spotted Goose", "https://www.thespottedgoose.com"],
  ["ATLR Paris", "https://atlrparis.com"],
  ["The Little Being", "https://thelittlebeing.com"],
  ["Jean + Hadley", "https://www.jeanandhadley.com"],
  ["SK Boutique", "https://shopskboutique.com"],
  ["Thistle and Wren", "https://www.thistleandwren.com"],
  ["No Small Miracle", "https://nosmallmiraclechildrensboutique.com"],
  ["Salchicha Kids", "https://shop-salchicha.com"],
  ["Lili Concept Store", "https://liliconceptstore.com"],
  ["Anderson Parker", "https://shopap.com"],
]);

const storeInstagramUrls = new Map([
  ["Tiptoe Boutique", "https://www.instagram.com/tiptoeboutique/"],
  ["Pacifier Kids", "https://www.instagram.com/pacifierkids/"],
  ["Ladida", "https://www.instagram.com/ladidakids/"],
  ["South Coast Baby Co", "https://www.instagram.com/southcoastbabyco/"],
  ["Design Life Kids", "https://www.instagram.com/designlifekids/"],
  ["Bella Kids NY", "https://www.instagram.com/bellakidsny/"],
  ["Boutique Little", "https://www.instagram.com/boutiquelittle/"],
  ["Little K Co", "https://www.instagram.com/littlekcoshop/"],
  ["Village Maternity", "https://www.instagram.com/villagematernity/"],
  ["Tiny Apple", "https://www.instagram.com/tinyappleny/"],
  ["The Front Shop", "https://www.instagram.com/thefrontshop/"],
  ["Ele Ella", "https://www.instagram.com/eleella_boutique/"],
  ["Little Red Planet", "https://www.instagram.com/thelittleredplanet_shop/"],
  ["Little Rags and Riches", "https://www.instagram.com/littleragsandriches/"],
  ["Hello Little Crew", "https://www.instagram.com/hellolittlecrew/"],
  ["Millie Bo Peep", "https://www.instagram.com/shopatmillies/"],
  ["Le Petit Kids", "https://www.instagram.com/lepetitkids/"],
  ["Born Yesterday Kids", "https://www.instagram.com/BornYesterdayPHL/"],
  ["Stoopher", "https://www.instagram.com/stoopher/"],
  ["Cotton Candy Kidz", "https://www.instagram.com/shopcottoncandykidz/"],
  ["Kid Biz", "https://www.instagram.com/kidbizkid/"],
  ["Mini Dreamers", "https://www.instagram.com/minidreamerskids/"],
  ["Bears Closet Boutique", "https://www.instagram.com/Bearsclosetbtq/"],
  ["Kids Atelier", "https://www.instagram.com/kids.atelier/"],
  ["Bdazzle", "https://www.instagram.com/shopbdazzle/"],
  ["Little Dreamers Boutique", "https://www.instagram.com/little_dreamers.boutique/"],
  ["Honeypie Kids", "https://www.instagram.com/honeypiekidscom/"],
  ["Skipper Scout", "https://www.instagram.com/skipperscoutvail/"],
  ["The Shoppe Miami", "https://www.instagram.com/theshoppemiami/"],
  ["Oh Baby St Pete", "https://www.instagram.com/ohbaby_stpete/"],
  ["Coucou Kids", "https://www.instagram.com/shopcoucoukids/"],
  ["My Oh My Kids", "https://www.instagram.com/myohmy_official/"],
  ["Jam Baby", "https://www.instagram.com/jambabyshop/"],
  ["Tottini", "https://www.instagram.com/tottinikids/"],
  ["Little Waves Kids", "https://www.instagram.com/littlewaveskids/"],
  ["Wee Mondine", "https://www.instagram.com/weemondine/"],
  ["Shan and Toad", "https://www.instagram.com/shanandtoad/"],
  ["Milomoo Baby", "https://www.instagram.com/milomoobaby/"],
  ["Young Timers NY", "https://www.instagram.com/youngtimersny/"],
  ["Spilled Milk", "https://www.instagram.com/getspilledmilk/"],
  ["Milk + Bots", "https://www.instagram.com/MILKBOTS/"],
  ["Wrightsville Ave", "https://www.instagram.com/wrightsville.ave.boutique/"],
  ["Maison Baby & Kids", "https://www.instagram.com/maisonbabyandkids/"],
  ["Childrensalon", "https://www.instagram.com/childrensalon/"],
  ["Maisonette", "https://www.instagram.com/maisonetteworld/"],
  ["Enjoy Kids US", "https://www.instagram.com/enjoy_kids_boutique/"],
  ["Ellou", "https://www.instagram.com/shop.ellou/"],
  ["Little-ish", "https://www.instagram.com/littleish.ct/"],
  ["Klade Children's Boutique", "https://www.instagram.com/kladechildren/"],
  ["Threadfare", "https://www.instagram.com/shopthreadfare/"],
  ["Fussy Mussy", "https://www.instagram.com/thefussymussy/"],
  ["Alexa James Baby", "https://www.instagram.com/alexajamesbaby/"],
  ["Marigold Modern", "https://www.instagram.com/marigoldmodern/"],
  ["Cub Shrub", "https://www.instagram.com/cubshrub/"],
  ["Broomtail Kids", "https://www.instagram.com/broomtail/"],
  ["Danrie", "https://www.instagram.com/shopdanrie/"],
  ["Smoochie Baby", "https://www.instagram.com/smoochie_baby/"],
  ["Dreams of Cuteness", "https://www.instagram.com/dreamsofcuteness/"],
  ["Ely's & Co", "https://www.instagram.com/elysandco/"],
  ["Two Tulips", "https://www.instagram.com/twotulips/"],
  ["Paducah Kids", "https://www.instagram.com/magpiespaducah/"],
  ["State of Kid", "https://www.instagram.com/stateofkid/"],
  ["Pi Baby", "https://www.instagram.com/pibabyboutique/"],
  ["Owen and Sage", "https://www.instagram.com/owenandsageshop/"],
  ["Hooray Shoppe", "https://www.instagram.com/hooraynewburgh/"],
  ["The Blue Beret", "https://www.instagram.com/the_blue_beret_/"],
  ["Hazel and Fawn", "https://www.instagram.com/hazel_and_fawn/"],
  ["Baby Braithwaite", "https://www.instagram.com/babybraithwaite/"],
  ["Lively Kid", "https://www.instagram.com/livelykids/"],
  ["Collins and Conley", "https://www.instagram.com/collinsandconley/"],
  ["The Ridge Kids", "https://www.instagram.com/ridgekidsboutique/"],
  ["Kodomo Boston", "https://www.instagram.com/kodomoboston/"],
  ["Yoya NYC", "https://www.instagram.com/yoyanyc/"],
  ["The Little Things", "https://www.instagram.com/thelittlethingskids/"],
  ["Black Wagon", "https://www.instagram.com/blackwagon_portland/"],
  ["Tiny Hanger", "https://www.instagram.com/tinyhanger/"],
  ["Hopscotch Kids", "https://www.instagram.com/hopscotchkidsbend/"],
  ["BIEN BIEN", "https://www.instagram.com/bien_bien_shop/"],
  ["The Boys and the Babe", "https://www.instagram.com/theboysandthebabe/"],
  ["Petit Loup", "https://www.instagram.com/petitloupofficial/"],
  ["Sadie & Co", "https://www.instagram.com/shopsadiesathens/"],
  ["Flying Colors Baby", "https://www.instagram.com/shopflyingcolors/"],
  ["Macaroni Kids", "https://www.instagram.com/macaroni_kids/"],
  ["Childsplay Clothing", "https://www.instagram.com/ChildsPlayClothing/"],
  ["Mini Ruby", "https://www.instagram.com/minirubycom/"],
  ["Blubelle Baby", "https://www.instagram.com/blubellebaby/"],
  ["Lolini", "https://www.instagram.com/shoplolini/"],
  ["Rama Baby", "https://www.instagram.com/ramababyofficial/"],
  ["Fritz and Gigi", "https://www.instagram.com/fritzandgigi/"],
  ["Tuesday's Child", "https://www.instagram.com/tcboutique/"],
  ["Flamingo Baby and Child", "https://www.instagram.com/flamingobabyny/"],
  ["Jelly Beanz Kids", "https://www.instagram.com/jellybeanzkids/"],
  ["Elegant Child NY", "https://www.instagram.com/elegantchild_ny/"],
  ["Luibelle", "https://www.instagram.com/luibelle.kids/"],
  ["Ruboland", "https://www.instagram.com/ruboland/"],
  ["All The Little Bows", "https://www.instagram.com/allthelittlebows/"],
  ["Cocoleto", "https://www.instagram.com/shopcocoleto/"],
  ["English Rabbit", "https://www.instagram.com/englishrabbit/"],
  ["The Spotted Goose", "https://www.instagram.com/thespottedgoose/"],
  ["ATLR Paris", "https://www.instagram.com/atlr.paris/"],
  ["The Little Being", "https://www.instagram.com/thelittlebeingshop/"],
  ["Shoppe Balloo", "https://www.instagram.com/shoppe.balloo/"],
  ["Dearly", "https://www.instagram.com/welovedearly/"],
  ["Jean + Hadley", "https://www.instagram.com/jeanandhadley_official/"],
  ["SK Boutique", "https://www.instagram.com/shop.sk.boutique/"],
  ["Murray & Finn", "https://www.instagram.com/murrayandfinn/"],
  ["Buttons Bebe", "https://www.instagram.com/buttonsbebe/"],
  ["Les Mini", "https://www.instagram.com/shoplesmini/"],
  ["Flying Ryno", "https://www.instagram.com/shopflyingryno/"],
  ["Little Loungers", "https://www.instagram.com/littleloungers11/"],
  ["Hello Alyss", "https://www.instagram.com/helloalyss/"],
  ["Faded Floral Boutique", "https://www.instagram.com/fadedfloralboutique/"],
  ["Panda and Cub", "https://www.instagram.com/pandaandcub/"],
  ["Sanna Baby and Child", "https://www.instagram.com/sanna_heights/"],
  ["Smallable", "https://www.instagram.com/smallable_store/"],
  ["The Red Balloon Co.", "https://www.instagram.com/theredballoonco/"],
  ["Whoopi Kids", "https://www.instagram.com/whoopikids/"],
  ["Willkie's", "https://www.instagram.com/shopwillkies/"],
  ["Thistle and Wren", "https://www.instagram.com/thistleandwren/"],
  ["No Small Miracle", "https://www.instagram.com/nosmallmiracle/"],
  ["Salchicha Kids", "https://www.instagram.com/salchichakids/"],
  ["Lili Concept Store", "https://www.instagram.com/lili.concept.store/"],
  ["Anderson Parker", "https://www.instagram.com/shopandersonparker/"],
]);

function createInstagramLink(sourceName) {
  const instagramUrl = storeInstagramUrls.get(sourceName);
  if (!instagramUrl) return null;
  const link = document.createElement("a");
  link.className = "instagramLink";
  link.href = instagramUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.title = `${sourceName} on Instagram`;
  link.setAttribute("aria-label", `${sourceName} Instagram`);
  link.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"5\" y=\"5\" width=\"14\" height=\"14\" rx=\"4\"></rect><circle cx=\"12\" cy=\"12\" r=\"3.2\"></circle><circle cx=\"16.4\" cy=\"7.6\" r=\"1\"></circle></svg>";
  return link;
}
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
  const trustedDiff = Number(trustedStoreSources.has(b.source)) - Number(trustedStoreSources.has(a.source));
  if (trustedDiff) return trustedDiff;
  const cautionDiff = Number(cautionStoreSources.has(a.source)) - Number(cautionStoreSources.has(b.source));
  if (cautionDiff) return cautionDiff;
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
    .replace(/^\s*d\s+([$£€]\s*\d+(?:\.\d+)?)\s+more\s+and\s+get\s+free\s+shipping!?/i, "Spend $1 more and get free shipping")
    .trim();
  if (!note) return "";
  if (source === "Hooray Shoppe"
    && /\bquincy\s+mae\s+halloween\s+sale\b/i.test(note)
    && /\$10\s*&\s*under/i.test(note)
    && /\$15\s+sale/i.test(note)
    && /\b40%\s*off\b/i.test(note)) {
    return "$10 & under · $15 sale · 40% off sale";
  }
  if (/\b(?:please enter a valid code|apply code|discount code\.js|social link|assets\/|sold out|in stock|shipping dis)\b/i.test(note)) {
    note = note
      .replace(/\b(?:please enter a valid code|apply code|promo code|discount code\.js|social link|assets\/remove|sold out|in stock|shipping dis|save\s*%\s*save\s*up\s*to\s*save)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

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
  if (!matchedPattern) return "";
  if (/^\s*[$£€]?\s*\d+(?:\.\d+)?\b/.test(note) && /\b(?:regular price|sale price|no reviews)\b/i.test(originalNote)) return "";

  const cutoff = note.match(/\b(?:shop now|shop the|new baby boxes|new arrivals|navigation|popular products|all collections|shop by category|home new arrivals|same day dispatched|instagram|facebook|pause slideshow|play slideshow|newsletter signup|sign up to receive|currency|sign in|my wish lists|baby girl|baby boy|baby girls|baby boys|regular price|sale price|no reviews)\b/i);
  if (cutoff?.index > 0) note = note.slice(0, cutoff.index);
  note = note
    .split("·")[0]
    .replace(/\bWHOLESALE\s+/gi, "")
    .replace(/\s+NEW$/i, "")
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

function activeFilterSnapshot() {
  return {
    brands: [...selectedBrands],
    sources: [...selectedSources],
    sort: choiceValue("sort"),
    discount: choiceValue("discount"),
    type: choiceValue("type"),
    ageFit: choiceValue("ageFit"),
    ageFits: [...selectedAgeFits],
    genders: [...selectedGenders],
    sizes: [...selectedSizes],
    womenOnly,
    newOnly,
    priceDropsOnly,
    search: searchInput.value.trim(),
  };
}

function clickPayload(eventType, find = null, extra = {}) {
  return {
    eventType,
    source: extra.source || find?.source || "",
    brand: extra.brand || find?.brand || "",
    title: extra.title || find?.title || "",
    productUrl: extra.url || find?.url || "",
    salePrice: Number.isFinite(Number(find?.salePrice)) ? Number(find.salePrice) : null,
    discount: Number.isFinite(Number(find?.discount)) ? Number(find.discount) : null,
    filters: activeFilterSnapshot(),
    pageUrl: window.location.href,
    ...extra,
  };
}

function trackClick(eventType, find = null, extra = {}) {
  const payload = JSON.stringify(clickPayload(eventType, find, extra));
  const url = "/api/clicks";
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Click tracking should never block shopping.
  }
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

function formatDuration(ms) {
  const value = Number(ms);
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value < 1000) return `${Math.round(value)}ms`;
  const seconds = value / 1000;
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}m ${remainder}s`;
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
  if (deepRefreshButton) deepRefreshButton.hidden = !unlocked;
  stopRefreshButton.hidden = !unlocked;
  stopRefreshButton.disabled = !refreshInProgress;
  if (!refreshButton.disabled) refreshButton.textContent = selectedSources.size ? "Quick selected" : "Quick refresh";
  if (deepRefreshButton && !deepRefreshButton.disabled) deepRefreshButton.textContent = selectedSources.size ? "Deep selected" : "Deep refresh";
  stopRefreshButton.textContent = refreshInProgress ? "Stop refresh" : "Stop refresh";
  if (!reportToggleButton || !refreshReport) {
    adminUnlockButton.textContent = unlocked ? "Admin unlocked" : "Admin unlock";
    adminUnlockButton.classList.toggle("active", unlocked);
    return;
  }
  reportToggleButton.hidden = !unlocked || !latestReportData;
  if (clickReportToggleButton) clickReportToggleButton.hidden = !unlocked;
  if (!unlocked) {
    reportOpen = false;
    clickReportOpen = false;
    refreshReport.hidden = true;
    if (clickReport) clickReport.hidden = true;
  }
  adminUnlockButton.textContent = unlocked ? "Admin unlocked" : "Admin unlock";
  adminUnlockButton.classList.toggle("active", unlocked);
  reportToggleButton.classList.toggle("active", reportOpen);
  reportToggleButton.setAttribute("aria-expanded", String(reportOpen));
  if (clickReportToggleButton) {
    clickReportToggleButton.classList.toggle("active", clickReportOpen);
    clickReportToggleButton.setAttribute("aria-expanded", String(clickReportOpen));
  }
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
  clickReportOpen = false;
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
      { value: "shuffle", label: "Shuffle" },
      { value: "discount-desc", label: "Discount, highest to lowest" },
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
  ageFit: {
    value: "kids",
    options: [
      { value: "", label: "All ages" },
      { value: "baby", label: "Baby" },
      { value: "toddler", label: "Toddler" },
      { value: "kids", label: "Kids" },
      { value: "big-kids", label: "Big kids" },
      { value: "women", label: "Women" },
      { value: "shoes", label: "Shoes" },
      { value: "accessories", label: "Accessories" },
    ],
    toggle: document.querySelector("#ageFitToggleArea"),
    summary: document.querySelector("#ageFitSummary"),
    hint: document.querySelector("#toggleAgeFitButton"),
    list: document.querySelector("#ageFitList"),
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
    value: "",
    options: [
      { value: "", label: "Any size", ageFits: ["", "baby", "toddler", "kids", "big-kids", "women", "shoes", "accessories"] },
      { value: "nb", label: "NB", ageFits: ["baby"] },
      { value: "0-3m", label: "0-3M", ageFits: ["baby"] },
      { value: "3-6m", label: "3-6M", ageFits: ["baby"] },
      { value: "6-12m", label: "6-12M", ageFits: ["baby"] },
      { value: "12-18m", label: "12–18M", ageFits: ["baby"] },
      { value: "18-24m", label: "18–24M", ageFits: ["baby"] },
      { value: "2t", label: "2T", ageFits: ["toddler"] },
      { value: "3t", label: "3T", ageFits: ["toddler"] },
      { value: "4t", label: "4T", ageFits: ["toddler"] },
      { value: "2y", label: "2Y", ageFits: ["kids"] },
      { value: "3y", label: "3Y", ageFits: ["kids"] },
      { value: "4y", label: "4Y", ageFits: ["kids"] },
      { value: "5y", label: "5Y", ageFits: ["kids"] },
      { value: "6y", label: "6Y", ageFits: ["kids"] },
      { value: "7y", label: "7Y", ageFits: ["kids"] },
      { value: "8y", label: "8Y", ageFits: ["kids"] },
      { value: "9y", label: "9Y", ageFits: ["big-kids"] },
      { value: "10y", label: "10Y", ageFits: ["big-kids"] },
      { value: "12y", label: "12Y", ageFits: ["big-kids"] },
      { value: "14y", label: "14Y", ageFits: ["big-kids"] },
      { value: "16y", label: "16Y", ageFits: ["big-kids"] },
      { value: "adult-xs-s", label: "Women XS-S", ageFits: ["women"] },
      { value: "adult-m-l", label: "Women M-L", ageFits: ["women"] },
      { value: "adult-xl-plus", label: "Women XL+", ageFits: ["women"] },
      { value: "baby-shoes", label: "Baby shoes", ageFits: ["shoes"] },
      { value: "toddler-shoes", label: "Toddler shoes", ageFits: ["shoes"] },
      { value: "little-kid-shoes", label: "Little kid shoes", ageFits: ["shoes"] },
      { value: "big-kid-shoes", label: "Big kid shoes", ageFits: ["shoes"] },
      { value: "women-shoes", label: "Women shoes", ageFits: ["shoes"] },
    ],
    toggle: document.querySelector("#sizeToggleArea"),
    summary: document.querySelector("#sizeSummary"),
    hint: document.querySelector("#toggleSizeButton"),
    list: document.querySelector("#sizeList"),
  },
};
const visibleSingleChoiceFilterNames = ["sort", "discount", "gender", "size"];
let openChoiceFilter = "";

const sizeFilterGroups = [
  { value: "baby", label: "Baby" },
  { value: "toddler", label: "Toddler" },
  { value: "kids", label: "Kids" },
  { value: "big-kids", label: "Big kids" },
  { value: "women", label: "Women" },
  { value: "shoes", label: "Shoes" },
];
const quick3To6SizeValues = ["3y", "4y", "5y", "6y"];
const categoryAgeFitValues = new Set(["baby", "toddler", "kids", "big-kids", "women"]);
const categoryTypeLabels = {
  clothes: "Clothes",
  shoes: "Shoes",
  accessories: "Accessories",
};
function visibleSingleChoiceEntries() {
  return visibleSingleChoiceFilterNames
    .map((name) => [name, singleChoiceFilters[name]])
    .filter(([, filter]) => filter?.toggle && filter?.summary && filter?.hint && filter?.list);
}

function setHasExactly(set, values) {
  return set.size === values.length && values.every((value) => set.has(value));
}

function filterOptionLabel(name, value) {
  return singleChoiceFilters[name].options.find((option) => option.value === value)?.label || "";
}

function selectedAgeFitValues() {
  const values = new Set([...selectedAgeFits].filter((value) => categoryAgeFitValues.has(value)));
  const legacyAgeFit = choiceValue("ageFit");
  if (categoryAgeFitValues.has(legacyAgeFit)) values.add(legacyAgeFit);
  return values;
}

function setSelectedAgeFits(values) {
  selectedAgeFits = new Set([...values].filter((value) => categoryAgeFitValues.has(value)));
  singleChoiceFilters.ageFit.value = selectedAgeFits.size === 1 ? [...selectedAgeFits][0] : "";
}

function clearSelectedAgeFits() {
  selectedAgeFits.clear();
  if (categoryAgeFitValues.has(choiceValue("ageFit"))) {
    singleChoiceFilters.ageFit.value = "";
  }
}

function isCategorySizeActive() {
  return Boolean(choiceValue("type") || selectedAgeFitValues().size || selectedSizes.size || womenOnly);
}

function clearCategorySizeFilters() {
  singleChoiceFilters.type.value = "";
  singleChoiceFilters.ageFit.value = "";
  singleChoiceFilters.size.value = "";
  selectedSizes.clear();
  selectedAgeFits.clear();
  womenOnly = false;
}

function updateSizeClearButton() {
  clearSizesButton.hidden = !isCategorySizeActive();
}

function selectedSizeSummaryLabels() {
  const remaining = new Set(selectedSizes);
  const labels = [];
  for (const group of sizeFilterGroups) {
    const values = sizeOptionsForGroup(group.value).map((option) => option.value);
    if (!values.length) continue;
    if (values.every((value) => remaining.has(value))) {
      labels.push(group.value === "shoes" ? "Shoe sizes" : `${group.label} sizes`);
      for (const value of values) remaining.delete(value);
    }
  }
  const optionLabels = singleChoiceFilters.size.options
    .filter((option) => remaining.has(option.value))
    .map((option) => option.label);
  return labels.concat(optionLabels);
}

function categorySizeLabel() {
  if (!isCategorySizeActive()) return "Any size";
  const ageFits = selectedAgeFitValues();
  if (!choiceValue("type") && ageFits.size === 1 && ageFits.has("kids") && setHasExactly(selectedSizes, quick3To6SizeValues)) {
    return "3Y–6Y";
  }

  const labels = [];
  const type = choiceValue("type");
  const hasWomenAgeFitOnly = ageFits.size === 1 && ageFits.has("women");
  if (type && !(type === "clothes" && hasWomenAgeFitOnly)) {
    labels.push(categoryTypeLabels[type] || filterOptionLabel("type", type));
  }
  for (const ageFit of ageFits) {
    labels.push(ageFit === "women" ? "Women only" : filterOptionLabel("ageFit", ageFit));
  }
  const sizeLabels = selectedSizeSummaryLabels();
  if (sizeLabels.length > 2) {
    labels.push(`${selectedSizes.size} sizes`);
  } else {
    labels.push(...sizeLabels);
  }
  if (!labels.length) return "Any size";
  return labels.length <= 2 ? labels.join(", ") : `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
}

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
  return comparison.priceDelta < 0 ? "↓" : "↑";
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

function stableShuffleValue(find) {
  const text = `${shuffleSeed}|${find.source || ""}|${find.brand || ""}|${find.title || ""}|${find.url || ""}`;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function sortFinds(finds) {
  const sortValue = choiceValue("sort");
  const items = [...finds];
  items.sort((a, b) => {
    if (sortValue === "shuffle") {
      return compareNumbers(stableShuffleValue(a), stableShuffleValue(b))
        || compareCurrentFeedOrder(a, b);
    }
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
    if (sortValue === "discount-desc") {
      return compareNumbers(displayedDiscountValue(b.discount), displayedDiscountValue(a.discount))
        || compareNumbers(a.salePrice, b.salePrice)
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
  if (name === "gender") {
    if (!selectedGenders.size) return "All";
    const labels = visibleChoiceOptions("gender")
      .filter((option) => selectedGenders.has(option.value))
      .map((option) => option.label);
    if (!labels.length) return "All";
    return labels.length <= 2 ? labels.join(", ") : `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
  }
  if (name === "size") {
    return categorySizeLabel();
  }
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
  if (isBabySize(size)) return years;

  for (const match of lower.matchAll(/\b(\d{1,2})\s*-\s*(\d{1,2})\s*(?:y|yr|yrs|year|years)?\b/g)) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (Number.isFinite(start) && Number.isFinite(end) && start > 0 && end <= 18 && end >= start) {
      for (let year = start; year <= end; year += 1) years.push(year);
    }
  }

  for (const match of lower.matchAll(/\b(\d{1,2})\s*(?:y|yr|yrs|year|years)\b/g)) {
    const year = Number(match[1]);
    if (Number.isFinite(year) && year > 0 && year <= 18) years.push(year);
  }

  if (!years.length && /^\d{1,2}$/.test(lower)) {
    const year = Number(lower);
    if (year > 0 && year <= 18) years.push(year);
  }
  return [...new Set(years)];
}

function isBabySize(size = "") {
  const lower = size.toLowerCase();
  return /\b(nb|newborn|preemie)\b/.test(lower)
    || /\d+\s*-\s*\d+\s*(?:m|mo|mos|month|months)\b/.test(lower)
    || /\d+\s*(?:m|mo|mos|month|months)\b/.test(lower)
    || /\b\d+\s*-\s*\d+\s*m\b/.test(lower);
}

function monthRangeFromSize(size = "") {
  const lower = size.toLowerCase();
  if (/\b(nb|newborn|preemie)\b/.test(lower)) return [0];
  const values = [];
  for (const match of lower.matchAll(/(\d+)\s*-\s*(\d+)\s*(?:m|mo|mos|month|months)\b/g)) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (Number.isFinite(start) && Number.isFinite(end)) {
      for (let month = start; month <= end; month += 1) values.push(month);
    }
  }
  for (const match of lower.matchAll(/\b(\d+)\s*(?:m|mo|mos|month|months)\b/g)) {
    const month = Number(match[1]);
    if (Number.isFinite(month)) values.push(month);
  }
  return [...new Set(values)];
}

function toddlerYearsFromSize(size = "") {
  const lower = size.toLowerCase();
  const years = [];
  for (const match of lower.matchAll(/\b([2-5])\s*t\b/g)) {
    years.push(Number(match[1]));
  }
  return [...new Set(years)];
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
  return womenOnly || selectedAgeFitValues().has("women");
}

function hasAdultSizeOption(find) {
  return eligibleSizeOptions(find).some((option) => isAdultClothingSize(option.size));
}

function visibleChoiceOptions(name) {
  const filter = singleChoiceFilters[name];
  if (name === "gender" && isWomenModeActive()) {
    return filter.options.filter((option) => option.value === "");
  }
  if (name !== "size") return filter.options;
  return filter.options;
}

function sizeFilterAgeFit(filter = "") {
  if (!filter) return "";
  const option = singleChoiceFilters.size.options.find((item) => item.value === filter);
  const ageFits = option?.ageFits?.filter(Boolean) || [];
  return ageFits.length === 1 ? ageFits[0] : "";
}

function defaultSizeForAgeFit(ageFit) {
  return "";
}

function applyAgeFitDefaults(ageFit) {
  if (categoryAgeFitValues.has(ageFit)) {
    setSelectedAgeFits(new Set([ageFit]));
  } else {
    clearSelectedAgeFits();
  }
  if (ageFit === "women") {
    singleChoiceFilters.type.value = "clothes";
    selectedGenders.clear();
  } else if (ageFit === "shoes") {
    singleChoiceFilters.type.value = "shoes";
  } else if (ageFit === "accessories") {
    singleChoiceFilters.type.value = "accessories";
  } else if (["shoes", "accessories"].includes(singleChoiceFilters.type.value)) {
    singleChoiceFilters.type.value = "";
  }
  singleChoiceFilters.size.value = defaultSizeForAgeFit(ageFit);
  selectedSizes.clear();
}

function isShoeFind(find) {
  const text = [find.title, find.category].join(" ").toLowerCase();
  return /\b(shoe|shoes|sandal|sandals|sneaker|sneakers|boot|boots|snowboot|snowboots|bootie|booties|loafer|loafers|mary jane|slipper|slippers|clog|clogs|flat|flats)\b/.test(text);
}

function isAccessoryFind(find) {
  if (isShoeFind(find)) return false;
  if (find.itemType === "accessories") return true;
  const title = String(find.title || "").toLowerCase();
  const category = String(find.category || "").toLowerCase();
  const clothingText = [title, category].join(" ");
  const clothingPattern = /\b(apparel|clothes|clothing|dress|dresses|shirt|shirts|tee|t-shirt|tank|top|tops|blouse|sweatshirt|sweater|cardigan|pant|pants|panty|trackpant|trackpants|sweatpant|sweatpants|trouser|trousers|legging|leggings|short|shorts|skirt|bottom|bottoms|romper|rompers|onesie|bodysuit|jumpsuit|jumpsuits|playsuit|playsuits|bubble|bubbles|overall|overalls|jacket|coat|swim|rashguard|bikini|bra|sports bra|tight|tights|sock|socks|footie|footies|sleeper|sleepers|pajama|pajamas|pyjama|pyjamas|layette|set|sweatsuit|tracksuit|bloomer|bloomers|jumper|jumpers|turtleneck|roll neck|one piece|sleepy doe)\b/;
  const broadApparelCategory = /\bapparel\s*(?:&|and)\s*accessories\b/.test(category);
  const accessoryPattern = /\b(accessory|accessories|hairgoods|hair|bow|bows|bow tie|clip|clips|barrette|headband|scrunchie|ribbon|toy|toys|doll|dolls|activity|rattle|teether|pacifier|blanket|bag|bags|purse|backpack|pouch|nap mat|quilt|quilts|quilted|basket|baskets|stationery|stationary|pencil|notebook|sticker|stickers|poster|print|lunch|bottle|cup|tableware|plate|bib|swaddle|towel|bath|decor|ornament|costume|dress up|jewelry|jewellery|necklace|bracelet|ring|hat|hats|sun hat|swim hat|bucket hat|beanie|bonnet|mitten|mittens|crown)\b/;

  if (/\bcostume\b/.test(title)) return true;
  if (clothingPattern.test(clothingText)) return false;
  if (broadApparelCategory && !accessoryPattern.test(title)) return false;
  return accessoryPattern.test([title, category].join(" "));
}

function isGirlCodedClothing(find) {
  const text = [find.title, find.category, find.brand].join(" ").toLowerCase();
  return /\b(dress|dresses|skirt|skirts|tutu|tutus|blouse|blouses|bikini|bikinis|swimsuit|swimsuits|tankini|tankinis|leotard|leotards|tights|maillot|maillots|hair bow|hair bows|ruffle|ruffles|ruffled|frill|frills|frilly|smock|smocked|smocking|puff sleeve|puff sleeves|flutter sleeve|flutter sleeves|one-piece swimsuit|one piece swimsuit|bathing suit|bathing suits|swim suit|swim suits)\b/.test(text);
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

function selectedShoeSizeMatches(size, find, filter = "") {
  if (!isShoeFind(find)) return false;
  if (!filter || filter === "shoe-any") return true;
  return shoeSizesFromSize(size).some(({ system, value }) => {
    if (filter === "baby-shoes") {
      if (system === "eu") return value <= 19;
      if (system === "us") return value <= 3;
    }
    if (filter === "toddler-shoes") {
      if (system === "eu") return value >= 20 && value <= 24;
      if (system === "us") return value >= 4 && value <= 8;
    }
    if (filter === "little-kid-shoes") {
      if (system === "eu") return value >= 25 && value <= 31;
      if (system === "us") return value >= 9 && value <= 13;
    }
    if (filter === "big-kid-shoes") {
      if (system === "eu") return value >= 32 && value <= 38;
      if (system === "us") return value >= 1 && value <= 6;
    }
    if (filter === "women-shoes") {
      if (system === "eu") return value >= 36;
      if (system === "us") return value >= 5;
    }
    return false;
  });
}

function sizeMatches(size, filter, find, forcedAgeFit = "") {
  const selectedAgeFit = forcedAgeFit || choiceValue("ageFit");
  const filterAgeFit = sizeFilterAgeFit(filter);
  const ageFit = filterAgeFit || selectedAgeFit;
  const isShoe = isShoeFind(find);
  const isAccessory = isAccessoryFind(find);
  const years = yearsFromSize(size);
  const toddlerYears = toddlerYearsFromSize(size);
  const months = monthRangeFromSize(size);

  if (filterAgeFit === "shoes" && !isShoe) return false;
  if (filterAgeFit && filterAgeFit !== "shoes" && isShoe) return false;
  if (filterAgeFit && isAccessory) return false;
  if (isAccessory) return ageFit === "accessories" || (!ageFit && !filter);
  if (isShoe) return (ageFit === "shoes" || (!ageFit && (!filter || String(filter).includes("shoe")))) && selectedShoeSizeMatches(size, find, filter);

  if (ageFit === "baby") {
    if (!filter) return months.length > 0;
    if (filter === "nb") return months.includes(0);
    if (filter === "0-3m") return months.some((month) => month >= 0 && month <= 3);
    if (filter === "3-6m") return months.some((month) => month >= 3 && month <= 6);
    if (filter === "6-12m") return months.some((month) => month >= 6 && month <= 12);
    if (filter === "12-18m") return months.some((month) => month >= 12 && month <= 18);
    if (filter === "18-24m") return months.some((month) => month >= 18 && month <= 24);
    return false;
  }

  if (ageFit === "toddler") {
    if (!filter) return toddlerYears.length > 0;
    const target = Number.parseInt(filter, 10);
    return toddlerYears.includes(target);
  }

  if (ageFit === "kids") {
    if (!filter) return years.some((year) => year >= 2 && year <= 8);
    if (filter === "2y") return years.includes(2);
    if (filter === "3y") return years.includes(3);
    if (filter === "4y") return years.includes(4);
    if (filter === "5y") return years.includes(5);
    if (filter === "6y") return years.includes(6);
    if (filter === "7y") return years.includes(7);
    if (filter === "8y") return years.includes(8);
    return false;
  }

  if (ageFit === "big-kids") {
    if (!filter) return years.some((year) => year >= 9);
    if (filter === "9y") return years.includes(9);
    if (filter === "10y") return years.includes(10);
    if (filter === "12y") return years.includes(12);
    if (filter === "14y") return years.includes(14);
    if (filter === "16y") return years.includes(16);
    return false;
  }

  if (ageFit === "women" && !filter) return isAdultClothingSize(size);
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
  if (ageFit === "women") return isAdultClothingSize(size);
  if (!ageFit && !filter) return true;
  if (!filter) return true;
  if (filter === "3-6") return years.some((year) => year >= 3 && year <= 6);
  return false;
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
  const filters = selectedSizes.size ? [...selectedSizes] : [""];
  const ageFits = selectedAgeFitValues();
  return eligibleSizeOptions(find).filter((option) => {
    if (womenOnly && !isShoeFind(find) && !isAdultClothingSize(option.size)) return false;
    return filters.some((filter) => {
      if (selectedSizes.size || !ageFits.size) {
        return sizeMatches(option.size, filter, find);
      }
      return [...ageFits].some((ageFit) => sizeMatches(option.size, filter, find, ageFit));
    });
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

function updateBrandDirectorySelection() {
  brandList.querySelectorAll(".brandOption").forEach((button) => {
    button.classList.toggle("selected", selectedBrands.has(button.dataset.brand));
  });
  brandList.querySelectorAll(".brandStyleButton").forEach((button) => {
    const collectionBrands = (button.dataset.brands || "").split("\n").filter(Boolean);
    button.classList.toggle("active", collectionBrands.length > 0 && collectionBrands.every((brand) => selectedBrands.has(brand)));
  });
  const allButton = brandList.querySelector(".brandAllButton");
  if (allButton) allButton.classList.toggle("active", !selectedBrands.size);
}

function applyBrandSelectionChange() {
  updateBrandPanel();
  updateBrandDirectorySelection();
  render();
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

function updateSourceListSelection() {
  sourceList.querySelectorAll(".sourceOption").forEach((button) => {
    button.classList.toggle("selected", selectedSources.has(button.dataset.source));
  });
  sourceList.querySelectorAll(".sourceQuickButton").forEach((button) => {
    if (button.dataset.action === "all") {
      button.classList.toggle("active", !selectedSources.size);
      return;
    }
    const groupSources = (button.dataset.sources || "").split("\n").filter(Boolean);
    button.classList.toggle("active", groupSources.length > 0 && groupSources.every((source) => selectedSources.has(source)));
  });
}

function applySourceSelectionChange() {
  updateSourcePanel();
  updateSourceListSelection();
  updateAdminControls();
  render();
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
  if (name === "size") {
    renderSizeChoiceList(filter);
    return;
  }
  const multiSelected = name === "size" ? selectedSizes : (name === "gender" ? selectedGenders : null);
  if (multiSelected) {
    if (multiSelected.size) {
      const quickActions = document.createElement("div");
      quickActions.className = "sourceQuickActions";
      const clearButton = document.createElement("button");
      clearButton.type = "button";
      clearButton.className = "sourceQuickButton";
      clearButton.textContent = `Clear (${multiSelected.size})`;
      clearButton.addEventListener("click", () => {
        multiSelected.clear();
        refreshChoicePanel(name);
        render();
      });
      quickActions.append(clearButton);
      filter.list.append(quickActions);
    }
  }
  const visibleOptions = visibleChoiceOptions(name)
    .filter((option) => !(name === "sort" && option.value === "shuffle"));
  const options = multiSelected
    ? visibleOptions.filter((option) => option.value)
    : visibleOptions;
  for (const option of options) {
    const button = document.createElement("button");
    button.type = "button";
    const isSelected = multiSelected
      ? multiSelected.has(option.value)
      : option.value === filter.value;
    button.className = isSelected ? "sourceOption selected" : "sourceOption";
    if (multiSelected) {
      const checkbox = document.createElement("span");
      checkbox.className = "sourceCheck";
      const label = document.createElement("span");
      label.className = "sourceOptionLabel";
      label.textContent = option.label;
      button.append(checkbox, label);
    } else {
      button.textContent = option.label;
    }
    button.addEventListener("click", () => {
      if (multiSelected) {
        trackClick(`${name}_filter_click`, null, {
          title: option.label,
          [name]: option.value,
        });
        if (!option.value) {
          multiSelected.clear();
        } else if (multiSelected.has(option.value)) {
          multiSelected.delete(option.value);
        } else {
          multiSelected.add(option.value);
        }
        refreshChoicePanel(name);
        render();
        return;
      }
      filter.value = option.value;
      if (name === "sort" && option.value === "shuffle") {
        shuffleSeed = Math.random();
      }
      trackClick(`${name}_filter_click`, null, {
        title: option.label,
        [name]: option.value,
      });
      if (name === "ageFit") {
        womenOnly = option.value === "women";
        applyAgeFitDefaults(option.value);
      }
      if (name === "type") {
        if (option.value === "shoes") {
          clearSelectedAgeFits();
          singleChoiceFilters.ageFit.value = "shoes";
          singleChoiceFilters.size.value = defaultSizeForAgeFit("shoes");
          selectedSizes.clear();
        } else if (option.value === "accessories") {
          clearSelectedAgeFits();
          singleChoiceFilters.ageFit.value = "accessories";
          singleChoiceFilters.size.value = defaultSizeForAgeFit("accessories");
          selectedSizes.clear();
        } else if (option.value === "clothes" && ["shoes", "accessories"].includes(choiceValue("ageFit"))) {
          clearSelectedAgeFits();
          singleChoiceFilters.ageFit.value = "";
          selectedSizes.clear();
        }
      }
      openChoiceFilter = "";
      updateSingleChoicePanels();
      render();
    });
    filter.list.append(button);
  }
}

function refreshChoicePanel(name) {
  const filter = singleChoiceFilters[name];
  if (!filter) return;
  filter.summary.textContent = choiceLabel(name);
  renderSingleChoiceList(name);
  if (name === "size") updateSizeClearButton();
}

function sizeOptionsForGroup(groupValue) {
  return singleChoiceFilters.size.options.filter((option) => (
    option.value && option.ageFits?.includes(groupValue)
  ));
}

function renderSizeChoiceList(filter) {
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

  if (isCategorySizeActive()) {
    makeQuickButton("Clear", () => {
      clearCategorySizeFilters();
      refreshChoicePanel("size");
      render();
    });
  }

  const quick3To6Active = !choiceValue("type")
    && selectedAgeFitValues().size === 1
    && selectedAgeFitValues().has("kids")
    && setHasExactly(selectedSizes, quick3To6SizeValues);
  makeQuickButton("3Y–6Y", () => {
    if (quick3To6Active) {
      clearCategorySizeFilters();
    } else {
      womenOnly = false;
      singleChoiceFilters.type.value = "";
      setSelectedAgeFits(new Set(["kids"]));
      selectedSizes = new Set(quick3To6SizeValues);
    }
    refreshChoicePanel("size");
    render();
  }, quick3To6Active);

  for (const group of sizeFilterGroups.filter((item) => item.value !== "shoes")) {
    const values = sizeOptionsForGroup(group.value).map((option) => option.value);
    if (!values.length) continue;
    const active = values.every((value) => selectedSizes.has(value));
    makeQuickButton(`${group.label} sizes`, () => {
      trackClick("size_group_filter_click", null, {
        title: group.label,
        sizeGroup: group.value,
      });
      clearSelectedAgeFits();
      if (group.value === "women") {
        womenOnly = true;
        setSelectedAgeFits(new Set(["women"]));
        selectedGenders.clear();
        singleChoiceFilters.type.value = "clothes";
      } else {
        womenOnly = false;
        if (["shoes", "accessories"].includes(choiceValue("type"))) {
          singleChoiceFilters.type.value = "";
        }
      }
      if (active) {
        for (const value of values) selectedSizes.delete(value);
      } else {
        for (const value of values) selectedSizes.add(value);
      }
      refreshChoicePanel("size");
      render();
    }, active);
  }

  filter.list.append(quickActions);

  const typeSection = document.createElement("div");
  typeSection.className = "sizeGroup";
  const typeLabel = document.createElement("div");
  typeLabel.className = "sizeGroupLabel";
  typeLabel.textContent = "Item category";
  typeSection.append(typeLabel);
  const typeGrid = document.createElement("div");
  typeGrid.className = "sourceGrid sizeGrid categoryGrid";
  singleChoiceFilters.type.options
    .filter((option) => option.value)
    .forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = choiceValue("type") === option.value ? "sourceOption selected" : "sourceOption";
      const checkbox = document.createElement("span");
      checkbox.className = "sourceCheck";
      const optionLabel = document.createElement("span");
      optionLabel.className = "sourceOptionLabel";
      optionLabel.textContent = categoryTypeLabels[option.value] || option.label;
      button.append(checkbox, optionLabel);
      button.addEventListener("click", () => {
        trackClick("category_filter_click", null, {
          title: option.label,
          type: option.value,
        });
        if (choiceValue("type") === option.value) {
          singleChoiceFilters.type.value = "";
        } else {
          singleChoiceFilters.type.value = option.value;
          if (option.value === "shoes") {
            clearSelectedAgeFits();
            singleChoiceFilters.ageFit.value = "shoes";
            womenOnly = false;
            selectedSizes.clear();
          } else if (option.value === "accessories") {
            clearSelectedAgeFits();
            singleChoiceFilters.ageFit.value = "accessories";
            womenOnly = false;
            selectedSizes.clear();
          } else if (["shoes", "accessories"].includes(choiceValue("ageFit"))) {
            clearSelectedAgeFits();
            selectedSizes.clear();
          }
        }
        refreshChoicePanel("size");
        render();
      });
      typeGrid.append(button);
    });
  typeSection.append(typeGrid);
  filter.list.append(typeSection);

  const ageSection = document.createElement("div");
  ageSection.className = "sizeGroup";
  const ageLabel = document.createElement("div");
  ageLabel.className = "sizeGroupLabel";
  ageLabel.textContent = "Age / fit";
  ageSection.append(ageLabel);
  const ageGrid = document.createElement("div");
  ageGrid.className = "sourceGrid sizeGrid categoryGrid";
  const activeAgeFits = selectedAgeFitValues();
  singleChoiceFilters.ageFit.options
    .filter((option) => categoryAgeFitValues.has(option.value))
    .forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = activeAgeFits.has(option.value) ? "sourceOption selected" : "sourceOption";
      const checkbox = document.createElement("span");
      checkbox.className = "sourceCheck";
      const optionLabel = document.createElement("span");
      optionLabel.className = "sourceOptionLabel";
      optionLabel.textContent = option.value === "women" ? "Women only" : option.label;
      button.append(checkbox, optionLabel);
      button.addEventListener("click", () => {
        trackClick("age_fit_filter_click", null, {
          title: option.label,
          ageFit: option.value,
        });
        const nextAgeFits = selectedAgeFitValues();
        if (nextAgeFits.has(option.value)) {
          nextAgeFits.delete(option.value);
        } else {
          nextAgeFits.add(option.value);
        }
        setSelectedAgeFits(nextAgeFits);
        if (nextAgeFits.has("women")) {
          singleChoiceFilters.type.value = "clothes";
          selectedGenders.clear();
        } else if (["shoes", "accessories"].includes(choiceValue("type"))) {
          singleChoiceFilters.type.value = "";
        }
        womenOnly = false;
        refreshChoicePanel("size");
        render();
      });
      ageGrid.append(button);
    });
  ageSection.append(ageGrid);
  filter.list.append(ageSection);

  for (const group of sizeFilterGroups) {
    const options = sizeOptionsForGroup(group.value);
    if (!options.length) continue;

    const section = document.createElement("div");
    section.className = "sizeGroup";

    const label = document.createElement("div");
    label.className = "sizeGroupLabel";
    label.textContent = group.label;
    section.append(label);

    const grid = document.createElement("div");
    grid.className = "sourceGrid sizeGrid";

    for (const option of options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = selectedSizes.has(option.value) ? "sourceOption selected" : "sourceOption";

      const checkbox = document.createElement("span");
      checkbox.className = "sourceCheck";
      const optionLabel = document.createElement("span");
      optionLabel.className = "sourceOptionLabel";
      optionLabel.textContent = option.label;

      button.append(checkbox, optionLabel);
      button.addEventListener("click", () => {
        trackClick("size_filter_click", null, {
          title: option.label,
          size: option.value,
        });
        clearSelectedAgeFits();
        if (group.value === "women") {
          womenOnly = true;
          setSelectedAgeFits(new Set(["women"]));
          selectedGenders.clear();
          singleChoiceFilters.type.value = "clothes";
        } else if (group.value === "shoes") {
          womenOnly = false;
          clearSelectedAgeFits();
          singleChoiceFilters.type.value = "shoes";
        } else {
          womenOnly = false;
          if (["shoes", "accessories"].includes(choiceValue("type"))) {
            singleChoiceFilters.type.value = "";
          }
        }
        if (selectedSizes.has(option.value)) {
          selectedSizes.delete(option.value);
        } else {
          selectedSizes.add(option.value);
        }
        refreshChoicePanel("size");
        render();
      });
      grid.append(button);
    }

    section.append(grid);
    filter.list.append(section);
  }
}

function updateSingleChoicePanels() {
  for (const [name, filter] of visibleSingleChoiceEntries()) {
    const visibleValues = new Set(visibleChoiceOptions(name).map((option) => option.value));
    if (name === "size") {
      selectedSizes = new Set([...selectedSizes].filter((value) => visibleValues.has(value)));
    }
    if (name === "gender") {
      selectedGenders = new Set([...selectedGenders].filter((value) => visibleValues.has(value)));
    }
    if (!visibleValues.has(filter.value)) {
      filter.value = "";
    }
    const isOpen = openChoiceFilter === name;
    filter.toggle.closest(".filterGroup")?.classList.toggle("isOpen", isOpen);
    filter.list.hidden = !isOpen;
    filter.hint.textContent = isOpen ? "Hide" : "Choose";
    filter.summary.textContent = choiceLabel(name);
    filter.toggle.setAttribute("aria-expanded", String(isOpen));
    renderSingleChoiceList(name);
  }
  updateSizeClearButton();
}

function toggleSingleChoicePanel(name) {
  if (!visibleSingleChoiceFilterNames.includes(name)) return;
  const closingSamePanel = openChoiceFilter === name;
  openChoiceFilter = closingSamePanel ? "" : name;
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
  if (clickReportOpen) {
    clickReportOpen = false;
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
  renderClickReport();
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

  const dynamicBrandStyleCollections = brandStyleCollections.map((collection) => {
    if (collection.id === "shoes") {
      return { ...collection, brands: brands.filter((brand) => brandTypes.get(brand) === "shoes") };
    }
    if (collection.id === "accessories") {
      return { ...collection, brands: brands.filter((brand) => brandTypes.get(brand) === "accessories") };
    }
    return collection;
  });

  const styleCollections = dynamicBrandStyleCollections
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
      button.dataset.brands = collection.brands.join("\n");
      button.textContent = collection.label;
      count.className = "brandStyleCount";
      count.textContent = String(collection.brands.length);
      button.append(document.createTextNode(" "), count);
      button.addEventListener("click", () => {
        trackClick("brand_collection_filter_click", null, {
          title: collection.label,
          brand: collection.brands.join(", "),
        });
        const currentlyAllSelected = collection.brands.every((brand) => selectedBrands.has(brand));
        if (currentlyAllSelected) {
          for (const brand of collection.brands) selectedBrands.delete(brand);
        } else {
          for (const brand of collection.brands) selectedBrands.add(brand);
        }
        applyBrandSelectionChange();
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
  allButton.className = selectedBrands.size ? "brandAllButton" : "brandAllButton active";
  allButton.addEventListener("click", () => {
    trackClick("brand_filter_clear_click");
    selectedBrands.clear();
    applyBrandSelectionChange();
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
      button.type = "button";
      button.className = selectedBrands.has(brand) ? "brandOption selected" : "brandOption";
      button.dataset.brand = brand;
      name.textContent = brand;
      button.append(name);
      button.addEventListener("click", () => {
        trackClick("brand_filter_click", null, { brand });
        if (selectedBrands.has(brand)) selectedBrands.delete(brand);
        else selectedBrands.add(brand);
        applyBrandSelectionChange();
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

  const makeQuickButton = (label, action, active = false, sourcesForButton = []) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = active ? "sourceQuickButton active" : "sourceQuickButton";
    button.textContent = label;
    button.dataset.sources = sourcesForButton.join("\n");
    button.addEventListener("click", action);
    quickActions.append(button);
  };

  const toggleMatchingSources = (wanted) => {
    const matchingSources = wanted.filter((source) => sources.includes(source));
    const currentlyAllSelected = matchingSources.length > 0 && matchingSources.every((source) => selectedSources.has(source));
    if (currentlyAllSelected) {
      for (const source of matchingSources) selectedSources.delete(source);
    } else {
      for (const source of matchingSources) selectedSources.add(source);
    }
    applySourceSelectionChange();
  };

  const sourceGroupActive = (wanted) => {
    const matchingSources = wanted.filter((source) => sources.includes(source));
    return matchingSources.length > 0 && matchingSources.every((source) => selectedSources.has(source));
  };

  const allButtonActive = !selectedSources.size;
  makeQuickButton("All", () => {
    selectedSources.clear();
    applySourceSelectionChange();
  }, allButtonActive);
  quickActions.lastElementChild.dataset.action = "all";
  makeQuickButton("Trusted", () => toggleMatchingSources([...trustedStoreSources]), sourceGroupActive([...trustedStoreSources]), [...trustedStoreSources]);
  makeQuickButton("Caution", () => toggleMatchingSources([...cautionStoreSources]), sourceGroupActive([...cautionStoreSources]), [...cautionStoreSources]);
  makeQuickButton("Usuals", () => toggleMatchingSources(usualSources), sourceGroupActive(usualSources), usualSources);
  makeQuickButton("New stores", () => toggleMatchingSources(newlyAddedSources), sourceGroupActive(newlyAddedSources), newlyAddedSources);

  sourceList.append(quickActions);

  const normalizedQuery = sourceSearchQuery.trim().toLowerCase();
  const visibleSources = sources
    .filter((source) => !normalizedQuery || source.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => {
      const selectedDiff = Number(selectedSources.has(b)) - Number(selectedSources.has(a));
      const trustedDiff = Number(trustedStoreSources.has(b)) - Number(trustedStoreSources.has(a));
      const cautionDiff = Number(cautionStoreSources.has(a)) - Number(cautionStoreSources.has(b));
      return selectedDiff || trustedDiff || cautionDiff || a.localeCompare(b);
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
    button.dataset.source = source;
    const checkbox = document.createElement("span");
    const label = document.createElement("span");
    label.className = "sourceOptionLabel";
    checkbox.className = "sourceCheck";
    label.textContent = source;
    if (trustedStoreSources.has(source)) {
      const badge = document.createElement("span");
      badge.className = "trustedStoreBadge";
      badge.textContent = "Trusted";
      badge.title = trustedStoreTooltip;
      label.append(document.createTextNode(" "), badge);
    }
    if (cautionStoreSources.has(source)) {
      const badge = document.createElement("span");
      badge.className = "cautionStoreBadge";
      badge.textContent = "Shipping risk";
      badge.title = "Multiple shoppers reported shipping issues";
      label.append(document.createTextNode(" "), badge);
    }
    button.append(checkbox, label);
    button.addEventListener("click", () => {
      trackClick("source_filter_click", null, { source });
      if (selectedSources.has(source)) selectedSources.delete(source);
      else selectedSources.add(source);
      applySourceSelectionChange();
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
  const basePromos = sourcePromos
    .filter((item) => !selectedSources.size || selectedSources.has(item.source))
    .sort(sortPromos);
  const normalizedStoreQuery = storeListSearchQuery.trim().toLowerCase();
  const promos = basePromos
    .filter((item) => !normalizedStoreQuery || item.source.toLowerCase().includes(normalizedStoreQuery));

  if (!basePromos.length) promosOpen = false;
  promoToggleButton.hidden = !basePromos.length;
  promoToggleButton.classList.toggle("active", promosOpen);
  promoToggleButton.setAttribute("aria-expanded", String(promosOpen));
  promoBoard.hidden = !basePromos.length || !promosOpen;
  if (storeListSearch) storeListSearch.value = storeListSearchQuery;
  promoList.innerHTML = "";
  promoCount.textContent = basePromos.length
    ? (normalizedStoreQuery ? `${promos.length}/${basePromos.length}` : `${basePromos.length} stores`)
    : "";

  if (!promos.length) {
    const empty = document.createElement("div");
    empty.className = "promoEmpty";
    empty.textContent = "No matching stores";
    promoList.append(empty);
    return;
  }

  for (const item of promos) {
    const row = document.createElement("div");
    const cleanNote = displayPromoNote(item.promoNote, item.source);
    row.className = cleanNote ? "promoItem" : "promoItem noPromo";

    const source = item.baseUrl ? document.createElement("a") : document.createElement("strong");
    if (item.baseUrl) {
      source.href = item.baseUrl;
      source.target = "_blank";
      source.rel = "noreferrer";
      source.addEventListener("click", () => {
        trackClick("store_list_website_click", null, {
          source: item.source,
          url: item.baseUrl,
        });
      });
    }
    source.textContent = item.baseUrl ? `${item.source} ↗` : item.source;
    if (trustedStoreSources.has(item.source)) {
      const badge = document.createElement("span");
      badge.className = "trustedStoreBadge";
      badge.textContent = "Trusted";
      badge.title = trustedStoreTooltip;
      source.append(document.createTextNode(" "), badge);
    }
    if (cautionStoreSources.has(item.source)) {
      const badge = document.createElement("span");
      badge.className = "cautionStoreBadge";
      badge.textContent = "Shipping risk";
      badge.title = "Multiple shoppers reported shipping issues";
      source.append(document.createTextNode(" "), badge);
    }
    const instagramLink = createInstagramLink(item.source);
    if (instagramLink) {
      instagramLink.addEventListener("click", () => {
        trackClick("store_list_instagram_click", null, {
          source: item.source,
          url: instagramLink.href,
        });
      });
    }
    const sourceLine = document.createElement("div");
    sourceLine.className = "promoSourceLine";
    sourceLine.append(source);
    if (instagramLink) sourceLine.append(instagramLink);

    const note = document.createElement("span");
    note.textContent = cleanNote || "No promo found";
    if (!item.promoNote && item.promoReason) {
      const reason = document.createElement("small");
      reason.textContent = item.promoReason;
      row.append(sourceLine, note, reason);
      promoList.append(row);
      continue;
    }

    row.append(sourceLine, note);
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
  const refreshMode = report?.refreshMode || data.refreshMode || "";
  const noPromoStores = report?.noPromoStores || sources
    .filter((source) => !source.promoNote && source.promoStatus !== "failed")
    .map((source) => ({ source: source.source, reason: source.promoReason || "No promo found." }));
  const failedStoreDetails = report?.failedStoreDetails || sources
    .filter((source) => source.scanStatus === "failed" || source.promoStatus === "failed")
    .map((source) => ({ source: source.source, reason: source.scanReason || source.promoReason || "Scan failed." }));
  const slowStoreDetails = report?.slowStoreDetails || sources
    .filter((source) => Number(source.durationMs) > 0)
    .sort((a, b) => Number(b.durationMs) - Number(a.durationMs))
    .slice(0, 12)
    .map((source) => ({
      source: source.source,
      reason: `${formatDuration(source.durationMs)} · scanned ${Number(source.scanned || 0)} products · ${source.scanStatus || "ok"}`,
    }));

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
  if (refreshMode) stats.splice(1, 0, ["Mode", refreshMode === "deep" ? "Deep" : "Quick"]);

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

  reportDetailsButton.hidden = !noPromoStores.length && !failedStoreDetails.length && !slowStoreDetails.length;
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
  addGroup("Slowest stores", slowStoreDetails);
  addGroup("Stores with no promo detected", noPromoStores);
}

function renderClickReport(data = latestClickReportData) {
  latestClickReportData = data;
  if (!clickReport || !clickReportToggleButton || !clickReportStats || !clickReportDetails) return;
  const unlocked = Boolean(adminRefreshToken());
  clickReportToggleButton.hidden = !unlocked;
  clickReportToggleButton.classList.toggle("active", clickReportOpen);
  clickReportToggleButton.setAttribute("aria-expanded", String(clickReportOpen));
  clickReport.hidden = !unlocked || !clickReportOpen;
  if (!unlocked || !clickReportOpen) return;

  clickReportStats.innerHTML = "";
  clickReportDetails.innerHTML = "";
  const stats = [
    ["Today", String(data?.today || 0)],
    ["7 days", String(data?.last7Days || 0)],
    ["All", String(data?.total || 0)],
  ];
  for (const [label, value] of stats) {
    const stat = document.createElement("div");
    stat.className = "reportStat";
    const strong = document.createElement("strong");
    strong.textContent = value;
    const span = document.createElement("span");
    span.textContent = label;
    stat.append(strong, span);
    clickReportStats.append(stat);
  }

  const addTopGroup = (title, items = [], valueKey = "count") => {
    const group = document.createElement("div");
    group.className = "reportGroup";
    const heading = document.createElement("h3");
    heading.textContent = title;
    const list = document.createElement("div");
    list.className = "reportList";
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "reportItem";
      empty.textContent = "No clicks yet";
      list.append(empty);
    }
    for (const item of items.slice(0, 8)) {
      const row = document.createElement("div");
      row.className = "reportItem";
      const name = document.createElement("strong");
      name.textContent = item.label || item.title || item.source || item.brand || "Unknown";
      const count = document.createElement("span");
      count.textContent = `${item[valueKey] || 0} click${item[valueKey] === 1 ? "" : "s"}`;
      row.append(name, count);
      list.append(row);
    }
    group.append(heading, list);
    clickReportDetails.append(group);
  };

  addTopGroup("Top stores", data?.topStores || []);
  addTopGroup("Top brands", data?.topBrands || []);
  addTopGroup("Top clicks", data?.topProducts || []);

  const recentGroup = document.createElement("div");
  recentGroup.className = "reportGroup";
  const recentHeading = document.createElement("h3");
  recentHeading.textContent = "Recent clicks";
  const recentList = document.createElement("div");
  recentList.className = "reportList";
  const recent = data?.recent || [];
  if (!recent.length) {
    const empty = document.createElement("div");
    empty.className = "reportItem";
    empty.textContent = "No clicks yet";
    recentList.append(empty);
  }
  for (const item of recent.slice(0, 12)) {
    const row = document.createElement("div");
    row.className = "reportItem";
    const title = document.createElement("strong");
    title.textContent = item.title || item.source || item.brand || item.eventType || "Click";
    const detail = document.createElement("span");
    const time = item.createdAt ? new Date(item.createdAt).toLocaleString() : "";
    detail.textContent = [item.eventType, item.source, item.brand, time].filter(Boolean).join(" · ");
    row.append(title, detail);
    recentList.append(row);
  }
  recentGroup.append(recentHeading, recentList);
  clickReportDetails.append(recentGroup);
}

async function loadClickReport() {
  if (!adminRefreshToken() && !unlockAdminRefresh()) return;
  if (!clickReportStats || !clickReportDetails) return;
  const shouldRenderWhenLoaded = clickReportOpen;
  clickReportStats.innerHTML = "";
  clickReportDetails.innerHTML = "<div class=\"reportItem\">Loading clicks...</div>";
  try {
    const response = await fetch(`/api/click-report?_=${Date.now()}`, {
      headers: { "x-admin-refresh-token": adminRefreshToken() },
    });
    if (response.status === 401) throw new Error("Admin unlock required.");
    if (!response.ok) throw new Error("Could not load click report");
    latestClickReportData = await response.json();
    if (shouldRenderWhenLoaded && clickReportOpen) renderClickReport(latestClickReportData);
  } catch (error) {
    if (/admin unlock|required|unauthorized/i.test(error.message)) lockAdminRefresh();
    if (clickReportDetails) clickReportDetails.innerHTML = `<div class="reportItem">${error.message}</div>`;
  }
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
    durationMs: item.durationMs || 0,
    scanMode: item.scanMode || "",
  }))
    .filter((item) => item.source);
  populateFilters(allFinds);
  const womenCount = allFinds.filter((find) => find.gender === "women" && hasAdultSizeOption(find)).length;
  const newCount = allFinds.filter((find) => find.isNew).length;
  const priceDropCount = allFinds.filter((find) => find.priceComparison?.priceDelta < -0.01).length;
  if (!womenCount) {
    womenOnly = false;
    if (selectedAgeFitValues().has("women")) {
      selectedAgeFits.delete("women");
      if (choiceValue("ageFit") === "women") {
        singleChoiceFilters.ageFit.value = "";
      }
    }
  }
  const newText = newCount ? ` · ${newCount} new` : "";
  const priceDropText = priceDropCount ? ` · ${priceDropCount} price drops` : "";
  if (!newCount) newOnly = false;
  if (!priceDropCount) priceDropsOnly = false;
  age3To6Button.hidden = true;
  womenOnlyButton.hidden = true;
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
    if (selectedGenders.size && !selectedGenders.has(find.gender)) return false;
    if (selectedGenders.has("boys") && !selectedGenders.has("girls") && isGirlCodedClothing(find)) return false;
    if (womenOnly && isShoe) return false;
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
  age3To6Button.classList.toggle("active", !choiceValue("type")
    && selectedAgeFitValues().size === 1
    && selectedAgeFitValues().has("kids")
    && setHasExactly(selectedSizes, quick3To6SizeValues));
  womenOnlyButton.classList.toggle("active", isWomenModeActive());
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
    imgLink.addEventListener("click", () => {
      trackClick("product_image_click", find);
    });
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
      trackClick("brand_chip_click", find, { brand: find.brand });
      womenOnly = false;
      if (selectedAgeFitValues().has("women")) {
        selectedAgeFits.delete("women");
        if (choiceValue("ageFit") === "women") {
          singleChoiceFilters.ageFit.value = "";
        }
      }
      newOnly = false;
      priceDropsOnly = false;
      selectedBrands = new Set([find.brand]);
      searchInput.value = "";
      populateFilters(allFinds);
      updateSingleChoicePanels();
      render();
    });
    const newBadge = node.querySelector(".newBadge");
    newBadge.hidden = !find.isNew;
    node.querySelector("h2").textContent = find.title;
    const storeLink = node.querySelector(".storeLink");
    storeLink.textContent = find.source;
    storeLink.title = `Show ${find.source}`;
    const storeLine = storeLink.closest(".storeLine");
    if (trustedStoreSources.has(find.source)) {
      const trustedBadge = document.createElement("span");
      trustedBadge.className = "trustedStoreBadge";
      trustedBadge.textContent = "✓";
      trustedBadge.title = trustedStoreTooltip;
      storeLine.append(trustedBadge);
    }
    if (cautionStoreSources.has(find.source)) {
      const cautionBadge = document.createElement("span");
      cautionBadge.className = "cautionStoreBadge";
      cautionBadge.textContent = "Risk";
      cautionBadge.title = "Multiple shoppers reported shipping issues";
      storeLine.append(cautionBadge);
    }
    storeLink.addEventListener("click", () => {
      trackClick("store_chip_click", find, { source: find.source });
      womenOnly = false;
      if (selectedAgeFitValues().has("women")) {
        selectedAgeFits.delete("women");
        if (choiceValue("ageFit") === "women") {
          singleChoiceFilters.ageFit.value = "";
        }
      }
      newOnly = false;
      priceDropsOnly = false;
      selectedSources = new Set([find.source]);
      searchInput.value = "";
      populateFilters(allFinds);
      updateSingleChoicePanels();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
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
    openLink.addEventListener("click", () => {
      trackClick("product_click", find);
    });
    card.dataset.brand = find.brand;
    card.classList.toggle("isNew", Boolean(find.isNew));
    grid.append(node);
  }
}

async function loadFinds(force = false, refreshMode = "quick") {
  if (force && !adminRefreshToken() && !unlockAdminRefresh()) return;
  if (activeLoadController) activeLoadController.abort();
  const refreshSourceNames = force ? [...selectedSources] : [];
  if (force) {
    refreshBackupData = cloneDataSnapshot(latestCompleteData);
    refreshInProgress = true;
  }
  refreshButton.disabled = true;
  if (deepRefreshButton) deepRefreshButton.disabled = true;
  const refreshLabel = refreshMode === "deep" ? "Deep refreshing" : "Quick refreshing";
  refreshButton.textContent = refreshSourceNames.length ? `${refreshLabel} selected...` : `${refreshLabel}...`;
  if (deepRefreshButton) deepRefreshButton.textContent = refreshSourceNames.length ? `${refreshLabel} selected...` : `${refreshLabel}...`;
  updatedEl.textContent = force
    ? (refreshSourceNames.length ? `${refreshLabel} ${refreshSourceNames.length} selected store${refreshSourceNames.length === 1 ? "" : "s"}...` : `${refreshLabel} from stores...`)
    : "Loading saved products...";
  if (force) {
    const expectedTotal = refreshSourceNames.length || allSources.length || 1;
    setProgress(0, expectedTotal, `${refreshLabel} starting...`);
  }
  updateAdminControls();
  try {
    const params = new URLSearchParams({ minDiscount: String(loadedMinDiscount) });
    params.set("_", String(Date.now()));
    if (force) params.set("refresh", "1");
    if (force) params.set("refreshMode", refreshMode === "deep" ? "deep" : "quick");
    if (force && refreshSourceNames.length) params.set("sources", refreshSourceNames.join("|"));
    const headers = {};
    if (force) headers["x-admin-refresh-token"] = adminRefreshToken();
    const controller = new AbortController();
    activeLoadController = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), force ? 4 * 60 * 60 * 1000 : 15000);
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
          const modeLabel = event.refreshMode === "deep" ? "Deep scanning" : "Quick scanning";
          setProgress(0, event.total, `${modeLabel} 0/${event.total} sources`);
        }
        if (event.type === "store") {
          const timeText = formatDuration(event.durationMs);
          const note = event.error
            ? `${event.source} skipped: ${event.error}${timeText ? ` · ${timeText}` : ""}`
            : `${event.source}: scanned ${event.scanned} products${timeText ? ` · ${timeText}` : ""}`;
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
    if (deepRefreshButton) deepRefreshButton.disabled = false;
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

clearSizesButton.addEventListener("click", () => {
  clearCategorySizeFilters();
  updateSingleChoicePanels();
  render();
});

age3To6Button.addEventListener("click", () => {
  const active = !choiceValue("type")
    && selectedAgeFitValues().size === 1
    && selectedAgeFitValues().has("kids")
    && setHasExactly(selectedSizes, quick3To6SizeValues);
  womenOnly = false;
  newOnly = false;
  priceDropsOnly = false;
  singleChoiceFilters.type.value = "";
  setSelectedAgeFits(active ? new Set() : new Set(["kids"]));
  selectedSizes = active ? new Set() : new Set(quick3To6SizeValues);
  closeOpenPanels();
  populateFilters(allFinds);
  updateAdminControls();
  updateSingleChoicePanels();
  render();
});

womenOnlyButton.addEventListener("click", () => {
  const nextWomenOnly = !isWomenModeActive();
  womenOnly = nextWomenOnly;
  if (nextWomenOnly) {
    newOnly = false;
    priceDropsOnly = false;
    selectedBrands.clear();
    selectedSources.clear();
    searchInput.value = "";
    singleChoiceFilters.discount.value = "0.4";
    setSelectedAgeFits(new Set(["women"]));
    selectedGenders.clear();
    applyAgeFitDefaults("women");
    closeOpenPanels();
    populateFilters(allFinds);
    updateAdminControls();
    updateSingleChoicePanels();
  } else {
    setSelectedAgeFits(new Set(["kids"]));
    applyAgeFitDefaults("kids");
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
    clearSelectedAgeFits();
    selectedGenders.clear();
    singleChoiceFilters.size.value = "";
    selectedSizes.clear();
    closeOpenPanels();
    populateFilters(allFinds);
    updateAdminControls();
    updateSingleChoicePanels();
  }
  render();
});

priceDropsButton.addEventListener("click", () => {
  priceDropsOnly = !priceDropsOnly;
  if (priceDropsOnly) {
    womenOnly = false;
    if (selectedAgeFitValues().has("women")) {
      selectedAgeFits.delete("women");
      if (choiceValue("ageFit") === "women") {
        singleChoiceFilters.ageFit.value = "";
      }
      applyAgeFitDefaults("kids");
      updateSingleChoicePanels();
    }
  }
  render();
});

function attachPanelToggle(toggle, onToggle) {
  const handleToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onToggle();
  };
  toggle.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    toggle.dataset.pointerHandled = "true";
    handleToggle(event);
  });
  toggle.addEventListener("click", (event) => {
    if (toggle.dataset.pointerHandled === "true") {
      delete toggle.dataset.pointerHandled;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    handleToggle(event);
  });
}

attachPanelToggle(brandToggleArea, toggleBrandPanel);
attachPanelToggle(sourceToggleArea, toggleSourcePanel);

attachPanelToggle(toggleSearchButton, () => {
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
storeListSearch?.addEventListener("input", () => {
  storeListSearchQuery = storeListSearch.value;
  renderPromoBoard();
});
searchInput.addEventListener("input", updateSearchPanel);
adminUnlockButton.addEventListener("click", unlockAdminRefresh);
refreshButton.addEventListener("click", () => loadFinds(true, "quick"));
deepRefreshButton?.addEventListener("click", () => loadFinds(true, "deep"));
stopRefreshButton.addEventListener("click", stopRefresh);
shuffleButton?.addEventListener("click", () => {
  shuffleSeed = Math.random();
  singleChoiceFilters.sort.value = "shuffle";
  closeOpenPanels();
  updateSingleChoicePanels();
  shuffleButton.classList.remove("isShuffling");
  void shuffleButton.offsetWidth;
  shuffleButton.classList.add("isShuffling");
  trackClick("shuffle_click", null, { title: "Shuffle" });
  render();
});
promoToggleButton.addEventListener("click", () => {
  promosOpen = !promosOpen;
  renderPromoBoard();
  if (promosOpen) window.setTimeout(() => storeListSearch?.focus(), 0);
});
reportToggleButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  reportOpen = !reportOpen;
  if (reportOpen) clickReportOpen = false;
  renderRefreshReport(latestReportData || { sources: sourcePromos, scanned: allFinds.length, finds: allFinds });
  renderClickReport();
});
reportDetailsButton?.addEventListener("click", () => {
  reportDetailsOpen = !reportDetailsOpen;
  renderRefreshReport(latestReportData || { sources: sourcePromos, scanned: allFinds.length, finds: allFinds });
});
clickReportToggleButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  clickReportOpen = !clickReportOpen;
  if (clickReportOpen) {
    reportOpen = false;
    renderRefreshReport(latestReportData || { sources: sourcePromos, scanned: allFinds.length, finds: allFinds });
    loadClickReport();
  } else {
    renderClickReport();
  }
});
clickReportRefreshButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  loadClickReport();
});
clickReport?.addEventListener("click", (event) => {
  event.stopPropagation();
});
refreshReport?.addEventListener("click", (event) => {
  event.stopPropagation();
});

for (const [name, filter] of visibleSingleChoiceEntries()) {
  renderSingleChoiceList(name);
  attachPanelToggle(filter.toggle, () => toggleSingleChoicePanel(name));
  filter.list.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}
updateSingleChoicePanels();
updateAdminControls();
loadFinds();
