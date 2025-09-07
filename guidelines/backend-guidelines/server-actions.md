# Server Actions

This document outlines the guidelines for creating and using Next.js Server Actions in the Next.js Shadcn Dashboard Starter project.

## 🏗️ Server Actions Architecture

### Server Actions Organization
```
lib/
├── actions/
│   ├── auth-actions.ts         # Authentication actions
│   ├── user-actions.ts         # User management actions
│   ├── product-actions.ts      # Product management actions
│   ├── file-actions.ts         # File upload actions
│   └── index.ts                # Action exports
└── server-utils/
    ├── validation.ts           # Server-side validation
    └── database.ts             # Database utilities
```

## 🎯 Basic Server Action Pattern

### Simple CRUD Actions
```typescript
// lib/actions/user-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { createUserSchema, updateUserSchema } from '@/lib/schemas/user'
import { validateRequest } from '@/lib/validation/middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-helpers'

// Create user action
export async function createUser(formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check permissions
    if (session.user.role !== 'admin') {
      return createErrorResponse('Forbidden', 403)
    }

    // Parse form data
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      phone: formData.get('phone'),
      bio: formData.get('bio'),
    }

    // Validate data
    const validation = validateRequest(createUserSchema, data)
    if (!validation.success) {
      return createErrorResponse('Validation failed', 400, validation.error.errors)
    }

    const userData = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (existingUser) {
      return createErrorResponse('User with this email already exists', 409)
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
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

    // Revalidate relevant paths
    revalidatePath('/dashboard/users')
    revalidatePath('/api/users')

    return createSuccessResponse(user, 201)
  } catch (error) {
    console.error('Create user error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

// Update user action
export async function updateUser(id: string, formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check permissions
    if (session.user.id !== id && session.user.role !== 'admin') {
      return createErrorResponse('Forbidden', 403)
    }

    // Parse form data
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      phone: formData.get('phone'),
      bio: formData.get('bio'),
    }

    // Validate data
    const validation = validateRequest(updateUserSchema, data)
    if (!validation.success) {
      return createErrorResponse('Validation failed', 400, validation.error.errors)
    }

    const updateData = validation.data

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return createErrorResponse('User not found', 404)
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      })

      if (emailExists) {
        return createErrorResponse('Email already in use', 409)
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
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

    // Revalidate relevant paths
    revalidatePath('/dashboard/users')
    revalidatePath(`/dashboard/users/${id}`)
    revalidatePath('/api/users')

    return createSuccessResponse(updatedUser)
  } catch (error) {
    console.error('Update user error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

// Delete user action
export async function deleteUser(id: string) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check permissions
    if (session.user.role !== 'admin') {
      return createErrorResponse('Forbidden', 403)
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return createErrorResponse('User not found', 404)
    }

    // Prevent self-deletion
    if (session.user.id === id) {
      return createErrorResponse('Cannot delete your own account', 400)
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    // Revalidate relevant paths
    revalidatePath('/dashboard/users')
    revalidatePath('/api/users')

    return createSuccessResponse({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
```

## 🔐 Authentication Actions

### Auth Server Actions
```typescript
// lib/actions/auth-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { signIn, signOut } from 'next-auth/react'
import { prisma } from '@/lib/db'
import { signUpSchema, changePasswordSchema } from '@/lib/schemas/auth'
import { validateRequest } from '@/lib/validation/middleware'
import bcrypt from 'bcryptjs'

// Sign up action
export async function signUpAction(formData: FormData) {
  try {
    // Parse form data
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      name: formData.get('name'),
      acceptTerms: formData.get('acceptTerms') === 'on',
    }

    // Validate data
    const validation = validateRequest(signUpSchema, data)
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

    const { email, password, name } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
      }
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
    })

    // Revalidate paths
    revalidatePath('/auth/sign-up')

    return {
      success: true,
      message: 'User created successfully. Please sign in.',
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return {
      success: false,
      error: 'Internal server error',
    }
  }
}

// Change password action
export async function changePasswordAction(formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Parse form data
    const data = {
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    }

    // Validate data
    const validation = validateRequest(changePasswordSchema, data)
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

    const { currentPassword, newPassword } = validation.data

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: 'Current password is incorrect',
      }
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    })

    // Revalidate paths
    revalidatePath('/dashboard/profile')

    return {
      success: true,
      message: 'Password changed successfully',
    }
  } catch (error) {
    console.error('Change password error:', error)
    return {
      success: false,
      error: 'Internal server error',
    }
  }
}

// Sign out action
export async function signOutAction() {
  try {
    await signOut({ redirect: false })
    revalidatePath('/')
    redirect('/auth/sign-in')
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: 'Failed to sign out',
    }
  }
}
```

## 📁 File Upload Actions

