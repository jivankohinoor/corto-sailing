import React from 'react';
import { Anchor, Facebook, Instagram, Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Anchor className="h-8 w-8 text-ocean-400" />
              <div>
                <h3 className="text-2xl font-bold">Corto Sailing</h3>
                <p className="text-ocean-300">{t('footer.tagline')}</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-ocean-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-ocean-400 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#services" className="hover:text-ocean-400 transition-colors">{t('footer.outings')}</a></li>
              <li><a href="#services" className="hover:text-ocean-400 transition-colors">{t('footer.accommodation')}</a></li>
              <li><a href="#services" className="hover:text-ocean-400 transition-colors">{t('footer.training')}</a></li>
              <li><a href="#extras" className="hover:text-ocean-400 transition-colors">{t('footer.extras')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.contact')}</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <a href="tel:+33123456789" className="hover:text-ocean-400 transition-colors">
                  +33 1 23 45 67 89
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:contact@cortosailing.fr" className="hover:text-ocean-400 transition-colors">
                  contact@cortosailing.fr
                </a>
              </div>
              <p className="text-sm">Port d'Agde, 34300 Agde</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Corto Sailing. {t('footer.rights')}</p>
          <p className="text-sm mt-2">
            {t('footer.specs')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
