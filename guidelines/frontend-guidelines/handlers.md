# Handlers

This document outlines the guidelines for creating and managing event handlers, form handlers, and action handlers in the Next.js Shadcn Dashboard Starter project.

## 🎯 Handler Types

### Event Handlers
- Click handlers
- Form submission handlers
- Input change handlers
- Keyboard event handlers
- Mouse event handlers

### Action Handlers
- Server actions
- API route handlers
- Database operations
- File upload handlers

## 🖱️ Event Handlers

### Click Handlers
```typescript
// Basic click handler
export function Button({ onClick, children }: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    onClick?.(e)
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}

// Async click handler
export function AsyncButton({ onAsyncClick, children }: AsyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onAsyncClick?.(e)
    } catch (error) {
      console.error('Button click error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Loading...' : children}
    </button>
  )
}
```

### Form Handlers
```typescript
// Form submission handler
export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate form data
      const validationResult = contactFormSchema.safeParse(formData)
      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {}
        validationResult.error.errors.forEach(error => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message
          }
        })
        setErrors(fieldErrors)
        return
      }

      // Submit form
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      // Reset form on success
      setFormData({ name: '', email: '', message: '' })
      toast.success('Message sent successfully!')
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          className={cn(
            'w-full px-3 py-2 border rounded-md',
            errors.name && 'border-red-500'
          )}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className={cn(
            'w-full px-3 py-2 border rounded-md',
            errors.email && 'border-red-500'
          )}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
      
      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          rows={4}
          className={cn(
            'w-full px-3 py-2 border rounded-md',
            errors.message && 'border-red-500'
          )}
        />
        {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
```

### Input Handlers
```typescript
// Input change handler with validation
export function ValidatedInput({ 
  name, 
  value, 
  onChange, 
  validation, 
  ...props 
}: ValidatedInputProps) {
  const [error, setError] = useState<string>('')
  const [isValidating, setIsValidating] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear previous error
    setError('')

    // Validate if validation function provided
    if (validation) {
      setIsValidating(true)
      try {
        const result = await validation(newValue)
        if (result !== true) {
          setError(result)
        }
      } catch (error) {
        setError('Validation error')
      } finally {
        setIsValidating(false)
      }
    }
  }

  return (
    <div className="space-y-1">
      <input
        {...props}
        name={name}
        value={value}
        onChange={handleChange}
        className={cn(
          'w-full px-3 py-2 border rounded-md',
          error && 'border-red-500',
          isValidating && 'opacity-50'
        )}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {isValidating && <p className="text-gray-500 text-sm">Validating...</p>}
    </div>
  )
}
```

### Keyboard Handlers
```typescript
// Keyboard event handler
export function KeyboardHandler() {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Enter':
        if (e.ctrlKey) {
          // Ctrl+Enter: Submit form
          handleSubmit()
        } else {
          // Enter: Next field
          handleNextField()
        }
        break
      case 'Escape':
        // Escape: Cancel/close
        handleCancel()
        break
      case 'Tab':
        // Tab: Handle custom tab behavior
        if (e.shiftKey) {
          handlePreviousField()
        } else {
          handleNextField()
        }
        break
      case 'ArrowUp':
      case 'ArrowDown':
        // Arrow keys: Navigate list
        e.preventDefault()
        handleListNavigation(e.key)
        break
    }
  }

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Content */}
    </div>
  )
}
```

## 🔄 Action Handlers

### Server Actions
```typescript
// Server action for form submission
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['user', 'admin']).default('user'),
})

export async function createUser(formData: FormData) {
  try {
    // Validate form data
    const validatedData = createUserSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
    })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: validatedData,
    })

    // Revalidate relevant paths
    revalidatePath('/dashboard/users')
    
    return {
      success: true,
      data: user,
    }
  } catch (error) {
    console.error('Create user error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid form data',
        fieldErrors: error.errors.reduce((acc, err) => {
          if (err.path[0]) {
            acc[err.path[0] as string] = err.message
          }
          return acc
        }, {} as Record<string, string>),
      }
    }

    return {
      success: false,
      error: 'Failed to create user',
    }
  }
}
```

