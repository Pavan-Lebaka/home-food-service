import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductShelf from './ProductShelf';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { Sparkles, Utensils, Flame, Leaf, Search, LayoutGrid, MoveHorizontal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MenuSection({ onAddToCart, onOpenDetails, activeCategory, setActiveCategory }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('shelf'); // 'shelf' or 'grid'

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teluguName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const nonVegPickles = filteredProducts.filter(p => p.category === 'non-veg-pickles');
  const vegPickles = filteredProducts.filter(p => p.category === 'veg-pickles');
  const pindiVantalu = filteredProducts.filter(p => p.category === 'pindi-vantalu');

  const currentCatInfo = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <section id="menu" className="annapurna-catalog-section">
      <div className="container">
        {/* Catalog Navigation Header */}
        <div className="catalog-header-block reveal-on-scroll">
          <div className="section-pre-pill">
            <Utensils size={14} />
            <span>{t('farmHomeFresh')}</span>
          </div>

          <h2 className="catalog-title">
            {t('ourHomemadeSpecials')}
          </h2>

          <p className="catalog-subtitle">
            {t('menuSubtitle')}
          </p>

          {/* Search & Filter Toolbar */}
          <div className="catalog-toolbar">
            {/* Search Input */}
            <div className="catalog-search-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder={t('searchPlaceholderMenu')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="catalog-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="annapurna-tabs-row" role="tablist">
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`annapurna-tab-btn ${isActive ? 'active' : ''}`}
                    id={`tab-${cat.id}`}
                  >
                    <span>{cat.label}</span>
                    <span className="tab-count-badge">{cat.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* If searching with zero results */}
        {filteredProducts.length === 0 ? (
          <div className="empty-search-state reveal-on-scroll">
            <p>{t('noResultsFor')} "{searchQuery}".</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="btn-browse-all"
            >
              {t('viewAllSpecials')}
            </button>
          </div>
        ) : activeCategory !== 'all' ? (
          /* Single Category Selected View */
          <div className="single-category-view reveal-on-scroll">
            {/* Category View Mode Switcher */}
            <div className="category-view-toolbar">
              <div className="category-meta-info">
                <span className="category-label-active">{currentCatInfo ? currentCatInfo.label : activeCategory}</span>
                <span className="category-count-sub">({filteredProducts.length} items)</span>
              </div>

              <div className="view-mode-toggle">
                <button
                  type="button"
                  onClick={() => setViewMode('shelf')}
                  className={`view-mode-btn ${viewMode === 'shelf' ? 'active' : ''}`}
                  title="Side scroll shelf"
                  aria-label="Side scroll view"
                >
                  <MoveHorizontal size={15} />
                  <span>Side Scroll</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  title="Grid view"
                  aria-label="Grid view"
                >
                  <LayoutGrid size={15} />
                  <span>Grid</span>
                </button>
              </div>
            </div>

            {viewMode === 'shelf' ? (
              <ProductShelf
                title=""
                products={filteredProducts}
                onAddToCart={onAddToCart}
                onOpenDetails={onOpenDetails}
              />
            ) : (
              <div className="products-grid-container">
                <div className="annapurna-products-grid">
                  {filteredProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      className="reveal-on-scroll"
                      style={{ animationDelay: `${(idx % 4) * 0.08}s` }}
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
            )}
          </div>
        ) : (
          /* Grouped by Side-Scrolling Shelves (Non-Veg Pickles, Veg Pickles, Pindi Vantalu) */
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
