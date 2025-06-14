# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `bun run dev` - Start development server
- `bun run build` - Build production version
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

### Package Management
This project uses bun as the preferred package manager. Supabase packages are managed through bun.

## Architecture Overview

### Core Application Structure
This is a Next.js 15 student ID card management system with Supabase integration:

- **Main Flow**: Home page → Student Form → ID Card Preview → Database Save
- **State Management**: React state for form data and UI flow control
- **Data Storage**: Supabase PostgreSQL database with direct frontend connection
- **Authentication**: Middleware ready for future auth implementation

### Key Components
- `app/page.tsx` - Main application orchestration with multi-step workflow
- `components/student-form.tsx` - Form for collecting student information
- `components/id-card-preview.tsx` - Visual ID card display component
- `lib/supabase/` - Supabase client utilities and type definitions
- `middleware.ts` - Auth token refresh and session management

### Data Model
The `StudentData` interface (defined in `app/page.tsx`) represents the core data structure:
- Basic info: name, class, section, admission number
- Personal details: date of birth (split into day/month/year), blood group, contact, address
- System fields: optional ID for saved records

### UI Framework
- **Styling**: Tailwind CSS with custom color palette and animations
- **Components**: Radix UI components via shadcn/ui pattern
- **Responsive**: Mobile-first design with `useIsMobile` hook
- **Notifications**: Sonner toast system available

### Database Integration
- **Supabase Integration**: Direct frontend-to-database connection using Supabase client
- **Schema**: PostgreSQL table with proper indexes and constraints
- **Setup Guide**: See `docs/SUPABASE_SETUP.md` for complete setup instructions
- **Type Safety**: TypeScript interfaces for database operations in `lib/supabase/types.ts`

## Technical Configuration

### TypeScript Setup
- Path aliases: `@/*` maps to root directory
- Strict mode enabled
- Build errors and ESLint ignored during builds (configured in `next.config.mjs`)

### Import Patterns
- UI components: `@/components/ui/*`
- Custom components: `@/components/*`
- Types: Import from `@/app/page` for `StudentData`
- Hooks: `@/hooks/*` (duplicated in `components/ui/` - use hooks/ directory)

### Styling Conventions
- Gradient backgrounds for different sections (blue/indigo for home, orange/yellow for form)
- Color-coded buttons (green for submit/save, yellow for navigation, blue for primary actions)
- Card-based layout pattern throughout

## Development Notes

### Current Limitations
- No authentication system (middleware ready for implementation)
- No file upload for student photos
- No print functionality for ID cards
- No advanced search/filtering capabilities

### Mobile Detection
The codebase has duplicate `useIsMobile` hooks in both `hooks/` and `components/ui/`. Use the one in `hooks/` directory as the canonical version.