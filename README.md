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

### ⛵ Weather Analysis (Agde)
- **Daily analysis** with dominant wind, variability, sunny hours, visibility, humidity, thermal amplitude
- **Intra-day best periods**: Morning / Afternoon / Evening with level and reason
- **Contiguous time windows** (06:00–22:00): timeline of conditions with start–end and rationale
- **Safety levels** aligned with Beaufort and gusts: Excellent, Bon, Modéré, Difficile, Dangereux
- UI located in `src/components/Calendar.tsx` under “Analyse détaillée”
- Engine in `src/services/weatherService.ts` (types: `DayWindow`, `DayPeriodBest`, `DayLevel`)

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
│   ├── Calendar.tsx# Calendar with detailed weather analysis (best periods, windows)
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
├── services/      # Domain services
│   └── weatherService.ts # Weather fetch + analysis (windows, best periods)
├── types/         # TypeScript types
├── App.tsx        # Main component
├── main.tsx       # Entry point
└── index.css      # Global styles
```

## 🧠 Weather Analysis Logic

- Uses Open‑Meteo hourly data to compute per‑hour sailing level considering:
  - Wind (10m), gusts, Beaufort scale, weather codes, temperature
- Derives:
  - `bestPeriods`: best level for Matin / Après‑midi / Soir
  - `windows`: contiguous segments between 06:00–22:00 with level + reason
- Display:
  - “Meilleures périodes” cards and “Évolution dans la journée” timeline in `Calendar.tsx`

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
