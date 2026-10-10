export const WEIGHT_VARIANTS = [
  { id: '250g', label: '250 g', displayLabel: '250 g (1/4 kg)', multiplier: 0.25 },
  { id: '500g', label: '1/2 kg', displayLabel: '500 g (1/2 kg)', multiplier: 0.5 },
  { id: '1kg', label: '1 kg', displayLabel: '1 kg', multiplier: 1.0 },
  { id: '2kg', label: '2 kg', displayLabel: '2 kg', multiplier: 2.0 }
];

export const CATEGORIES = [
  { id: 'all', label: 'All Specials', count: 14 },
  { id: 'non-veg-pickles', label: 'Non-Veg Pickles', count: 2, bg: '#F1E2C5' },
  { id: 'veg-pickles', label: 'Veg Pickles', count: 4, bg: '#E8F0E3' },
  { id: 'pindi-vantalu', label: 'Pindi Vantalu (Sweets & Snacks)', count: 8, bg: '#FFFCF7' },
];

export const FEATURED_COLLECTIONS = [
  {
    id: 'non-veg-pickles',
    title: 'Non-Veg Pickles',
    subtitle: 'Boneless Chicken & Coastal Prawns',
    image: '/images/nonveg-pickles.jpg',
    startingPrice: 'From ₹275',
    tag: 'Spicy & Fiery'
  },
  {
    id: 'veg-pickles',
    title: 'Veg Pickles',
    subtitle: 'Avakaya, Gongura, Tomato & Allam',
    image: '/images/veg-pickles.jpg',
    startingPrice: 'From ₹110',
    tag: 'Andhra Icons'
  },
  {
    id: 'pindi-vantalu',
    title: 'Traditional Sweets',
    subtitle: 'Arisalu, Sunnundalu, Ravva Laddu & Kajjikayalu',
    image: '/images/sweets.jpg',
    startingPrice: 'From ₹80',
    tag: 'Pure Desi Ghee'
  },
  {
    id: 'pindi-vantalu-hot',
    categoryTarget: 'pindi-vantalu',
    title: 'Crispy Savouries',
    subtitle: 'Pappu Chekkalu, Karapusa & Karam Boondhi',
    image: '/images/savouries.jpg',
    startingPrice: 'From ₹80',
    tag: 'Crunchy Snacks'
  }
];

