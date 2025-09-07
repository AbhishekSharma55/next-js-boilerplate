# Project Structure

This document outlines the overall architecture and organization of the Next.js Shadcn Dashboard Starter project.

## 🏗️ High-Level Architecture

The project follows a **feature-based architecture** combined with **layered architecture** principles:

```
src/
├── app/                    # Next.js App Router (Pages & API Routes)
├── components/             # Shared UI Components
├── features/              # Feature-based modules
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and configurations
├── types/                 # TypeScript type definitions
└── middleware.ts          # Next.js middleware
```

## 📁 Directory Breakdown

### `/src/app/` - Next.js App Router
The main application structure using Next.js 13+ App Router:

```
app/
├── api/                   # API routes
│   ├── auth/             # Authentication endpoints
│   └── register/         # User registration
├── auth/                 # Authentication pages
│   ├── sign-in/          # Sign-in page
│   └── sign-up/          # Sign-up page
├── dashboard/            # Protected dashboard area
│   ├── overview/         # Dashboard overview with parallel routes
│   ├── kanban/           # Kanban board
│   ├── product/          # Product management
│   └── profile/          # User profile
├── globals.css           # Global styles
├── layout.tsx            # Root layout
└── page.tsx              # Home page
```

**Key Principles:**
- Use App Router for all new pages
- Group related routes in folders
- Use parallel routes (`@folder`) for complex layouts
- Keep API routes organized by feature

### `/src/components/` - Shared Components
Reusable UI components organized by type:

```
components/
├── ui/                   # Shadcn/ui base components
├── layout/               # Layout-specific components
├── kbar/                 # Command palette components
├── modal/                # Modal components
├── providers/            # Context providers
└── [feature-specific]/   # Feature-specific shared components
```

**Key Principles:**
- Keep components small and focused
- Use composition over inheritance
- Follow single responsibility principle
- Export components from index files

### `/src/features/` - Feature Modules
Self-contained feature modules:

```
features/
├── auth/                 # Authentication feature
│   ├── components/       # Auth-specific components
│   └── utils/           # Auth utilities
├── kanban/              # Kanban board feature
│   ├── components/      # Kanban components
│   └── utils/          # Kanban utilities
├── overview/            # Dashboard overview
├── products/            # Product management
└── profile/             # User profile
```

**Key Principles:**
- Each feature is self-contained
- Features can have their own components, utils, and types
- Avoid cross-feature dependencies
- Use feature flags for optional features

### `/src/lib/` - Utility Libraries
Shared utilities and configurations:

```
lib/
├── auth/                # Authentication configuration
├── db/                  # Database connection
├── utils.ts             # General utilities
├── format.ts            # Formatting functions
├── parsers.ts           # Data parsers
└── searchparams.ts      # URL search params utilities
```

**Key Principles:**
- Keep utilities pure and testable
- Use TypeScript for type safety
- Document complex utilities
- Avoid side effects in utility functions

## 🔄 Data Flow Architecture

### Client-Side State Management
```
User Interaction → Component → Hook → Zustand Store → Component Re-render
```

### Server-Side Data Flow
```
Component → Server Action/API Route → Prisma → Database → Response → Component
```

### Authentication Flow
```
User → NextAuth.js → Prisma Adapter → Database → Session → Protected Routes
```

## 🎯 Design Patterns

### 1. Feature-Based Organization
- Group related functionality together
- Minimize coupling between features
- Enable independent development

### 2. Layered Architecture
- **Presentation Layer**: Components and pages
- **Business Logic Layer**: Hooks and utilities
- **Data Access Layer**: Prisma and API routes
- **Infrastructure Layer**: Database and external services

### 3. Composition Pattern
- Build complex components from simple ones
- Use React composition patterns
- Leverage Shadcn/ui component composition

### 4. Provider Pattern
- Use React Context for global state
- Implement provider composition
- Keep providers focused and minimal

## 📊 Scalability Considerations

### Horizontal Scaling
- Feature modules can be developed independently
- Components are reusable across features
- API routes are stateless and scalable

### Vertical Scaling
- Clear separation of concerns
- Modular architecture allows for easy refactoring
- TypeScript provides compile-time safety

### Performance
- Code splitting at the feature level
- Lazy loading for heavy components
- Optimized bundle sizes with tree shaking

## 🛠️ Development Workflow

### Adding New Features
1. Create feature directory in `/src/features/`
2. Add components, utils, and types
3. Create API routes if needed
4. Add to navigation and routing
5. Update documentation

### Adding New Components
1. Determine if it's shared or feature-specific
2. Place in appropriate directory
3. Follow naming conventions
4. Add TypeScript types
5. Export from index file

### Adding New Pages
1. Create in `/src/app/` following App Router conventions
2. Add layout if needed
3. Implement authentication if required
4. Add to navigation
5. Test routing

## 🔍 Code Organization Best Practices

### File Naming
- Use kebab-case for files and directories
- Use PascalCase for React components
- Use camelCase for utilities and hooks

### Import Organization
```typescript
// 1. React and Next.js imports
import React from 'react'
import { NextPage } from 'next'

// 2. Third-party libraries
import { z } from 'zod'
import { toast } from 'sonner'

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

// 4. Relative imports
import './component.css'
```

### Export Patterns
```typescript
// Default export for main component
export default function MyComponent() {
  return <div>...</div>
}

// Named exports for utilities
export const myUtility = () => { ... }
export const myConstant = 'value'

// Re-export from index files
export { MyComponent } from './my-component'
export { myUtility } from './utils'
```

## 🚀 Getting Started

1. **Understand the structure**: Read this document thoroughly
2. **Explore existing code**: Look at similar features for patterns
3. **Follow conventions**: Use established naming and organization patterns
4. **Ask questions**: Don't hesitate to ask about unclear patterns
5. **Contribute**: Help improve the structure as the project grows

---

*This structure is designed to scale with your application while maintaining clarity and organization.*
