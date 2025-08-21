# 🚀 Déploiement Netlify - Corto Sailing

Guide complet pour déployer le site Corto Sailing sur Netlify.

## 📋 Prérequis

1. **Compte Netlify** : [netlify.com](https://netlify.com)
2. **Git repository** : Code sur GitHub/GitLab
3. **Node.js 18+** installé localement

## 🛠️ Méthodes de déploiement

### Méthode 1 : Déploiement automatique via Git (Recommandé)

1. **Push le code sur GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connecter à Netlify**
   - Aller sur [netlify.com](https://netlify.com)
   - Cliquer "New site from Git"
   - Choisir votre repository
   - Configurer :
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Node version**: `18`

3. **Variables d'environnement** (si nécessaire)
   - Site settings > Environment variables
   - Ajouter `NODE_VERSION = 18`

### Méthode 2 : Déploiement manuel

1. **Build local**
   ```bash
   npm install
   npm run build
   ```

2. **Upload sur Netlify**
   - Aller sur netlify.com
   - Glisser-déposer le dossier `dist/` sur l'interface

### Méthode 3 : CLI Netlify

1. **Installer Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login et déploiement**
   ```bash
   netlify login
   npm run deploy
   ```

## ⚙️ Configuration automatique

Le projet inclut :
- **`netlify.toml`** : Configuration de build
- **`public/_redirects`** : Redirections pour SPA
- **Scripts optimisés** dans `package.json`

## 🌍 Fonctionnalités déployées

✅ **Site bilingue** (FR/EN)  
✅ **Détection automatique** de langue  
✅ **SEO optimisé** pour les deux langues  
✅ **Responsive design**  
✅ **Animations Framer Motion**  
✅ **Formulaire de contact**  

## 🔧 Optimisations incluses

- **Minification** CSS/JS automatique
- **Compression** des assets
- **Cache** optimisé
- **PWA ready** (ajout possible)

## 📱 Test après déploiement

1. **Fonctionnalité multilingue**
   - Tester le switch FR/EN
   - Vérifier les traductions

2. **Responsive design**
   - Mobile, tablette, desktop

3. **Performance**
   - Lighthouse score
   - Temps de chargement

## 🆘 Dépannage

### Erreur de build
```bash
# Tester localement
npm run build
npm run preview
```

### Problème de redirections
- Vérifier `public/_redirects`
- Contrôler `netlify.toml`

### Problème i18n
- Vérifier les fichiers de traduction
- Tester les imports React-i18next

## 🎯 URL finale

Votre site sera accessible sur :
- **URL Netlify** : `https://nom-du-site.netlify.app`
- **Domaine custom** : Configurable dans les settings

---

**🌊 Corto Sailing est prêt à naviguer sur le web !**
