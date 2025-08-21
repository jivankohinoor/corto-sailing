import { Service, Extra, Season } from '../types';

export const services: Service[] = [
  // Packs Sorties
  {
    id: 'decouverte',
    title: 'Découverte',
    duration: '2h',
    description: 'Initiation voile et navigation tranquille pour découvrir les plaisirs de la voile',
    category: 'sortie',
    features: ['Initiation voile', 'Navigation tranquille', 'Sangria maison offerte', 'Sécurité assurée']
  },
  {
    id: 'sunset-apero',
    title: 'Sunset & Apéro',
    duration: '2h30-3h',
    description: 'Admirez le coucher de soleil depuis la mer avec un apéro convivial à bord',
    category: 'sortie',
    features: ['Coucher de soleil', 'Apéro à bord', 'Sangria maison offerte', 'Ambiance romantique']
  },
  {
    id: 'journee-mouillage',
    title: 'Journée Mouillage & Baignade',
    duration: '6-8h',
    description: 'Une journée complète en mer avec navigation, baignade et pique-nique',
    category: 'sortie',
    features: ['Navigation complète', 'Baignade en mer', 'Pique-nique inclus', 'Sangria maison offerte']
  },
  {
    id: 'soirees-speciales',
    title: 'Soirées Spéciales',
    duration: 'Variable',
    description: 'Sorties thématiques : feu d\'artifice, événements nautiques, pêche...',
    category: 'sortie',
    features: ['Événements spéciaux', 'Ambiance unique', 'Sangria maison offerte', 'Sur mesure']
  },
  
  // Hébergement
  {
    id: 'nuitee-bord',
    title: 'Nuitée à bord',
    duration: '1 nuit',
    description: 'Dormez à bord au quai pour une expérience insolite (2 personnes conseillées)',
    category: 'hebergement',
    features: ['Hébergement insolite', 'Au quai d\'Agde', 'Ambiance maritime', 'Petit-déjeuner possible']
  },
  {
    id: 'weekend-formule',
    title: 'Formule Week-end',
    duration: '2 jours + 1 nuit',
    description: 'Combinaison parfaite de sorties en mer et hébergement à bord',
    category: 'hebergement',
    features: ['2 jours d\'activités', '1 nuit à bord', 'Sorties incluses', 'Expérience complète']
  },
  
  // Formations
  {
    id: 'initiation-voile',
    title: 'Initiation Voile',
    duration: '3h',
    description: 'Apprenez les bases : sécurité, vocabulaire maritime et réglages de base',
    category: 'formation',
    features: ['Sécurité en mer', 'Vocabulaire maritime', 'Réglages de base', 'Certificat de participation']
  },
  {
    id: 'equipier-journee',
    title: 'Équipier Journée',
    duration: '6h',
    description: 'Formation complète : manœuvres, mouillage et gestion des voiles',
    category: 'formation',
    features: ['Manœuvres avancées', 'Techniques de mouillage', 'Gestion des voiles', 'Pratique intensive']
  },
  {
    id: 'navigation-nuit',
    title: 'Navigation de Nuit',
    duration: '2h30',
    description: 'Maîtrisez la navigation nocturne : feux, règles de route et repères lumineux',
    category: 'formation',
    features: ['Feux de navigation', 'Règles de route', 'Repères lumineux', 'Sécurité nocturne']
  },
  {
    id: 'securite-mob',
    title: 'Sécurité & Homme à la mer',
    duration: '2h',
    description: 'Formation essentielle : prévention, procédures MOB et radio VHF',
    category: 'formation',
    features: ['Prévention des risques', 'Procédures MOB', 'Radio VHF', 'Gestes de secours']
  }
];

export const extras: Extra[] = [
  {
    id: 'rose-tapas',
    name: 'Rosé & Tapas',
    price: 35,
    description: 'Sélection de rosés locaux accompagnés de tapas méditerranéennes'
  },
  {
    id: 'muscat-fromages',
    name: 'Muscat & Fromages',
    price: 45,
    description: 'Muscat de Frontignan et plateau de fromages régionaux'
  },
  {
    id: 'huitres-bouzigues',
    name: 'Huîtres de Bouzigues & Vin blanc',
    price: 60,
    description: 'Huîtres fraîches de Bouzigues avec vin blanc de la région'
  },
  {
    id: 'fruits-douceurs',
    name: 'Fruits & Douceurs locales',
    price: 25,
    description: 'Fruits de saison et spécialités sucrées du terroir'
  }
];

export const seasons: Season[] = [
  {
    name: 'Basse saison',
    months: 'Novembre - Mars',
    modifier: -0.1,
    description: 'Tarifs réduits pour profiter de la mer en toute tranquillité'
  },
  {
    name: 'Moyenne saison',
    months: 'Avril - Juin, Septembre - Octobre',
    modifier: 0,
    description: 'Conditions idéales avec un climat doux et moins de monde'
  },
  {
    name: 'Haute saison',
    months: 'Juillet - Août',
    modifier: 0.2,
    description: 'Période estivale avec le maximum d\'activités et d\'animations'
  }
];
