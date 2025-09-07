# File Structure

This document provides detailed guidelines for organizing files and directories in the Next.js Shadcn Dashboard Starter project.

## 📁 Root Directory Structure

```
next-shadcn-dashboard-starter/
├── .env.example.txt              # Environment variables template
├── .gitignore                    # Git ignore rules
├── components.json               # Shadcn/ui configuration
├── next.config.ts                # Next.js configuration
├── next-env.d.ts                 # Next.js TypeScript declarations
├── package.json                  # Dependencies and scripts
├── pnpm-lock.yaml               # Package lock file
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── prisma/                      # Database schema and migrations
├── public/                      # Static assets
├── src/                         # Source code
└── guidelines/                  # Project documentation
```

## 🗂️ Source Directory (`/src/`)

### App Directory (`/src/app/`)
Next.js App Router structure:

```
app/
├── api/                         # API routes
│   ├── auth/
│   │   ├── [...nextauth]/
│   │   │   └── route.ts         # NextAuth.js API route
│   │   └── register/
│   │       └── route.ts         # User registration API
│   └── [feature]/               # Feature-specific API routes
├── auth/                        # Authentication pages
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx         # Sign-in page
│   └── sign-up/
│       └── [[...sign-up]]/
│           └── page.tsx         # Sign-up page
├── dashboard/                   # Protected dashboard area
│   ├── layout.tsx               # Dashboard layout
│   ├── page.tsx                 # Dashboard home
│   ├── overview/                # Overview page with parallel routes
│   │   ├── @area_stats/         # Parallel route: area charts
│   │   ├── @bar_stats/          # Parallel route: bar charts
│   │   ├── @pie_stats/          # Parallel route: pie charts
│   │   ├── @sales/              # Parallel route: sales data
│   │   ├── error.tsx            # Error boundary
│   │   └── layout.tsx           # Overview layout
│   ├── kanban/
│   │   └── page.tsx             # Kanban board page
│   ├── product/
│   │   ├── page.tsx             # Products list page
│   │   └── [productId]/
│   │       └── page.tsx         # Individual product page
│   └── profile/
│       └── [[...profile]]/
│           └── page.tsx         # User profile page
├── favicon.ico                  # Site favicon
├── globals.css                  # Global styles
├── global-error.tsx             # Global error boundary
├── layout.tsx                   # Root layout
├── not-found.tsx                # 404 page
├── page.tsx                     # Home page
└── theme.css                    # Theme-specific styles
```

### Components Directory (`/src/components/`)

```
components/
├── ui/                          # Shadcn/ui base components
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── alert.tsx
│   ├── avatar.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── table/
│   │   ├── data-table.tsx
│   │   ├── data-table-column-header.tsx
│   │   ├── data-table-pagination.tsx
│   │   └── [other table components]
│   └── [other UI components]
├── layout/                      # Layout components
│   ├── app-sidebar.tsx
│   ├── header.tsx
│   ├── page-container.tsx
│   ├── providers.tsx
│   ├── ThemeToggle/
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   └── user-nav.tsx
├── kbar/                        # Command palette components
│   ├── index.tsx
│   ├── render-result.tsx
│   ├── result-item.tsx
│   └── use-theme-switching.tsx
├── modal/                       # Modal components
│   └── alert-modal.tsx
├── providers/                   # Context providers
│   └── auth-provider.tsx
├── active-theme.tsx
├── breadcrumbs.tsx
├── file-uploader.tsx
├── form-card-skeleton.tsx
├── icons.tsx
├── nav-main.tsx
├── nav-projects.tsx
├── nav-user.tsx
├── org-switcher.tsx
├── search-input.tsx
├── theme-selector.tsx
└── user-avatar-profile.tsx
```

### Features Directory (`/src/features/`)

```
features/
├── auth/                        # Authentication feature
│   ├── components/
│   │   ├── github-auth-button.tsx
│   │   ├── sign-in-form.tsx
│   │   ├── sign-up-form.tsx
│   │   └── user-auth-form.tsx
│   └── utils/
│       └── [auth utilities]
├── kanban/                      # Kanban board feature
│   ├── components/
│   │   ├── [7 kanban components]
│   └── utils/
│       ├── index.ts
│       └── store.ts
├── overview/                    # Dashboard overview
│   └── components/
│       └── [9 overview components]
├── products/                    # Product management
│   └── components/
│       └── [7 product components]
└── profile/                     # User profile
    ├── components/
    │   └── [2 profile components]
    └── utils/
        └── form-schema.ts
```

### Hooks Directory (`/src/hooks/`)

```
hooks/
├── use-breadcrumbs.tsx
├── use-callback-ref.ts
├── use-callback-ref.tsx
├── use-controllable-state.tsx
├── use-data-table.ts
├── use-debounce.tsx
├── use-debounced-callback.ts
├── use-media-query.ts
├── use-mobile.tsx
└── use-multistep-form.tsx
```

### Library Directory (`/src/lib/`)

