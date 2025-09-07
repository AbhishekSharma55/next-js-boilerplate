# Modules

This document outlines the guidelines for creating and organizing feature-based modules in the Next.js Shadcn Dashboard Starter project.

## 🏗️ Module Architecture

### Module Structure
```
features/
├── [feature-name]/
│   ├── components/              # Feature-specific components
│   │   ├── [component-name].tsx
│   │   ├── [component-name].test.tsx
│   │   └── index.ts            # Barrel exports
│   ├── hooks/                  # Feature-specific hooks
│   │   ├── use-[hook-name].ts
│   │   └── index.ts
│   ├── utils/                  # Feature utilities
│   │   ├── [utility-name].ts
│   │   └── index.ts
│   ├── types/                  # Feature types
│   │   └── index.ts
│   ├── constants/              # Feature constants
│   │   └── index.ts
│   └── index.ts                # Main module exports
```

## 🎯 Module Examples

### Authentication Module
```
features/auth/
├── components/
│   ├── sign-in-form.tsx
│   ├── sign-up-form.tsx
│   ├── github-auth-button.tsx
│   ├── user-auth-form.tsx
│   └── index.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-session.ts
│   └── index.ts
├── utils/
│   ├── validation.ts
│   ├── auth-helpers.ts
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

### Product Management Module
```
features/products/
├── components/
│   ├── product-list.tsx
│   ├── product-card.tsx
│   ├── product-form.tsx
│   ├── product-filters.tsx
│   ├── product-details.tsx
│   ├── product-actions.tsx
│   └── index.ts
├── hooks/
│   ├── use-products.ts
│   ├── use-product.ts
│   └── index.ts
├── utils/
│   ├── product-helpers.ts
│   ├── product-validation.ts
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

## 🧩 Module Components

### Feature Component Structure
```typescript
// features/products/components/product-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '../types'
import { formatPrice } from '../utils/product-helpers'

interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
}

export function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onView 
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = async () => {
    setIsLoading(true)
    try {
      await onEdit?.(product)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Badge variant="secondary">{product.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {formatPrice(product.price)}
          </span>
          <div className="flex gap-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(product)}>
                View
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEdit}
                disabled={isLoading}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onDelete(product)}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Module Hook
```typescript
// features/products/hooks/use-products.ts
'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Product, CreateProductData, UpdateProductData } from '../types'
import { productApi } from '../utils/product-api'

export function useProducts() {
  const queryClient = useQueryClient()

  const {
    data: products,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) =>
      productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return {
    products: products || [],
    isLoading,
    error,
    refetch,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
```

### Module Utilities
```typescript
// features/products/utils/product-helpers.ts
import { Product } from '../types'

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function formatProductDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function getProductStatus(product: Product): 'active' | 'inactive' | 'draft' {
  if (product.publishedAt) {
    return 'active'
  }
  if (product.draft) {
    return 'draft'
  }
  return 'inactive'
}

export function sortProducts(products: Product[], sortBy: string): Product[] {
  switch (sortBy) {
    case 'name':
      return [...products].sort((a, b) => a.name.localeCompare(b.name))
    case 'price':
      return [...products].sort((a, b) => a.price - b.price)
    case 'createdAt':
      return [...products].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    default:
      return products
  }
}

export function filterProducts(
  products: Product[], 
  filters: {
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
  }
): Product[] {
  return products.filter(product => {
    if (filters.category && product.category !== filters.category) {
      return false
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!product.name.toLowerCase().includes(searchLower) &&
          !product.description.toLowerCase().includes(searchLower)) {
        return false
      }
    }
    
    if (filters.minPrice && product.price < filters.minPrice) {
      return false
    }
    
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false
    }
    
    return true
  })
}
```

### Module Types
```typescript
// features/products/types/index.ts
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  draft?: boolean
}

export interface CreateProductData {
  name: string
  description: string
  price: number
  category: string
  image?: string
}

export interface UpdateProductData {
  name?: string
  description?: string
  price?: number
  category?: string
  image?: string
  publishedAt?: string
  draft?: boolean
}

export interface ProductFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'name' | 'price' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductListProps {
  products: Product[]
  filters?: ProductFilters
  onProductSelect?: (product: Product) => void
  onProductEdit?: (product: Product) => void
  onProductDelete?: (product: Product) => void
}
```

## 🔄 Module Integration

### Module Exports
```typescript
// features/products/index.ts
// Components
export { ProductCard } from './components/product-card'
export { ProductList } from './components/product-list'
export { ProductForm } from './components/product-form'
export { ProductFilters } from './components/product-filters'
export { ProductDetails } from './components/product-details'
export { ProductActions } from './components/product-actions'

