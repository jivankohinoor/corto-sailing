import React from 'react';
import { Wine, Grape, Fish, Apple } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';


const Extras: React.FC = () => {
  const { t } = useTranslation();
  
  const extraItems = [
    { key: 'roseTapas', icon: Wine, price: 35 },
    { key: 'muscatCheese', icon: Grape, price: 45 },
    { key: 'oysters', icon: Fish, price: 60 },
    { key: 'fruits', icon: Apple, price: 25 }
  ];
  return (
    <section id="extras" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('extras.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('extras.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {extraItems.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.key}
                className="bg-gradient-to-br from-sunset-50 to-orange-50 rounded-xl p-6 border border-sunset-200 hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <Icon className="h-12 w-12 text-sunset-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t(`extras.items.${item.key}.name`)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t(`extras.items.${item.key}.description`)}
                  </p>
                  <div className="text-2xl font-bold text-sunset-600">
                    +{item.price}€
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional info */}
        <motion.div
          className="mt-12 text-center bg-ocean-50 rounded-xl p-6 border border-ocean-200"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-semibold text-ocean-800 mb-2">
            {t('extras.terroir.title')}
          </h3>
          <p className="text-ocean-700">
            {t('extras.terroir.description')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Extras;
