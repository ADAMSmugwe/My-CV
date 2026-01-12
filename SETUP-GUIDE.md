# Full-Stack Apple CV - Complete Implementation Guide

## 🎨 Project Overview

A stunning personal CV website built with:
- **React (Vite)** - Lightning-fast development
- **Tailwind CSS** - Utility-first styling with Apple aesthetics  
- **Framer Motion** - Smooth Apple-style animations
- **Sanity.io** - Headless CMS for content management

## 📦 Installation

All packages are already installed. If you need to reinstall:

```bash
npm install
```

### Installed Dependencies:
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "framer-motion": "^12.25.0",
  "@sanity/client": "^7.14.0",
  "@sanity/image-url": "^2.0.2",
  "lucide-react": "^0.562.0",
  "sanity": "^5.2.0"
}
```

## 🚀 Running the Project

### 1. Start the Frontend (Vite Development Server)
```bash
npm run dev
```
The app will run at: `http://localhost:5173` or `http://localhost:5174`

### 2. Start Sanity Studio (Content Management)
```bash
npm run sanity
```
Sanity Studio will run at: `http://localhost:3333`

## 🔧 Configuration Files

### Sanity Client (`src/sanity/client.js`)
```javascript
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: '79b8oplb',
  dataset: 'production',
  apiVersion: 'v2024-01-01',
  useCdn: true
});
```

