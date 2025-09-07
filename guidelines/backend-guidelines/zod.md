# Zod

This document outlines the guidelines for using Zod for schema validation and type safety in the Next.js Shadcn Dashboard Starter project.

## 🏗️ Zod Architecture

### Schema Organization
```
lib/
├── schemas/
│   ├── auth.ts                # Authentication schemas
│   ├── user.ts                # User schemas
│   ├── product.ts             # Product schemas
│   ├── common.ts              # Common schemas
│   └── index.ts               # Schema exports
└── validation/
    ├── middleware.ts          # Validation middleware
    └── utils.ts               # Validation utilities
```

## 🎯 Basic Schema Patterns

### Simple Schemas
```typescript
// lib/schemas/common.ts
import { z } from 'zod'

// Basic types
export const emailSchema = z.string().email('Invalid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long')
export const phoneSchema = z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number')

// Date schemas
export const dateSchema = z.string().datetime()
export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')

// ID schemas
export const idSchema = z.string().uuid('Invalid ID format')
export const cuidSchema = z.string().cuid('Invalid CUID format')

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.record(z.any()).optional(),
})
```

### Complex Schemas
```typescript
// lib/schemas/user.ts
import { z } from 'zod'
import { emailSchema, nameSchema, phoneSchema } from './common'

// User role enum
export const userRoleSchema = z.enum(['admin', 'user', 'moderator'])

// User status enum
export const userStatusSchema = z.enum(['active', 'inactive', 'pending', 'suspended'])

// Base user schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  name: nameSchema,
  phone: phoneSchema.optional(),
  role: userRoleSchema,
  status: userStatusSchema,
  avatar: z.string().url().optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  website: z.string().url().optional(),
  location: z.string().max(100, 'Location too long').optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().optional(),
})

// Create user schema
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
}).extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Update user schema
export const updateUserSchema = userSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
})

// User filters schema
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
})

// User query schema
export const userQuerySchema = z.object({
  filters: userFiltersSchema.optional(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  sorting: z.object({
    sortBy: z.enum(['name', 'email', 'createdAt', 'lastLoginAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
})
```

## 🔐 Authentication Schemas

### Auth Schemas
```typescript
// lib/schemas/auth.ts
import { z } from 'zod'
import { emailSchema, passwordSchema } from './common'

// Sign in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().default(false),
})

// Sign up schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Reset password schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
})

// Reset password confirm schema
export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// OAuth callback schema
export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
  provider: z.enum(['google', 'github', 'facebook']),
})
```

## 📊 Product Schemas

### Product Schemas
```typescript
// lib/schemas/product.ts
import { z } from 'zod'

// Product category schema
export const productCategorySchema = z.enum([
  'electronics',
  'clothing',
  'books',
  'home',
  'sports',
  'beauty',
  'automotive',
  'other',
])

// Product status schema
export const productStatusSchema = z.enum(['draft', 'active', 'inactive', 'archived'])

// Product schema
export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  price: z.number().positive('Price must be positive'),
  category: productCategorySchema,
  status: productStatusSchema,
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  tags: z.array(z.string()).max(10, 'Too many tags'),
  inventory: z.object({
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
    lowStockThreshold: z.number().int().min(0).default(10),
  }),
  specifications: z.record(z.string(), z.any()).optional(),
  seo: z.object({
    title: z.string().max(60, 'SEO title too long').optional(),
    description: z.string().max(160, 'SEO description too long').optional(),
    keywords: z.array(z.string()).max(10, 'Too many keywords').optional(),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
})

// Create product schema
export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
})

// Update product schema
export const updateProductSchema = productSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

// Product filters schema
export const productFiltersSchema = z.object({
  search: z.string().optional(),
  category: productCategorySchema.optional(),
  status: productStatusSchema.optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  inStock: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
})

// Product query schema
export const productQuerySchema = z.object({
  filters: productFiltersSchema.optional(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  sorting: z.object({
    sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
})
```

## 🔧 Validation Utilities

### Validation Middleware
```typescript
// lib/validation/middleware.ts
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return { success: false, error: result.error }
}

export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: NextRequest) => {
    const body = req.body
    const result = schema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.errors },
        { status: 400 }
      )
    }
    
    return result.data
  }
}

export function validateQuery<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams) {
  const params = Object.fromEntries(searchParams.entries())
  return schema.safeParse(params)
}

export function validateParams<T>(schema: z.ZodSchema<T>, params: Record<string, string>) {
  return schema.safeParse(params)
}
```

### Validation Utilities
```typescript
// lib/validation/utils.ts
import { z } from 'zod'

export function formatZodError(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    formattedErrors[path] = err.message
  })
  
  return formattedErrors
}

export function createErrorResponse(error: z.ZodError) {
  return {
    success: false,
    error: 'Validation failed',
    details: formatZodError(error),
  }
}

export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
  }
}

export function validateAndTransform<T, R>(
  schema: z.ZodSchema<T>,
  data: unknown,
  transform?: (data: T) => R
): { success: true; data: R } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    return { success: false, error: result.error }
  }
  
  const transformedData = transform ? transform(result.data) : (result.data as unknown as R)
  return { success: true, data: transformedData }
}
```

## 🎯 Form Integration