```
lib/
├── auth/
│   └── config.ts                # NextAuth.js configuration
├── db/
│   └── index.ts                 # Prisma client
├── utils.ts                     # General utilities
├── font.ts                      # Font configuration
├── format.ts                    # Formatting utilities
├── parsers.ts                   # Data parsers
├── searchparams.ts              # URL search params utilities
└── data-table.ts                # Data table utilities
```

### Types Directory (`/src/types/`)

```
types/
├── data-table.ts                # Data table types
├── index.ts                     # Main type exports
└── next-auth.d.ts               # NextAuth.js type extensions
```

### Configuration Files

```
config/
└── data-table.ts                # Data table configuration

constants/
├── data.ts                      # Mock data
└── mock-api.ts                  # Mock API responses
```

## 📄 File Naming Conventions

### React Components
- **PascalCase** for component files: `UserProfile.tsx`
- **kebab-case** for directories: `user-profile/`
- **index.ts** for barrel exports: `index.ts`

### Utilities and Hooks
- **camelCase** with prefix: `useAuth.ts`, `formatDate.ts`
- **kebab-case** for directories: `auth-utils/`

### Pages and API Routes
- **lowercase** for pages: `page.tsx`
- **lowercase** for API routes: `route.ts`
- **brackets** for dynamic routes: `[id]/page.tsx`

### Configuration Files
- **kebab-case**: `next.config.ts`, `tailwind.config.js`
- **dot-prefix** for hidden files: `.env.local`

## 🗂️ Directory Organization Rules

### 1. Feature-Based Organization
```
features/
├── [feature-name]/
│   ├── components/              # Feature-specific components
│   ├── utils/                   # Feature utilities
│   ├── types/                   # Feature types (if complex)
│   └── hooks/                   # Feature-specific hooks (if complex)
```

### 2. Shared Components
```
components/
├── ui/                          # Base UI components
├── layout/                      # Layout components
├── [feature]/                   # Feature-specific shared components
└── [utility]/                   # Utility components
```

### 3. API Routes
```
app/api/
├── [feature]/                   # Feature-specific API routes
│   ├── route.ts                 # Main API route
│   └── [sub-feature]/
│       └── route.ts             # Sub-feature API route
```

## 📋 File Structure Best Practices

### 1. Barrel Exports
Use `index.ts` files to create clean import paths:

```typescript
// components/ui/index.ts
export { Button } from './button'
export { Input } from './input'
export { Card } from './card'

// Usage
import { Button, Input, Card } from '@/components/ui'
```

### 2. Co-location
Keep related files together:

```
features/auth/
├── components/
│   ├── sign-in-form.tsx
│   ├── sign-up-form.tsx
│   └── index.ts                 # Export all components
├── utils/
│   ├── validation.ts
│   └── index.ts                 # Export all utilities
└── types.ts                     # Feature-specific types
```

### 3. Consistent Naming
- Use descriptive names that indicate purpose
- Follow established patterns
- Be consistent across the project

### 4. File Size Guidelines
- **Components**: Keep under 200 lines
- **Utilities**: Keep under 100 lines
- **Pages**: Keep under 300 lines
- **API Routes**: Keep under 150 lines

## 🔄 Import/Export Patterns

### Absolute Imports
```typescript
// Use @/ prefix for src directory
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { prisma } from '@/lib/db'
```

### Relative Imports
```typescript
// Use relative paths for same-level files
import { UserCard } from './user-card'
import { userSchema } from '../utils/schema'
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

## 📁 Special Directories

### Parallel Routes (`@folder`)
```
app/dashboard/overview/
├── @area_stats/
│   ├── default.tsx
│   └── page.tsx
├── @bar_stats/
│   ├── default.tsx
│   └── page.tsx
└── layout.tsx
```

### Dynamic Routes (`[param]`)
```
app/product/
├── page.tsx                     # /product
└── [productId]/
    └── page.tsx                 # /product/123
```

### Catch-All Routes (`[...param]`)
```
app/auth/
└── [[...sign-in]]/
    └── page.tsx                 # /auth/sign-in, /auth/sign-in/callback
```

## 🚀 Adding New Files

### 1. Determine Location
- **Shared component**: `/src/components/`
- **Feature component**: `/src/features/[feature]/components/`
- **Page**: `/src/app/[route]/page.tsx`
- **API route**: `/src/app/api/[route]/route.ts`
- **Utility**: `/src/lib/` or `/src/features/[feature]/utils/`

### 2. Follow Naming Conventions
- Use appropriate case for file type
- Be descriptive but concise
- Follow established patterns

### 3. Update Exports
- Add to relevant `index.ts` files
- Update import statements
- Ensure proper TypeScript types

### 4. Test Integration
- Verify imports work correctly
- Check TypeScript compilation
- Test functionality

## 🔍 File Organization Checklist

When organizing files, ask:

- [ ] Is this file in the right directory?
- [ ] Does the name clearly indicate its purpose?
- [ ] Are related files grouped together?
- [ ] Is the import/export structure clean?
- [ ] Does it follow established patterns?
- [ ] Is it properly typed with TypeScript?
- [ ] Are there any circular dependencies?

---

*Good file organization is crucial for maintainable code. Follow these guidelines to keep your project clean and scalable.*
