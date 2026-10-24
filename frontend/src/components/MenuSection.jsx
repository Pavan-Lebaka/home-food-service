import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductShelf from './ProductShelf';
import { CATEGORIES } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import {
  Sparkles,
  Flame,
  Leaf,
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Cookie,
  Check,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CATEGORY_META = {
  all: {
    icon: Sparkles,
    badgeText: 'Curated 18 Recipes',
    badgeClass: 'cat-all'
  },
  'non-veg-pickles': {
    icon: Flame,
    badgeText: 'Fiery & Savoury',
    badgeClass: 'cat-nonveg'
  },
  'veg-pickles': {
    icon: Leaf,
    badgeText: 'Diviseema Nilva',
    badgeClass: 'cat-veg'
  },
  'pindi-vantalu': {
    icon: Cookie,
    badgeText: 'Pure Desi Ghee',
    badgeClass: 'cat-sweets'
  }
};

const QUICK_SEARCH_CHIPS = [
  { label: 'Avakaya', query: 'Avakaya' },
  { label: 'Chicken Pickle', query: 'Chicken' },
  { label: 'Gongura', query: 'Gongura' },
  { label: 'Ariselu', query: 'Ariselu' },
  { label: 'Pappu Chekkalu', query: 'Chekkalu' },
  { label: 'Sunnundalu', query: 'Sunnundalu' }
];

export default function MenuSection({ onAddToCart, onOpenDetails, activeCategory, setActiveCategory }) {
  const { t } = useLanguage();
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('featured');

  const filteredProducts = (products || []).filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery.trim() ||
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.teluguName && p.teluguName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.tagline && p.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortOrder === 'price-asc') return Number(a.pricePerKg || 0) - Number(b.pricePerKg || 0);
    if (sortOrder === 'price-desc') return Number(b.pricePerKg || 0) - Number(a.pricePerKg || 0);
    return 0;
  });

  const nonVegPickles = filteredProducts.filter(p => p.category === 'non-veg-pickles');
  const vegPickles = filteredProducts.filter(p => p.category === 'veg-pickles');
  const pindiVantalu = filteredProducts.filter(p => p.category === 'pindi-vantalu');

  const currentCatInfo = CATEGORIES.find(c => c.id === activeCategory);
  const isSearchActive = searchQuery.trim().length > 0;
  const isFiltered = activeCategory !== 'all' || isSearchActive;

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  const handleChipClick = (query) => {
    if (searchQuery.toLowerCase() === query.toLowerCase()) {
      setSearchQuery('');
    } else {
      setSearchQuery(query);
    }
  };

  return (
    <section id="menu" className="annapurna-catalog-section">
      <div className="container">
        {/* Catalog Navigation Header */}
        <div className="catalog-header-block reveal-on-scroll">
          {/* Eyebrow Badge */}
          <div className="catalog-eyebrow-pill">
            <span className="eyebrow-sparkle-dot" aria-hidden="true" />
            <span className="eyebrow-text">{t('farmHomeFresh')}</span>
            <span className="eyebrow-divider" aria-hidden="true">•</span>
            <span className="eyebrow-count-badge">18 Handcrafted Recipes</span>
          </div>

          {/* Title */}
          <h2 className="catalog-title">
            {t('ourHomemadeSpecials')}
          </h2>

          {/* Subtitle */}
          <p className="catalog-subtitle">
            {t('menuSubtitle')}
          </p>

          {/* Authentic Quality Trust Highlights */}
          <div className="catalog-trust-strip" aria-label="Kitchen standards">
            <span className="catalog-trust-pill">
              <Sparkles size={13} className="trust-pill-icon" aria-hidden="true" />
              <span>Pure Desi Buffalo Ghee</span>
            </span>
            <span className="catalog-trust-pill">
              <Leaf size={13} className="trust-pill-icon" aria-hidden="true" />
              <span>Cold-Pressed Gingelly Oil</span>
            </span>
            <span className="catalog-trust-pill">
              <Flame size={13} className="trust-pill-icon" aria-hidden="true" />
              <span>Guntur Sun-Dried Chillies</span>
            </span>
            <span className="catalog-trust-pill">
              <Check size={13} className="trust-pill-icon" aria-hidden="true" />
              <span>0 Preservatives or Chemicals</span>
            </span>
          </div>

          {/* 1. Category Switcher Deck */}
          <div className="annapurna-category-nav" role="tablist" aria-label="Product categories">
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id;
              const meta = CATEGORY_META[cat.id] || CATEGORY_META.all;
              const Icon = meta.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`category-nav-card ${isActive ? 'is-active' : ''} ${meta.badgeClass}`}
                  id={`tab-${cat.id}`}
                >
                  <div className="category-icon-wrapper" aria-hidden="true">
                    <Icon size={18} className="cat-icon" />
                  </div>
                  <div className="category-label-group">
                    <span className="category-label-title">{cat.label}</span>
                    <span className="category-meta-subtitle">{meta.badgeText}</span>
                  </div>
                  <span className="category-count-pill">{cat.count}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Search & Filter Control Dock */}
          <div className="catalog-control-dock">
            <div className="catalog-search-capsule">
              <div className="search-input-field-wrap">
                <Search size={18} className="search-field-icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholderMenu') || 'Search Avakaya, Arisalu, Chicken pickle...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="catalog-search-field"
                  aria-label="Search delicacies"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="search-clear-capsule-btn"
                    aria-label="Clear search input"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Quick Search Tags */}
              <div className="catalog-quick-chips-row" aria-label="Popular search terms">
                <span className="quick-chips-label">Popular:</span>
                <div className="quick-chips-track">
                  {QUICK_SEARCH_CHIPS.map(chip => {
                    const isChipActive = searchQuery.toLowerCase() === chip.query.toLowerCase();
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => handleChipClick(chip.query)}
                        className={`quick-tag-chip ${isChipActive ? 'is-active' : ''}`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sort & Quick Filter Reset */}
            <div className="catalog-dock-actions">
              <label className="catalog-sort-box" htmlFor="catalog-sort-select">
                <SlidersHorizontal size={15} className="sort-box-icon" aria-hidden="true" />
                <span className="sort-box-label">Sort:</span>
                <div className="sort-select-wrapper">
                  <select
                    id="catalog-sort-select"
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                    aria-label="Sort products"
                    className="catalog-sort-select"
                  >
                    <option value="featured">Featured Favorites</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ChevronDown size={14} className="sort-dropdown-arrow" aria-hidden="true" />
                </div>
              </label>

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="catalog-reset-filters-btn"
                  aria-label="Reset active search and category filters"
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Status Line (when filtering or searching) */}
          {isFiltered && (
            <div className="catalog-results-status-bar">
              <div className="results-status-left">
                <span className="results-count-badge">{filteredProducts.length}</span>
                <span className="results-count-text">
                  {filteredProducts.length === 1 ? 'delicacy found' : 'delicacies found'}
                  {activeCategory !== 'all' && currentCatInfo ? ` in ${currentCatInfo.label}` : ''}
                  {isSearchActive ? ` matching "${searchQuery}"` : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* If searching with zero results */}
        {filteredProducts.length === 0 ? (
          <div className="empty-search-state reveal-on-scroll">
            <p>{t('noResultsFor')} "{searchQuery}".</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-browse-all"
            >
              {t('viewAllSpecials')}
            </button>
          </div>
        ) : (activeCategory !== 'all' || isSearchActive) ? (
          /* Filtered or Single Category View */
          <div className="single-category-view reveal-on-scroll">
            <div className="products-grid-container">
              <div className="annapurna-products-grid">
                {filteredProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="reveal-on-scroll"
                    style={{ transitionDelay: `${(idx % 4) * 70}ms` }}
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      onOpenDetails={onOpenDetails}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Grouped Shelves View (when all categories and no search) */
          <div className="catalog-shelves-container">
            {/* 1. NON-VEG PICKLES SHELF */}
            {nonVegPickles.length > 0 && (
              <ProductShelf
                title={t('nonVegPickles')}
                subtitle={t('nonVegSubtitle')}
                badgeIcon={Flame}
                badgeText={t('fierAndhrSpecials')}
                badgeColor="#A83A24"
                products={nonVegPickles}
                onAddToCart={onAddToCart}
                onOpenDetails={onOpenDetails}
                onViewCategory={() => setActiveCategory('non-veg-pickles')}
                viewCategoryText={t('viewCategory')}
              />
            )}

            {/* 2. VEG PICKLES SHELF */}
            {vegPickles.length > 0 && (
              <ProductShelf
                title={t('vegPickles')}
                subtitle={t('vegSubtitle')}
                badgeIcon={Leaf}
                badgeText={t('traditionalNilva')}
                badgeColor="#2F5D3A"
                products={vegPickles}
                onAddToCart={onAddToCart}
                onOpenDetails={onOpenDetails}
                onViewCategory={() => setActiveCategory('veg-pickles')}
                viewCategoryText={t('viewCategory')}
              />
            )}

            {/* 3. PINDI VANTALU (SWEETS & SAVOURIES) SHELF */}
            {pindiVantalu.length > 0 && (
              <ProductShelf
                title={t('pindiVantalu')}
                subtitle={t('pindiSubtitle')}
                badgeIcon={Sparkles}
                badgeText={t('pureGheeTreats')}
                badgeColor="#D99A17"
                products={pindiVantalu}
                onAddToCart={onAddToCart}
                onOpenDetails={onOpenDetails}
                onViewCategory={() => setActiveCategory('pindi-vantalu')}
                viewCategoryText={t('viewCategory')}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
