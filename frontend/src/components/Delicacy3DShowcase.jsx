import React, { useState } from 'react';
import { Sparkles, ShoppingBag, MessageCircle, RotateCcw, Flame, Leaf, Award } from 'lucide-react';
import SceneContainer from './3d/SceneContainer';
import WarmKitchenEnvironment from './3d/WarmKitchenEnvironment';
import PickleJarModel from './3d/PickleJarModel';
import SnackPlateModel from './3d/SnackPlateModel';
import SpiceBowlModel from './3d/SpiceBowlModel';
import { OrbitControls, Float } from '@react-three/drei';
import { useLanguage } from '../context/LanguageContext';
import { getProductVariantPrice } from '../data/products';

const SHOWCASE_TABS = [
  {
    id: 'avakaya',
    title: 'Andhra Avakaya',
    teluguTitle: 'ఆవకాయ పచ్చడి',
    category: 'veg-pickles',
    productId: 'avakaya-pickle',
    type: 'pickle',
    pickleType: 'avakaya',
    icon: Flame,
    color: '#D99A17',
    badge: 'Flagship Monarch',
    highlight: 'Sour raw mango pieces, Guntur red chilli powder, stone-ground mustard, garlic & cold-pressed oil.',
    pricePerKg: 449,
    startingPrice: '₹129 for 250g'
  },
  {
    id: 'arisalu',
    title: 'Traditional Ariselu',
    teluguTitle: 'సంప్రదాయ అరిసెలు',
    category: 'pindi-vantalu',
    productId: 'arisalu',
    type: 'snack',
    snackId: 'arisalu',
    icon: Sparkles,
    color: '#A83A24',
    badge: 'Festive Sweet',
    highlight: 'Wet harvested rice flour, pure organic Bellam jaggery syrup, cardamom, and toasted white sesame crust.',
    pricePerKg: 349,
    startingPrice: '₹109 for 250g'
  },
  {
    id: 'chekkalu',
    title: 'Pappu Chekkalu',
    teluguTitle: 'పప్పు చెక్కలు',
    category: 'pindi-vantalu',
    productId: 'pappu-chekkalu',
    type: 'snack',
    snackId: 'pappu-chekkalu',
    icon: Leaf,
    color: '#2F5D3A',
    badge: 'Tea-Time Classic',
    highlight: 'Hand-pressed spiced rice discs studded with soaked chana dal lentils, cumin seeds and aromatic curry leaves.',
    pricePerKg: 349,
    startingPrice: '₹109 for 250g'
  },
  {
    id: 'spices',
    title: 'Traditional Spices & Podis',
    teluguTitle: 'సంప్రదాయ కారప్పొడులు & సుగంధాలు',
    category: 'spices',
    productId: 'spices',
    type: 'podi',
    podiType: 'karampodi',
    icon: Award,
    color: '#E67E22',
    badge: 'Aroma Heritage',
    highlight: 'Slow-roasted Guntur chillies, aromatic curry leaves, cumin, coriander and garlic ground on stone pestles.',
    pricePerKg: 399,
    startingPrice: 'Aromatic Spice Heritage'
  }
];

