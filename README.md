# Corto Sailing ⛵

Modern bilingual website for Corto Sailing - Friendly sea outings in Agde

🌍 **Available in French & English** with automatic language detection and seamless switching

## 🚀 Technologies

- **React 18** with TypeScript
- **Vite** for build and dev server
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **React-i18next** for internationalization (FR/EN)

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

## 🎯 Features

### 🌍 Internationalization
- **Bilingual support**: French (default) & English
- **Automatic language detection** from browser settings
- **Language switcher** in header
- **SEO optimization** for both languages
- **Persistent language preference** in localStorage

### Services
- **Sailing Packages**: Discovery, Sunset & Aperitif, Day Anchoring, Special Events
- **Unique Accommodation**: Overnight stay, Weekend package
- **Sailing Training**: Initiation, Crew member, Night navigation, Safety

### Gastronomic Extras
- Rosé & Tapas (+35€)
- Muscat & Cheeses (+45€)
- Bouzigues Oysters & White Wine (+60€)
- Fruits & Local Sweets (+25€)

### Seasonal Pricing
- **Low season** (Nov-Mar): -10%
- **Mid season** (Apr-Jun, Sep-Oct): Base rate
- **High season** (Jul-Aug): +20%

## 🎨 Design System

### Colors
- **Ocean**: Primary palette (blues)
- **Sunset**: Secondary palette (oranges/yellows)
- **Neutrals**: Grays for text and backgrounds

### Components
- Responsive header with language switcher
- Animated hero section
- Service cards with translations
- Contact form with validation
- Complete footer
- SEO head component for meta tags

## 📱 Responsive Design

Fully responsive website with:
- Mobile-first approach
- Tailwind breakpoints (sm, md, lg, xl)
- Mobile navigation with hamburger menu
- Adaptive grids

## ⚡ Performance

- Vite optimizations
- Automatic code splitting
- Optimized images
- Performant animations with Framer Motion
- Language-specific SEO meta tags

## 🔧 Project Structure

```
src/
├── components/     # React components
│   ├── Header.tsx  # Navigation with language switcher
│   ├── Hero.tsx    # Animated hero section
│   ├── Services.tsx# Service cards with i18n
│   ├── Extras.tsx  # Gastronomic extras
│   ├── Pricing.tsx # Seasonal pricing
│   ├── Contact.tsx # Contact form
│   ├── Footer.tsx  # Footer with translations
│   ├── LanguageSwitcher.tsx # Language toggle
│   └── SEOHead.tsx # Dynamic meta tags
├── i18n/          # Internationalization
│   ├── index.ts   # i18n configuration
│   └── locales/   # Translation files
│       ├── fr.json# French translations
│       └── en.json# English translations
├── data/          # Static data (deprecated)
├── types/         # TypeScript types
├── App.tsx        # Main component
├── main.tsx       # Entry point
└── index.css      # Global styles
```

## 🌊 Corto Sailing

**Sailboat**: Sangria 7m  
**Capacity**: 4 people maximum  
**Base**: Port of Agde, 34300 Agde  
**Tagline**: 
- 🇫🇷 Naviguez, Kiffez, Trinquez ⛵🍹
- 🇬🇧 Sail, Enjoy, Cheers ⛵🍹

## 🌍 Language Features

- **Automatic detection**: Browser language preference
- **Manual switching**: Globe icon in header
- **Persistent choice**: Saved in localStorage
- **SEO optimized**: Dynamic meta tags for each language
- **Complete translation**: All content available in both languages

---

Developed with ❤️ for sea lovers