### File Upload Server Action
```typescript
// lib/actions/file-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function uploadFileAction(formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get file from form data
    const file = formData.get('file') as File
    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only images are allowed.',
      }
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File too large. Maximum size is 5MB.',
      }
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

    return {
      success: true,
      data: {
        url: fileUrl,
        fileName: file.name,
        size: file.size,
        type: file.type,
      },
    }
  } catch (error) {
    console.error('File upload error:', error)
    return {
      success: false,
      error: 'Internal server error',
    }
  }
}

// Delete file action
export async function deleteFileAction(fileUrl: string) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Extract filename from URL
    const fileName = fileUrl.split('/').pop()
    if (!fileName) {
      return {
        success: false,
        error: 'Invalid file URL',
      }
    }

    // Delete file
    const filePath = join(process.cwd(), 'public', 'uploads', fileName)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    return {
      success: true,
      message: 'File deleted successfully',
    }
  } catch (error) {
    console.error('Delete file error:', error)
    return {
      success: false,
      error: 'Internal server error',
    }
  }
}
```

## 🔄 Form Integration

### Form with Server Actions
```typescript
// components/forms/user-form.tsx
'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { createUser } from '@/lib/actions/user-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UserFormProps {
  initialData?: {
    name?: string
    email?: string
    role?: string
    phone?: string
    bio?: string
  }
  onSuccess?: () => void
}

export function UserForm({ initialData, onSuccess }: UserFormProps) {
  const [state, formAction] = useFormState(createUser, {
    success: false,
    error: null,
    fieldErrors: {},
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await formAction(formData)
      if (result.success) {
        onSuccess?.()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          required
        />
        {state.fieldErrors?.name && (
          <p className="text-sm text-red-500">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={initialData?.email}
          required
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-red-500">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          name="role"
          defaultValue={initialData?.role || 'user'}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
        {state.fieldErrors?.role && (
          <p className="text-sm text-red-500">{state.fieldErrors.role}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialData?.phone}
        />
        {state.fieldErrors?.phone && (
          <p className="text-sm text-red-500">{state.fieldErrors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={initialData?.bio}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        />
        {state.fieldErrors?.bio && (
          <p className="text-sm text-red-500">{state.fieldErrors.bio}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Save User'}
      </Button>
    </form>
  )
}
```

## 🔧 Server Action Utilities

### Action Response Types
```typescript
// lib/types/action-types.ts
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string>
  message?: string
}

export interface CreateActionResponse<T> extends ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string>
}

export interface UpdateActionResponse<T> extends ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string>
}

export interface DeleteActionResponse extends ActionResponse {
  success: boolean
  message?: string
  error?: string
}
```

### Action Helpers
```typescript
// lib/actions/helpers.ts
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden')
  }
  return session
}

export function createActionResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  fieldErrors?: Record<string, string>
): ActionResponse<T> {
  return {
    success,
    ...(data && { data }),
    ...(error && { error }),
    ...(fieldErrors && { fieldErrors }),
  }
}

export function revalidatePaths(paths: string[]) {
  paths.forEach(path => revalidatePath(path))
}

export function redirectTo(path: string) {
  redirect(path)
}
```

## 📋 Server Action Guidelines

### 1. Authentication & Authorization
- Always check authentication in server actions
- Implement proper role-based access control
- Validate user permissions
- Handle unauthorized access gracefully

### 2. Input Validation
- Validate all input data using Zod schemas
- Return clear validation error messages
- Handle validation errors consistently
- Sanitize input data

### 3. Error Handling
- Implement comprehensive error handling
- Log errors for debugging
- Return user-friendly error messages
- Handle database errors gracefully

### 4. Revalidation
- Revalidate relevant paths after mutations
- Use revalidatePath for specific routes
- Use revalidateTag for tagged data
- Consider revalidation strategies

### 5. Performance
- Optimize database queries
- Use transactions for complex operations
- Implement proper error boundaries
- Consider caching strategies

## 🚀 Best Practices

### 1. Use Form Actions
```typescript
// ✅ Good - Form action
<form action={createUser}>
  <input name="name" />
  <button type="submit">Create User</button>
</form>

// ❌ Bad - Client-side form handling
<form onSubmit={handleSubmit}>
  <input name="name" />
  <button type="submit">Create User</button>
</form>
```

### 2. Handle Errors Gracefully
```typescript
// ✅ Good - Error handling
export async function createUser(formData: FormData) {
  try {
    // Action logic
    return { success: true, data: user }
  } catch (error) {
    console.error('Create user error:', error)
    return { success: false, error: 'Internal server error' }
  }
}
```

### 3. Validate Input Data
```typescript
// ✅ Good - Input validation
const validation = validateRequest(createUserSchema, data)
if (!validation.success) {
  return {
    success: false,
    error: 'Validation failed',
    fieldErrors: validation.error.errors,
  }
}
```

### 4. Revalidate Paths
```typescript
// ✅ Good - Revalidation
export async function updateUser(id: string, formData: FormData) {
  // Update logic
  revalidatePath('/dashboard/users')
  revalidatePath(`/dashboard/users/${id}`)
  return { success: true, data: updatedUser }
}
```

### 5. Use TypeScript
```typescript
// ✅ Good - TypeScript
export async function createUser(formData: FormData): Promise<ActionResponse<User>> {
  // Action logic
}
```

---

*Following these Server Action guidelines ensures robust, secure, and maintainable server-side operations in your Next.js application.*
