import React from 'react';
import { useTranslation } from 'react-i18next';

const SEOHead: React.FC = () => {
  const { i18n } = useTranslation();

  React.useEffect(() => {
    const currentLang = i18n.language;
    
    // Update document title
    document.title = currentLang === 'fr' 
      ? 'Corto Sailing - Naviguez, Kiffez, Trinquez ⛵'
      : 'Corto Sailing - Sail, Enjoy, Cheers ⛵';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        currentLang === 'fr'
          ? 'Corto Sailing - Sorties en mer conviviales à Agde. Voile, apéros, formations et hébergement insolite à bord.'
          : 'Corto Sailing - Friendly sea outings in Agde. Sailing, aperitifs, training and unique accommodation aboard.'
      );
    }
    
    // Update lang attribute
    document.documentElement.lang = currentLang;
    
    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content',
        currentLang === 'fr'
          ? 'voile, sailing, Agde, sorties mer, formation voile, hébergement bateau, sunset, apéro'
          : 'sailing, boat trips, Agde, sea outings, sailing training, boat accommodation, sunset, aperitif'
      );
    }
  }, [i18n.language]);

  return null;
};

export default SEOHead;