export const PRODUCTS = [
  // --- NON-VEG PICKLES ---
  {
    id: 'chicken-pickle',
    name: 'Chicken Pickle (Boneless)',
    teluguName: 'నాటుకోడి తరహా చికెన్ పచ్చడి',
    category: 'non-veg-pickles',
    categoryLabel: 'Non-Veg Pickles',
    pricePerKg: 1000,
    unit: 'kg',
    tagline: 'Boneless tender chicken in spicy Andhra masala',
    description: 'Succulent chicken chunks crisped in ginger-garlic paste and simmered in fiery Andhra ground spices, cold-pressed oil, and roasted curry leaves.',
    badge: 'Hot Seller',
    image: '/images/chicken-pickle.jpg',
    taste: 'Rich & Fiery',
    rating: 4.9,
    reviewCount: 48,
    ingredients: 'Fresh tender chicken, Homemade garam masala, Lemon juice, Ginger garlic, Red chilli, Cold pressed oil',
    variantPrices: {
      '250g': 275,
      '500g': 500,
      '1kg': 1000,
      '2kg': 1950
    }
  },
  {
    id: 'prawn-pickle',
    name: 'Prawn Pickle (Royyala Pachadi)',
    teluguName: 'రొయ్యల పచ్చడి (Royyala Pachadi)',
    category: 'non-veg-pickles',
    categoryLabel: 'Non-Veg Pickles',
    pricePerKg: 1300,
    unit: 'kg',
    tagline: 'Coastal Andhra prawns in rich homemade masala',
    description: 'Fresh coastal prawns cleaned, fried till juicy and tender, steeped in roasted spices, fresh garlic cloves, tangy lemon juice, and aromatic tempering.',
    badge: 'Premium Special',
    image: '/images/prawn-pickle.jpg',
    taste: 'Rich & Fiery',
    rating: 5.0,
    reviewCount: 32,
    ingredients: 'Fresh coastal prawns, Andhra pickle masala, Garlic, Lemon, Fenugreek, Mustard, Pure oil',
    variantPrices: {
      '250g': 350,
      '500g': 650,
      '1kg': 1300,
      '2kg': 2550
    }
  },

  // --- VEG PICKLES ---
  {
    id: 'avakaya',
    name: 'Avakaya Pickle',
    teluguName: 'ఆవకాయ పచ్చడి (గోదావరి రుచి)',
    category: 'veg-pickles',
    categoryLabel: 'Veg Pickles',
    pricePerKg: 400,
    unit: 'kg',
    tagline: 'The King of Andhra Mango Pickles',
    description: 'Traditional Telugu Avakaya prepared with stone-cut raw sour mangoes, fiery Guntur red chillies, freshly ground yellow mustard (aavalu), and cold-pressed gingelly oil.',
    badge: 'Signature',
    image: '/images/avakaya.jpg',
    taste: 'Spicy & Tangy',
    rating: 4.9,
    reviewCount: 56,
    ingredients: 'Raw mango cubes, Yellow mustard seed powder, Guntur chilli, Gingelly oil, Garlic cloves',
    variantPrices: {
      '250g': 110,
      '500g': 200,
      '1kg': 400,
      '2kg': 780
    }
  },
  {
    id: 'gongura',
    name: 'Gongura Pachadi',
    teluguName: 'గోంగూర పచ్చడి (ఆంధ్రా మాత)',
    category: 'veg-pickles',
    categoryLabel: 'Veg Pickles',
    pricePerKg: 400,
    unit: 'kg',
    tagline: 'Iconic Andhra Sorrel Leaf Pickle',
    description: 'Hand-picked red-stem Gongura leaves slow-roasted in cold-pressed oil, pounded with whole red chillies, roasted coriander seeds, fenugreek, and tempered garlic.',
    badge: 'Andhra Icon',
    image: '/images/gongura.jpg',
    taste: 'Tangy & Spicy',
    rating: 4.9,
    reviewCount: 41,
    ingredients: 'Red Gongura leaves, Red chillies, Garlic cloves, Fenugreek, Mustard, Pure gingelly oil',
    variantPrices: {
      '250g': 110,
      '500g': 200,
      '1kg': 400,
      '2kg': 780
    }
  },
  {
    id: 'tomato',
    name: 'Tomato Pickle',
    teluguName: 'టమోటా నిల్వ పచ్చడి',
    category: 'veg-pickles',
    categoryLabel: 'Veg Pickles',
    pricePerKg: 400,
    unit: 'kg',
    tagline: 'Sun-dried country tomato relish',
    description: 'Country tomatoes cooked down to rich pulp, blended with tangy tamarind extract, traditional pickle spices, and aromatic mustard garlic tempering.',
    badge: 'All-Season Favorite',
    image: '/images/tomato.jpg',
    taste: 'Tangy & Spicy',
    rating: 4.8,
    reviewCount: 29,
    ingredients: 'Country tomatoes, Tamarind, Mustard powder, Red chilli, Fenugreek, Gingelly oil',
    variantPrices: {
      '250g': 110,
      '500g': 200,
      '1kg': 400,
      '2kg': 780
    }
  },
  {
    id: 'allam-pickle',
    name: 'Allam (Ginger) Pickle',
    teluguName: 'అల్లం పచ్చడి',
    category: 'veg-pickles',
    categoryLabel: 'Veg Pickles',
    pricePerKg: 400,
    unit: 'kg',
    tagline: 'Spicy, sweet & tangy ginger pickle',
    description: 'Fresh aromatic ginger roots ground with organic jaggery, tamarind, and spicy red chillies. The quintessential Andhra breakfast and rice relish.',
    badge: 'Authentic Flavor',
    image: '/images/allam.jpg',
    taste: 'Sweet, Spicy & Tangy',
    rating: 4.8,
    reviewCount: 25,
    ingredients: 'Fresh ginger root, Jaggery, Tamarind, Red chilli, Mustard, Salt',
    variantPrices: {
      '250g': 110,
      '500g': 200,
      '1kg': 400,
      '2kg': 780
    }
  },

  // --- PINDI VANTALU (SWEETS & SAVOURIES) ---
  {
    id: 'arisalu',
    name: 'Arisalu(22-25 arisalu per kg)',
    teluguName: 'అరిసెలు (నువ్వుల అరిసెలు)',
    category: 'pindi-vantalu',
    categoryLabel: 'Pindi Vantalu',
    pricePerKg: 300,
    unit: 'kg',
    tagline: 'Traditional jaggery & sesame sweet',
    description: 'Slow-cooked soaked rice flour simmered in pure Andhra jaggery syrup, hand-pressed, deep-fried in fresh oil, and garnished with toasted sesame seeds.',
    badge: 'Festive Classic',
    image: '/images/arisalu.jpg',
    taste: 'Sweet',
    rating: 4.9,
    reviewCount: 64,
    ingredients: 'Rice flour, Jaggery, White sesame seeds, Cardamom, Pure ghee/oil',
    variantPrices: {
      '250g': 80,
      '500g': 150,
      '1kg': 300,
      '2kg': 590
    }
  },
  {
    id: 'chekkalu',
    name: 'Pappu Chekkalu(100-120 chekkalu per kg)',
    teluguName: 'చెక్కలు (పప్పు చెక్కలు)',
    category: 'pindi-vantalu',
    categoryLabel: 'Pindi Vantalu',
    pricePerKg: 300,
    unit: 'kg',
    tagline: 'Crispy rice crackers with chana dal',
    description: 'Golden, extra crunchy rice crackers flavored with soaked Bengal gram (chana dal), fresh curry leaves, cumin, and mild green chillies.',
    badge: 'Crunchy Favorite',
    image: '/images/chekkalu.jpg',
    taste: 'Savory & Crunchy',
    rating: 4.9,
    reviewCount: 52,
    ingredients: 'Rice flour, Chana dal, Cumin, Curry leaves, Butter, Mild chilli',
    variantPrices: {
      '250g': 80,
      '500g': 150,
      '1kg': 300,
      '2kg': 590
    }
  },
  {
    id: 'karapusa',
    name: 'Karapusa / Jantikalu',
    teluguName: 'కారప్పూస / జంతికలు',
    category: 'pindi-vantalu',
    categoryLabel: 'Pindi Vantalu',
    pricePerKg: 300,
    unit: 'kg',
    tagline: 'Crispy spiced ribbon savouries',
    description: 'A traditional tea-time companion made with fine gram flour, spiced with carom seeds (vaamu) and red chilli powder, pressed into golden ribbons.',
    badge: 'Tea-Time Special',
    image: '/images/karapusa.jpg',
    taste: 'Savory',
    rating: 4.8,
    reviewCount: 37,
    ingredients: 'Besan flour, Rice flour, Ajwain (Vaamu), Red chilli, Salt',
    variantPrices: {
      '250g': 80,
      '500g': 150,
      '1kg': 300,
      '2kg': 590
    }
  },
  {
    id: 'kajjikayalu',
    name: 'Kajjikayalu(22-25 kajjikayalu per kg)',
    teluguName: 'కజ్జికాయలు (కొబ్బరి కజ్జికాయలు)',
    category: 'pindi-vantalu',
    categoryLabel: 'Pindi Vantalu',
    pricePerKg: 350,
    unit: 'kg',
    tagline: 'Crescent sweets with roasted coconut filling',
    description: 'Flaky crescent pastry shells stuffed with roasted grated coconut, semolina, jaggery, cardamom, and chopped cashews, fried to delicate golden perfection.',
    badge: 'Hand-Pleated',
    image: '/images/kajjikayalu.jpg',
    taste: 'Sweet & Nutty',
    rating: 4.9,
    reviewCount: 45,
    ingredients: 'Fine wheat flour, Dry coconut (Kobbari), Jaggery/Sugar, Semolina, Cardamom, Cashews',
    variantPrices: {
      '250g': 95,
      '500g': 180,
      '1kg': 350,
      '2kg': 690
    }
  },
  {
    id: 'gavvalu',
    name: 'Bellam Gavvalu(110-120 gavvalu per kg)',
    teluguName: 'బెల్లం గవ్వలు',
    category: 'pindi-vantalu',
    categoryLabel: 'Pindi Vantalu',
    pricePerKg: 300,
    unit: 'kg',
    tagline: 'Shell-shaped jaggery coated sweets',
    description: 'Classic shell-patterned bites rolled on wooden planks, crisp-fried, and coated in a glossy caramel-like cardamom jaggery glaze.',
    badge: 'Nostalgic Treat',
    image: '/images/gavvalu.jpg',
    taste: 'Sweet & Crunchy',
    rating: 4.8,
    reviewCount: 28,
    ingredients: 'Wheat flour, Jaggery syrup, Cardamom, Pure ghee',
    variantPrices: {
      '250g': 80,
      '500g': 150,
      '1kg': 300,
      '2kg': 590
    }
  },
  {
    id: 'ravva-laddu',
    name: 'Ravva Laddu(23-26 laddus per kg)',
    teluguName: 'రవ్వ లడ్డూ (నెయ్యి లడ్డూ)',
    category: 'pindi-vantalu',
    categoryLabel: 'Pindi Vantalu',
    pricePerKg: 300,
    unit: 'kg',
    tagline: 'Fragrant semolina & pure Buffalo ghee laddu',
    description: 'Roasted Bombay rava bound with warm pure Buffalo ghee, milk, aromatic green cardamom, golden raisins, and crunchy ghee-roasted cashew nuts.',
    badge: 'Pure Buffalo Ghee',
    image: '/images/ravva-laddu.jpg',
    taste: 'Sweet & Rich',
    rating: 4.9,
    reviewCount: 39,
    ingredients: 'Roasted Semolina, Pure Buffalo ghee, Sugar, Cashews, Raisins, Cardamom',
    variantPrices: {
      '250g': 80,
      '500g': 150,
      '1kg': 300,
      '2kg': 590
    }
  },
  {
    id: 'sunnundalu',
    name: 'Sunnundalu(27-30 sunnundalu per kg)',
    teluguName: 'సున్నుండలు (మినప సున్నుండ)',
    category: 'pindi-vantalu',
    categoryLabel: 'Pindi Vantalu',
    pricePerKg: 300,
    unit: 'kg(28-30Sunnundalu',
    tagline: 'Roasted urad dal & desi ghee laddus',
    description: 'Powerhouse of nutrition and heritage. Roasted black gram lentils finely stone-ground, blended with organic jaggery powder and generous molten ghee.',
    badge: 'Healthy Heritage',
    image: '/images/sunnundalu.jpg',
    taste: 'Sweet & Wholesome',
    rating: 5.0,
    reviewCount: 68,
    ingredients: 'Whole Urad dal (Minapappu), Organic Bellam (Jaggery), Pure Buffalo ghee',
    variantPrices: {
      '250g': 80,
      '500g': 150,
      '1kg': 300,
      '2kg': 590
    }
  },
  {
    id: 'karam-boondhi',
    name: 'Karam Boondhi',
    teluguName: 'కారం బూంది',
    category: 'pindi-vantalu',
    categoryLabel: 'Pindi Vantalu',
    pricePerKg: 300,
    unit: 'kg',
    tagline: 'Spicy boondhi with roasted peanuts & garlic',
    description: 'Tiny crisp chickpea pearls tossed with roasted groundnuts, golden cashews, crispy curry leaves, and hand-pounded garlic chilli seasoning.',
    badge: 'Crispy Snack',
    image: '/images/karam-boondhi.jpg',
    taste: 'Savory & Spicy',
    rating: 4.8,
    reviewCount: 33,
    ingredients: 'Besan flour, Peanuts, Cashews, Curry leaves, Garlic, Red chilli',
    variantPrices: {
      '250g': 80,
      '500g': 150,
      '1kg': 300,
      '2kg': 590
    }
  }
];

