# kasp - Electronic Music Producer EPK

## Overview
Personal website and Electronic Press Kit (EPK) for kasp, an electronic music producer and DJ specializing in speed garage and UK 2-step.

This is a Next.js 15 application built with React 19, TypeScript, and Tailwind CSS 4. The site features a newsletter landing page and an about section with music releases, DJ sets, gallery, and contact information.

## Project Structure
- `src/app/` - Next.js app router pages
  - `page.tsx` - Newsletter subscription landing page
  - `api/subscribe/route.ts` - Signed proxy to the Renders email control plane
  - `about/page.tsx` - Full EPK with gallery, releases, sets, and contact
  - `casa/page.tsx` - Guest guide page (password protected)
  - `layout.tsx` - Root layout with fonts and metadata
  - `globals.css` - Global styles and theme variables
- `src/components/` - React components
  - `ui/` - Shadcn UI components (button, card, input)
  - `section-card.tsx` - Reusable section wrapper component
- `src/config/` - Configuration files
  - `socials.ts` - Social media links and aliases
- `src/lib/` - Utility functions
- `public/` - Static assets (images)

## Technology Stack
- **Framework**: Next.js 15.5.2
- **React**: 19.1.0
- **TypeScript**: 5
- **Styling**: Tailwind CSS 4 with custom theme
- **UI Components**: Radix UI primitives, Shadcn UI pattern
- **Icons**: Lucide React
- **Newsletter**: Provider-neutral Renders email control plane

## Pages
- `/` - Newsletter subscription form for Kasp updates
- `/about` - Full EPK with bio, gallery, releases, sets, and contact
- `/casa` - Guest guide (password protected)

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
3. Modify content in `src/app/about/page.tsx` (bio, releases, sets, etc.)
4. Adjust theme colors in `src/app/globals.css`
5. Keep public signups fixed to the `kasp_updates` topic

## Deployment
The project is configured for Replit's autoscale deployment:
- Build command: `npm run build`
- Run command: `npm run start`
- Deployment type: autoscale (stateless)

Set `EMAIL_TRUSTED_PROXY=replit` alongside the server-only signup variables
documented in `.env.example`. The current Vercel deployment uses `vercel`.

## Recent Changes
- **2025-11-28**: Newsletter landing page
  - Moved EPK content from index to `/about` route
  - Created newsletter subscription form on index page
  - Integrated Loops.so API for newsletter subscriptions (form ID: cmii4epv4wyk92k0i8zg9ssxo)
  - Disabled Turbopack due to Replit symlink compatibility issue
- **2025-11-28**: Initial Replit setup
  - Configured Next.js to run on port 5000
  - Set up workflow for development server
  - Configured deployment settings
  - Added host configuration for Replit proxy compatibility
