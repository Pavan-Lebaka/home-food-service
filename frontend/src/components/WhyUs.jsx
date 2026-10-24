import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const steps = [
  { number: '01', title: 'Browse the catalogue', text: 'Compare the listed products and pack prices.' },
  { number: '02', title: 'Build your cart', text: 'Choose a pack size and adjust quantities before checkout.' },
  { number: '03', title: 'Send your request', text: 'Review the order message, then send it to the kitchen on WhatsApp.' }
];

export default function WhyUs() {
  const { t } = useLanguage();

  return (
    <section id="why-us" className="section-why reveal-on-scroll">
      <div className="container">
        <div className="why-us-header">
          <p className="section-kicker">How ordering works</p>
          <h2 className="why-us-title">{t('whyChooseUs')}</h2>
          <p className="why-us-subtitle">Choose your products here, then confirm the request directly with Bramarambika Home Foods.</p>
        </div>

        <ol className="order-steps">
          {steps.map((step) => (
            <li className="order-step" key={step.number}>
              <span className="order-step-number">{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              <ArrowUpRight size={17} aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
