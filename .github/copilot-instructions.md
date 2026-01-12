# My CV Website - Project Documentation

## Project Overview
This is a high-end personal CV website built with React (Vite), Tailwind CSS, and Framer Motion, following Apple's Human Interface Guidelines.

## Tech Stack
- **Framework**: React with Vite
- **Styling**: Tailwind CSS with custom Apple-inspired configuration
- **Animations**: Framer Motion
- **Icons**: lucide-react

## Design Principles
- Apple Human Interface Guidelines aesthetic
- Inter font family with tracking-tight for headings
- Bento Grid layout for portfolio section
- Pure white background (#FFFFFF) with light-grey secondary (#F5F5F7)
- Apple Blue (#0071E3) for primary buttons
- Large rounded corners (2.5rem) for cards
- Sticky navigation with backdrop-blur-md effect

## Project Structure
- `/src/App.jsx` - Main application component with all sections
- `/src/components/ProjectCard.jsx` - Reusable project card component
- `/src/index.css` - Global styles with Tailwind directives
- `tailwind.config.js` - Tailwind configuration with custom colors and fonts
- `postcss.config.js` - PostCSS configuration for Tailwind

## Sections Included
1. **Hero Section** - Large headline with gradient text and CTA button
2. **Experience Section** - Career history with company cards
3. **Tech Stack & Projects** - Bento grid showcasing skills and projects
4. **Footer** - Contact section with social links

## Running the Project
```bash
npm install
npm run dev
```

The site will be available at http://localhost:5173/

## Customization
- Update social links in the Footer section
- Replace placeholder content with your own experience and projects
- Adjust colors in tailwind.config.js
- Modify animations in App.jsx by changing Framer Motion parameters
