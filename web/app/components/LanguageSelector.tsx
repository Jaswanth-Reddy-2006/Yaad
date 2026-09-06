'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { INDIAN_LANGUAGES, LanguageInfo, LanguageCode } from '../i18n/languages';
import { Globe, ChevronDown, Check, Search, X } from 'lucide-react';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false, className = '' }) => {
  const { currentLanguage, setLanguage, isRTL, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentLangInfo = INDIAN_LANGUAGES.find(l => l.code === currentLanguage) || INDIAN_LANGUAGES[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredLanguages = INDIAN_LANGUAGES.filter(lang => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query) ||
      (lang.script && lang.script.toLowerCase().includes(query))
    );
  });

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      className={className}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('nav.selectLanguage', 'Select Language')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: compact ? '6px 10px' : '8px 14px',
          backgroundColor: isOpen ? '#F0FDF4' : '#FFFFFF',
          border: isOpen ? '1.5px solid #16A34A' : '1.5px solid #E2E8F0',
          borderRadius: '10px',
          color: '#0F172A',
          fontSize: compact ? '13px' : '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(22, 163, 74, 0.12)' : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <Globe size={compact ? 16 : 18} color="#16A34A" style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', textAlign: isRTL ? 'right' : 'left' }}>
          <span>{currentLangInfo.name}</span>
          {!compact && (
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '400' }}>
              ({currentLangInfo.nativeName})
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          color="#64748B"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            marginLeft: '2px',
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t('nav.selectLanguage', 'Languages')}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [isRTL ? 'left' : 'right']: 0,
            width: '300px',
            maxHeight: '400px',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header & Search */}
          <div style={{ padding: '12px 12px 8px 12px', borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('nav.selectLanguage', 'Select Language')} ({INDIAN_LANGUAGES.length})
              </span>
              <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600', backgroundColor: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                {t('nav.indianLanguagesCount', '22 Indian Languages')}
              </span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '10px', pointerEvents: 'none' }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('nav.searchLanguage', 'Search language or script...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: isRTL ? '6px 30px 6px 10px' : '6px 10px 6px 30px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    [isRTL ? 'left' : 'right']: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: '#94A3B8',
                    display: 'flex',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Language List */}
          <div
            style={{
              overflowY: 'auto',
              maxHeight: '300px',
              padding: '6px',
            }}
          >
            {filteredLanguages.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                {t('nav.noLanguageFound', 'No language found matching')} "{searchQuery}"
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === currentLanguage;
                return (
                  <button
                    key={lang.code}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isSelected ? '#DCFCE7' : 'transparent',
                      color: isSelected ? '#15803D' : '#1E293B',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: isRTL ? 'right' : 'left',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: isSelected ? '700' : '600' }}>{lang.name}</span>
                        {lang.isRTL && (
                          <span style={{ fontSize: '10px', padding: '1px 4px', backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '3px', fontWeight: '600' }}>
                            RTL
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: isSelected ? '#16A34A' : '#64748B', fontWeight: '500' }}>
                        {lang.nativeName}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8', backgroundColor: '#F1F5F9', padding: '2px 5px', borderRadius: '4px' }}>
                        {lang.code.toUpperCase()}
                      </span>
                      {isSelected && <Check size={16} color="#16A34A" style={{ flexShrink: 0 }} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
