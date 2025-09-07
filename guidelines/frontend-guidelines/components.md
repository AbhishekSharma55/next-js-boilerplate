# Components

This document outlines the guidelines for creating and organizing React components in the Next.js Shadcn Dashboard Starter project.

## 🧩 Component Architecture

### Component Types

#### 1. UI Components (`/src/components/ui/`)
Base components from Shadcn/ui that provide the foundation for all other components.

```typescript
// Example: Button component
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

#### 2. Layout Components (`/src/components/layout/`)
Components that define the overall structure and layout of the application.

```typescript
// Example: App Sidebar
'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useSidebar } from '@/hooks/use-sidebar'

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function AppSidebar({ children, className, ...props }: AppSidebarProps) {
  const { isMobile, toggleSidebar } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={isMobile} onOpenChange={toggleSidebar}>
        <SheetContent side="left" className="p-0">
          <div className="flex h-full flex-col">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className={cn(
        'flex h-full w-64 flex-col border-r bg-background',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

#### 3. Feature Components (`/src/features/[feature]/components/`)
Components specific to a particular feature or domain.

```typescript
// Example: User Profile Card
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User } from '@/types/user'

interface UserProfileCardProps {
  user: User
  onEdit?: () => void
  onDelete?: () => void
}

export function UserProfileCard({ user, onEdit, onDelete }: UserProfileCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Avatar className="mx-auto h-24 w-24">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle>{user.name}</CardTitle>
        <Badge variant="secondary">{user.role}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-sm">{user.email}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Joined</p>
          <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

## 🏗️ Component Structure

### File Organization
```
components/
├── ui/                          # Base UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── index.ts                 # Barrel exports
├── layout/                      # Layout components
│   ├── app-sidebar.tsx
│   ├── header.tsx
│   └── index.ts
├── [feature]/                   # Feature-specific components
│   ├── user-profile-card.tsx
│   ├── product-list.tsx
│   └── index.ts
└── index.ts                     # Main barrel export
```

### Component File Structure
```typescript
// 1. Imports (organized by type)
import React from 'react'
import { NextPage } from 'next'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// 2. Types and Interfaces
interface ComponentProps {
  // Props definition
}

// 3. Component Implementation
export default function Component({ ...props }: ComponentProps) {
  // Component logic
  return (
    // JSX
  )
}

// 4. Named exports (if needed)
export { Component }
```

## 🎯 Component Guidelines

### 1. Single Responsibility Principle
Each component should have one clear purpose and responsibility.

```typescript
// ✅ Good - Single responsibility
export function UserAvatar({ user }: { user: User }) {
  return (
    <Avatar>
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}

// ❌ Bad - Multiple responsibilities
export function UserProfileWithActions({ user }: { user: User }) {
  return (
    <div>
      <Avatar>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <Button onClick={() => editUser(user.id)}>Edit</Button>
      <Button onClick={() => deleteUser(user.id)}>Delete</Button>
    </div>
  )
}
```

### 2. Composition Over Inheritance
Use composition to build complex components from simple ones.

```typescript
// ✅ Good - Composition
export function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <UserAvatar user={user} />
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <UserDetails user={user} />
        <UserActions user={user} />
      </CardContent>
    </Card>
  )
}

// ❌ Bad - Inheritance
export class UserCard extends Card {
  // Complex inheritance hierarchy
}
```

### 3. Props Interface Design
Design clear, well-typed props interfaces.

```typescript
// ✅ Good - Clear, well-typed props
interface UserCardProps {
  user: User
  showActions?: boolean
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  className?: string
}

// ❌ Bad - Unclear or poorly typed props
interface UserCardProps {
  data: any
  options?: any
  callback?: Function
}
```

### 4. Default Props and Variants
Use default props and variant systems for flexibility.

```typescript
// ✅ Good - Variants with defaults
const buttonVariants = cva(
  'base-styles',
  {
    variants: {
      variant: {
        primary: 'primary-styles',
        secondary: 'secondary-styles',
      },
      size: {
        sm: 'small-styles',
        md: 'medium-styles',
        lg: 'large-styles',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)
```

## 🔄 State Management in Components

### Local State
Use React hooks for component-local state.

```typescript
'use client'

import { useState, useEffect } from 'react'

export function UserForm({ user, onSubmit }: UserFormProps) {
  const [formData, setFormData] = useState(user)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      setErrors({ submit: 'Failed to save user' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Global State
Use Zustand for global state management.

```typescript
'use client'

import { useAuthStore } from '@/stores/auth-store'

export function UserProfile() {
  const { user, isLoading, signOut } = useAuthStore()

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <Button onClick={signOut}>Sign Out</Button>
    </div>
  )
}
```

## 🎨 Styling Components

### Tailwind CSS Classes
Use Tailwind CSS for styling with consistent patterns.

```typescript
// ✅ Good - Consistent Tailwind usage
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}>
      {children}
    </div>
  )
}

// ❌ Bad - Inconsistent or inline styles
export function Card({ children, className }: CardProps) {
  return (
    <div 
      className={className}
      style={{ borderRadius: '8px', border: '1px solid #ccc' }}
    >
      {children}
    </div>
  )
}
```

### CSS Variables
Use CSS variables for theming and consistency.

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
}
```

## 🔍 Component Testing

### Testing Structure
```typescript
// __tests__/user-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { UserCard } from '@/components/user-card'
import { mockUser } from '@/mocks/user'

describe('UserCard', () => {
  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />)
    
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()
    expect(screen.getByText(mockUser.email)).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<UserCard user={mockUser} onEdit={onEdit} />)
    
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(mockUser)
  })
})
```

## 📱 Responsive Design

### Mobile-First Approach
```typescript
export function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  )
}
```

### Breakpoint Usage
```typescript
// Use Tailwind breakpoints
<div className="
  w-full 
  sm:w-1/2 
  md:w-1/3 
  lg:w-1/4 
  xl:w-1/5
">
  Content
</div>
```

## ♿ Accessibility

### ARIA Attributes
```typescript
export function AccessibleButton({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      aria-label={props['aria-label'] || 'Button'}
      role="button"
      tabIndex={0}
    >
      {children}
    </button>
  )
}
```

### Keyboard Navigation
```typescript
export function KeyboardNavigableList({ items }: { items: Item[] }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      // Handle selection
    }
  }

  return (
    <ul role="listbox">
      {items.map((item) => (
        <li
          key={item.id}
          role="option"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {item.name}
        </li>
      ))}
    </ul>
  )
}
```

## 🚀 Performance Optimization

### Memoization
```typescript
import { memo, useMemo } from 'react'

