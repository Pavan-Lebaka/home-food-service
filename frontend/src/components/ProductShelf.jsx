import React, { useRef, useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight, MoveHorizontal, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ProductShelf({
  title,
  subtitle,
  badgeIcon: BadgeIcon,
  badgeText,
  badgeColor = '#A83A24',
  products = [],
  onAddToCart,
  onOpenDetails,
  onViewCategory,
  viewCategoryText
}) {
  const { t } = useLanguage();
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScrollState = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScroll - 10);
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
    }
  };

  useEffect(() => {
    checkScrollState();
    const el = trackRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollState, { passive: true });
      window.addEventListener('resize', checkScrollState);
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScrollState);
      }
      window.removeEventListener('resize', checkScrollState);
    };
  }, [products]);

  const handleScroll = (direction) => {
    if (!trackRef.current) return;
    const scrollAmount = trackRef.current.clientWidth * 0.75;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleTrackBarClick = (e) => {
    if (!trackRef.current) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const maxScroll = trackRef.current.scrollWidth - trackRef.current.clientWidth;
    trackRef.current.scrollTo({
      left: maxScroll * percentage,
      behavior: 'smooth'
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="product-shelf-block reveal-on-scroll">
      {/* Shelf Header */}
      <div className="shelf-header">
        <div className="shelf-header-info">
          {badgeText && (
            <div className="shelf-badge-pill">
              {BadgeIcon && <BadgeIcon size={14} color={badgeColor} />}
              <span>{badgeText}</span>
            </div>
          )}
          <h3 className="shelf-title">{title}</h3>
          {subtitle && <p className="shelf-subtitle">{subtitle}</p>}
        </div>

        {/* Shelf Action Buttons & Controls */}
        <div className="shelf-controls-group">
          {onViewCategory && (
            <button
              type="button"
              onClick={onViewCategory}
              className="shelf-view-category-btn"
            >
              <span>{viewCategoryText || t('viewCategory')}</span>
              <span className="shelf-count-badge">({products.length})</span>
            </button>
          )}

          {/* Header Navigation Arrows */}
          <div className="shelf-arrow-buttons" aria-label="Horizontal scroll controls">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`shelf-nav-arrow ${!canScrollLeft ? 'disabled' : ''}`}
              aria-label={t('scrollLeft') || 'Scroll left'}
              title="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`shelf-nav-arrow ${!canScrollRight ? 'disabled' : ''}`}
              aria-label={t('scrollRight') || 'Scroll right'}
              title="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Track Relative Wrapper (holds floating arrows, scroll track, and edge fade) */}
      <div className="shelf-track-relative-wrap">
        {/* Floating Left Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="shelf-floating-arrow shelf-floating-left"
            aria-label={t('scrollLeft') || 'Scroll left'}
            title="Scroll left"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Floating Right Arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="shelf-floating-arrow shelf-floating-right"
            aria-label={t('scrollRight') || 'Scroll right'}
            title="Scroll right"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Horizontal Side-Scrolling Track */}
        <div
          ref={trackRef}
          className="product-shelf-track"
          tabIndex={0}
          role="region"
          aria-label={`${title} scroller`}
        >
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="shelf-item-card-wrapper reveal-on-scroll"
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

        {/* Right Edge Glow/Fade to indicate more items */}
        {canScrollRight && <div className="shelf-edge-gradient-hint" />}
      </div>

      {/* Prominent Visible Scroller Bar & Instruction (Makes it 100% obvious this is a scroller) */}
      <div className="shelf-scroller-footer">
        <div
          className="shelf-progress-track-bar"
          onClick={handleTrackBarClick}
          role="slider"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(scrollProgress)}
          aria-label="Scroll position bar"
          title="Click to jump across items"
        >
          <div
            className="shelf-progress-thumb"
            style={{ width: `${Math.max(18, scrollProgress)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
