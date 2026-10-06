import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Translation dictionary ───────────────────────────────────────────────────
export const TRANSLATIONS = {
  en: {
    // Navbar
    home: 'Home',
    collections: 'Collections',
    catalog: 'Catalog',
    ourStory: 'Our Story',
    contact: 'Contact',
    whatsapp: 'WhatsApp',
    searchPlaceholder: 'Search Avakaya, Arisalu, Chicken pickle...',
    language: 'Language',

    // Hero
    heroPill: 'Village Kitchen Soul • Andhra Heritage',
    heroTitle: 'Traditional Telugu Taste,',
    heroTitleHighlight: 'Homemade With Love.',
    heroSubtitle: 'Authentic Pindi Vantalu, pure desi ghee sweets, and sun-ripened Andhra pickles prepared using cold-pressed oils, stone-ground masalas, and generational family recipes.',
    heroPackSizes: 'Custom pack sizes available: 250 g, 1/2 kg, and 1 kg packs',
    exploreCollections: 'Explore Collections',
    orderOnWhatsApp: 'Order on WhatsApp',
    hundredHomemade: '100% Homemade',
    noPreservatives: 'No Preservatives',
    coldPressedOils: 'Cold-Pressed Oils',
    dailyFreshBatches: 'Daily Fresh Batches',
    traditionalStoneGround: 'Traditional Stone Ground',

    // Hero Carousel Slides
    heroSlide1Tag: 'Grand Andhra Heritage • Fresh Daily',
    heroSlide1Title: 'Traditional Telugu Taste, Homemade With Love',
    heroSlide1Sub: 'Authentic Pindi Vantalu, pure desi ghee sweets, and sun-ripened Andhra pickles prepared using cold-pressed oils and stone-ground masalas.',
    heroSlide1Cta: 'Explore Collections',

    heroSlide2Tag: 'Ceramic Jaadi Aged • Zero Preservatives',
    heroSlide2Title: 'Fiery Royal Andhra Pickles, Steeped In Mustard Oil',
    heroSlide2Sub: 'Signature Avakaya, Gongura, spicy Boneless Chicken & Prawn pickles made with pure Guntur chillies and wood-pressed gingelly oil.',
    heroSlide2Cta: 'Shop Spicy Pickles',

    heroSlide3Tag: '100% Pure Cow Ghee • Organic Bellam',
    heroSlide3Title: 'Melt-in-Mouth Sweets, Handcrafted With Desi Ghee',
    heroSlide3Sub: 'Traditional Sunnundalu, soft festive Arisalu, Ravva Laddu and Bellam Gavvalu prepared using ancestral festive recipes.',
    heroSlide3Cta: 'Explore Pure Sweets',

    heroSlide4Tag: 'Freshly Fried • Handcrafted Crunchy Snacks',
    heroSlide4Title: 'Crispy Pindi Vantalu, Authentic Andhra Crunch',
    heroSlide4Sub: 'Hand-pressed Chekkalu, spicy Karapusa, golden Karam Boondhi & Kajjikayalu made fresh to order in pure cold-pressed oil.',
    heroSlide4Cta: 'View Savouries',

    swipeToExplore: 'Swipe to see more delicacies',
    scrollLeft: 'Scroll left',
    scrollRight: 'Scroll right',

    // Featured Collections
    ourCollectionsPill: 'Handpicked Favorites',
    ourCollectionsTitle: 'Our Homemade Collections',
    ourCollectionsSubtitle: 'From fiery Andhra pickles to melt-in-mouth festive sweets — each made fresh in small batches using ancestral recipes.',
    shopCollection: 'Shop Collection',
    colNonVegTitle: 'Non-Veg Pickles',
    colNonVegSub: 'Boneless Chicken & Coastal Prawns',
    colNonVegTag: 'Spicy & Fiery',
    colVegTitle: 'Veg Pickles',
    colVegSub: 'Avakaya, Gongura, Tomato & Allam',
    colVegTag: 'Andhra Icons',
    colSweetsTitle: 'Traditional Sweets',
    colSweetsSub: 'Arisalu, Sunnundalu, Ravva Laddu & Kajjikayalu',
    colSweetsTag: 'Pure Desi Ghee',
    colSavouriesTitle: 'Crispy Savouries',
    colSavouriesSub: 'Pappu Chekkalu, Karapusa & Karam Boondhi',
    colSavouriesTag: 'Crunchy Snacks',

    // Menu
    farmHomeFresh: 'Farm & Home Fresh',
    ourHomemadeSpecials: 'Our Homemade Specials',
    menuSubtitle: 'Authentic Andhra taste crafted using stone-ground spices, cold-pressed oils, and pure desi cow ghee. Select weights in 250g, 1/2 kg, or 1 kg packs.',
    searchPlaceholderMenu: 'Search Avakaya, Arisalu, Chicken pickle...',
    allSpecials: 'All Specials',
    viewCategory: 'View Category',
    fierAndhrSpecials: 'Fiery Andhra Specials',
    nonVegPickles: 'Non Veg Pickles',
    nonVegSubtitle: 'Slow-cooked tender chunks steeped in aromatic stone-ground masala and cold-pressed oil.',
    vegPickles: 'Veg Pickles',
    vegSubtitle: 'Aged in traditional ceramic jaadi jars with yellow mustard, Guntur chillies, and cold-pressed gingelly oil.',
    pureGheeTreats: 'Pure Ghee & Hand-Pressed Treats',
    pindiVantalu: 'Pindi Vantalu (Sweets & Savouries)',
    pindiSubtitle: 'Handcrafted with pure aged jaggery, pure cow ghee, and crisp rice flour using ancestral festive recipes.',
    noResultsFor: 'No homemade specials matched your search for',
    viewAllSpecials: 'View All Specials',
    selectWeight: 'Select Weight:',
    add: 'Add',
    addToCart: 'Add to Cart',
    added: 'Added ✓',
    details: 'Details',
    traditionalNilva: 'Traditional Nilva Pachallu',

    // Cart
    yourOrderCart: 'Your Order Cart',
    addItemsToOrder: 'Add items to place your order',
    addItemsDesc: 'Select your favorite homemade pickles, sweets, or savouries along with weight preferences (250g, 1/2 kg, 1 kg).',
    popularTeluguFavorites: 'Popular Telugu Favorites:',
    browseFullMenu: 'Browse Full Specials Menu',
    flatDelivery: 'Flat ₹100 Delivery Across All Orders!',
    packSize: 'Pack size:',
    each: 'each',
    itemsSubtotal: 'Items Subtotal:',
    deliveryCharge: 'Delivery Charge:',
    flatDeliveryCharge: 'Flat ₹100',
    totalAmount: 'Total Amount:',
    sendOrderWhatsApp: 'Send Order on WhatsApp',
    preferDirectCall: 'Prefer direct phone call? Dial',
    freshlyPacked: 'Freshly packed in leakproof food-grade containers',
    deliveryInfo: 'Delivery Information (for WhatsApp Order)',
    yourFullName: 'Your Full Name (e.g. Ramesh Reddy)',
    deliveryCity: 'Delivery City / Address (e.g. Hyderabad / Vijayawada)',
    specialRequest: 'Special request (e.g. Mild spicy / Festive pack)',
    addHalfKg: 'Add 1/2 kg',
    fromPrice: 'From',
    halfKgPack: '(1/2 kg)',

    // Story
    ourRootsHeritage: 'Our Roots & Heritage',
    storyMainHeading: 'Made the Traditional Way',
    storyQuote: '“From our home kitchen to your dining table, Bramarambika Home Foods brings you traditional Telugu flavours prepared with care and authentic recipes.”',
    generationalCraft: 'Generational Kitchen Craft',
    generationalCraftDesc: 'Preserving authentic taste with slow cooking in brass vessels & stone grinding.',
    noFactoriesHeading: 'No Factories. No Shortcuts. Just Pure Home Taste.',
    noFactoriesDesc: 'In an era of commercial mass production, we take immense pride in preserving Andhra Pradesh’s rich culinary traditions. Every batch of Arisalu, Chekkalu, and Nilva Pachallu is prepared right in our home kitchen using the exact hand methods passed down by our grandmothers.',
    brassCookwareTitle: 'Brass Cookware',
    brassCookwareDesc: 'Cooked slowly in heavy brass vessels for even heat and unparalleled aroma.',
    stoneGroundSpicesTitle: 'Stone-Ground Spices',
    stoneGroundSpicesDesc: 'Hand-pounded mustard, chillies, and garlic on traditional grinding stones.',
    pureGheeOilsTitle: 'Pure Ghee & Oils',
    pureGheeOilsDesc: 'Pure cow ghee and wood-pressed gingelly oil, free from adulteration.',
    madeInBatchesTitle: 'Made in Batches',
    madeInBatchesDesc: 'Freshly prepared in small daily batches so you receive peak crunch and aroma.',
    ourHeritage: 'Our Heritage',
    storyTitle: 'Crafted in a Village Home, Delivered to Your Door',
    storyText1: 'Our journey began in a traditional Andhra kitchen, where our grandmother slow-cooked pickles in brass vessels, hand-pressed arisalu on banana leaves, and used only stone-ground spices for every recipe.',
    storyText2: 'Today, we follow the same methods — no commercial shortcuts, no artificial preservatives. Every batch is made fresh, hand-packed, and dispatched with love.',
    pureIngredients: 'Pure Ingredients',
    pureIngredientsDesc: 'Cold-pressed gingelly oil, fresh jaggery, stone-ground spices, and pure cow ghee.',
    smallBatches: 'Small Batches Only',
    smallBatchesDesc: 'Each batch is made fresh — never bulk-produced to preserve authentic flavors.',
    directFromKitchen: 'Direct from Kitchen',
    directFromKitchenDesc: 'No middlemen, no warehouses — freshly packed and dispatched within 24 hours.',
    allIndia: 'All India Delivery',
    allIndiaDesc: 'Safe leakproof packaging delivers freshness from our village kitchen to your home.',

    // Why Us
    bramarambikaPromise: 'The Bramarambika Promise',
    whyChooseUs: 'Why Choose Bramarambika?',
    whySubtitle: 'The same taste you grew up with — no shortcuts, no compromises, just authentic homemade love.',
    coldPressedTitle: 'Cold Pressed Oils',
    coldPressedDesc: 'Only pure cold-pressed gingelly oil and coconut oil — no refined or adulterated oils.',
    stoneGround: 'Stone Ground Masalas',
    stoneGroundDesc: 'All spices ground fresh on traditional stone mills for maximum flavor and aroma.',
    noPreservativesTitle: 'No Preservatives',
    noPreservativesDesc: 'Zero artificial colors, flavors, or preservatives. Just real food, real taste.',
    cowGhee: 'Pure Cow Ghee',
    cowGheeDesc: 'Only A2 bilona method desi cow ghee used in our sweets and traditional laddus.',

    // Testimonials
    customerLove: 'Customer Love',
    testimonialsTitle: 'What Our Customers Say',
    testimonialsSubtitle: 'Real Telugu hearts, real reviews — from Hyderabad to Bengaluru, our flavors travel far.',
    verifiedBuyer: 'Verified Buyer',

    // Scroller Bar
    scrollMoreShelf: 'Scroll or swipe sideways to view all items ➔',
    reviewOrderSendWhatsApp: 'Review Order & Send on WhatsApp',

    // Final CTA
    readyToOrder: 'Ready to taste authentic Andhra at home?',
    ctaSubtitle: 'Order from our curated homemade collection — available in 250g, 1/2 kg, and 1 kg packs. Fresh batches dispatched within 24 hours.',
    viewFullMenu: 'View Full Menu',
    callUs: 'Call Us Directly',
    availableHours: 'Available 7 Days a Week • 8 AM – 9 PM IST',

    // Footer
    ourCategories: 'Our Categories',
    orderAndInquiries: 'Order & Inquiries',
    pindiVantaluFull: 'Pindi Vantalu (Sweets & Savouries)',
    vegPicklesFull: 'Veg Pickles (Andhra Pachallu)',
    nonVegPicklesFull: 'Non-Veg Pickles (Chicken & Prawn)',
    ourHeritageStory: 'Our Heritage & Story',
    copyright: '© 2026 Bramarambika Home Foods. All rights reserved.',
    madeWith: 'Made with',
    forTelugu: 'for Telugu authentic taste lovers.',

    // Announcements
    ann1: 'Flat Rs. 100 on Delivery Across Andhra, Telangana & All India',
    ann2: '100% Homemade • Pure Cold Pressed Oils & Desi Ghee • No Preservatives',
    ann3: 'Order on WhatsApp: 7702808886 | Call: 9705449968',
    ann4: 'Fresh Batches Handcrafted Daily • Available in 250g, 1/2 kg & 1 kg packs',
  },

  te: {
    // Navbar
    home: 'హోమ్',
    collections: 'కలెక్షన్లు',
    catalog: 'కేటలాగ్',
    ourStory: 'మా కథ',
    contact: 'సంప్రదించండి',
    whatsapp: 'వాట్సాప్',
    searchPlaceholder: 'ఆవకాయ, అరిసెలు, చికెన్ పచ్చడి వెతకండి...',
    language: 'భాష',

    // Hero
    heroPill: 'పల్లె వంటిల్లు • ఆంధ్రా వారసత్వం',
    heroTitle: 'సంప్రదాయ తెలుగు రుచి,',
    heroTitleHighlight: 'ప్రేమతో చేసిన గృహ వంటకాలు.',
    heroSubtitle: 'నిజమైన పిండి వంటలు, స్వచ్ఛమైన దేశీ నెయ్యి మిఠాయిలు, మరియు ఆంధ్ర పచ్చళ్ళు — చల్లని నొక్కిన నూనెలు, రాయి నలిగిన మసాలాలు, మరియు తరతరాల కుటుంబ వంటకాలతో తయారు చేయబడ్డాయి.',
    heroPackSizes: 'అనుకూల ప్యాక్ పరిమాణాలు: 250 గ్రా, 1/2 కేజీ మరియు 1 కేజీ ప్యాక్లు',
    exploreCollections: 'కలెక్షన్లు చూడండి',
    orderOnWhatsApp: 'వాట్సాప్‌లో ఆర్డర్ చేయండి',
    hundredHomemade: '100% గృహ నిర్మిత',
    noPreservatives: 'పరిరక్షకాలు లేవు',
    coldPressedOils: 'చల్లని నొక్కిన నూనెలు',
    dailyFreshBatches: 'రోజువారీ తాజా బ్యాచ్‌లు',
    traditionalStoneGround: 'సంప్రదాయ రాయి నలిపిన',

    // Hero Carousel Slides
    heroSlide1Tag: 'గొప్ప ఆంధ్రా వారసత్వం • రోజువారీ తాజా',
    heroSlide1Title: 'సంప్రదాయ తెలుగు రుచి, ప్రేమతో చేసిన వంటకాలు',
    heroSlide1Sub: 'నిజమైన పిండి వంటలు, స్వచ్ఛమైన దేశీ నెయ్యి మిఠాయిలు, మరియు ఆంధ్ర పచ్చళ్ళు — చల్లని నొక్కిన నూనెలు, రాయి నలిగిన మసాలాలతో తయారు చేయబడ్డాయి.',
    heroSlide1Cta: 'కలెక్షన్లు చూడండి',

    heroSlide2Tag: 'మట్టి జాడీలలో నిల్వ • పరిరక్షకాలు లేవు',
    heroSlide2Title: 'ఘాటైన రాజసం ఆంధ్రా పచ్చళ్ళు, నువ్వుల నూనె సువాసన',
    heroSlide2Sub: 'గుంటూరు మిర్చి మరియు గానుగ నూనెతో చేసిన ప్రసిద్ధ ఆవకాయ, గోంగూర, చికెన్ మరియు రొయ్యల పచ్చళ్ళు.',
    heroSlide2Cta: 'పచ్చళ్ళు కొనుగోలు చేయండి',

    heroSlide3Tag: '100% స్వచ్ఛమైన గోమాతా నెయ్యి • సేంద్రీయ బెల్లం',
    heroSlide3Title: 'నోటిలో కరిగే మిఠాయిలు, దేశీ నెయ్యితో చేతితో చేసినవి',
    heroSlide3Sub: 'సంప్రదాయ సున్నుండలు, మెత్తని అరిసెలు, రవ్వ లడ్డు మరియు బెల్లం గవ్వలు — పూర్వీకుల పండుగ వంటకాలతో.',
    heroSlide3Cta: 'మిఠాయిలు చూడండి',

    heroSlide4Tag: 'తాజాగా వేయించినవి • కరకరలాడే స్నాక్లు',
    heroSlide4Title: 'కరకరలాడే పిండి వంటలు, నిజమైన ఆంధ్రా క్రంచ్',
    heroSlide4Sub: 'చేత్తో నొక్కిన చెక్కలు, కారపూస, కారం బూంది మరియు కజ్జికాయలు — ఆర్డర్ చేసిన వెంటనే తాజాగా తయారు చేయబడతాయి.',
    heroSlide4Cta: 'స్నాక్స్ చూడండి',

    swipeToExplore: 'మరిన్ని చూడటానికి స్వైప్ చేయండి',
    scrollLeft: 'ఎడమవైపుకు జరపండి',
    scrollRight: 'కుడివైపుకు జరపండి',

    // Featured Collections
    ourCollectionsPill: 'ఎంపిక చేసిన ఇష్టమైనవి',
    ourCollectionsTitle: 'మా గృహ నిర్మిత కలెక్షన్లు',
    ourCollectionsSubtitle: 'మసాలా ఆంధ్రా పచ్చళ్ళ నుండి నోటిలో కరిగే పండుగ మిఠాయిల వరకు — ప్రతిది పూర్వీకుల వంటకాలతో తాజాగా తయారు చేయబడుతుంది.',
    shopCollection: 'కలెక్షన్ కొనుగోలు చేయండి',
    colNonVegTitle: 'నాన్-వెజ్ పచ్చళ్ళు',
    colNonVegSub: 'బోన్‌లెస్ చికెన్ & రొయ్యల పచ్చళ్ళు',
    colNonVegTag: 'ఘాటైన ఆంధ్రా రుచి',
    colVegTitle: 'వెజ్ పచ్చళ్ళు',
    colVegSub: 'ఆవకాయ, గోంగూర, టొమాటో & అల్లం',
    colVegTag: 'ఆంధ్రా ప్రత్యేకత',
    colSweetsTitle: 'సంప్రదాయ మిఠాయిలు',
    colSweetsSub: 'అరిసెలు, సున్నుండలు, రవ్వ లడ్డు & కజ్జికాయలు',
    colSweetsTag: 'స్వచ్ఛమైన గోమాతా నెయ్యి',
    colSavouriesTitle: 'కరకరలాడే స్నాక్లు',
    colSavouriesSub: 'పప్పు చెక్కలు, కారపూస & కారం బూంది',
    colSavouriesTag: 'కరకరలాడే పిండి వంటలు',

    // Menu
    farmHomeFresh: 'పొలం & గృహం నుండి తాజా',
    ourHomemadeSpecials: 'మా గృహ నిర్మిత స్పెషల్స్',
    menuSubtitle: 'రాయి నలిగిన మసాలాలు, చల్లని నొక్కిన నూనెలు మరియు స్వచ్ఛమైన దేశీ గోమాతా నెయ్యితో తయారైన నిజమైన ఆంధ్రా రుచి.',
    searchPlaceholderMenu: 'ఆవకాయ, అరిసెలు, చికెన్ పచ్చడి వెతకండి...',
    allSpecials: 'అన్ని స్పెషల్స్',
    viewCategory: 'వర్గం చూడండి',
    fierAndhrSpecials: 'వేడి ఆంధ్రా స్పెషల్స్',
    nonVegPickles: 'నాన్ వెజ్ పచ్చళ్ళు',
    nonVegSubtitle: 'సుగంధ రాయి నలిగిన మసాలా మరియు చల్లని నొక్కిన నూనెలో మురగబెట్టిన మెత్తని ముక్కలు.',
    vegPickles: 'వెజ్ పచ్చళ్ళు',
    vegSubtitle: 'పసుపు ఆవాలు, గుంటూరు మిర్చి మరియు చల్లని నొక్కిన నువ్వుల నూనెతో సంప్రదాయ మట్టి జాడీలలో పక్వానికి వచ్చాయి.',
    pureGheeTreats: 'స్వచ్ఛమైన నెయ్యి & చేతి నొక్కిన తిండి',
    pindiVantalu: 'పిండి వంటలు (మిఠాయిలు & స్నాక్లు)',
    pindiSubtitle: 'స్వచ్ఛమైన పురాతన బెల్లం, స్వచ్ఛమైన గోమాతా నెయ్యి మరియు కాలుష్య నిరోధక బియ్యపు పిండితో పండుగ వంటకాలతో చేతితో తయారు చేయబడింది.',
    noResultsFor: 'మీ వెతకిన దానికి ఏ గృహ నిర్మిత స్పెషల్స్ కనుగొనబడలేదు',
    viewAllSpecials: 'అన్ని స్పెషల్స్ చూడండి',
    selectWeight: 'బరువు ఎంచుకోండి:',
    add: 'యాడ్',
    addToCart: 'కార్ట్‌కు జోడించండి',
    added: 'జోడించబడింది ✓',
    details: 'వివరాలు',
    traditionalNilva: 'సంప్రదాయ నిల్వ పచ్చళ్ళు',

    // Cart
    yourOrderCart: 'మీ ఆర్డర్ కార్ట్',
    addItemsToOrder: 'ఆర్డర్ ఇవ్వడానికి అంశాలు జోడించండి',
    addItemsDesc: 'మీకు ఇష్టమైన గృహ నిర్మిత పచ్చళ్ళు, మిఠాయిలు, లేదా స్నాక్లు మరియు బరువు ప్రాధాన్యతలతో ఎంచుకోండి (250గ్రా, 1/2 కేజీ, 1 కేజీ).',
    popularTeluguFavorites: 'ప్రసిద్ధ తెలుగు ఇష్టమైనవి:',
    browseFullMenu: 'పూర్తి స్పెషల్స్ మెనూ చూడండి',
    flatDelivery: 'అన్ని ఆర్డర్లకు ₹100 డెలివరీ!',
    packSize: 'ప్యాక్ పరిమాణం:',
    each: 'ఒక్కొక్కటి',
    itemsSubtotal: 'అంశాల మొత్తం:',
    deliveryCharge: 'డెలివరీ చార్జి:',
    flatDeliveryCharge: '₹100 మాత్రమే',
    totalAmount: 'మొత్తం మొత్తం:',
    sendOrderWhatsApp: 'వాట్సాప్‌లో ఆర్డర్ పంపించండి',
    preferDirectCall: 'నేరుగా ఫోన్ ఇష్టమా? డయల్ చేయండి',
    freshlyPacked: 'లీక్ ప్రూఫ్ ఫుడ్ గ్రేడ్ కంటైనర్లలో తాజాగా ప్యాక్ చేయబడింది',
    deliveryInfo: 'డెలివరీ సమాచారం (వాట్సాప్ ఆర్డర్ కోసం)',
    yourFullName: 'మీ పూర్తి పేరు (ఉదా. రమేష్ రెడ్డి)',
    deliveryCity: 'డెలివరీ నగరం / చిరునామా (ఉదా. హైదరాబాద్ / విజయవాడ)',
    specialRequest: 'ప్రత్యేక అభ్యర్థన (ఉదా. తక్కువ మసాలా / పండుగ ప్యాక్)',
    addHalfKg: '1/2 కేజీ జోడించు',
    fromPrice: 'నుండి',
    halfKgPack: '(1/2 కేజీ)',

    // Story
    ourRootsHeritage: 'మా మూలాలు & వారసత్వం',
    storyMainHeading: 'సంప్రదాయ పద్ధతిలోనే తయారు',
    storyQuote: '“మా ఇంటి వంటింటి నుండి మీ భోజన బల్ల వరకు, భ్రమరాంబిక హోమ్ ఫుడ్స్ మీకు సంప్రదాయ తెలుగు రుచులను ప్రేమతో మరియు అసలైన వంటకాలతో అందిస్తుంది.”',
    generationalCraft: 'తరతరాల వంటింటి కళ',
    generationalCraftDesc: 'ఇత్తడి పాత్రలలో నెమ్మదిగా వండడం & రాతి రుబ్బులతో అసలైన రుచిని కాపాడటం.',
    noFactoriesHeading: 'ఫ్యాక్టరీలు లేవు. సత్వర మార్గాలు లేవు. కేవలం స్వచ్ఛమైన గృహ రుచి.',
    noFactoriesDesc: 'వాణిజ్య భారీ ఉత్పత్తి యుగంలో, ఆంధ్రప్రదేశ్ గొప్ప వంట సంప్రదాయాలను కాపాడటంలో మేము ఎంతో గర్విస్తున్నాము. ప్రతి అరిసెలు, చెక్కలు, మరియు నిల్వ పచ్చళ్ళ బ్యాచ్ మా అమ్మమ్మలు నేర్పిన చేతి పద్ధతులతో మా ఇంటి వంటింట్లోనే తయారు చేయబడుతుంది.',
    brassCookwareTitle: 'ఇత్తడి పాత్రలు',
    brassCookwareDesc: 'సమానమైన వేడి మరియు అద్భుతమైన సువాసన కోసం బరువైన ఇత్తడి పాత్రలలో నెమ్మదిగా వండుతారు.',
    stoneGroundSpicesTitle: 'రాతిపై నలిపిన మసాలాలు',
    stoneGroundSpicesDesc: 'సంప్రదాయ రుబ్బు రోళ్లపై చేత్తో దంచిన ఆవాలు, మిర్చి మరియు వెల్లుల్లి.',
    pureGheeOilsTitle: 'స్వచ్ఛమైన నెయ్యి & నూనెలు',
    pureGheeOilsDesc: 'స్వచ్ఛమైన గోమాత నెయ్యి మరియు గానుగ నువ్వుల నూనె, కల్తీ లేకుండా.',
    madeInBatchesTitle: 'చిన్న బ్యాచ్‌లలో తయారీ',
    madeInBatchesDesc: 'గరిష్ట కరకర మరియు తాజా సువాసన కోసం ప్రతిరోజూ చిన్న బ్యాచ్‌లలో తాజాగా తయారు చేస్తాము.',
    ourHeritage: 'మా వారసత్వం',
    storyTitle: 'పల్లె ఇంట్లో తయారు, మీ ఇంటికి పంపబడింది',
    storyText1: 'మా ప్రయాణం సంప్రదాయ ఆంధ్రా వంటింట్లో ప్రారంభమైంది, అక్కడ మా అమ్మమ్మ ఇత్తడి పాత్రలలో పచ్చళ్ళు నెమ్మదిగా వండేది, అరిసెలు అరటి ఆకులపై చేత్తో నొక్కేది, మరియు ప్రతి వంటకానికి రాయి నలిగిన మసాలాలు మాత్రమే వాడేది.',
    storyText2: 'నేడు, మేము అదే పద్ధతులను అనుసరిస్తాము — వాణిజ్య సత్వర మార్గాలు లేవు, కృత్రిమ పరిరక్షకాలు లేవు. ప్రతి బ్యాచ్ తాజాగా తయారు చేయబడి, చేతితో ప్యాక్ చేయబడి, ప్రేమతో పంపబడుతుంది.',
    pureIngredients: 'స్వచ్ఛమైన పదార్థాలు',
    pureIngredientsDesc: 'చల్లని నొక్కిన నువ్వుల నూనె, తాజా బెల్లం, రాయి నలిగిన మసాలాలు మరియు స్వచ్ఛమైన గోమాతా నెయ్యి.',
    smallBatches: 'చిన్న బ్యాచ్‌లు మాత్రమే',
    smallBatchesDesc: 'ప్రతి బ్యాచ్ తాజాగా తయారు చేయబడుతుంది — నిజమైన రుచులను సంరక్షించడానికి ఎప్పుడూ పెద్ద పరిమాణంలో ఉత్పత్తి చేయరు.',
    directFromKitchen: 'వంటింటి నుండి నేరుగా',
    directFromKitchenDesc: 'మధ్యవర్తులు లేరు, గోదాముల్లేవు — 24 గంటల్లో తాజాగా ప్యాక్ చేసి పంపుతాం.',
    allIndia: 'అన్ని భారతదేశ డెలివరీ',
    allIndiaDesc: 'సురక్షితమైన లీక్ ప్రూఫ్ ప్యాకేజింగ్ మా పల్లె వంటింటి నుండి మీ ఇంటికి తాజాదనాన్ని అందిస్తుంది.',

    // Why Us
    bramarambikaPromise: 'భ్రమరాంబిక విశ్వసనీయ హామీ',
    whyChooseUs: 'భ్రమరాంబికను ఎందుకు ఎంచుకోవాలి?',
    whySubtitle: 'మీరు పెరిగిన అదే రుచి — సత్వర మార్గాలు లేవు, రాజీ పడటం లేదు, కేవలం నిజమైన గృహ నిర్మిత ప్రేమ.',
    coldPressedTitle: 'చల్లని నొక్కిన నూనెలు',
    coldPressedDesc: 'కేవలం స్వచ్ఛమైన చల్లని నొక్కిన నువ్వుల నూనె మరియు కొబ్బరి నూనె — శుద్ధి చేయబడిన లేదా కల్తీ నూనెలు లేవు.',
    stoneGround: 'రాయి నలిగిన మసాలాలు',
    stoneGroundDesc: 'గరిష్ట రుచి మరియు వాసన కోసం సంప్రదాయ రాయి మిల్లులపై అన్ని మసాలాలు తాజాగా నలగబడతాయి.',
    noPreservativesTitle: 'పరిరక్షకాలు లేవు',
    noPreservativesDesc: 'జీరో కృత్రిమ రంగులు, రుచులు, లేదా పరిరక్షకాలు. కేవలం నిజమైన ఆహారం, నిజమైన రుచి.',
    cowGhee: 'స్వచ్ఛమైన గోమాతా నెయ్యి',
    cowGheeDesc: 'మా మిఠాయిలు మరియు సంప్రదాయ లడ్డులలో కేవలం A2 బిలోనా పద్ధతి దేశీ గోమాతా నెయ్యి వాడబడుతుంది.',

    // Testimonials
    customerLove: 'కస్టమర్ ప్రేమ',
    testimonialsTitle: 'మా కస్టమర్లు ఏమి చెబుతున్నారు',
    testimonialsSubtitle: 'నిజమైన తెలుగు హృదయాలు, నిజమైన సమీక్షలు — హైదరాబాద్ నుండి బెంగళూరు వరకు, మా రుచులు దూరంగా ప్రయాణిస్తాయి.',
    verifiedBuyer: 'నిర్థారించబడిన కొనుగోలుదారు',

    // Scroller Bar
    scrollMoreShelf: 'మరిన్ని అంశాలు చూడటానికి పక్కకు జరపండి ➔',
    reviewOrderSendWhatsApp: 'ఆర్డర్ సమీక్షించి వాట్సాప్‌లో పంపండి',

    // Final CTA
    readyToOrder: 'ఇంట్లో నిజమైన ఆంధ్రా రుచి చూసేందుకు సిద్ధంగా ఉన్నారా?',
    ctaSubtitle: 'మా క్యూరేటెడ్ గృహ నిర్మిత కలెక్షన్ నుండి ఆర్డర్ చేయండి — 250గ్రా, 1/2 కేజీ మరియు 1 కేజీ ప్యాక్లలో అందుబాటులో ఉంది. 24 గంటల్లో తాజా బ్యాచ్లు పంపబడతాయి.',
    viewFullMenu: 'పూర్తి మెనూ చూడండి',
    callUs: 'మాకు నేరుగా కాల్ చేయండి',
    availableHours: 'వారంలో 7 రోజులు అందుబాటులో • ఉదయం 8 – రాత్రి 9 IST',

    // Footer
    ourCategories: 'మా వర్గాలు',
    orderAndInquiries: 'ఆర్డర్ & విచారణలు',
    pindiVantaluFull: 'పిండి వంటలు (మిఠాయిలు & స్నాక్లు)',
    vegPicklesFull: 'వెజ్ పచ్చళ్ళు (ఆంధ్రా పచ్చళ్ళు)',
    nonVegPicklesFull: 'నాన్-వెజ్ పచ్చళ్ళు (చికెన్ & రొయ్యలు)',
    ourHeritageStory: 'మా వారసత్వం & కథ',
    copyright: '© 2026 భ్రమరాంబిక హోమ్ ఫుడ్స్. అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.',
    madeWith: 'ప్రేమతో తయారు చేయబడింది',
    forTelugu: 'తెలుగు నిజమైన రుచి ప్రేమికుల కోసం.',

    // Announcements
    ann1: 'ఆంధ్రా, తెలంగాణ & అన్ని భారతదేశంలో ₹100 డెలివరీ',
    ann2: '100% గృహ నిర్మిత • స్వచ్ఛమైన చల్లని నొక్కిన నూనెలు & దేశీ నెయ్యి • పరిరక్షకాలు లేవు',
    ann3: 'వాట్సాప్‌లో ఆర్డర్ చేయండి: 7702808886 | కాల్: 9705449968',
    ann4: 'రోజువారీ తాజా బ్యాచ్‌లు • 250గ్రా, 1/2 కేజీ & 1 కేజీ ప్యాక్లలో అందుబాటులో',
  },

  hi: {
    // Navbar
    home: 'होम',
    collections: 'संग्रह',
    catalog: 'कैटलॉग',
    ourStory: 'हमारी कहानी',
    contact: 'संपर्क',
    whatsapp: 'व्हाट्सएप',
    searchPlaceholder: 'अवाकाया, अरिसालु, चिकन अचार खोजें...',
    language: 'भाषा',

    // Hero
    heroPill: 'गाँव की रसोई • आंध्रा विरासत',
    heroTitle: 'पारंपरिक तेलुगु स्वाद,',
    heroTitleHighlight: 'प्यार से बना घर का खाना।',
    heroSubtitle: 'असली पिंडी वंटालु, शुद्ध देसी घी की मिठाइयाँ, और आंध्रा के अचार — ठंडे दबाए गए तेल, पत्थर पर पिसे मसाले और पीढ़ियों से चली आ रही रेसिपी से बनाए जाते हैं।',
    heroPackSizes: 'कस्टम पैक साइज़: 250 ग्राम, 1/2 किग्रा और 1 किग्रा',
    exploreCollections: 'संग्रह देखें',
    orderOnWhatsApp: 'व्हाट्सएप पर ऑर्डर करें',
    hundredHomemade: '100% घर का बना',
    noPreservatives: 'कोई संरक्षक नहीं',
    coldPressedOils: 'कोल्ड-प्रेस्ड तेल',
    dailyFreshBatches: 'रोज़ताज़ा बैच',
    traditionalStoneGround: 'पारंपरिक पत्थर-पिसा',

    // Hero Carousel Slides
    heroSlide1Tag: 'भव्य आंध्रा विरासत • रोज़ाना ताज़ा',
    heroSlide1Title: 'पारंपरिक तेलुगु स्वाद, प्यार से बना घर का खाना',
    heroSlide1Sub: 'असली पिंडी वंटालु, शुद्ध देसी घी की मिठाइयाँ, और आंध्रा के अचार — ठंडे दबाए गए तेल और पत्थर पर पिसे मसालों से बने।',
    heroSlide1Cta: 'कलेक्शन देखें',

    heroSlide2Tag: 'मिट्टी के मर्तबान में तैयार • कोई संरक्षक नहीं',
    heroSlide2Title: 'तीखे शाही आंध्रा अचार, शुद्ध तिल के तेल में बने',
    heroSlide2Sub: 'गुंटूर मिर्च और पारंपरिक तेल से बने खास अवाकाया, गोंगुरा, चिकन और प्रॉन अचार।',
    heroSlide2Cta: 'अचार खरीदें',

    heroSlide3Tag: '100% शुद्ध गाय का घी • जैविक गुड़',
    heroSlide3Title: 'मुँह में घुल जाने वाली मिठाइयाँ, शुद्ध देसी घी से बनी',
    heroSlide3Sub: 'पारंपरिक सुन्नुंडालु, ताज़ा अरिसालु, रवा लड्डू और गुड़ की गव्वालु — त्योहारों की पारंपरिक मिठास।',
    heroSlide3Cta: 'मिठाइयाँ देखें',

    heroSlide4Tag: 'ताज़ा तला हुआ • कुरकुरा पारंपरिक नाश्ता',
    heroSlide4Title: 'कुरकुरा पिंडी वंटालु, असली आंध्रा स्वाद',
    heroSlide4Sub: 'हाथ से बने चेक्कलु, कारापूसा, तीखी बूंदी और कज्जिकायालु — हर ऑर्डर पर ताज़ा बनाए जाते हैं।',
    heroSlide4Cta: 'नाश्ता देखें',

    swipeToExplore: 'अधिक देखने के लिए स्वाइप करें',
    scrollLeft: 'बाएँ स्क्रॉल करें',
    scrollRight: 'दाएँ स्क्रॉल करें',

    // Featured Collections
    ourCollectionsPill: 'चुनिंदा पसंदीदा',
    ourCollectionsTitle: 'हमारे घर के बने संग्रह',
    ourCollectionsSubtitle: 'तीखे आंध्रा अचार से लेकर मुंह में घुलने वाली उत्सव मिठाइयों तक — सब कुछ पूर्वजों की रेसिपी से छोटे बैचों में ताज़ा बनाया जाता है।',
    shopCollection: 'संग्रह खरीदें',
    colNonVegTitle: 'नॉन-वेज अचार',
    colNonVegSub: 'बोनलेस चिकन और झींगा अचार',
    colNonVegTag: 'तीखा और चटपटा',
    colVegTitle: 'वेज अचार',
    colVegSub: 'अवाकाया, गोंगुरा, टमाटर और अदरक',
    colVegTag: 'आंध्रा की पहचान',
    colSweetsTitle: 'पारंपरिक मिठाइयाँ',
    colSweetsSub: 'अरिसालु, सुन्नुंडालु, रवा लड्डू और कज्जिकायालु',
    colSweetsTag: 'शुद्ध देसी घी',
    colSavouriesTitle: 'कुरकुरी नमकीन',
    colSavouriesSub: 'पप्पू चेक्कलु, कारापूसा और तीखी बूंदी',
    colSavouriesTag: 'पारंपरिक नाश्ता',

    // Menu
    farmHomeFresh: 'खेत और घर से ताज़ा',
    ourHomemadeSpecials: 'हमारे घर के स्पेशल',
    menuSubtitle: 'पत्थर पिसे मसाले, कोल्ड-प्रेस्ड तेल और शुद्ध देसी गाय का घी से बना असली आंध्रा स्वाद। 250 ग्राम, 1/2 किग्रा या 1 किग्रा पैक में वज़न चुनें।',
    searchPlaceholderMenu: 'अवाकाया, अरिसालु, चिकन अचार खोजें...',
    allSpecials: 'सभी स्पेशल',
    viewCategory: 'श्रेणी देखें',
    fierAndhrSpecials: 'तीखे आंध्रा स्पेशल',
    nonVegPickles: 'नॉन-वेज अचार',
    nonVegSubtitle: 'सुगंधित पत्थर पिसे मसाले और कोल्ड-प्रेस्ड तेल में भिगोए नरम टुकड़े।',
    vegPickles: 'वेज अचार',
    vegSubtitle: 'पीली सरसों, गुंटूर मिर्च और ठंडे दबाए तिल के तेल के साथ पारंपरिक मिट्टी के जाडी घड़ों में पका हुआ।',
    pureGheeTreats: 'शुद्ध घी और हाथ से दबाए व्यंजन',
    pindiVantalu: 'पिंडी वंटालु (मिठाइयाँ और नमकीन)',
    pindiSubtitle: 'शुद्ध पुराने गुड़, शुद्ध गाय के घी और कुरकुरे चावल के आटे से पूर्वजों की उत्सव रेसिपी से हाथ से बनाया गया।',
    noResultsFor: 'आपकी खोज के लिए कोई घर का स्पेशल नहीं मिला',
    viewAllSpecials: 'सभी स्पेशल देखें',
    selectWeight: 'वज़न चुनें:',
    add: 'जोड़ें',
    addToCart: 'कार्ट में जोड़ें',
    added: 'जोड़ा गया ✓',
    details: 'विवरण',
    traditionalNilva: 'पारंपरिक नील्वा पचालु',

    // Cart
    yourOrderCart: 'आपकी ऑर्डर कार्ट',
    addItemsToOrder: 'ऑर्डर देने के लिए आइटम जोड़ें',
    addItemsDesc: 'अपने पसंदीदा घर के अचार, मिठाइयाँ या नमकीन वज़न के साथ चुनें (250 ग्राम, 1/2 किग्रा, 1 किग्रा)।',
    popularTeluguFavorites: 'प्रसिद्ध तेलुगु पसंदीदा:',
    browseFullMenu: 'पूरा स्पेशल मेनू देखें',
    flatDelivery: 'सभी ऑर्डर पर फ्लैट ₹100 डिलीवरी!',
    packSize: 'पैक साइज़:',
    each: 'प्रत्येक',
    itemsSubtotal: 'आइटम उप-कुल:',
    deliveryCharge: 'डिलीवरी शुल्क:',
    flatDeliveryCharge: 'फ्लैट ₹100',
    totalAmount: 'कुल राशि:',
    sendOrderWhatsApp: 'व्हाट्सएप पर ऑर्डर भेजें',
    preferDirectCall: 'सीधे फोन पसंद है? डायल करें',
    freshlyPacked: 'लीकप्रूफ फूड-ग्रेड कंटेनर में ताज़ा पैक',
    deliveryInfo: 'डिलीवरी जानकारी (व्हाट्सएप ऑर्डर के लिए)',
    yourFullName: 'आपका पूरा नाम (जैसे रमेश रेड्डी)',
    deliveryCity: 'डिलीवरी शहर / पता (जैसे हैदराबाद / विजयवाड़ा)',
    specialRequest: 'विशेष अनुरोध (जैसे कम मसाला / उत्सव पैक)',
    addHalfKg: '1/2 किग्रा जोड़ें',
    fromPrice: 'से',
    halfKgPack: '(1/2 किग्रा)',

    // Story
    ourRootsHeritage: 'हमारी जड़ें और विरासत',
    storyMainHeading: 'पारंपरिक तरीके से तैयार',
    storyQuote: '“हमारी घरेलू रसोई से आपकी डाइनिंग टेबल तक, भ्रमरांबिका होम फूड्स आपके लिए पारंपरिक तेलुगु स्वाद और प्रामाणिक रेसिपी लाता है।”',
    generationalCraft: 'पीढ़ियों की रसोई कला',
    generationalCraftDesc: 'पीतल के बर्तनों में धीमी आंच पर पकाने और सिलबट्टे पर मसाले पीसने से असली स्वाद बना रहता है।',
    noFactoriesHeading: 'कोई फैक्ट्री नहीं। कोई शॉर्टकट नहीं। बस शुद्ध घर का स्वाद।',
    noFactoriesDesc: 'व्यावसायिक उत्पादन के इस दौर में, हम आंध्र प्रदेश की समृद्ध खान-पान परंपराओं को संजोने में गर्व महसूस करते हैं। अरिसालु, चेक्कलु और आंध्रा अचार का हर बैच हमारी घरेलू रसोई में हमारी दादी-नानी के पारंपरिक हाथों के तरीकों से तैयार किया जाता है।',
    brassCookwareTitle: 'पीतल के बर्तन',
    brassCookwareDesc: 'समान आंच और लाजवाब खुशबू के लिए भारी पीतल के बर्तनों में धीमी आंच पर पकाया जाता है।',
    stoneGroundSpicesTitle: 'सिलबट्टे पर पिसे मसाले',
    stoneGroundSpicesDesc: 'पारंपरिक सिलबट्टे पर हाथ से कूटी गई राई, मिर्च और लहसुन।',
    pureGheeOilsTitle: 'शुद्ध घी और तेल',
    pureGheeOilsDesc: 'शुद्ध गाय का घी और लकड़ी की घानी का तिल का तेल, बिना किसी मिलावट के।',
    madeInBatchesTitle: 'छोटे बैचों में ताज़ा',
    madeInBatchesDesc: 'ताज़गी, कुरकुरापन और खुशबू बनाए रखने के लिए हर रोज़ छोटे-छोटे बैचों में ताज़ा तैयार किया जाता है।',
    ourHeritage: 'हमारी विरासत',
    storyTitle: 'गाँव के घर में बना, आपके दरवाज़े पर पहुँचाया',
    storyText1: 'हमारी यात्रा एक पारंपरिक आंध्रा रसोई में शुरू हुई, जहाँ हमारी दादी पीतल के बर्तनों में अचार धीरे-धीरे पकाती थी, केले के पत्तों पर अरिसालु हाथ से दबाती थी, और हर रेसिपी के लिए केवल पत्थर पिसे मसाले ही उपयोग करती थी।',
    storyText2: 'आज, हम उन्हीं तरीकों का पालन करते हैं — कोई व्यावसायिक शॉर्टकट नहीं, कोई कृत्रिम संरक्षक नहीं। हर बैच ताज़ा बनाया, हाथ से पैक किया, और प्यार से भेजा जाता है।',
    pureIngredients: 'शुद्ध सामग्री',
    pureIngredientsDesc: 'ठंडे दबाए तिल का तेल, ताज़ा गुड़, पत्थर पिसे मसाले और शुद्ध गाय का घी।',
    smallBatches: 'केवल छोटे बैच',
    smallBatchesDesc: 'हर बैच ताज़ा बनाया जाता है — असली स्वाद बनाए रखने के लिए कभी बड़े पैमाने पर उत्पादन नहीं।',
    directFromKitchen: 'सीधे रसोई से',
    directFromKitchenDesc: 'कोई बिचौलिया नहीं, कोई गोदाम नहीं — 24 घंटे में ताज़ा पैक और भेजा।',
    allIndia: 'पूरे भारत डिलीवरी',
    allIndiaDesc: 'सुरक्षित लीकप्रूफ पैकेजिंग हमारे गाँव की रसोई से आपके घर तक ताजगी पहुँचाती है।',

    // Why Us
    bramarambikaPromise: 'भ्रमरांबिका का अटूट वादा',
    whyChooseUs: 'ब्रमरांबिका क्यों चुनें?',
    whySubtitle: 'वही स्वाद जो आपने बचपन में चखा — कोई शॉर्टकट नहीं, कोई समझौता नहीं, बस असली घर के बने प्यार से।',
    coldPressedTitle: 'कोल्ड-प्रेस्ड तेल',
    coldPressedDesc: 'केवल शुद्ध ठंडे दबाए तिल का तेल और नारियल तेल — कोई रिफाइंड या मिलावटी तेल नहीं।',
    stoneGround: 'पत्थर पिसे मसाले',
    stoneGroundDesc: 'अधिकतम स्वाद और सुगंध के लिए पारंपरिक पत्थर मिल पर सभी मसाले ताज़ा पिसे जाते हैं।',
    noPreservativesTitle: 'कोई संरक्षक नहीं',
    noPreservativesDesc: 'शून्य कृत्रिम रंग, स्वाद या संरक्षक। बस असली खाना, असली स्वाद।',
    cowGhee: 'शुद्ध गाय का घी',
    cowGheeDesc: 'हमारी मिठाइयों और पारंपरिक लड्डू में केवल A2 बिलोना विधि देसी गाय का घी उपयोग।',

    // Testimonials
    customerLove: 'ग्राहक प्यार',
    testimonialsTitle: 'हमारे ग्राहक क्या कहते हैं',
    testimonialsSubtitle: 'असली तेलुगु दिल, असली समीक्षाएँ — हैदराबाद से बेंगलुरु तक, हमारे स्वाद दूर-दूर जाते हैं।',
    verifiedBuyer: 'सत्यापित खरीदार',

    // Scroller Bar
    scrollMoreShelf: 'सभी आइटम देखने के लिए बगल में स्क्रॉल करें ➔',
    reviewOrderSendWhatsApp: 'ऑर्डर रिव्यू करें और व्हाट्सएप पर भेजें',

    // Final CTA
    readyToOrder: 'घर पर असली आंध्रा स्वाद चखने के लिए तैयार?',
    ctaSubtitle: 'हमारे क्यूरेटेड घर के बने संग्रह से ऑर्डर करें — 250 ग्राम, 1/2 किग्रा और 1 किग्रा पैक में उपलब्ध। 24 घंटे में ताज़ा बैच भेजे जाते हैं।',
    viewFullMenu: 'पूरा मेनू देखें',
    callUs: 'हमें सीधे कॉल करें',
    availableHours: 'सप्ताह में 7 दिन उपलब्ध • सुबह 8 – रात 9 IST',

    // Footer
    ourCategories: 'हमारी श्रेणियाँ',
    orderAndInquiries: 'ऑर्डर और पूछताछ',
    pindiVantaluFull: 'पिंडी वंटालु (मिठाइयाँ और नमकीन)',
    vegPicklesFull: 'वेज अचार (आंध्रा पचालु)',
    nonVegPicklesFull: 'नॉन-वेज अचार (चिकन और झींगा)',
    ourHeritageStory: 'हमारी विरासत और कहानी',
    copyright: '© 2026 ब्रमरांबिका होम फूड्स। सर्वाधिकार सुरक्षित।',
    madeWith: 'प्यार से बनाया',
    forTelugu: 'तेलुगु असली स्वाद प्रेमियों के लिए।',

    // Announcements
    ann1: 'आंध्रा, तेलंगाना और पूरे भारत में फ्लैट ₹100 डिलीवरी',
    ann2: '100% घर का बना • शुद्ध कोल्ड-प्रेस्ड तेल और देसी घी • कोई संरक्षक नहीं',
    ann3: 'व्हाट्सएप पर ऑर्डर करें: 7702808886 | कॉल: 9705449968',
    ann4: 'रोज़ ताज़ा बैच • 250 ग्राम, 1/2 किग्रा और 1 किग्रा पैक में उपलब्ध',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('bramarambika_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem('bramarambika_lang', lang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback((key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
