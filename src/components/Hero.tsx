import React from 'react';
import { Waves, Wind, Sunset, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Hero: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with boat image */}
      <div className="absolute inset-0">
        <img 
          src="/corto.jpg" 
          alt="Voilier Corto - Sangria 7m"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-900/80 via-ocean-800/70 to-ocean-900/80"></div>
        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1200 120" className="w-full h-32 text-white/10">
            <motion.path
              d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
              fill="currentColor"
              initial={{ d: "M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" }}
              animate={{ d: "M0,80 C300,0 900,120 1200,80 L1200,120 L0,120 Z" }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-ocean-100">
            {t('hero.tagline')}
          </p>
          <p className="text-lg md:text-xl mb-8 text-ocean-200 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="text-center">
            <Waves className="h-8 w-8 mx-auto mb-2 text-ocean-200" />
            <p className="text-sm font-medium">{t('hero.features.outings')}</p>
          </div>
          <div className="text-center">
            <Sunset className="h-8 w-8 mx-auto mb-2 text-sunset-300" />
            <p className="text-sm font-medium">{t('hero.features.sunsets')}</p>
          </div>
          <div className="text-center">
            <Wind className="h-8 w-8 mx-auto mb-2 text-ocean-200" />
            <p className="text-sm font-medium">{t('hero.features.training')}</p>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-ocean-200" />
            <p className="text-sm font-medium">{t('hero.features.capacity')}</p>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <a href="#services" className="btn-primary text-lg px-8 py-4">
            {t('hero.cta.discover')}
          </a>
          <a href="#contact" className="btn-secondary bg-white/10 border-white text-white hover:bg-white/20 text-lg px-8 py-4">
            {t('hero.cta.contact')}
          </a>
        </motion.div>

        {/* Special offer */}
        <motion.div
          className="mt-8 p-4 bg-sunset-500/20 rounded-lg border border-sunset-300/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <p className="text-sunset-100 font-medium">
            {t('hero.offer')}
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
