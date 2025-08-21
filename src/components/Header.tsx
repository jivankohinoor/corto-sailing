import React, { useState } from 'react';
import { Anchor, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  currentPage?: string;
  setCurrentPage?: (page: 'home' | 'calendar') => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage = 'home', setCurrentPage }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (page: 'home' | 'calendar', href?: string) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
    if (href && page === 'home') {
      // Scroll to section after a small delay to ensure page is rendered
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { href: '#services', label: t('nav.services'), page: 'home' as const },
    { href: '#extras', label: t('nav.extras'), page: 'home' as const },
    { href: '#tarifs', label: t('nav.pricing'), page: 'home' as const },
    { href: '#contact', label: t('nav.contact'), page: 'home' as const },
    { href: '', label: t('nav.calendar'), page: 'calendar' as const }
  ];

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.button 
            className="flex items-center space-x-2"
            onClick={() => handleNavigation('home')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Anchor className="h-8 w-8 text-ocean-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Corto Sailing</h1>
              <p className="text-sm text-ocean-600 font-medium">{t('hero.tagline')}</p>
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.href || item.label}
                onClick={() => handleNavigation(item.page, item.href)}
                className={`text-gray-700 hover:text-ocean-600 font-medium transition-colors duration-200 ${
                  currentPage === item.page ? 'text-ocean-600 border-b-2 border-ocean-600' : ''
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Language Switcher & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            <motion.button
              onClick={() => handleNavigation('home', '#contact')}
              className="btn-primary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('nav.book')}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.href || item.label}
                  onClick={() => handleNavigation(item.page, item.href)}
                  className={`text-left text-gray-700 hover:text-ocean-600 font-medium transition-colors duration-200 ${
                    currentPage === item.page ? 'text-ocean-600' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex justify-center mb-4">
                <LanguageSwitcher />
              </div>
              <button
                onClick={() => handleNavigation('home', '#contact')}
                className="btn-primary text-center"
              >
                {t('nav.book')}
              </button>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;
