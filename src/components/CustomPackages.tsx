import React from 'react';
import { Clock, Anchor, Utensils, Heart, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const CustomPackages: React.FC = () => {
  const { t } = useTranslation();

  const customSections = [
    {
      key: 'timing',
      icon: Clock,
      color: 'ocean'
    },
    {
      key: 'activities', 
      icon: Anchor,
      color: 'sunset'
    },
    {
      key: 'extras',
      icon: Utensils,
      color: 'ocean'
    },
    {
      key: 'experiences',
      icon: Heart,
      color: 'sunset'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('services.customPackages.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('services.customPackages.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {customSections.map((section, index) => {
            const Icon = section.icon;
            const options = Array.isArray(t(`services.customPackages.${section.key}.options`, { returnObjects: true })) ? 
              t(`services.customPackages.${section.key}.options`, { returnObjects: true }) as string[] : 
              [];
            
            return (
              <motion.div
                key={section.key}
                className="bg-gray-50 rounded-xl p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-6">
                  <Icon className={`h-8 w-8 text-${section.color}-600 mr-3`} />
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t(`services.customPackages.${section.key}.title`)}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {options.map((option: string, idx: number) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className={`h-5 w-5 text-${section.color}-500 mr-3 flex-shrink-0`} />
                      <span className="text-gray-700">{option}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Special Events Section */}
        <motion.div
          className="bg-gradient-to-br from-sunset-50 to-ocean-50 rounded-xl p-8 mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {t('services.specialEvents.title')}
          </h3>
          <p className="text-lg text-gray-600 text-center mb-8">
            {t('services.specialEvents.subtitle')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-sunset-800 mb-4">
                {t('services.specialEvents.summer.title')}
              </h4>
              <ul className="space-y-2">
                {Array.isArray(t('services.specialEvents.summer.events', { returnObjects: true })) ?
                  (t('services.specialEvents.summer.events', { returnObjects: true }) as string[]).map((event: string, idx: number) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="h-4 w-4 text-sunset-500 mr-2 flex-shrink-0" />
                      {event}
                    </li>
                  )) : null
                }
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-ocean-800 mb-4">
                {t('services.specialEvents.seasonal.title')}
              </h4>
              <ul className="space-y-2">
                {Array.isArray(t('services.specialEvents.seasonal.events', { returnObjects: true })) ?
                  (t('services.specialEvents.seasonal.events', { returnObjects: true }) as string[]).map((event: string, idx: number) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="h-4 w-4 text-ocean-500 mr-2 flex-shrink-0" />
                      {event}
                    </li>
                  )) : null
                }
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Unique Advantages */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('services.uniqueAdvantages.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(t('services.uniqueAdvantages.items', { returnObjects: true })) ?
              (t('services.uniqueAdvantages.items', { returnObjects: true }) as Array<{title: string, description: string}>).map((item, idx) => (
                <div key={idx} className="text-center p-4">
                  <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-ocean-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              )) : null
            }
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomPackages;
