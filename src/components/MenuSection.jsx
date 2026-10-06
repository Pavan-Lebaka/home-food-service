import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { Sparkles, Utensils, Flame, Leaf, Search } from 'lucide-react';

export default function MenuSection({ onAddToCart, onOpenDetails, activeCategory, setActiveCategory }) {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <section id="menu" className="annapurna-catalog-section">
      <div className="container">
        {/* Catalog Navigation Header */}
        <div className="catalog-header-block">
          <div className="section-pre-pill">
            <Utensils size={14} />
            <span>Farm & Home Fresh</span>
          </div>

          <h2 className="catalog-title">
            Our Homemade Specials
          </h2>

          <p className="catalog-subtitle">
            Authentic Andhra taste crafted using stone-ground spices, cold-pressed oils, and pure desi cow ghee. Select weights in <strong>250g, 1/2 kg, or 1 kg</strong> packs.
          </p>

          {/* Search & Filter Toolbar */}
          <div className="catalog-toolbar">
            {/* Search Input */}
            <div className="catalog-search-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search Avakaya, Arisalu, Chicken pickle..."
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

        {/* If searching or specific tab */}
        {filteredProducts.length === 0 ? (
          <div className="empty-search-state">
            <p>No homemade specials matched your search for "{searchQuery}".</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="btn-browse-all"
            >
              View All Specials
            </button>
          </div>
        ) : activeCategory !== 'all' ? (
          /* Single Category View */
          <div className="products-grid-container">
            <div className="annapurna-products-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Grouped by Authentic Collections (Non-Veg Pickles, Veg Pickles, Pindi Vantalu) */
          <div className="catalog-grouped-sections">
            {/* 1. NON-VEG PICKLES */}
            {nonVegPickles.length > 0 && (
              <div className="collection-group-block" id="non-veg-pickles-block">
                <div className="collection-group-header">
                  <div className="group-title-col">
                    <div className="group-badge-line">
                      <Flame size={15} color="#A83A24" />
                      <span>Fiery Andhra Specials</span>
                    </div>
                    <h3 className="group-title">Non Veg Pickles</h3>
                    <p className="group-subtitle">Slow-cooked tender chunks steeped in aromatic stone-ground masala and cold-pressed oil.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('non-veg-pickles')}
                    className="group-view-all-btn"
                  >
                    View Category ({nonVegPickles.length})
                  </button>
                </div>

                <div className="annapurna-products-grid">
                  {nonVegPickles.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      onOpenDetails={onOpenDetails}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. VEG PICKLES */}
            {vegPickles.length > 0 && (
              <div className="collection-group-block" id="veg-pickles-block">
                <div className="collection-group-header">
                  <div className="group-title-col">
                    <div className="group-badge-line">
                      <Leaf size={15} color="#2F5D3A" />
                      <span>Traditional Nilva Pachallu</span>
                    </div>
                    <h3 className="group-title">Veg Pickles</h3>
                    <p className="group-subtitle">Aged in traditional ceramic jaadi jars with yellow mustard, Guntur chillies, and cold-pressed gingelly oil.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('veg-pickles')}
                    className="group-view-all-btn"
                  >
                    View Category ({vegPickles.length})
                  </button>
                </div>

                <div className="annapurna-products-grid">
                  {vegPickles.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      onOpenDetails={onOpenDetails}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. PINDI VANTALU (SWEETS & CRISPY SAVOURIES) */}
            {pindiVantalu.length > 0 && (
              <div className="collection-group-block" id="pindi-vantalu-block">
                <div className="collection-group-header">
                  <div className="group-title-col">
                    <div className="group-badge-line">
                      <Sparkles size={15} color="#D99A17" />
                      <span>Pure Ghee & Hand-Pressed Treats</span>
                    </div>
                    <h3 className="group-title">Pindi Vantalu (Sweets & Savouries)</h3>
                    <p className="group-subtitle">Handcrafted with pure aged jaggery, pure cow ghee, and crisp rice flour using ancestral festive recipes.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('pindi-vantalu')}
                    className="group-view-all-btn"
                  >
                    View Category ({pindiVantalu.length})
                  </button>
                </div>

                <div className="annapurna-products-grid">
                  {pindiVantalu.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      onOpenDetails={onOpenDetails}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