### Tailwind Config (`tailwind.config.cjs`)
Apple-inspired configuration with:
- **Inter font family** for that crisp Apple look
- **Custom colors**: `apple-blue` (#0071E3), `apple-grey` (#F5F5F7)
- **Extended border radius**: `rounded-apple` (2.5rem)
- **Apple easing curve**: `ease-apple` - cubic-bezier(0.22, 1, 0.36, 1)

## 🎬 Framer Motion Animations

The app uses the official Apple easing curve: `[0.22, 1, 0.36, 1]`

```javascript
const appleEase = [0.22, 1, 0.36, 1];

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: appleEase }
};
```

All animations use:
- **Scroll-triggered reveals** with `whileInView`
- **Stagger animations** for lists
- **Hover effects** with scale transformations
- **Apple-style transitions** (500ms with cubic-bezier easing)

## 📐 Apple Design Principles

### Typography
- **Hero headline**: `text-7xl md:text-8xl` with `tracking-tighter`
- **High contrast**: Black text (`text-black`) on pure white (`bg-white`)
- **Inter font** throughout for that modern Apple aesthetic

### Layout
- **Bento Grid**: 4-column responsive grid with varying spans
- **Large rounded corners**: `rounded-[2.5rem]` on all cards
- **Generous spacing**: Consistent padding and margins
- **Frosted glass nav**: `backdrop-blur-md bg-white/80`

### Colors
- **Pure white background**: `#FFFFFF`
- **Light grey cards**: `#F5F5F7` (Apple grey)
- **Primary blue**: `#0071E3` (Apple blue)
- **Gradient cards**: Beautiful gradient backgrounds for projects

## 📋 Sanity Schemas

### Profile Schema
```javascript
{
  name: 'profile',
  type: 'document',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'headline', type: 'string' },
    { name: 'bio', type: 'text' },
    { name: 'email', type: 'string' },
    { name: 'github', type: 'url' },
    { name: 'linkedin', type: 'url' }
  ]
}
```

### Experience Schema
```javascript
{
  name: 'experience',
  type: 'document',
  fields: [
    { name: 'company', type: 'string' },
    { name: 'role', type: 'string' },
    { name: 'startDate', type: 'string' },
    { name: 'endDate', type: 'string' },
    { name: 'description', type: 'text' },
    { name: 'techStack', type: 'array', of: [{ type: 'string' }] },
    { name: 'order', type: 'number' }
  ]
}
```

### Project Schema
```javascript
{
  name: 'project',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'description', type: 'text' },
    { name: 'techStack', type: 'array', of: [{ type: 'string' }] },
    { name: 'githubLink', type: 'url' },
    { name: 'liveLink', type: 'url' },
    { name: 'gradient', type: 'string' },
    { name: 'order', type: 'number' }
  ]
}
```

## 🔑 GROQ Queries Used

### Fetch Profile
```javascript
*[_type == "profile"][0]{
  name,
  headline,
  bio,
  email,
  github,
  linkedin
}
```

### Fetch Experiences
```javascript
*[_type == "experience"] | order(order asc){
  _id,
  company,
  role,
  startDate,
  endDate,
  description,
  techStack
}
```

### Fetch Projects
```javascript
*[_type == "project"] | order(order asc){
  _id,
  title,
  description,
  techStack,
  githubLink,
  liveLink,
  gradient
}
```

## ⚙️ CORS Configuration

**IMPORTANT:** To allow the frontend to fetch data from Sanity:

1. Go to https://www.sanity.io/manage
2. Select your project: **My CV** (ID: 79b8oplb)
3. Navigate to: **Settings → API → CORS Origins**
4. Add the following origins:
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:5174` (Alternate port)
   - `http://localhost:3000` (if needed)
5. Enable **"Allow credentials"**
6. Save changes

## 🎨 Bento Grid Layout

The projects section uses a dynamic Bento Grid:
- Every 5th project gets `lg:col-span-2 lg:row-span-2` (larger card)
- Responsive: 1 column on mobile, 2 on tablet, 4 on desktop
- Custom gradient backgrounds per project
- Hover effects with Apple easing

```jsx
const isLarge = index % 5 === 0;
const spanClass = isLarge ? 'lg:col-span-2 lg:row-span-2' : '';
```

## 📁 Project Structure

```
My CV/
├── src/
│   ├── App.jsx                 # Main single-file app
│   ├── main.jsx               # React entry point
│   ├── index.css              # Tailwind + Inter font
│   └── sanity/
│       └── client.js          # Sanity configuration
├── schemaTypes/
│   ├── profile.js             # Profile schema
│   ├── experience.js          # Experience schema
│   ├── project.js             # Project schema
│   └── index.js               # Schema exports
├── tailwind.config.cjs        # Apple-style Tailwind config
├── sanity.config.js           # Sanity Studio config
└── package.json               # Dependencies
```

## 🎯 Key Features

### ✅ Frosted Glass Navigation
- Sticky header with `backdrop-blur-md`
- Social links (GitHub, LinkedIn, Email)
- Smooth slide-in animation

### ✅ Hero Section
- Massive bold headline with `tracking-tighter`
- High-contrast black on white
- Animated CTA button with hover scale

### ✅ Experience Timeline
- Cards with `rounded-[2.5rem]`
- Company, role, dates, and description
- Tech stack badges
- Scroll-triggered stagger animations

### ✅ Bento Grid Projects
- 4-column responsive grid
- Gradient backgrounds (customizable per project)
- GitHub and Live links
- Hover overlay effects

### ✅ Contact Footer
- Large call-to-action
- Social media buttons with hover animations
- Clean copyright section

## 🔄 Adding Content

1. Start Sanity Studio: `npm run sanity`
2. Navigate to http://localhost:3333
3. Add your content:
   - **Profile**: Add one profile document
   - **Experience**: Add multiple experience entries (set `order` field)
   - **Projects**: Add multiple projects (set `order` and `gradient` fields)

### Available Gradient Options:
- `from-blue-500 to-cyan-500`
- `from-purple-500 to-pink-500`
- `from-orange-500 to-red-500`
- `from-green-500 to-emerald-500`
- `from-yellow-500 to-orange-500`

## 🚢 Deployment

### Deploy Frontend (Vercel/Netlify)
```bash
npm run build
```

### Deploy Sanity Studio
```bash
npm run sanity:deploy
```

## 🐛 Troubleshooting

### CORS Errors (403 Forbidden)
- Add your domain to Sanity CORS origins (see CORS Configuration section)

### Data Not Loading
1. Check Sanity Studio is running: `npm run sanity`
2. Verify content exists in Sanity
3. Check browser console for errors
4. Confirm CORS is configured

### Animation Issues
- Ensure Framer Motion is installed: `npm install framer-motion`
- Clear browser cache

## 📞 Support

For issues or questions:
- **Sanity Docs**: https://www.sanity.io/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Built with ❤️ using React, Tailwind CSS, Framer Motion, and Sanity.io**
