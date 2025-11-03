# QR Generator Application

## Overview

A full-stack web application for generating customizable QR codes. Users can input URLs, customize QR code appearance (colors, size, logo), preview in real-time, and download as PNG or SVG. Built with a utility-first design philosophy emphasizing clarity and immediate visual feedback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing (single-page application with `/` route)

**UI Component System:**
- Shadcn/ui component library (New York style variant) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design principles adapted for utility-focused workflows
- Component path aliasing (`@/components`, `@/lib`, `@/hooks`) for clean imports

**State Management:**
- React Hook Form with Zod validation for form state and validation
- TanStack Query (React Query) for server state management and API caching
- Local component state using React hooks for UI-specific state (file uploads, previews)

**Design System:**
- Custom CSS variables for theming (light/dark mode support via HSL color system)
- Consistent spacing primitives (Tailwind units: 2, 4, 6, 8)
- Typography hierarchy using Inter/Outfit font families
- Single-column card layout (max-width 600px) for focused workflow
- Progressive disclosure pattern: basic options first, advanced features accessible

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing
- TypeScript for type safety across the stack
- ESM module system for modern JavaScript features

**QR Code Generation:**
- `qrcode` library for generating QR codes in PNG and SVG formats
- `sharp` library for image manipulation (logo overlays on QR codes)
- Multipart form data handling via `multer` for logo file uploads (2MB limit, images only)

**API Design:**
- RESTful endpoint: `POST /api/generate` for QR code generation
- Accepts: URL, foreground color, background color, size, format (png/svg), and optional logo file
- Returns: Base64-encoded data URL or SVG string for immediate display
- Request validation using Zod schemas shared between client and server

**Development Features:**
- Custom request/response logging middleware for API debugging
- Vite integration in development mode with middleware passthrough
- Runtime error overlay for debugging (Replit-specific tooling)
- Raw body capture for webhook/API integrations

### Data Storage

**Current Implementation:**
- In-memory storage using `MemStorage` class with Map-based data structure
- Stores generated QR code metadata: URL, colors, size, logo presence, creation timestamp
- UUID-based ID generation for QR code records
- Interface-driven design (`IStorage`) for easy database migration

**Future Considerations:**
- Drizzle ORM configured for PostgreSQL migration (Neon Database serverless driver ready)
- Schema defined in `shared/schema.ts` with `qr_codes` table structure
- Migration files would be stored in `./migrations` directory
- Connection via environment variable `DATABASE_URL`

### Validation & Type Safety

**Shared Schema Layer:**
- Zod schemas in `shared/schema.ts` for runtime validation
- Type inference from Drizzle schema definitions
- Validation rules: URL format, hex color format (#RRGGBB), size constraints (200-400px)
- Shared types between frontend and backend prevent type drift

**Type System:**
- Strict TypeScript configuration across client, server, and shared code
- Path mapping for clean imports (`@/*`, `@shared/*`)
- Incremental compilation for faster development builds

### File Upload Handling

**Logo Upload Flow:**
- Client-side file input with preview using FileReader API
- Multipart/form-data submission with FormData API
- Server-side validation: file type checking, 2MB size limit
- Image processing: Sharp library composites logo onto QR code center
- Base64 encoding for client-side display without additional requests

**Security Measures:**
- MIME type validation on server
- File size limits enforced by multer
- Memory storage prevents filesystem pollution during development

### Code Organization

**Directory Structure:**
```
client/               # Frontend React application
  src/
    components/ui/    # Shadcn/ui component library
    pages/           # Route components (qr-generator, not-found)
    hooks/           # Custom React hooks (use-toast, use-mobile)
    lib/             # Utilities (queryClient, utils)
server/              # Backend Express application
  routes.ts          # API endpoint definitions
  storage.ts         # Data persistence layer
  vite.ts            # Development server integration
shared/              # Code shared between client and server
  schema.ts          # Zod validation schemas and types
```

**Rationale:**
- Clear separation between client and server code
- Shared code prevents duplication and type mismatches
- UI components isolated for reusability
- Server-side modules focused on single responsibilities

## External Dependencies

### Core Libraries

**Frontend:**
- `react` & `react-dom`: UI framework
- `@tanstack/react-query`: Server state management
- `react-hook-form`: Form handling
- `wouter`: Client-side routing
- `zod`: Schema validation
- `@hookform/resolvers`: React Hook Form + Zod integration

**UI Components:**
- `@radix-ui/*`: 20+ unstyled accessible primitives (dialogs, dropdowns, forms, etc.)
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority` & `clsx`: Dynamic className composition
- `tailwind-merge`: Tailwind class conflict resolution
- `lucide-react`: Icon library

**Backend:**
- `express`: HTTP server framework
- `qrcode`: QR code generation
- `sharp`: Image processing for logo overlays
- `multer`: Multipart form data parsing
- `drizzle-orm`: Database ORM (configured for future use)
- `@neondatabase/serverless`: PostgreSQL driver for serverless environments

### Development Tools

- `vite`: Build tool and dev server
- `@vitejs/plugin-react`: React Fast Refresh support
- `tsx`: TypeScript execution for development
- `esbuild`: Production bundling for server code
- `drizzle-kit`: Database migration toolkit
- `@replit/*` plugins: Runtime error overlay, cartographer, dev banner

### Configuration Files

- `components.json`: Shadcn/ui configuration (New York style, Tailwind paths)
- `tailwind.config.ts`: Custom design tokens, color system, border radius
- `tsconfig.json`: TypeScript compiler options with path mapping
- `vite.config.ts`: Build configuration with aliases and plugins
- `drizzle.config.ts`: Database connection and migration settings
- `postcss.config.js`: CSS processing (Tailwind + Autoprefixer)

### Environment Requirements

- `DATABASE_URL`: PostgreSQL connection string (required for database mode)
- `NODE_ENV`: Development vs production mode detection
- `REPL_ID`: Replit-specific environment detection for dev tooling