export default function Delicacy3DShowcase({ onAddToCart, onOpenDetails, onWhatsAppOrder }) {
  const { t } = useLanguage();
  const [activeTabId, setActiveTabId] = useState('avakaya');
  const activeTab = SHOWCASE_TABS.find(t => t.id === activeTabId) || SHOWCASE_TABS[0];

  const handleAddActive = (e) => {
    e.stopPropagation();
    if (activeTab.productId === 'spices') {
      const menuEl = document.getElementById('menu');
      menuEl?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // Fake mini-product payload to match handleAddToCart
    const mockProduct = {
      id: activeTab.productId,
      name: activeTab.title,
      teluguName: activeTab.teluguTitle,
      category: activeTab.category,
      pricePerKg: activeTab.pricePerKg,
      image: 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220635/bramarambika_foods/avakaya.jpg'
    };
    onAddToCart?.({
      product: mockProduct,
      variantId: '500g',
      variantLabel: '1/2 kg',
      unitPrice: Math.round(activeTab.pricePerKg * 0.5),
      quantity: 1
    });
  };

  return (
    <section className="delicacy-3d-showcase-section" aria-label="Interactive 3D Food Experience">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center" style={{ marginBottom: '2.5rem' }}>
          <div className="section-pill-tag">
            <Sparkles size={14} color="#D99A17" />
            <span>Interactive 3D Experience</span>
          </div>
          <h2 className="section-title">
            Explore Diviseema Flavours in 3D
          </h2>
          <p className="section-subtitle">
            Interact with our traditional glass jaadi pickle jars and brass thali sweets. Touch or drag to rotate 360°.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="showcase-tabs-bar" role="tablist">
          {SHOWCASE_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTabId(tab.id)}
                className={`showcase-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} color={isActive ? '#FFFFFF' : tab.color} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Main 3D Interactive Stage Card */}
        <div className="showcase-stage-card">
          <div className="showcase-stage-grid">
            {/* Left / Center: Interactive 3D Canvas */}
            <div className="showcase-canvas-col">
              <SceneContainer
                camera={{
                  position: [0, activeTab.type === 'snack' ? 1.6 : 0.8, activeTab.type === 'snack' ? 2.8 : 3.4],
                  fov: 42
                }}
                loadingLabel={`Preparing 3D ${activeTab.title}...`}
                style={{ height: '420px', minHeight: '380px', borderRadius: '16px' }}
              >
                <WarmKitchenEnvironment
                  showShadows={true}
                  shadowOpacity={0.65}
                  shadowScale={activeTab.type === 'snack' ? 3.8 : 3.4}
                  groundY={activeTab.type === 'snack' ? -0.1 : -0.85}
                />

                <Float
                  speed={1.5}
                  rotationIntensity={0.25}
                  floatIntensity={0.35}
                  floatingRange={[-0.03, 0.03]}
                >
                  {activeTab.type === 'pickle' && (
                    <PickleJarModel
                      pickleType={activeTab.pickleType}
                      isHero={false}
                      floatingIngredients={true}
                      autoRotate={true}
                      scale={1.15}
                    />
                  )}

                  {activeTab.type === 'snack' && (
                    <SnackPlateModel
                      snackId={activeTab.snackId}
                      plateType="brass"
                      autoRotate={true}
                      scale={1.25}
                    />
                  )}

                  {activeTab.type === 'podi' && (
                    <SpiceBowlModel
                      podiType={activeTab.podiType}
                      autoRotate={true}
                      scale={1.25}
                    />
                  )}
                </Float>

                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 1.88}
                  rotateSpeed={0.7}
                  dampingFactor={0.06}
                />
              </SceneContainer>

              {/* Interaction Hint */}
              <div className="showcase-hint-badge">
                <RotateCcw size={13} />
                <span>Drag to spin 360° • Real-time WebGL</span>
              </div>
            </div>

            {/* Right: Authentic Delicacy Story & Fast Order Controls */}
            <div className="showcase-info-col">
              <div className="showcase-badge-pill" style={{ borderColor: activeTab.color }}>
                <span className="dot" style={{ background: activeTab.color }} />
                <span>{activeTab.badge}</span>
              </div>

              <h3 className="showcase-food-title">
                {activeTab.title}
              </h3>
              <div className="showcase-food-telugu">
                {activeTab.teluguTitle}
              </div>

              <p className="showcase-food-desc">
                {activeTab.highlight}
              </p>

              <div className="showcase-features-list">
                <div className="showcase-feat-item">
                  <span className="check">✓</span>
                  <span>Pure cold-pressed groundnut oil & desi ghee</span>
                </div>
                <div className="showcase-feat-item">
                  <span className="check">✓</span>
                  <span>Zero preservatives or commercial additives</span>
                </div>
                <div className="showcase-feat-item">
                  <span className="check">✓</span>
                  <span>Leak-proof hygienic 5-layer food grade packing</span>
                </div>
              </div>

              <div className="showcase-pricing-row">
                <div>
                  <span className="starting-label">Fresh Batches: </span>
                  <span className="price-tag">{activeTab.startingPrice}</span>
                </div>
              </div>

              {/* Real HTML Buttons — 3D never blocks shopping actions */}
              <div className="showcase-action-btns">
                {activeTab.productId !== 'spices' && (
                  <button
                    type="button"
                    onClick={handleAddActive}
                    className="showcase-add-cart-btn"
                  >
                    <ShoppingBag size={16} />
                    <span>Add 1/2 kg to Cart • ₹{Math.round(activeTab.pricePerKg * 0.5)}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const menuEl = document.getElementById('menu');
                    menuEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="showcase-explore-btn"
                >
                  <span>Explore Full Menu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
