import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ShoppingCart, ArrowRight } from 'lucide-react';
import { PRODUCTS, getProductVariantPrice } from '../data/products';
import { formatCurrency } from '../lib/whatsapp';

export default function SearchModal({ isOpen, onClose, onSelectProduct }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Strict scroll lock when search modal is active
  useEffect(() => {
    if (!isOpen) return;
    const origBody = document.body.style.overflow;
    const origHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origHtml;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query.trim()
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.teluguName.toLowerCase().includes(query.toLowerCase()) ||
        p.tagline.toLowerCase().includes(query.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(query.toLowerCase())
      )
    : PRODUCTS.slice(0, 5); // Default popular recommendations

  return (
    <div className="search-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="search-modal-box" onClick={e => e.stopPropagation()}>
        <div className="search-input-header">
          <Search size={20} className="search-box-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pickles, arisalu, chekkalu, prawn pickle..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="search-modal-input"
          />
          <button onClick={onClose} className="search-close-icon" aria-label="Close search">
            <X size={20} />
          </button>
        </div>

        <div className="search-results-list">
          <div className="search-results-heading">
            {query.trim() ? `Search Results (${results.length})` : 'Popular Recommendations'}
          </div>

          {results.length === 0 ? (
            <div className="search-no-results">
              No products found matching "{query}".
            </div>
          ) : (
            results.map(product => {
              const halfKgPrice = getProductVariantPrice(product, '500g');
              return (
                <div
                  key={product.id}
                  className="search-result-item"
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img src={product.image} alt={product.name} className="result-thumb" />
                  <div className="result-info">
                    <div className="result-name">{product.name}</div>
                    <div className="result-telugu">{product.teluguName}</div>
                    <div className="result-price">
                      From ₹{halfKgPrice} <span className="price-unit">(1/2 kg)</span>
                    </div>
                  </div>
                  <div className="result-action">
                    <span>View & Select Weight</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