// Hooks
export { useProducts } from './hooks/use-products'
export { useProduct } from './hooks/use-product'

// Utils
export { formatPrice, formatProductDate, getProductStatus } from './utils/product-helpers'
export { sortProducts, filterProducts } from './utils/product-helpers'

// Types
export type { Product, CreateProductData, UpdateProductData, ProductFilters } from './types'

// Constants
export { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from './constants'
```

### Using Modules in Pages
```typescript
// app/dashboard/products/page.tsx
import { 
  ProductList, 
  ProductFilters, 
  useProducts 
} from '@/features/products'

export default function ProductsPage() {
  const { 
    products, 
    isLoading, 
    createProduct, 
    updateProduct, 
    deleteProduct 
  } = useProducts()

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">
          Manage your product catalog
        </p>
      </div>
      
      <div className="mb-6">
        <ProductFilters />
      </div>
      
      <ProductList
        products={products}
        isLoading={isLoading}
        onProductEdit={updateProduct}
        onProductDelete={deleteProduct}
      />
    </div>
  )
}
```

## 🎯 Module Guidelines

### 1. Single Responsibility
Each module should have a clear, single responsibility.

```typescript
// ✅ Good - Clear responsibility
// features/auth/ - Handles authentication
// features/products/ - Manages products
// features/orders/ - Handles orders

// ❌ Bad - Mixed responsibilities
// features/user-management/ - Handles users, products, and orders
```

### 2. Self-Contained
Modules should be self-contained with minimal external dependencies.

```typescript
// ✅ Good - Self-contained
// features/products/
//   - Has its own components, hooks, utils, types
//   - Only depends on shared UI components and utilities

// ❌ Bad - Tightly coupled
// features/products/
//   - Depends on features/orders/components
//   - Shares state with features/inventory
```

### 3. Clear Interfaces
Modules should have clear, well-defined interfaces.

```typescript
// ✅ Good - Clear interface
export interface ProductModule {
  components: {
    ProductList: React.ComponentType<ProductListProps>
    ProductCard: React.ComponentType<ProductCardProps>
    ProductForm: React.ComponentType<ProductFormProps>
  }
  hooks: {
    useProducts: () => ProductsHookReturn
    useProduct: (id: string) => ProductHookReturn
  }
  utils: {
    formatPrice: (price: number) => string
    sortProducts: (products: Product[], sortBy: string) => Product[]
  }
}
```

### 4. Consistent Structure
All modules should follow the same structure and patterns.

```typescript
// Standard module structure
features/[module-name]/
├── components/          # React components
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── types/              # TypeScript types
├── constants/          # Module constants
└── index.ts            # Main exports
```

## 🔧 Module Development

### Creating a New Module
1. **Define the module scope and responsibility**
2. **Create the directory structure**
3. **Define types and interfaces**
4. **Create utility functions**
5. **Build components**
6. **Create custom hooks**
7. **Set up exports**
8. **Write tests**
9. **Document the module**

### Module Testing
```typescript
// features/products/__tests__/product-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '../components/product-card'
import { mockProduct } from '../__mocks__/product'

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<ProductCard product={mockProduct} onEdit={onEdit} />)
    
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(mockProduct)
  })
})
```

## 📋 Module Checklist

When creating a module, ensure:

- [ ] Module has a clear, single responsibility
- [ ] Module is self-contained with minimal external dependencies
- [ ] Module follows the standard directory structure
- [ ] All components are properly typed with TypeScript
- [ ] Custom hooks are implemented for data management
- [ ] Utility functions are pure and testable
- [ ] Types and interfaces are well-defined
- [ ] Module exports are properly organized
- [ ] Module is thoroughly tested
- [ ] Module is documented with examples

## 🚀 Best Practices

### 1. Keep Modules Focused
- Each module should handle one domain or feature
- Avoid mixing unrelated functionality
- Keep modules small and manageable

### 2. Use Consistent Patterns
- Follow the same structure across all modules
- Use consistent naming conventions
- Implement similar patterns for similar functionality

### 3. Minimize Dependencies
- Keep external dependencies to a minimum
- Use shared utilities and components when possible
- Avoid circular dependencies between modules

### 4. Test Thoroughly
- Write unit tests for components
- Test custom hooks
- Test utility functions
- Write integration tests for module functionality

### 5. Document Well
- Provide clear examples of how to use the module
- Document the module's purpose and scope
- Include JSDoc comments for complex functions

---

*Following these module guidelines ensures maintainable, scalable, and well-organized feature-based architecture.*
