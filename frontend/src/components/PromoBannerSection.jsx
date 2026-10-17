import React from 'react';
import {
  Sparkles, Gift, MessageCircle, Phone, ArrowRight,
  Maximize2, Plus, Heart, ShieldCheck, Truck, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BANNER_SPECIAL_IDS, BRAND_INFO } from '../data/products';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../context/ProductsContext';

export default function PromoBannerSection({
  onOpenBannerModal,
  onAddToCart,
  onOpenCart,
  onSelectCategory
}) {
  const { t } = useLanguage();
  const { products } = useProducts();

  // The 5 traditional delicacies highlighted in the banner
  const bannerProducts = (products || []).filter(p => BANNER_SPECIAL_IDS.includes(p.id));

  // Festive WhatsApp link with pre-filled message
  const festiveWhatsAppMessage = encodeURIComponent(
    `Hello ${BRAND_INFO.name},\n\nI saw your grand Festive Offer banner on your website and would like to place an order and claim the FIRST ORDER SURPRISE GIFT (Village Authentic Food)!\n\nPlease share today's festive batch menu.\n\nThank you!`
  );
  const cleanPhone = BRAND_INFO.whatsappNumber.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const whatsappUrl = `https://wa.me/${internationalPhone}?text=${festiveWhatsAppMessage}`;

  const handleCelebrate = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }
  };

  const handleNavigateToMenu = () => {
    handleCelebrate();
    if (onSelectCategory) {
      onSelectCategory('all');
    }
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="promo-offer" className="festive-offer-section reveal-on-scroll" aria-label="Grand Festive Offer">
      <div className="container">
        {/* Festive Header */}
        <div className="festive-section-header">
          <div className="festive-top-pill">
            <span className="festive-diya-icon">🪔</span>
            <span>పండుగ ప్రత్యేక ఆఫర్ • GRAND FESTIVE CELEBRATION OFFER</span>
            <Sparkles size={14} className="festive-sparkle-icon" />
          </div>

          <h2 className="festive-main-title">
            Traditional Telugu Taste, Homemade with Love
          </h2>

          <div className="festive-telugu-slogan">
            మన ఇంటి రుచి, మీ ఇంటికే ❤️ సంప్రదాయ పండుగ పిండివంటలు & పచ్చళ్ళు
          </div>

          <p className="festive-subtitle-text">
            Handcrafted village authentic sweets & savouries prepared fresh in pure desi cow ghee & cold-pressed oils.
          </p>
        </div>

        {/* Grand Festive Banner Showcase */}
        <div className="festive-banner-showcase">
          <div className="festive-banner-frame">
            {/* Top Decorative Toranam Ribbon */}
            <div className="festive-toranam-ribbon">
              <span className="toranam-badge">
                <Gift size={14} />
                <span>FIRST ORDER SPECIAL: SURPRISE GIFT OF VILLAGE AUTHENTIC FOOD</span>
              </span>
            </div>

            {/* Main Banner Visual */}
            <div
              className="festive-image-viewport"
              onClick={onOpenBannerModal}
              role="button"
              tabIndex={0}
              aria-label="Click to enlarge official festive banner"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onOpenBannerModal();
                }
              }}
            >
              <img
                src="/images/Banner.jpg"
                alt="Bramarambika Home Foods - Grand Festive Offer Banner: Traditional Telugu Taste with Murukulu, Chekkalu, Ravva Laddu, Sunnundalu, Kajjikayalu and First Order Surprise Gift (Junnu, Country Eggs, Original Honey)"
                className="festive-banner-full-img"
                loading="eager"
              />

              {/* Hover overlay hint */}
              <div className="festive-hover-overlay">
                <span className="festive-zoom-btn">
                  <Maximize2 size={18} />
                  <span>Tap to View Full Poster</span>
                </span>
              </div>
            </div>

            {/* Bottom Festive CTA Action Bar */}
            <div className="festive-banner-action-bar">
              <div className="action-bar-left">
                <div className="festive-offer-callout">
                  <span className="gift-emoji-lead">🎁</span>
                  <div>
                    <div className="callout-heading">Surprise Gift on First Order</div>
                    <div className="callout-desc">
                      Choose <strong>Junnu</strong>, <strong>Country Eggs</strong>, or <strong>Forest Honey</strong> with your delicacies!
                    </div>
                  </div>
                </div>
              </div>

              <div className="action-bar-right">
                <button
                  type="button"
                  onClick={handleNavigateToMenu}
                  className="festive-btn-whatsapp"
                  aria-label="Select items to claim offer"
                >
                  <Sparkles size={18} />
                  <span>{t('selectItemsToClaim')}</span>
                </button>

                <a
                  href={`tel:${BRAND_INFO.phoneNumber}`}
                  className="festive-btn-call"
                  aria-label={`Call us at ${BRAND_INFO.phoneDisplay}`}
                >
                  <Phone size={16} />
                  <span>Call: {BRAND_INFO.phoneDisplay}</span>
                </a>

                <button
                  type="button"
                  onClick={onOpenBannerModal}
                  className="festive-btn-zoom"
                  title="View High-Resolution Banner Poster"
                  aria-label="View High-Resolution Banner Poster"
                >
                  <Maximize2 size={16} />
                  <span>View Poster</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Pillars of Festive Trust */}
          <div className="festive-highlights-strip">
            <div className="festive-highlight-item">
              <Gift size={18} className="highlight-icon terracotta" />
              <div>
                <strong>First Order Gift</strong>
                <span>Junnu, Eggs or Raw Honey</span>
              </div>
            </div>

            <div className="festive-highlight-item">
              <Truck size={18} className="highlight-icon green" />
              <div>
                <strong>FREE Delivery Above ₹1,000</strong>
                <span>Pan-India secure dispatch</span>
              </div>
            </div>

            <div className="festive-highlight-item">
              <Flame size={18} className="highlight-icon gold" />
              <div>
                <strong>Daily Fresh Batches</strong>
                <span>Pure Desi Ghee & Cold-Pressed Oils</span>
              </div>
            </div>

            <div className="festive-highlight-item">
              <ShieldCheck size={18} className="highlight-icon green" />
              <div>
                <strong>Zero Preservatives</strong>
                <span>Generational Telugu recipes</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Delicacies Featured on the Banner */}
        <div className="festive-specials-shelf">
          <div className="festive-shelf-header">
            <div>
              <div className="shelf-pill-gold">
                <Sparkles size={13} />
                <span>HANDCRAFTED FESTIVE DELICACIES</span>
              </div>
              <h3 className="festive-shelf-title">
                Traditional Delicacies Featured on Our Banner
              </h3>
              <p className="festive-shelf-sub">
                Prepared by traditional village artisans using time-honored recipes, pure cow ghee, and wooden-press oils.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const menuEl = document.getElementById('menu');
                if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="festive-view-all-btn"
            >
              <span>View Full Menu</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* 5 Delicacies Cards Grid */}
          <div className="festive-delicacies-grid">
            {bannerProducts.map((product) => {
              const halfKgPrice = product.variantPrices?.['500g'] || Math.round(product.pricePerKg * 0.5);

              return (
                <div key={product.id} className="festive-delicacy-card">
                  <div className="delicacy-img-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="delicacy-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = product.category === 'pindi-vantalu' ? '/images/arisalu.jpg' : '/images/avakaya.jpg';
                      }}
                    />
                    <span className="delicacy-badge">{product.badge || 'Banner Special'}</span>
                  </div>

                  <div className="delicacy-body">
                    <h4 className="delicacy-title">{product.name}</h4>
                    <span className="delicacy-telugu">{product.teluguName}</span>
                    <p className="delicacy-tagline">{product.tagline}</p>

                    <div className="delicacy-footer">
                      <div className="delicacy-price-box">
                        <span className="delicacy-price-unit">1/2 kg pack</span>
                        <span className="delicacy-price-value">₹{halfKgPrice}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onAddToCart({
                            product,
                            variantId: '500g',
                            variantLabel: '1/2 kg',
                            unitPrice: halfKgPrice,
                            quantity: 1
                          });
                          try {
                            confetti({
                              particleCount: 25,
                              spread: 45,
                              origin: { y: 0.8 }
                            });
                          } catch (e) {}
                        }}
                        className="delicacy-add-btn"
                        title={`Add 1/2 kg ${product.name} to cart`}
                        aria-label={`Add 1/2 kg ${product.name}`}
                      >
                        <Plus size={14} />
                        <span>Add 1/2 kg</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
