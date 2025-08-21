import React from 'react';
import { Compass, Home, GraduationCap, Clock, Users, Star, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const categoryIcons = {
  sortie: Compass,
  hebergement: Home,
  formation: GraduationCap,
  custom: Settings
};


const ServiceCardTranslated: React.FC<{ serviceKey: string; category: string; index: number }> = ({ serviceKey, category, index }) => {
  const { t } = useTranslation();
  const Icon = categoryIcons[category as keyof typeof categoryIcons];
  
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className="h-8 w-8 text-ocean-600" />
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {t(`services.items.${serviceKey}.duration`)}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t(`services.items.${serviceKey}.title`)}</h3>
        <p className="text-gray-600 mb-4">{t(`services.items.${serviceKey}.description`)}</p>
        
        <div className="space-y-2 mb-6">
          {Array.isArray(t(`services.items.${serviceKey}.features`, { returnObjects: true })) ? 
            (t(`services.items.${serviceKey}.features`, { returnObjects: true }) as string[]).map((feature: string, idx: number) => (
              <div key={idx} className="flex items-center text-sm text-gray-700">
                <Star className="h-4 w-4 text-sunset-500 mr-2 flex-shrink-0" />
                {feature}
              </div>
            )) : 
            <div className="flex items-center text-sm text-gray-700">
              <Star className="h-4 w-4 text-sunset-500 mr-2 flex-shrink-0" />
              {t(`services.items.${serviceKey}.features`)}
            </div>
          }
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-ocean-600">
            <Users className="h-4 w-4 mr-1" />
            {t('services.capacity')}
          </div>
          <button className="btn-primary text-sm px-4 py-2">
            {t('services.learnMore')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Services: React.FC = () => {
  const { t } = useTranslation();
  const categories = ['sortie', 'hebergement', 'formation', 'custom'] as const;
  
  const getServicesForCategory = (category: string) => {
    const serviceKeys = {
      sortie: ['discovery', 'sunset', 'dayTrip', 'moonlight', 'fishing', 'fireworks', 'nauticalEvents'],
      hebergement: ['overnight', 'weekend', 'longStays'],
      formation: ['initiation', 'crewMember', 'nightNavigation', 'safety', 'completeStage'],
      custom: []
    };
    return serviceKeys[category as keyof typeof serviceKeys] || [];
  };
  
  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('services.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </motion.div>

        {categories.map((category) => {
          const serviceKeys = getServicesForCategory(category);
          const Icon = categoryIcons[category];
          
          return (
            <div key={category} className="mb-16">
              <motion.div
                className="flex items-center mb-8"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Icon className="h-8 w-8 text-ocean-600 mr-3" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t(`services.categories.${category === 'sortie' ? 'outings' : category === 'hebergement' ? 'accommodation' : category === 'formation' ? 'training' : 'custom'}.title`)}
                  </h3>
                  <p className="text-gray-600">
                    {t(`services.categories.${category === 'sortie' ? 'outings' : category === 'hebergement' ? 'accommodation' : category === 'formation' ? 'training' : 'custom'}.description`)}
                  </p>
                </div>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceKeys.map((serviceKey, index) => (
                  <ServiceCardTranslated
                    key={serviceKey}
                    serviceKey={serviceKey}
                    category={category}
                    index={index}
                  />
                ))}
              </div>
            </div>
          );
        })}
        
        {/* Boat showcase */}
        <motion.div
          className="mb-16 bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="relative h-64 lg:h-auto">
              <img 
                src="/corto.jpg" 
                alt="Voilier Corto - Sangria 7m"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {t('services.boat.title')}
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                {t('services.boat.description')}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-ocean-600 mr-2" />
                  <span>{t('services.boat.capacity')}</span>
                </div>
                <div className="flex items-center">
                  <Compass className="h-5 w-5 text-ocean-600 mr-2" />
                  <span>{t('services.boat.type')}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Special mention */}
        <motion.div
          className="text-center bg-sunset-50 rounded-xl p-8 border border-sunset-200"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-sunset-800 mb-4">
            {t('services.sangriaOffer.title')}
          </h3>
          <p className="text-sunset-700 text-lg">
            {t('services.sangriaOffer.description')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
