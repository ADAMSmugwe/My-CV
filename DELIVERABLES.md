# 🚀 Quick Start Commands

## Installation (Already Done ✅)
All packages are installed. If you need to reinstall:
```bash
npm install
```

## Running the Project

### Start Frontend Development Server
```bash
npm run dev
```
**Access at:** http://localhost:5173 or http://localhost:5174

### Start Sanity Studio (CMS Admin Panel)
```bash
npm run sanity
```
**Access at:** http://localhost:3333

## Build for Production

### Build Frontend
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy Sanity Studio
```bash
npm run sanity:deploy
```

---

# 📦 The Deliverables

## ✅ 1. Terminal Commands (Package Installation)
All dependencies are already installed:
- `react` & `react-dom` v19.2.0
- `framer-motion` v12.25.0
- `@sanity/client` v7.14.0
- `@sanity/image-url` v2.0.2
- `lucide-react` v0.562.0
- `tailwindcss` via `@tailwindcss/postcss` v4.1.18
- `sanity` v5.2.0

## ✅ 2. Single-File App.jsx

**Location:** `src/App.jsx`

**Features:**
- ✨ **Framer Motion animations** with Apple easing curve `[0.22, 1, 0.36, 1]`
- 🎨 **Frosted glass navigation** with `backdrop-blur-md`
- 📱 **Hero section** with massive `tracking-tighter` headline
- 💼 **Experience timeline** with scroll-triggered reveals
- 🎯 **Bento Grid projects** (4-column responsive with varying spans)
- 📧 **Contact footer** with social links

**All data is fetched from Sanity using GROQ:**
```javascript
// Profile
*[_type == "profile"][0]{ name, headline, bio, email, github, linkedin }

// Experiences
*[_type == "experience"] | order(order asc){ _id, company, role, ... }

// Projects
*[_type == "project"] | order(order asc){ _id, title, description, ... }
```

## ✅ 3. Sanity Client Configuration

**Location:** `src/sanity/client.js`

```javascript
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: '79b8oplb',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true
});
```

**Sanity Project Details:**
- **Project ID:** 79b8oplb
- **Dataset:** production
- **Schemas:** Profile, Experience, Project

## ✅ 4. Tailwind Configuration

**Location:** `tailwind.config.cjs`

**Apple-Inspired Customizations:**
- **Font:** Inter (imported in `index.css`)
- **Colors:**
  - `apple-blue`: #0071E3
  - `apple-grey`: #F5F5F7
- **Border Radius:** `rounded-apple` = 2.5rem
- **Easing:** `ease-apple` = cubic-bezier(0.22, 1, 0.36, 1)

## ✅ 5. Sanity Schemas

**Location:** `schemaTypes/`

### Profile Schema (`schemaTypes/profile.js`)
Fields: name, headline, bio, email, github, linkedin

### Experience Schema (`schemaTypes/experience.js`)
Fields: company, role, startDate, endDate, description, techStack, order

### Project Schema (`schemaTypes/project.js`)
Fields: title, description, techStack, githubLink, liveLink, gradient, order

---

# 🎨 Apple Design Implementation

## Typography
- **Hero headline:** `text-7xl md:text-8xl font-bold tracking-tighter`
- **Font:** Inter with `tracking-tight` on headings
- **High contrast:** Pure black on white background

## Layout
- **Bento Grid:** 4-column responsive grid
- **Cards:** `rounded-[2.5rem]` with `bg-apple-grey`
- **Spacing:** Generous padding (p-8, py-16, py-24)

## Motion
- **Easing curve:** `[0.22, 1, 0.36, 1]` (Apple's signature curve)
- **Scroll animations:** `whileInView` with `viewport={{ once: true }}`
- **Stagger effects:** Sequential reveal of list items
- **Hover states:** `scale: 1.05` on buttons, `shadow-xl` on cards

## Navigation
- **Sticky positioning:** `sticky top-0`
- **Frosted glass:** `backdrop-blur-md bg-white/80`
- **Slide-in animation:** From top with Apple easing

---

# ⚡ Next Steps

## 1. Configure CORS (CRITICAL)
Without this, data won't load from Sanity:

1. Visit: https://www.sanity.io/manage
2. Select project: **My CV**
3. Go to: **Settings → API → CORS Origins**
4. Add origins:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://localhost:3333`
5. Enable "Allow credentials"
6. Save

## 2. Add Content in Sanity Studio
```bash
npm run sanity
```

Navigate to http://localhost:3333 and add:
- **1 Profile document** (your personal info)
- **Multiple Experience entries** (set the `order` field)
- **Multiple Projects** (set `order` and choose a gradient)

### Project Gradient Options:
- `from-blue-500 to-cyan-500`
- `from-purple-500 to-pink-500`
- `from-orange-500 to-red-500`
- `from-green-500 to-emerald-500`
- `from-yellow-500 to-orange-500`

## 3. View Your Site
```bash
npm run dev
```

Visit: http://localhost:5174 (or 5173)

---

# 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│         Vite Dev Server                 │
│      http://localhost:5173/5174         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │      App.jsx (Single File)       │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │  Frosted Glass Nav          │ │  │
│  │  │  - Social Links             │ │  │
│  │  │  - Sticky Header            │ │  │
│  │  └─────────────────────────────┘ │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │  Hero Section               │ │  │
│  │  │  - Massive Headline         │ │  │
│  │  │  - Bio                      │ │  │
│  │  │  - CTA Button               │ │  │
│  │  └─────────────────────────────┘ │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │  Experience Timeline        │ │  │
│  │  │  - Cards with techStack     │ │  │
│  │  │  - Stagger animations       │ │  │
│  │  └─────────────────────────────┘ │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │  Bento Grid Projects        │ │  │
│  │  │  - 4-column grid            │ │  │
│  │  │  - Gradient backgrounds     │ │  │
│  │  │  - GitHub/Live links        │ │  │
│  │  └─────────────────────────────┘ │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │  Footer / Contact           │ │  │
│  │  │  - Email & Social CTAs      │ │  │
│  │  └─────────────────────────────┘ │  │
│  └───────────────────────────────────┘  │
│                 ↓                       │
│         GROQ Queries via                │
│       @sanity/client                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Sanity.io Headless CMS             │
│      Project: 79b8oplb                  │
│      Dataset: production                │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Sanity Studio Admin Panel       │  │
│  │  http://localhost:3333            │  │
│  │                                   │  │
│  │  Schemas:                         │  │
│  │  - Profile (1 document)           │  │
│  │  - Experience (multiple)          │  │
│  │  - Projects (multiple)            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

**🎉 Your Apple-inspired CV website is ready!**

For detailed documentation, see: [SETUP-GUIDE.md](SETUP-GUIDE.md)