export const BRAND_INFO = {
  name: 'Bramarambika Home Foods',
  tagline: 'Traditional Telugu Taste • Homemade with Love',
  heroSubtitle: 'Authentic Pindi Vantalu & Homemade Pickles',
  announcement: 'FREE Delivery on Orders Above ₹1,000 • Flat ₹100 Below ₹1,000 • WhatsApp: 7702808886',
  whatsappNumber: '7702808886',
  whatsappDisplay: '7702808886',
  phoneNumber: '9705449968',
  phoneDisplay: '9705449968',
  location: 'Andhra Pradesh, India',
  years: 'Generational Family Recipes',
  hours: 'Available 7 Days a week • 8:00 AM - 9:00 PM'
};

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sravanthi Reddy',
    location: 'Hyderabad, Telangana',
    rating: 5,
    title: 'Real Andhra taste, just like grandma’s kitchen!',
    text: 'Ordered 1 kg Avakaya and 1/2 kg Arisalu. The oil, yellow mustard pungency, and crunch of the mango pieces are completely authentic. Truly homemade without commercial chemicals!',
    verified: true,
    product: 'Avakaya Pickle'
  },
  {
    id: 2,
    name: 'Murali Krishna V.',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    title: 'Boneless chicken pickle is outstanding',
    text: 'Tender succulent chicken chunks, not rock hard like mass-market bottles. Spice level is spot on Andhra style. Delivered safely within 2 days with leakproof pack.',
    verified: true,
    product: 'Chicken Pickle (Boneless)'
  },
  {
    id: 3,
    name: 'Padmaja Rao',
    location: 'Vijayawada, AP',
    rating: 5,
    title: 'Pure Buffalo ghee Sunnundalu & Arisalu',
    text: 'Bought 1 kg Sunnundalu for my children. The aroma of roasted urad dal and Buffalo ghee was divine. Melt-in-mouth texture. Will keep reordering!',
    verified: true,
    product: 'Sunnundalu'
  }
];

// Helper to get price for a product and variant
export function getProductVariantPrice(product, variantId = '500g') {
  if (product.variantPrices && product.variantPrices[variantId] !== undefined) {
    return product.variantPrices[variantId];
  }
  const variant = WEIGHT_VARIANTS.find(v => v.id === variantId);
  const multiplier = variant ? variant.multiplier : 1.0;
  return Math.round(product.pricePerKg * multiplier);
}
