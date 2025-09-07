# Pages

This document outlines the guidelines for creating and organizing pages in the Next.js Shadcn Dashboard Starter project using the App Router.

## 🏗️ App Router Structure

### Page File Organization
```
app/
├── page.tsx                     # Home page (/)
├── layout.tsx                   # Root layout
├── globals.css                  # Global styles
├── not-found.tsx                # 404 page
├── global-error.tsx             # Global error boundary
├── auth/                        # Authentication pages
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx         # /auth/sign-in
│   └── sign-up/
│       └── [[...sign-up]]/
│           └── page.tsx         # /auth/sign-up
├── dashboard/                   # Protected dashboard
│   ├── layout.tsx               # Dashboard layout
│   ├── page.tsx                 # /dashboard
│   ├── overview/                # Overview page
│   │   ├── layout.tsx           # Overview layout
│   │   ├── page.tsx             # /dashboard/overview
│   │   ├── @area_stats/         # Parallel route
│   │   ├── @bar_stats/          # Parallel route
│   │   ├── @pie_stats/          # Parallel route
│   │   ├── @sales/              # Parallel route
│   │   └── error.tsx            # Overview error boundary
│   ├── kanban/
│   │   └── page.tsx             # /dashboard/kanban
│   ├── product/
│   │   ├── page.tsx             # /dashboard/product
│   │   └── [productId]/
│   │       └── page.tsx         # /dashboard/product/123
│   └── profile/
│       └── [[...profile]]/
│           └── page.tsx         # /dashboard/profile
└── api/                         # API routes
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts         # /api/auth/[...nextauth]
    └── register/
        └── route.ts             # /api/register
```

## 📄 Page Component Structure

### Basic Page Component
```typescript
// app/dashboard/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardStats } from '@/components/dashboard-stats'

export const metadata: Metadata = {
  title: 'Dashboard | Next.js App',
  description: 'Main dashboard page with overview and statistics',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="container mx-auto py-6">
      <DashboardHeader user={session.user} />
      <DashboardStats />
    </div>
  )
}
```

### Page with Dynamic Routes
```typescript
// app/dashboard/product/[productId]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/products'
import { ProductDetails } from '@/components/product-details'
import { ProductActions } from '@/components/product-actions'

interface ProductPageProps {
  params: {
    productId: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductById(params.productId)
  
  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} | Products`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.productId)
  
  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <ProductDetails product={product} />
      <ProductActions product={product} />
    </div>
  )
}
```

### Page with Search Parameters
```typescript
// app/dashboard/products/page.tsx
import { Metadata } from 'next'
import { Suspense } from 'react'
import { ProductsList } from '@/components/products-list'
import { ProductsFilters } from '@/components/products-filters'
import { ProductsSkeleton } from '@/components/products-skeleton'

interface ProductsPageProps {
  searchParams: {
    category?: string
    search?: string
    page?: string
    sort?: string
  }
}

export const metadata: Metadata = {
  title: 'Products | Dashboard',
  description: 'Browse and manage products',
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">
          Manage your product catalog
        </p>
      </div>
      
      <div className="mb-6">
        <ProductsFilters />
      </div>
      
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
```

## 🎨 Layout Components

### Root Layout
```typescript
// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Next.js Dashboard',
    template: '%s | Next.js Dashboard',
  },
  description: 'A modern dashboard built with Next.js and Shadcn/ui',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
```

### Nested Layout
```typescript
// app/dashboard/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## 🔄 Parallel Routes

