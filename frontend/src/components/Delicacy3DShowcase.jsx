import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ShoppingBag, RotateCcw, Flame, Leaf } from 'lucide-react';
import SceneContainer from './3d/SceneContainer';
import WarmKitchenEnvironment from './3d/WarmKitchenEnvironment';
import PickleJarModel from './3d/PickleJarModel';
import SnackPlateModel from './3d/SnackPlateModel';
import { OrbitControls, Float } from '@react-three/drei';
import { getProductVariantPrice, PRODUCTS } from '../data/products';
import { useProducts } from '../context/ProductsContext';

const SHOWCASE_TABS = [
  {
    id: 'avakaya',
    productId: 'avakaya-pickle',
    type: 'pickle',
    pickleType: 'avakaya',
    icon: Flame,
    color: '#D99A17',
    badge: 'Vegetable pickle',
  },
  {
    id: 'arisalu',
    productId: 'arisalu',
    type: 'snack',
    snackId: 'arisalu',
    icon: Sparkles,
    color: '#A83A24',
    badge: 'Traditional sweet',
  },
  {
    id: 'chekkalu',
    productId: 'pappu-chekkalu',
    type: 'snack',
    snackId: 'pappu-chekkalu',
    icon: Leaf,
    color: '#2F5D3A',
    badge: 'Traditional savoury',
  },
  {
    id: 'chicken',
    productId: 'chicken-pickle',
    type: 'pickle',
    pickleType: 'chicken',
    icon: Flame,
    color: '#9F3928',
    badge: 'Non-vegetarian pickle',
  }
];

export default function Delicacy3DShowcase({ onAddToCart, onOpenDetails, onWhatsAppOrder }) {
  const { products } = useProducts();
  const sectionRef = useRef(null);
  const [shouldRenderScene, setShouldRenderScene] = useState(false);
  const [activeTabId, setActiveTabId] = useState('avakaya');
  const catalogProducts = products?.length ? products : PRODUCTS;
  const visibleTabs = SHOWCASE_TABS.filter(tab => catalogProducts.some(product => product.id === tab.productId));
  const activeTab = visibleTabs.find(tab => tab.id === activeTabId) || visibleTabs[0] || SHOWCASE_TABS[0];
  const activeProduct = catalogProducts.find(product => product.id === activeTab.productId);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || shouldRenderScene) return undefined;
    if (!('IntersectionObserver' in window)) {
      setShouldRenderScene(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldRenderScene(true);
        observer.disconnect();
      }
    }, { rootMargin: '240px 0px' });
    observer.observe(section);
    return () => observer.disconnect();
  }, [shouldRenderScene]);

  const handleAddActive = (e) => {
    e.stopPropagation();
    if (!activeProduct) return;
    onAddToCart?.({
      product: activeProduct,
      variantId: '500g',
      variantLabel: '1/2 kg',
      unitPrice: getProductVariantPrice(activeProduct, '500g'),
      quantity: 1
    });
  };

  return (
    <section ref={sectionRef} className="delicacy-3d-showcase-section" aria-label="Interactive 3D Food Experience">
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
          {visibleTabs.map(tab => {
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
                <span>{catalogProducts.find(product => product.id === tab.productId)?.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main 3D Interactive Stage Card */}
        <div className="showcase-stage-card">
          <div className="showcase-stage-grid">
            {/* Left / Center: Interactive 3D Canvas */}
            <div className="showcase-canvas-col">
              {shouldRenderScene ? <SceneContainer
                camera={{
                  position: [0, activeTab.type === 'snack' ? 1.6 : 0.8, activeTab.type === 'snack' ? 2.8 : 3.4],
                  fov: 42
                }}
                loadingLabel={`Preparing 3D ${activeProduct?.name}...`}
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

                </Float>

                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 1.88}
                  rotateSpeed={0.7}
                  dampingFactor={0.06}
                />
              </SceneContainer> : <div className="showcase-static-preview"><img src={activeProduct?.image} alt={activeProduct?.name || 'Product preview'} loading="lazy" /><span>Interactive 3D preview loads as you explore</span></div>}

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
                {activeProduct?.name}
              </h3>
              <div className="showcase-food-telugu">
                {activeProduct?.teluguName}
              </div>

              <p className="showcase-food-desc">
                {activeProduct?.description}
              </p>

              {activeProduct?.ingredients && <div className="showcase-features-list"><div className="showcase-feat-item"><span className="check">✓</span><span>{activeProduct.ingredients}</span></div></div>}

              <div className="showcase-pricing-row">
                <div>
                  <span className="starting-label">Available from </span>
                  <span className="price-tag">From ₹{getProductVariantPrice(activeProduct, '250g')} / 250 g</span>
                </div>
              </div>

              {/* Real HTML Buttons — 3D never blocks shopping actions */}
              <div className="showcase-action-btns">
                <button
                    type="button"
                    onClick={handleAddActive}
                    className="showcase-add-cart-btn"
                  >
                    <ShoppingBag size={16} />
                    <span>Add 1/2 kg to Cart • ₹{getProductVariantPrice(activeProduct, '500g')}</span>
                </button>

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
