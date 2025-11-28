# kasp - Electronic Music Producer EPK

## Overview
Personal website and Electronic Press Kit (EPK) for kasp, an electronic music producer and DJ specializing in speed garage and UK 2-step.

This is a Next.js 15 application built with React 19, TypeScript, and Tailwind CSS 4. The site features a modern, clean design showcasing music releases, DJ sets, gallery, and contact information.

## Project Structure
- `src/app/` - Next.js app router pages
  - `page.tsx` - Main homepage with all sections
  - `layout.tsx` - Root layout with fonts and metadata
  - `globals.css` - Global styles and theme variables
  - `casa/` - Additional page route
- `src/components/` - React components
  - `ui/` - Shadcn UI components (button, card, input)
  - `section-card.tsx` - Reusable section wrapper component
- `src/config/` - Configuration files
  - `socials.ts` - Social media links and aliases
- `src/lib/` - Utility functions
- `public/` - Static assets (images)

## Technology Stack
- **Framework**: Next.js 15.5.2 with Turbopack
- **React**: 19.1.0
- **TypeScript**: 5
- **Styling**: Tailwind CSS 4 with custom theme
- **UI Components**: Radix UI primitives, Shadcn UI pattern
- **Icons**: Lucide React

## Development
The project runs on port 5000 bound to 0.0.0.0 to work with Replit's proxy system.

### Available Scripts
- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm run start` - Start production server on port 5000
- `npm run lint` - Run ESLint

### Configuration
- The Next.js config allows all origins for server actions to work with Replit's iframe proxy
- Development and production servers bind to 0.0.0.0:5000

## Customization
To customize this site for your own use:

1. Update social media handles in `src/config/socials.ts`
2. Replace placeholder images in the gallery section
3. Modify content in `src/app/page.tsx` (bio, releases, sets, etc.)
4. Adjust theme colors in `src/app/globals.css`

## Deployment
The project is configured for Replit's autoscale deployment:
- Build command: `npm run build`
- Run command: `npm run start`
- Deployment type: autoscale (stateless)

## Recent Changes
- **2025-11-28**: Initial Replit setup
  - Configured Next.js to run on port 5000
  - Set up workflow for development server
  - Configured deployment settings
  - Added host configuration for Replit proxy compatibility
