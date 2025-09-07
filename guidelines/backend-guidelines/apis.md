# APIs

This document outlines the guidelines for creating and managing API routes in the Next.js Shadcn Dashboard Starter project.

## 🏗️ API Architecture

### API Route Organization
```
app/api/
├── auth/
│   ├── [...nextauth]/
│   │   └── route.ts           # NextAuth.js API route
│   ├── signin/
│   │   └── route.ts           # Sign in endpoint
│   ├── signup/
│   │   └── route.ts           # Sign up endpoint
│   └── refresh/
│       └── route.ts           # Token refresh endpoint
├── users/
│   ├── route.ts               # GET /api/users, POST /api/users
│   ├── [id]/
│   │   ├── route.ts           # GET /api/users/[id], PUT /api/users/[id], DELETE /api/users/[id]
│   │   └── profile/
│   │       └── route.ts       # GET /api/users/[id]/profile
│   └── search/
│       └── route.ts           # GET /api/users/search
├── products/
│   ├── route.ts               # Product CRUD operations
│   ├── [id]/
│   │   └── route.ts           # Individual product operations
│   └── categories/
│       └── route.ts           # Product categories
└── upload/
    └── route.ts               # File upload endpoint
```

## 🎯 Basic API Route Pattern

### Simple CRUD API
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { createUserSchema, userQuerySchema } from '@/lib/schemas/user'
import { validateRequest } from '@/lib/validation/middleware'

// GET /api/users - List users
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate query parameters
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const validation = validateRequest(userQuerySchema, params)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { filters, pagination, sorting } = validation.data

    // Build Prisma query
    const where: any = {}
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    
    if (filters?.role) {
      where.role = filters.role
    }
    
    if (filters?.status) {
      where.status = filters.status
    }

    // Execute query
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { [sorting.sortBy]: sorting.sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          ...pagination,
          total,
          totalPages: Math.ceil(total / pagination.limit),
        },
      },
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create user
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(createUserSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const userData = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Individual Resource API
```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { updateUserSchema } from '@/lib/schemas/user'
import { validateRequest } from '@/lib/validation/middleware'

interface RouteParams {
  params: { id: string }
}

// GET /api/users/[id] - Get user by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate user ID
    if (!params.id || typeof params.id !== 'string') {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Check permissions (users can only view their own profile unless admin)
    if (session.user.id !== params.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        bio: true,
        website: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate user ID
    if (!params.id || typeof params.id !== 'string') {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Check permissions
    if (session.user.id !== params.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(updateUserSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const updateData = validation.data

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        bio: true,
        website: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions (only admins can delete users)
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate user ID
    if (!params.id || typeof params.id !== 'string') {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent self-deletion
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 🔐 Authentication API

### Sign In API
```typescript
// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { signInSchema } from '@/lib/schemas/auth'
import { validateRequest } from '@/lib/validation/middleware'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(signInSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, password, rememberMe } = validation.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true,
        avatar: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { 
        expiresIn: rememberMe ? '30d' : '1d' 
      }
    )

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        expiresIn: rememberMe ? '30d' : '1d',
      },
    })
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Sign Up API
```typescript
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { signUpSchema } from '@/lib/schemas/auth'
import { validateRequest } from '@/lib/validation/middleware'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(signUpSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, password, name, acceptTerms } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'user',
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
      },
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    )

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          token,
          expiresIn: '1d',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 📁 File Upload API

### File Upload Endpoint
```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return file URL
    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: file.name,
        size: file.size,
        type: file.type,
      },
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 🔍 Search API

### Search Endpoint
```typescript
// app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.number().int().min(1).max(50).default(10),
  offset: z.number().int().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const params = {
      q: searchParams.get('q'),
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const validation = searchSchema.safeParse(params)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { q, limit, offset } = validation.data

    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
      take: limit,
      skip: offset,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        users,
        query: q,
        limit,
        offset,
        total: users.length,
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 🔧 API Utilities

### API Response Helpers
```typescript
// lib/api-helpers.ts
import { NextResponse } from 'next/server'

export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function createErrorResponse(
  error: string, 
  status: number = 500, 
  details?: any
) {
  return NextResponse.json({ 
    success: false, 
    error, 
    ...(details && { details }) 
  }, { status })
}

export function createValidationErrorResponse(errors: any[]) {
  return NextResponse.json({
    success: false,
    error: 'Validation failed',
    details: errors,
  }, { status: 400 })
}

export function createUnauthorizedResponse() {
  return NextResponse.json({
    success: false,
    error: 'Unauthorized',
  }, { status: 401 })
}

export function createForbiddenResponse() {
  return NextResponse.json({
    success: false,
    error: 'Forbidden',
  }, { status: 403 })
}

export function createNotFoundResponse(resource: string = 'Resource') {
  return NextResponse.json({
    success: false,
    error: `${resource} not found`,
  }, { status: 404 })
}
```

### API Middleware
```typescript
// lib/api-middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, session: any) => Promise<NextResponse>
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return await handler(request, session)
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function withRole(
  request: NextRequest,
  allowedRoles: string[],
  handler: (request: NextRequest, session: any) => Promise<NextResponse>
) {
  return withAuth(request, async (req, session) => {
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return await handler(req, session)
  })
}
```

## 📋 API Guidelines

### 1. RESTful Design
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Use meaningful resource URLs
- Return appropriate HTTP status codes
- Follow REST conventions

### 2. Authentication & Authorization
- Implement proper authentication checks
- Use role-based access control
- Validate user permissions
- Handle unauthorized access gracefully

### 3. Input Validation
- Validate all input data
- Use Zod schemas for validation
- Return clear error messages
- Handle validation errors consistently

### 4. Error Handling
- Implement comprehensive error handling
- Log errors for debugging
- Return user-friendly error messages
- Use appropriate HTTP status codes

### 5. Performance
- Implement proper pagination
- Use database indexes
- Optimize queries
- Implement caching when appropriate

## 🚀 Best Practices

### 1. Consistent Response Format
```typescript
// ✅ Good - Consistent response format
return NextResponse.json({
  success: true,
  data: user,
})

// ❌ Bad - Inconsistent response format
return NextResponse.json(user)
```

### 2. Proper Error Handling
```typescript
// ✅ Good - Proper error handling
try {
  const user = await prisma.user.create({ data: userData })
  return NextResponse.json({ success: true, data: user })
} catch (error) {
  console.error('Create user error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

### 3. Input Validation
```typescript
// ✅ Good - Input validation
const validation = validateRequest(createUserSchema, body)
if (!validation.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: validation.error.errors },
    { status: 400 }
  )
}
```

### 4. Authentication Checks
```typescript
// ✅ Good - Authentication checks
const session = await getServerSession(authOptions)
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 5. Proper HTTP Status Codes
```typescript
// ✅ Good - Appropriate status codes
return NextResponse.json({ success: true, data: user }, { status: 201 }) // Created
return NextResponse.json({ error: 'Not found' }, { status: 404 }) // Not Found
return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) // Forbidden
```

---

*Following these API guidelines ensures robust, secure, and maintainable API endpoints in your Next.js application.*
