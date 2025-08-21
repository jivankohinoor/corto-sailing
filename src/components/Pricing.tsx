import React from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Pricing: React.FC = () => {
  const { t } = useTranslation();
  
  const seasons = [
    { key: 'low', modifier: -0.1 },
    { key: 'mid', modifier: 0 },
    { key: 'high', modifier: 0.2 }
  ];
  const getSeasonIcon = (modifier: number) => {
    if (modifier > 0) return TrendingUp;
    if (modifier < 0) return TrendingDown;
    return Minus;
  };

  const getSeasonColor = (modifier: number) => {
    if (modifier > 0) return 'text-red-600 bg-red-50 border-red-200';
    if (modifier < 0) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <section id="tarifs" className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        {/* Pricing structure */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('pricing.structure.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-ocean-50 rounded-lg border border-ocean-200">
              <h4 className="font-semibold text-ocean-800 mb-2">{t('pricing.structure.flatRate.title')}</h4>
              <p className="text-sm text-ocean-700">
                {t('pricing.structure.flatRate.description')}
              </p>
            </div>
            
            <div className="text-center p-6 bg-sunset-50 rounded-lg border border-sunset-200">
              <h4 className="font-semibold text-sunset-800 mb-2">{t('pricing.structure.included.title')}</h4>
              <p className="text-sm text-sunset-700">
                {t('pricing.structure.included.description')}
              </p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">{t('pricing.structure.optional.title')}</h4>
              <p className="text-sm text-green-700">
                {t('pricing.structure.optional.description')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Seasonal pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {seasons.map((season, index) => {
            const Icon = getSeasonIcon(season.modifier);
            const colorClasses = getSeasonColor(season.modifier);
            
            return (
              <motion.div
                key={season.key}
                className={`rounded-xl p-6 border ${colorClasses}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="h-6 w-6" />
                  <Icon className="h-6 w-6" />
                </div>
                
                <h3 className="text-xl font-bold mb-2">{t(`pricing.seasons.${season.key}.title`)}</h3>
                <p className="text-sm mb-4">{t(`pricing.seasons.${season.key}.discount`)}</p>
                
                <div className="text-lg font-bold">
                  {t(`pricing.seasons.${season.key}.discount`)}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Options */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('pricing.options.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-800">{t('pricing.options.skipper')}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-800">{t('pricing.options.fuel')}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-800">{t('pricing.options.terroir')}</p>
            </div>
          </div>
        </motion.div>

        {/* Solidarity Rates */}
        <motion.div
          className="bg-green-50 rounded-xl p-8 mb-8 border border-green-200"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">
            {t('pricing.solidarity.title')}
          </h3>
          <p className="text-green-700 text-center mb-2">
            {t('pricing.solidarity.description')}
          </p>
          <p className="text-sm text-green-600 text-center">
            {t('pricing.solidarity.note')}
          </p>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          className="bg-blue-50 rounded-xl p-8 mb-8 border border-blue-200"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">
            {t('pricing.payment.title')}
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {Array.isArray(t('pricing.payment.methods', { returnObjects: true })) ?
              (t('pricing.payment.methods', { returnObjects: true }) as string[]).map((method: string, idx: number) => (
                <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {method}
                </span>
              )) : null
            }
          </div>
        </motion.div>

        {/* Contact for pricing */}
        <motion.div
          className="text-center bg-ocean-600 text-white rounded-xl p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4">
            {t('pricing.custom.title')}
          </h3>
          <p className="text-ocean-100 mb-6 max-w-2xl mx-auto">
            {t('pricing.custom.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="btn-secondary bg-white text-ocean-600 hover:bg-gray-50">
              {t('pricing.custom.quote')}
            </a>
            <a href="tel:+33123456789" className="btn-primary bg-sunset-500 hover:bg-sunset-600 border-sunset-500">
              {t('pricing.custom.call')}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
