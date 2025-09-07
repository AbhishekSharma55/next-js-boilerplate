# Tech Stack

This document outlines the complete technology stack used in the Next.js Shadcn Dashboard Starter project, including versions, purposes, and alternatives.

## 🚀 Core Framework

### Next.js 15.3.2
- **Purpose**: Full-stack React framework
- **Features Used**:
  - App Router (file-based routing)
  - Server Components
  - Server Actions
  - API Routes
  - Middleware
  - Image Optimization
- **Why**: Industry standard, excellent DX, built-in optimizations

### React 19.0.0
- **Purpose**: UI library
- **Features Used**:
  - Server Components
  - Client Components
  - Hooks
  - Context API
- **Why**: Latest version with improved performance and features

### TypeScript 5.7.2
- **Purpose**: Type safety and developer experience
- **Configuration**: Strict mode enabled
- **Why**: Prevents runtime errors, improves code quality

## 🎨 UI & Styling

### Tailwind CSS 4.0.0
- **Purpose**: Utility-first CSS framework
- **Configuration**: Custom design system
- **Why**: Rapid development, consistent design, small bundle size

### Shadcn/ui
- **Purpose**: Component library
- **Style**: New York variant
- **Base Color**: Zinc
- **Why**: Accessible, customizable, copy-paste components

### Radix UI
- **Purpose**: Headless UI primitives
- **Components Used**: 20+ components (accordion, dialog, dropdown, etc.)
- **Why**: Accessible, unstyled, composable

### Lucide React 0.476.0
- **Purpose**: Icon library
- **Why**: Consistent, lightweight, customizable icons

### Tabler Icons React 3.31.0
- **Purpose**: Additional icon set
- **Why**: Comprehensive icon collection

## 🗄️ Database & ORM

### PostgreSQL
- **Purpose**: Primary database
- **Why**: ACID compliance, JSON support, excellent performance

### Prisma 6.15.0
- **Purpose**: Database ORM and query builder
- **Features Used**:
  - Schema definition
  - Migrations
  - Query generation
  - Type safety
- **Why**: Type-safe, excellent DX, powerful query API

### @auth/prisma-adapter 2.10.0
- **Purpose**: NextAuth.js database adapter
- **Why**: Seamless integration with Prisma

## 🔐 Authentication

### NextAuth.js 4.24.11
- **Purpose**: Authentication framework
- **Providers**: Credentials, Google, GitHub
- **Strategy**: JWT
- **Why**: Industry standard, multiple providers, secure

### bcryptjs 3.0.2
- **Purpose**: Password hashing
- **Why**: Secure, widely used, Node.js compatible

## 📊 State Management

### Zustand 5.0.2
- **Purpose**: Client-side state management
- **Why**: Simple, lightweight, TypeScript-friendly

### React Hook Form 7.54.1
- **Purpose**: Form state management
- **Why**: Performance, validation, minimal re-renders

### @hookform/resolvers 3.9.1
- **Purpose**: Form validation resolvers
- **Why**: Integration with validation libraries

## 🔍 Data Validation

### Zod 3.24.1
- **Purpose**: Schema validation
- **Usage**: API validation, form validation, type inference
- **Why**: TypeScript-first, runtime validation, excellent DX

## 📋 Data Tables

### TanStack Table 8.21.2
- **Purpose**: Table component library
- **Features**: Sorting, filtering, pagination, column visibility
- **Why**: Headless, flexible, performant

## 🎯 URL State Management

### nuqs 2.4.1
- **Purpose**: URL search params state management
- **Why**: Type-safe, SSR-compatible, debounced

## 🎨 UI Enhancements

### Motion 11.17.0
- **Purpose**: Animation library
- **Why**: Framer Motion successor, better performance

### Sonner 1.7.1
- **Purpose**: Toast notifications
- **Why**: Beautiful, accessible, customizable

### nextjs-toploader 3.7.15
- **Purpose**: Page transition loader
- **Why**: Better UX, lightweight

## 🎨 Theme Management

### next-themes 0.4.6
- **Purpose**: Theme switching (light/dark)
- **Why**: SSR-compatible, system preference detection

## 🎨 Drag & Drop

### @dnd-kit 6.3.1+
- **Purpose**: Drag and drop functionality
- **Components**: Core, Sortable, Modifiers, Utilities
- **Why**: Accessible, performant, customizable

## 🔍 Search & Commands

### cmdk 1.1.1
- **Purpose**: Command palette
- **Why**: Fast, accessible, customizable

