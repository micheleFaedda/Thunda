# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is an Astro project using pnpm as the package manager. All commands should be run from the project root:

- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server at localhost:4321
- `pnpm build` - Build production site to ./dist/
- `pnpm preview` - Preview production build locally
- `pnpm astro check` - Run TypeScript and Astro diagnostics
- `pnpm lint` - Run ESLint to check for code quality issues
- `pnpm lint:fix` - Run ESLint and automatically fix issues
- `pnpm astro -- --help` - Get help with Astro CLI commands

## Project Architecture

This is a static Astro website for "Tundha", a Sardinian pizza restaurant in Cagliari. The site uses Astro's component-based architecture with performance optimizations for production deployment.

### Core Structure

- **Layout System**: Single main layout (`src/layouts/Layout.astro`) with environment-based conditional rendering
  - Development mode: Full site with Menu → Content → Footer flow
  - Production mode: Coming Soon component only (site under development)
- **Page Routing**: Static pages in `src/pages/`
  - Main site: `index.astro` (renders Home component)
  - Secondary pages: `about-us.astro`, `contact-us.astro`, `lavora-con-noi.astro`, `privacy-policy.astro`, `cookie-policy.astro`
- **Component Organization**: All components in `src/components/` are Astro components with embedded styles
  - Content sections: Home, AboutUs, FoodMenu, Where, When, Book
  - UI elements: Menu, Footer, PhotoCarousel, AwardCarousel, Award, Signature
  - Special: ComingSoon (production placeholder)

### Key Configuration

- **Site URL**: https://tundha.it (configured in astro.config.mjs)
- **External Links**: Menu and booking redirects to external services (defined in `src/constants.ts`)
  - Menu: https://www.pbread.it/gourmet/menu-cena/
  - Booking: Google Maps reservation system
- **Redirects**: `/pbread` → https://pbread.it
- **Path Aliases**:
  - `@assets/*` → `src/assets/*`
  - `@components/*` → `src/components/*`
  - `@styles/*` → `src/styles/*`
  - `@layouts/*` → `src/layouts/*`

### Performance Optimizations

- **Build Configuration**: HTML compression, CSS inlining, code splitting enabled
- **Vite Optimizations**:
  - Manual chunks for vendor code and carousel component
  - Optimized asset naming for caching
  - Sharp image service for image optimization
- **Font Loading**: Google Fonts (Nunito, Averia Serif Libre) optimized via astro-google-fonts-optimizer
- **Prefetching**: Hover-based prefetching strategy for faster navigation

### Development Notes

- **TypeScript**: Uses Astro's strictest configuration
- **Styling**: Global styles in `src/styles/global.css`, component-specific styles in `.astro` files
- **Assets**: SVG logos and awards in `src/assets/`
- **SEO**: Structured data for restaurant schema included in Layout
- **No Testing Framework**: Project does not include test files or testing commands
- **Pre-commit Hook**: Runs `pnpm lint` automatically before each commit via husky and lint-staged

## Important Development Guidelines

- **ALWAYS PASS LINTING**: When committing changes, ensure all linting passes. Fix ESLint and TypeScript errors rather than bypassing with `--no-verify`. The pre-commit hooks exist to maintain code quality.

## Menu Management System

The project uses a YAML-based menu management system for easy content updates:

- **Menu Data**: All menu content is stored in `/src/data/menu/*.yaml` files
- **Images**: Menu item images go in `/src/data/menu/images/{category}/` directories
- **Validation**: Build-time validation ensures YAML structure is correct
- **Documentation**: See `MENU_GUIDE.md` for detailed editing instructions
- **No Code Changes**: Menu updates require only YAML editing, no Astro component changes