export const ExpensiveComponent = memo(({ data }: { data: any[] }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true
    }))
  }, [data])

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
})
```

### Lazy Loading
```typescript
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./heavy-component'))

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

## 📋 Component Checklist

When creating a component, ensure:

- [ ] Component has a single responsibility
- [ ] Props are well-typed with TypeScript
- [ ] Component is accessible (ARIA attributes, keyboard navigation)
- [ ] Component is responsive (mobile-first design)
- [ ] Component follows naming conventions
- [ ] Component is properly exported
- [ ] Component has appropriate error boundaries
- [ ] Component is tested
- [ ] Component uses consistent styling patterns
- [ ] Component is documented with JSDoc comments

## 🎯 Best Practices

### 1. Keep Components Small
- Aim for components under 200 lines
- Break down large components into smaller ones
- Use composition to build complex UIs

### 2. Use TypeScript
- Define proper interfaces for props
- Use generic types when appropriate
- Leverage TypeScript's type inference

### 3. Follow Design Patterns
- Use compound components for complex UI
- Implement render props for flexibility
- Use higher-order components sparingly

### 4. Optimize for Performance
- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid unnecessary re-renders

### 5. Maintain Consistency
- Follow established patterns
- Use consistent naming conventions
- Maintain consistent styling approaches

---

*Following these component guidelines ensures maintainable, scalable, and performant React components.*
