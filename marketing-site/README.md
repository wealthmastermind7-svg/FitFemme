# Fit Femme Marketing Website

Beautiful marketing website for the Fit Femme premium fitness app. Built with React, Vite, and TypeScript.

## Features

- 🎯 Modern landing page with feature showcase
- 📱 Fully responsive design
- 🎨 Dark theme with pink accents (matching app design)
- 📄 Legal pages (Privacy, Terms, Sources)
- ⚡ Fast performance with Vite
- 🔗 Smooth navigation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd marketing-site
npm install
```

### Development

```bash
npm run dev
```

The site will open at `http://localhost:3000`

### Build

```bash
npm run build
```

Output files will be in the `dist/` directory.

## Deployment to fitfemme.cerolauto.store

### Option 1: Netlify (Recommended)

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure custom domain to `fitfemme.cerolauto.store`

### Option 2: Vercel

1. Import repository into Vercel
2. Framework: Vite
3. Deploy
4. Configure custom domain

### Option 3: Manual Deployment

1. Build the project: `npm run build`
2. Upload `dist/` folder to your hosting
3. Configure `fitfemme.cerolauto.store` DNS to point to your hosting

## Project Structure

```
marketing-site/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Header.css
│   │   ├── Footer.tsx
│   │   └── Footer.css
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Landing.css
│   │   ├── Terms.tsx
│   │   ├── Privacy.tsx
│   │   ├── Sources.tsx
│   │   └── Legal.css
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Customization

### Update Download Links

Edit the "Download Now" buttons in `src/pages/Landing.tsx` to link to your app stores:
- App Store: https://apps.apple.com/...
- Google Play: https://play.google.com/store/apps/details?id=...

### Update Contact Email

Change `admin@cerolauto.com` to your contact email in:
- `src/components/Footer.tsx`
- `src/pages/Terms.tsx`
- `src/pages/Privacy.tsx`
- `src/pages/Sources.tsx`

### Modify Content

Edit the content in:
- `src/pages/Landing.tsx` - Hero, features, workouts
- `src/pages/Privacy.tsx` - Privacy policy
- `src/pages/Terms.tsx` - Terms of service
- `src/pages/Sources.tsx` - Attribution and open source libraries

## Design System

The site uses a consistent design system with CSS variables:
- Primary color: `#d41173` (Pink)
- Accent color: `#ff006e` (Hot Pink)
- Background: `#0a0a0a` (Dark)
- Surface: `#1a1a1a` (Light Dark)

Edit `src/index.css` to customize colors globally.

## Performance

- Optimized bundle size
- Fast page load times
- Mobile-first responsive design
- Smooth animations and transitions

## License

© 2026 Fit Femme. All rights reserved.
