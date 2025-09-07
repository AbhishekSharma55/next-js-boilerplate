# Styling

This document outlines the guidelines for styling and CSS in the Next.js Shadcn Dashboard Starter project using Tailwind CSS and modern styling practices.

## 🎨 Styling Architecture

### CSS Organization
```
src/
├── app/
│   ├── globals.css              # Global styles and CSS variables
│   └── theme.css                # Theme-specific styles
├── components/
│   └── ui/                      # Component-specific styles
└── lib/
    └── utils.ts                 # Utility functions (cn)
```

## 🎯 Tailwind CSS Configuration

### Tailwind Config
```typescript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### CSS Variables
```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## 🎨 Component Styling

### Button Component
```typescript
// components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
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

### Card Component
```typescript
// components/ui/card.tsx
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

## 🎨 Layout Styling

### Container Styles
```typescript
// components/layout/page-container.tsx
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('container mx-auto px-4 py-6', className)}>
      {children}
    </div>
  )
}

// Usage
export function DashboardPage() {
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to your dashboard</p>
    </PageContainer>
  )
}
```

### Grid Layouts
```typescript
// components/layout/grid-layout.tsx
import { cn } from '@/lib/utils'

interface GridLayoutProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function GridLayout({ 
  children, 
  columns = 3, 
  gap = 'md',
  className 
}: GridLayoutProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }

  const gridGap = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div className={cn(
      'grid',
      gridCols[columns],
      gridGap[gap],
      className
    )}>
      {children}
    </div>
  )
}
```

### Flexbox Layouts
```typescript
// components/layout/flex-layout.tsx
import { cn } from '@/lib/utils'

interface FlexLayoutProps {
  children: React.ReactNode
  direction?: 'row' | 'col'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FlexLayout({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'md',
  className
}: FlexLayoutProps) {
  const flexDirection = {
    row: 'flex-row',
    col: 'flex-col',
  }

  const alignItems = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  const justifyContent = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }

  const flexGap = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div className={cn(
      'flex',
      flexDirection[direction],
      alignItems[align],
      justifyContent[justify],
      wrap && 'flex-wrap',
      flexGap[gap],
      className
    )}>
      {children}
    </div>
  )
}
```

## 🎨 Responsive Design

### Breakpoint Usage
```typescript
// Responsive component example
export function ResponsiveCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      w-full
      sm:w-1/2
      md:w-1/3
      lg:w-1/4
      xl:w-1/5
      p-4
      sm:p-6
      md:p-8
    ">
      {children}
    </div>
  )
}

// Responsive text
export function ResponsiveText({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="
      text-2xl
      sm:text-3xl
      md:text-4xl
      lg:text-5xl
      font-bold
      text-center
    ">
      {children}
    </h1>
  )
}
```

### Mobile-First Approach
```typescript
// Mobile-first responsive design
export function MobileFirstLayout() {
  return (
    <div className="
      // Mobile styles (default)
      flex flex-col space-y-4 p-4
      
      // Tablet styles
      md:flex-row md:space-y-0 md:space-x-4 md:p-6
      
      // Desktop styles
      lg:space-x-6 lg:p-8
      
      // Large desktop styles
      xl:space-x-8 xl:p-12
    ">
      <div className="
        w-full
        md:w-1/3
        lg:w-1/4
      ">
        Sidebar
      </div>
      <div className="
        w-full
        md:w-2/3
        lg:w-3/4
      ">
        Main content
      </div>
    </div>
  )
}
```

## 🎨 Theme Styling

### Dark Mode Support
```typescript
// components/theme-toggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Theme-Aware Components
```typescript
// Theme-aware component
export function ThemedCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      bg-white
      dark:bg-gray-900
      text-gray-900
      dark:text-gray-100
      border
      border-gray-200
      dark:border-gray-700
      rounded-lg
      p-6
      shadow-sm
      dark:shadow-lg
    ">
      {children}
    </div>
  )
}
```

## 🎨 Animation and Transitions

### CSS Animations
```css
/* app/globals.css */
@layer utilities {
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }

  .animate-slide-up {
    animation: slideUp 0.3s ease-out;
  }

  .animate-bounce-in {
    animation: bounceIn 0.6s ease-out;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

### Transition Classes
```typescript
// Transition utility classes
export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      transition-all
      duration-300
      ease-in-out
      hover:scale-105
      hover:shadow-lg
      focus:scale-105
      focus:shadow-lg
    ">
      {children}
    </div>
  )
}

// Loading animation
export function LoadingSpinner() {
  return (
    <div className="
      animate-spin
      rounded-full
      h-8
      w-8
      border-b-2
      border-primary
    " />
  )
}
```

## 🎨 Utility Classes

### Custom Utility Classes
```css
/* app/globals.css */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .gradient-text {
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}
```

### Spacing Utilities
```typescript
// Spacing utility component
export function Spacer({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const spacing = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-8',
    xl: 'h-16',
  }

  return <div className={spacing[size]} />
}
```

## 🎨 Form Styling

### Form Components
```typescript
// components/ui/input.tsx
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

### Form Layout
```typescript
// Form layout component
export function FormLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      max-w-md
      mx-auto
      space-y-6
      p-6
      bg-card
      rounded-lg
      border
      shadow-sm
    ">
      {children}
    </div>
  )
}

// Form field component
export function FormField({ 
  label, 
  error, 
  children 
}: { 
  label: string
  error?: string
  children: React.ReactNode 
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
```

## 📋 Styling Guidelines

### 1. Use Tailwind CSS Classes
- Prefer Tailwind utility classes over custom CSS
- Use consistent spacing and sizing scales
- Leverage Tailwind's responsive design features

### 2. Component Styling
- Use the `cn` utility for conditional classes
- Create reusable component variants
- Follow the design system patterns

### 3. Responsive Design
- Use mobile-first approach
- Test on different screen sizes
- Use appropriate breakpoints

### 4. Theme Support
- Use CSS variables for theming
- Support both light and dark modes
- Test theme switching functionality

### 5. Performance
- Minimize custom CSS
- Use Tailwind's purging features
- Optimize for production builds

## 🚀 Best Practices

### 1. Consistent Spacing
```typescript
// ✅ Good - Consistent spacing
<div className="space-y-4 p-6">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ Bad - Inconsistent spacing
<div className="space-y-2 p-4">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

### 2. Semantic Color Usage
```typescript
// ✅ Good - Semantic colors
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</button>

// ❌ Bad - Hardcoded colors
<button className="bg-blue-600 text-white hover:bg-blue-700">
  Primary Action
</button>
```

### 3. Responsive Design
```typescript
// ✅ Good - Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Item key={item.id} item={item} />)}
</div>

// ❌ Bad - Fixed layout
<div className="grid grid-cols-3 gap-4">
  {items.map(item => <Item key={item.id} item={item} />)}
</div>
```

### 4. Accessibility
```typescript
// ✅ Good - Accessible styling
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-ring
  focus:ring-offset-2
  disabled:opacity-50
  disabled:cursor-not-allowed
">
  Accessible Button
</button>
```

### 5. Performance
```typescript
// ✅ Good - Optimized classes
<div className="flex items-center justify-between p-4">
  <span>Content</span>
</div>

// ❌ Bad - Redundant classes
<div className="flex flex-row items-center justify-between p-4">
  <span>Content</span>
</div>
```

---

*Following these styling guidelines ensures consistent, maintainable, and performant CSS in your Next.js application.*
