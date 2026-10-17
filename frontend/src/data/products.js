export const WEIGHT_VARIANTS = [
  { id: '250g', label: '250 g', displayLabel: '250 g (1/4 kg)', multiplier: 0.25 },
  { id: '500g', label: '1/2 kg', displayLabel: '500 g (1/2 kg)', multiplier: 0.5 },
  { id: '1kg', label: '1 kg', displayLabel: '1 kg', multiplier: 1.0 },
  { id: '2kg', label: '2 kg', displayLabel: '2 kg', multiplier: 2.0 }
];

export const CATEGORIES = [
  { id: 'all', label: 'All Specials', count: 17 },
  { id: 'non-veg-pickles', label: 'Non-Veg Pickles', count: 2, bg: '#F1E2C5' },
  { id: 'veg-pickles', label: 'Veg Pickles', count: 6, bg: '#E8F0E3' },
  { id: 'pindi-vantalu', label: 'Pindi Vantalu (Sweets & Snacks)', count: 9, bg: '#FFFCF7' },
];

export const FEATURED_COLLECTIONS = [
  {
    id: 'non-veg-pickles',
    title: 'Non-Veg Pickles',
    subtitle: 'Chicken & Coastal Prawns',
    image: 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220652/bramarambika_foods/nonveg-pickles.jpg',
    startingPrice: 'From ₹249',
    tag: 'Spicy & Fiery'
  },
  {
    id: 'veg-pickles',
    title: 'Veg Pickles',
    subtitle: 'Avakaya, Gongura, Cauliflower & Dondakaya',
    image: 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220662/bramarambika_foods/veg-pickles.jpg',
    startingPrice: 'From ₹109',
    tag: 'Diviseema Icons'
  },
  {
    id: 'pindi-vantalu',
    title: 'Traditional Sweets',
    subtitle: 'Arisalu, Sunnundalu, Ravva Laddu & Kajjikayalu',
    image: 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220660/bramarambika_foods/sweets.jpg',
    startingPrice: 'From ₹79',
    tag: 'Pure Desi Ghee'
  },
  {
    id: 'pindi-vantalu-hot',
    categoryTarget: 'pindi-vantalu',
    title: 'Crispy Savouries',
    subtitle: 'Pappu Chekkalu, Karapusa & Karam Boondhi',
    image: 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220656/bramarambika_foods/savouries.jpg',
    startingPrice: 'From ₹79',
    tag: 'Crunchy Snacks'
  }
];

// Live products are served dynamically from the Database API via useProducts()
export const PRODUCTS = [];

export const BRAND_INFO = {
  name: 'Bramarambika Home Foods',
  tagline: 'Traditional Telugu Taste • Homemade with Love',
  heroSubtitle: 'Authentic Pindi Vantalu & Homemade Pickles',
  announcement: `FREE Delivery on Orders Above ₹2,000 • Flat ₹100 Below ₹2,000 • WhatsApp: ${import.meta.env.VITE_WHATSAPP_NUMBER || '7793910819'}`,
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '7793910819',
  whatsappDisplay: import.meta.env.VITE_WHATSAPP_NUMBER || '7793910819',
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
    title: 'Chicken pickle is outstanding',
    text: 'Tender succulent chicken chunks, not rock hard like mass-market bottles. Spice level is spot on Diviseema style. Delivered safely within 2 days with leakproof pack.',
    verified: true,
    product: 'Chicken Pickle'
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

// 5 specialties highlighted in official promotional Banner.jpg
export const BANNER_SPECIAL_IDS = [
  'murukulu',
  'chekkalu',
  'ravva-laddu',
  'sunnundalu',
  'kajjikayalu'
];

// 3 First-Order Surprise Gifts from Banner.jpg
export const PROMO_GIFTS = [
  {
    id: 'junnu',
    name: 'Junnu',
    teluguName: 'జున్ను',
    subtitle: 'Traditional Milk Sweet',
    teluguSubtitle: 'సంప్రదాయ పాల మిఠాయి',
    badge: 'Sweet Heritage',
    valueText: '₹150 Value • FREE',
    description: 'Creamy authentic village colostrum milk pudding slow-steamed with black pepper and cardamom.',
    imageLabel: 'Junnu',
    emoji: '🍮'
  },
  {
    id: 'country-eggs',
    name: 'Country Eggs',
    teluguName: 'నాటుకోడి గుడ్లు',
    subtitle: 'Farm Fresh & Natural',
    teluguSubtitle: 'ఫార్మ్ ఫ్రెష్ & సహజమైనవి',
    badge: 'Farm Fresh',
    valueText: '₹120 Value • FREE',
    description: 'Free-range country chicken eggs direct from village poultry, pure and unadulterated.',
    imageLabel: 'Country Eggs',
    emoji: '🥚'
  },
  {
    id: 'honey',
    name: 'Original Honey',
    teluguName: 'అసలైన తేనె',
    subtitle: 'Pure • Natural • Healthy',
    teluguSubtitle: 'స్వచ్ఛమైన • సహజమైన • ఆరోగ్యకరమైన',
    badge: '100% Pure Forest Honey',
    valueText: '₹180 Value • FREE',
    description: 'Raw, unprocessed wild forest honey harvested with traditional care for optimal health & immunity.',
    imageLabel: 'Original Honey',
    emoji: '🍯'
  }
];