### kbar 0.1.0-beta.45
- **Purpose**: Command bar implementation
- **Why**: React-based, keyboard navigation

## 📅 Date Handling

### date-fns 4.1.0
- **Purpose**: Date manipulation
- **Why**: Modular, tree-shakeable, immutable

### react-day-picker 8.10.1
- **Purpose**: Date picker component
- **Why**: Accessible, customizable, headless

## 📊 Charts & Visualization

### Recharts 2.15.1
- **Purpose**: Chart library
- **Why**: React-native, composable, responsive

## 🛠️ Development Tools

### ESLint 8.48.0
- **Purpose**: Code linting
- **Config**: Next.js recommended + custom rules
- **Why**: Code quality, consistency

### Prettier 3.4.2
- **Purpose**: Code formatting
- **Plugin**: Tailwind CSS class sorting
- **Why**: Consistent formatting, team collaboration

### Husky 9.1.7
- **Purpose**: Git hooks
- **Why**: Pre-commit checks, code quality

### lint-staged 15.2.11
- **Purpose**: Run linters on staged files
- **Why**: Faster feedback, only check changed files

## 🔧 Build & Performance

### Turbopack
- **Purpose**: Fast bundler (development)
- **Why**: 10x faster than Webpack

### Sharp 0.33.5
- **Purpose**: Image optimization
- **Why**: High-performance image processing

## 📱 Responsive Design

### react-responsive 10.0.0
- **Purpose**: Responsive design hooks
- **Why**: Server-side rendering compatible

## 🎨 File Handling

### react-dropzone 14.3.5
- **Purpose**: File upload component
- **Why**: Drag & drop, validation, progress

## 🔍 Utilities

### clsx 2.1.1
- **Purpose**: Conditional className utility
- **Why**: Small, fast, TypeScript-friendly

### tailwind-merge 3.0.2
- **Purpose**: Tailwind class merging
- **Why**: Prevents class conflicts

### class-variance-authority 0.7.1
- **Purpose**: Component variant management
- **Why**: Type-safe variants, consistent API

## 🎨 Additional UI Components

### input-otp 1.4.2
- **Purpose**: OTP input component
- **Why**: Accessible, customizable

### vaul 1.1.2
- **Purpose**: Drawer component
- **Why**: Mobile-friendly, accessible

### react-resizable-panels 2.1.7
- **Purpose**: Resizable panel layouts
- **Why**: Flexible layouts, user customization

## 🔍 Data Processing

### match-sorter 8.0.0
- **Purpose**: Fuzzy search and sorting
- **Why**: Fast, flexible search algorithms

### sort-by 1.2.0
- **Purpose**: Array sorting utility
- **Why**: Simple, functional approach

## 🆔 ID Generation

### uuid 11.0.3
- **Purpose**: Unique identifier generation
- **Why**: Standard, reliable, widely supported

## 📊 Monitoring (Optional)

### Sentry 9.19.0
- **Purpose**: Error monitoring and performance tracking
- **Why**: Production error tracking, performance insights

## 🔄 Package Management

### pnpm
- **Purpose**: Package manager
- **Why**: Faster, disk-efficient, strict dependency resolution

## 📋 Version Management

### Node.js
- **Recommended Version**: 18.x or 20.x
- **Why**: LTS support, modern features

## 🎯 Architecture Decisions

### Why This Stack?

1. **Developer Experience**: TypeScript + Next.js + Tailwind provides excellent DX
2. **Performance**: Server Components, optimized builds, minimal JavaScript
3. **Scalability**: Feature-based architecture, modular components
4. **Maintainability**: Type safety, consistent patterns, good tooling
5. **Accessibility**: Radix UI primitives, semantic HTML
6. **Modern**: Latest versions, cutting-edge features

### Alternatives Considered

| Technology | Alternative | Why Not Chosen |
|------------|-------------|----------------|
| Next.js | Remix, SvelteKit | Next.js has better ecosystem |
| Tailwind | Styled Components, Emotion | Tailwind is faster, more maintainable |
| Prisma | TypeORM, Drizzle | Prisma has better DX and type safety |
| Zustand | Redux, Jotai | Zustand is simpler, less boilerplate |
| NextAuth | Auth0, Clerk | NextAuth is more flexible, self-hosted |

## 🚀 Getting Started

1. **Install dependencies**: `pnpm install`
2. **Set up environment**: Copy `.env.example` to `.env.local`
3. **Run database migrations**: `pnpm prisma migrate dev`
4. **Start development**: `pnpm dev`

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)

---

*This tech stack is chosen for its balance of developer experience, performance, and maintainability.*
