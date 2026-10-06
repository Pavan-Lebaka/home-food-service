import React from 'react';
import { BookOpen, Home, Clock, Heart, Sparkles, ShieldCheck } from 'lucide-react';

export default function WhyUs() {
  const pillars = [
    {
      icon: <BookOpen size={24} strokeWidth={2} />,
      title: 'Traditional Recipes',
      desc: 'Authentic Telugu preparation handed down across three generations without modern alterations.',
      color: 'var(--color-terracotta)'
    },
    {
      icon: <Home size={24} strokeWidth={2} />,
      title: '100% Homemade',
      desc: 'Prepared with motherly care in our village home kitchen, never in mass commercial factories.',
      color: 'var(--color-leaf-green)'
    },
    {
      icon: <Clock size={24} strokeWidth={2} />,
      title: 'Freshly Prepared',
      desc: 'Made in small, carefully monitored batches for ultimate crunch, fragrance, and freshness.',
      color: 'var(--color-turmeric)'
    },
    {
      icon: <Heart size={24} strokeWidth={2} />,
      title: 'Made With Love',
      desc: 'Crafted using pure wood-pressed gingelly oil, pure cow ghee, and stone-ground spices.',
      color: 'var(--color-terracotta)'
    }
  ];

  return (
    <section id="why-us" className="section-why">
      <div className="container">
        <div className="why-us-header">
          <div className="section-pre-pill">
            <ShieldCheck size={14} />
            <span>The Bramarambika Promise</span>
          </div>

          <h2 className="why-us-title">
            Why Bramarambika?
          </h2>

          <p className="why-us-subtitle">
            Every jar of pickle and every box of Pindi Vantalu carries our family promise of honesty, taste, and tradition.
          </p>
        </div>

        <div className="features-grid">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon-circle" style={{ color: pillar.color }}>
                {pillar.icon}
              </div>
              <h3 className="feature-title">{pillar.title}</h3>
              <p className="feature-desc">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
