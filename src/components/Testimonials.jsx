import React from 'react';
import { Star, CheckCircle, Quote, MessageSquare } from 'lucide-react';
import { TESTIMONIALS } from '../data/products';

export default function Testimonials() {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <div className="section-pre-pill">
            <MessageSquare size={14} />
            <span>Customer Praise</span>
          </div>
          <h2 className="testimonials-title">
            Loved By Telugu Food Connoisseurs
          </h2>
          <p className="testimonials-subtitle">
            Read what homes across Hyderabad, Vijayawada, Vizag, and Bengaluru say about our homemade taste.
          </p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((item) => (
            <div key={item.id} className="testimonial-card">
              <div className="testimonial-top-row">
                <div className="rating-stars">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="#E67E22" color="#E67E22" />
                  ))}
                </div>
                <div className="verified-badge">
                  <CheckCircle size={13} color="var(--color-leaf-green)" />
                  <span>Verified Buyer</span>
                </div>
              </div>

              <h3 className="testimonial-quote-title">"{item.title}"</h3>
              <p className="testimonial-body-text">{item.text}</p>

              <div className="testimonial-footer-meta">
                <div className="author-name">{item.name}</div>
                <div className="author-loc">{item.location} • <span className="product-tag">{item.product}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