### React Hook Form Integration
```typescript
// lib/schemas/form-schemas.ts
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// User form schema
export const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user', 'moderator']),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
})

export type UserFormData = z.infer<typeof userFormSchema>

// Product form schema
export const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  category: z.enum(['electronics', 'clothing', 'books', 'home', 'sports']),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  tags: z.array(z.string()).max(10, 'Too many tags'),
})

export type ProductFormData = z.infer<typeof productFormSchema>

// Form resolver
export const userFormResolver = zodResolver(userFormSchema)
export const productFormResolver = zodResolver(productFormSchema)
```

### Form Component with Zod
```typescript
// components/forms/user-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userFormSchema, type UserFormData } from '@/lib/schemas/form-schemas'

interface UserFormProps {
  initialData?: Partial<UserFormData>
  onSubmit: (data: UserFormData) => void | Promise<void>
  isLoading?: boolean
}

export function UserForm({ initialData, onSubmit, isLoading }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData,
  })

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          {...register('name')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="role">Role</label>
        <select
          id="role"
          {...register('role')}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
        {errors.role && (
          <p className="text-red-500 text-sm">{errors.role.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting || isLoading ? 'Saving...' : 'Save User'}
      </button>
    </form>
  )
}
```

## 🔄 API Integration

### API Route Validation
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createUserSchema, userQuerySchema } from '@/lib/schemas/user'
import { validateRequest } from '@/lib/validation/middleware'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateRequest(createUserSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const userData = validation.data
    // Process user creation
    const user = await createUser(userData)
    
    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const validation = validateRequest(userQuerySchema, params)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const query = validation.data
    const users = await getUsers(query)
    
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Server Action Validation
```typescript
// lib/actions/user-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createUserSchema, updateUserSchema } from '@/lib/schemas/user'
import { validateRequest } from '@/lib/validation/middleware'

export async function createUser(formData: FormData) {
  try {
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      phone: formData.get('phone'),
      bio: formData.get('bio'),
    }
    
    const validation = validateRequest(createUserSchema, data)
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: validation.error.errors.reduce((acc, err) => {
          if (err.path[0]) {
            acc[err.path[0] as string] = err.message
          }
          return acc
        }, {} as Record<string, string>),
      }
    }
    
    const userData = validation.data
    const user = await prisma.user.create({
      data: userData,
    })
    
    revalidatePath('/dashboard/users')
    return { success: true, data: user }
  } catch (error) {
    console.error('Create user error:', error)
    return {
      success: false,
      error: 'Failed to create user',
    }
  }
}

export async function updateUser(id: string, formData: FormData) {
  try {
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      phone: formData.get('phone'),
      bio: formData.get('bio'),
    }
    
    const validation = validateRequest(updateUserSchema, data)
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: validation.error.errors.reduce((acc, err) => {
          if (err.path[0]) {
            acc[err.path[0] as string] = err.message
          }
          return acc
        }, {} as Record<string, string>),
      }
    }
    
    const userData = validation.data
    const user = await prisma.user.update({
      where: { id },
      data: userData,
    })
    
    revalidatePath('/dashboard/users')
    return { success: true, data: user }
  } catch (error) {
    console.error('Update user error:', error)
    return {
      success: false,
      error: 'Failed to update user',
    }
  }
}
```

## 📋 Zod Guidelines

### 1. Schema Organization
- Group related schemas together
- Use descriptive names for schemas
- Export types for TypeScript integration
- Keep schemas focused and reusable

### 2. Validation Rules
- Use appropriate validation rules
- Provide clear error messages
- Implement custom validators when needed
- Use refinements for complex validation

### 3. Type Safety
- Export inferred types from schemas
- Use TypeScript integration
- Validate at runtime and compile time
- Handle validation errors gracefully

### 4. Performance
- Use lazy evaluation for complex schemas
- Cache compiled schemas when possible
- Optimize validation for large datasets
- Use appropriate validation strategies

### 5. Error Handling
- Provide user-friendly error messages
- Handle validation errors consistently
- Log validation errors for debugging
- Implement proper error recovery

## 🚀 Best Practices

### 1. Use Descriptive Error Messages
```typescript
// ✅ Good - Clear error messages
export const emailSchema = z.string().email('Please enter a valid email address')

// ❌ Bad - Generic error messages
export const emailSchema = z.string().email('Invalid')
```

### 2. Use Appropriate Validation Rules
```typescript
// ✅ Good - Appropriate validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// ❌ Bad - Too strict or too loose
export const passwordSchema = z.string().min(1)
```

### 3. Use Schema Composition
```typescript
// ✅ Good - Schema composition
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: passwordSchema,
  confirmPassword: z.string(),
})

// ❌ Bad - Duplicate schemas
export const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  // ... duplicate fields
})
```

### 4. Handle Validation Errors
```typescript
// ✅ Good - Proper error handling
try {
  const result = schema.parse(data)
  return { success: true, data: result }
} catch (error) {
  if (error instanceof z.ZodError) {
    return { success: false, error: formatZodError(error) }
  }
  throw error
}
```

### 5. Use Type Inference
```typescript
// ✅ Good - Type inference
export const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

export type User = z.infer<typeof userSchema>

// ❌ Bad - Manual type definition
export interface User {
  name: string
  email: string
}
```

---

*Following these Zod guidelines ensures robust, type-safe, and maintainable validation in your Next.js application.*
