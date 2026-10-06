import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', flag: '🇮🇳' },
];

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="lang-switcher-wrap" ref={dropdownRef}>
      <button
        type="button"
        className="lang-trigger-btn"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Switch language"
        title="Change language"
        aria-expanded={isOpen}
      >
        <Globe size={16} />
        <span className="lang-trigger-label">{currentLang.nativeLabel}</span>
        <ChevronDown size={14} className={`lang-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="lang-dropdown" role="listbox">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={language === lang.code}
              className={`lang-option-btn ${language === lang.code ? 'active' : ''}`}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-option-labels">
                <span className="lang-native">{lang.nativeLabel}</span>
                <span className="lang-english">{lang.label}</span>
              </span>
              {language === lang.code && (
                <Check size={14} className="lang-check-icon" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
