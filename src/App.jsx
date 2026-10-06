import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCollections from './components/FeaturedCollections';
import MenuSection from './components/MenuSection';
import ProductModal from './components/ProductModal';
import SearchModal from './components/SearchModal';
import Testimonials from './components/Testimonials';
import StorySection from './components/StorySection';
import WhyUs from './components/WhyUs';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import FloatingCart from './components/FloatingCart';
import { useScrollReveal } from './hooks/useScrollReveal';

export default function App() {
  useScrollReveal();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bramarambika_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    try {
      localStorage.setItem('bramarambika_cart_v2', JSON.stringify(cartItems));
    } catch (e) {
      // ignore
    }
  }, [cartItems]);

  // Lock background page scroll whenever Cart Drawer, Search Modal, or Product Details is open
  useEffect(() => {
    const isLocked = isCartOpen || isSearchOpen || Boolean(modalProduct);
    if (isLocked) {
      document.body.classList.add('modal-open-scroll-locked');
      document.documentElement.classList.add('modal-open-scroll-locked');
    } else {
      document.body.classList.remove('modal-open-scroll-locked');
      document.documentElement.classList.remove('modal-open-scroll-locked');
    }
    return () => {
      document.body.classList.remove('modal-open-scroll-locked');
      document.documentElement.classList.remove('modal-open-scroll-locked');
    };
  }, [isCartOpen, isSearchOpen, modalProduct]);

  const handleAddToCart = ({ product, variantId = '500g', variantLabel = '1/2 kg', unitPrice, quantity = 1 }) => {
    const cartItemId = `${product.id}-${variantId}`;
    setCartItems(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          cartItemId,
          name: product.name,
          teluguName: product.teluguName,
          variantId,
          variantLabel,
          unitPrice: unitPrice || product.pricePerKg,
          price: unitPrice || product.pricePerKg,
          pricePerKg: product.pricePerKg,
          image: product.image,
          quantity
        }
      ];
    });
  };

  const handleUpdateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSelectCategoryFromCollections = (categoryId) => {
    setActiveCategory(categoryId);
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="site-wrapper">
      {/* 1. Header with Annapurna Style Announcement Bar & Modern Store Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onWhatsAppClick={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectCategory={setActiveCategory}
      />

      <main>
        {/* 2. Hero Section */}
        <Hero
          onWhatsAppClick={() => setIsCartOpen(true)}
          onSelectCategory={setActiveCategory}
        />

        {/* 3. Featured Collections Showcase ("Our Collections") */}
        <FeaturedCollections
          onSelectCategory={handleSelectCategoryFromCollections}
        />

        {/* 4. Menu & Specials with Annapurna Style Product Cards & 250g, 1/2 kg, 1 kg Selectors */}
        <MenuSection
          onAddToCart={handleAddToCart}
          onOpenDetails={(p) => setModalProduct(p)}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {/* 5. Customer Reviews Section (Like Annapurna Judge.me Reviews) */}
        <Testimonials />

        {/* 6. Story & Traditional Cooking Heritage */}
        <StorySection />

        {/* 7. Why Bramarambika Feature Cards */}
        <WhyUs />

        {/* 8. Final WhatsApp Action */}
        <FinalCTA
          onWhatsAppClick={() => setIsCartOpen(true)}
          cartCount={totalCartCount}
        />
      </main>

      {/* 9. Footer */}
      <Footer />

      {/* 10. Floating Cart (Desktop) & Sticky Bottom Bar (Mobile) */}
      <FloatingCart
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 11. Slide-over Cart Drawer with Weight Variants & WhatsApp Checkout */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onAddToCart={handleAddToCart}
      />

      {/* 12. Quick Product Details Modal */}
      <ProductModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 13. Instant Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setModalProduct(p)}
      />
    </div>
  );
}