### Overview Page with Parallel Routes
```typescript
// app/dashboard/overview/layout.tsx
import { Suspense } from 'react'
import { AreaStatsSkeleton } from '@/components/area-stats-skeleton'
import { BarStatsSkeleton } from '@/components/bar-stats-skeleton'
import { PieStatsSkeleton } from '@/components/pie-stats-skeleton'
import { SalesSkeleton } from '@/components/sales-skeleton'

export default function OverviewLayout({
  children,
  area_stats,
  bar_stats,
  pie_stats,
  sales,
}: {
  children: React.ReactNode
  area_stats: React.ReactNode
  bar_stats: React.ReactNode
  pie_stats: React.ReactNode
  sales: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      {children}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<AreaStatsSkeleton />}>
          {area_stats}
        </Suspense>
        <Suspense fallback={<BarStatsSkeleton />}>
          {bar_stats}
        </Suspense>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<PieStatsSkeleton />}>
          {pie_stats}
        </Suspense>
        <Suspense fallback={<SalesSkeleton />}>
          {sales}
        </Suspense>
      </div>
    </div>
  )
}
```

### Parallel Route Component
```typescript
// app/dashboard/overview/@area_stats/page.tsx
import { getAreaStats } from '@/lib/stats'
import { AreaChart } from '@/components/area-chart'

export default async function AreaStatsPage() {
  const data = await getAreaStats()
  
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Area Statistics</h3>
      <AreaChart data={data} />
    </div>
  )
}
```

## 🚨 Error Handling

### Page-Level Error Boundary
```typescript
// app/dashboard/overview/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function OverviewError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Overview page error:', error)
  }, [error])

  return (
    <div className="container mx-auto py-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong loading the overview data.
        </AlertDescription>
      </Alert>
      
      <div className="mt-4">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      </div>
    </div>
  )
}
```

### Global Error Boundary
```typescript
// app/global-error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong!</AlertTitle>
              <AlertDescription>
                An unexpected error occurred. Please try again.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4">
              <Button onClick={reset} variant="outline">
                Try again
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
```

### Not Found Page
```typescript
// app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The page you're looking for doesn't exist.
        </p>
        
        <div className="mt-6 flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

## 🔐 Authentication Pages

### Sign In Page
```typescript
// app/auth/sign-in/[[...sign-in]]/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { SignInForm } from '@/components/auth/sign-in-form'

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  )
}
```

## 📊 Loading States

### Loading Component
```typescript
// app/dashboard/overview/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function OverviewLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}
```

## 🎯 Page Guidelines

### 1. Server Components First
- Use Server Components by default
- Only use Client Components when necessary
- Leverage server-side data fetching

### 2. Proper Metadata
- Define metadata for SEO
- Use dynamic metadata when appropriate
- Include proper Open Graph tags

### 3. Error Handling
- Implement error boundaries
- Provide fallback UI
- Log errors appropriately

### 4. Loading States
- Show loading skeletons
- Use Suspense boundaries
- Provide feedback to users

### 5. Authentication
- Protect routes appropriately
- Redirect unauthenticated users
- Handle session states

## 📋 Page Checklist

When creating a page, ensure:

- [ ] Page follows App Router conventions
- [ ] Proper metadata is defined
- [ ] Error boundaries are implemented
- [ ] Loading states are handled
- [ ] Authentication is properly managed
- [ ] Page is responsive
- [ ] SEO is optimized
- [ ] TypeScript types are defined
- [ ] Page is tested
- [ ] Performance is optimized

## 🚀 Best Practices

### 1. Use Server Components
```typescript
// ✅ Good - Server Component
export default async function ProductsPage() {
  const products = await getProducts()
  return <ProductsList products={products} />
}

// ❌ Bad - Unnecessary Client Component
'use client'
export default function ProductsPage() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    getProducts().then(setProducts)
  }, [])
  return <ProductsList products={products} />
}
```

### 2. Implement Proper Error Handling
```typescript
// ✅ Good - Error boundary
export default function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  if (!product) {
    notFound()
  }
  return <ProductDetails product={product} />
}
```

### 3. Use Suspense for Loading States
```typescript
// ✅ Good - Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
```

### 4. Optimize Metadata
```typescript
// ✅ Good - Dynamic metadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  return {
    title: product.name,
    description: product.description,
  }
}
```

---

*Following these page guidelines ensures well-structured, performant, and maintainable Next.js pages.*