### API Route Handlers
```typescript
// API route handler
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin']).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({ data: updatedUser })
  } catch (error) {
    console.error('Update user error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### File Upload Handlers
```typescript
// File upload handler
export async function handleFileUpload(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size too large' }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type' }
    }

    // Create form data
    const formData = new FormData()
    formData.append('file', file)

    // Upload file
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    return { success: true, url: result.url }
  } catch (error) {
    console.error('File upload error:', error)
    return { success: false, error: 'Upload failed' }
  }
}

// File upload component
export function FileUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setProgress(0)

    try {
      const result = await handleFileUpload(file, setProgress)
      if (result.success && result.url) {
        onUpload(result.url)
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        disabled={isUploading}
        className="w-full"
      />
      {isUploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">Uploading... {progress}%</p>
        </div>
      )}
    </div>
  )
}
```

## 🎨 Handler Patterns

### Handler Composition
```typescript
// Composed handlers
export function useFormHandlers<T>({
  initialData,
  validationSchema,
  onSubmit,
  onSuccess,
  onError,
}: UseFormHandlersProps<T>) {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value
    setData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate data
      if (validationSchema) {
        const result = validationSchema.safeParse(data)
        if (!result.success) {
          const fieldErrors: Record<string, string> = {}
          result.error.errors.forEach(error => {
            if (error.path[0]) {
              fieldErrors[error.path[0] as string] = error.message
            }
          })
          setErrors(fieldErrors)
          return
        }
      }

      // Submit data
      const result = await onSubmit(data)
      onSuccess?.(result)
    } catch (error) {
      console.error('Form submission error:', error)
      onError?.(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setData(initialData)
    setErrors({})
    setIsSubmitting(false)
  }

  return {
    data,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    handleReset,
  }
}
```

### Error Handling
```typescript
// Error handling wrapper
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('Handler error:', error)
      
      // Log error to monitoring service
      if (typeof window !== 'undefined') {
        // Client-side error logging
        console.error('Client error:', error)
      }
      
      // Show user-friendly error message
      toast.error('An error occurred. Please try again.')
      
      return null
    }
  }
}

// Usage
const handleSubmit = withErrorHandling(async (data: FormData) => {
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: data,
  })
  
  if (!response.ok) {
    throw new Error('Submission failed')
  }
  
  return response.json()
})
```

## 📋 Handler Guidelines

### 1. Naming Convention
- Use descriptive names: `handleSubmit`, `handleInputChange`
- Include action in name: `handleUserDelete`, `handleFileUpload`
- Use consistent patterns across the application

### 2. Error Handling
- Always handle errors gracefully
- Provide user-friendly error messages
- Log errors for debugging
- Implement proper fallbacks

### 3. Performance
- Use debouncing for input handlers
- Implement proper loading states
- Avoid unnecessary re-renders
- Use async/await properly

### 4. Accessibility
- Handle keyboard events
- Provide proper ARIA labels
- Ensure focus management
- Support screen readers

### 5. Type Safety
- Use TypeScript for all handlers
- Define proper interfaces
- Validate input data
- Handle edge cases

## 🚀 Best Practices

### 1. Keep Handlers Focused
```typescript
// ✅ Good - Focused handler
const handleSubmit = async (data: FormData) => {
  // Only handle form submission
}

// ❌ Bad - Multiple responsibilities
const handleSubmit = async (data: FormData) => {
  // Handle submission, validation, navigation, etc.
}
```

### 2. Use Proper Error Handling
```typescript
// ✅ Good - Proper error handling
const handleSubmit = async (data: FormData) => {
  try {
    await submitData(data)
    toast.success('Success!')
  } catch (error) {
    console.error('Submit error:', error)
    toast.error('Failed to submit')
  }
}
```

### 3. Implement Loading States
```typescript
// ✅ Good - Loading state
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async (data: FormData) => {
  setIsLoading(true)
  try {
    await submitData(data)
  } finally {
    setIsLoading(false)
  }
}
```

### 4. Validate Input Data
```typescript
// ✅ Good - Input validation
const handleSubmit = async (data: FormData) => {
  const validation = schema.safeParse(data)
  if (!validation.success) {
    setErrors(validation.error.errors)
    return
  }
  
  await submitData(validation.data)
}
```

---

*Following these handler guidelines ensures robust, user-friendly, and maintainable event and action handling.*
