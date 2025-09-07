# Hooks

This document outlines the guidelines for creating and using custom React hooks in the Next.js Shadcn Dashboard Starter project.

## 🎣 Hook Architecture

### Hook Organization
```
hooks/
├── use-auth.ts                  # Authentication hook
├── use-data-table.ts           # Data table hook
├── use-debounce.ts             # Debounce hook
├── use-debounced-callback.ts   # Debounced callback hook
├── use-media-query.ts          # Media query hook
├── use-mobile.tsx              # Mobile detection hook
├── use-breadcrumbs.tsx         # Breadcrumbs hook
├── use-callback-ref.ts         # Callback ref hook
├── use-controllable-state.tsx  # Controllable state hook
└── use-multistep-form.tsx      # Multistep form hook
```

## 🔐 Authentication Hooks

### useAuth Hook
```typescript
// hooks/use-auth.ts
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const signInWithCredentials = useCallback(
    async (email: string, password: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error('Invalid credentials')
      }

      if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    },
    [router]
  )

  const signInWithProvider = useCallback(
    async (provider: 'google' | 'github') => {
      await signIn(provider, { callbackUrl: '/dashboard' })
    },
    []
  )

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/' })
  }, [])

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    signInWithCredentials,
    signInWithProvider,
    logout,
  }
}
```

### useSession Hook
```typescript
// hooks/use-session.ts
'use client'

import { useSession } from 'next-auth/react'
import { useCallback } from 'react'

export function useSession() {
  const { data: session, status, update } = useSession()

  const refreshSession = useCallback(async () => {
    await update()
  }, [update])

  const hasRole = useCallback(
    (role: string) => {
      return session?.user?.role === role
    },
    [session?.user?.role]
  )

  const hasPermission = useCallback(
    (permission: string) => {
      return session?.user?.permissions?.includes(permission) || false
    },
    [session?.user?.permissions]
  )

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    refreshSession,
    hasRole,
    hasPermission,
  }
}
```

## 📊 Data Management Hooks

### useDataTable Hook
```typescript
// hooks/use-data-table.ts
'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'

interface UseDataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  initialPageSize?: number
  enablePagination?: boolean
  enableSorting?: boolean
  enableFiltering?: boolean
}

export function useDataTable<TData>({
  data,
  columns,
  initialPageSize = 10,
  enablePagination = true,
  enableSorting = true,
  enableFiltering = true,
}: UseDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
  })

  const resetFilters = useCallback(() => {
    setColumnFilters([])
    setSorting([])
    setPagination({ pageIndex: 0, pageSize: initialPageSize })
  }, [initialPageSize])

  const resetPagination = useCallback(() => {
    setPagination({ pageIndex: 0, pageSize: initialPageSize })
  }, [initialPageSize])

  return {
    table,
    sorting,
    columnFilters,
    pagination,
    resetFilters,
    resetPagination,
  }
}
```

### useApi Hook
```typescript
// hooks/use-api.ts
'use client'

import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const result = await apiFunction(...args)
        setState({ data: result, isLoading: false, error: null })
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred'
        setState({ data: null, isLoading: false, error: errorMessage })
        return null
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}
```

## ⏱️ Performance Hooks

### useDebounce Hook
```typescript
// hooks/use-debounce.ts
'use client'

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

### useDebouncedCallback Hook
```typescript
// hooks/use-debounced-callback.ts
'use client'

import { useCallback, useRef } from 'react'

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay]
  )
}
```

### useThrottle Hook
```typescript
// hooks/use-throttle.ts
'use client'

import { useState, useEffect, useRef } from 'react'

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecuted = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastExecution = now - lastExecuted.current

    if (timeSinceLastExecution >= delay) {
      setThrottledValue(value)
      lastExecuted.current = now
    } else {
      const timeout = setTimeout(() => {
        setThrottledValue(value)
        lastExecuted.current = Date.now()
      }, delay - timeSinceLastExecution)

      return () => clearTimeout(timeout)
    }
  }, [value, delay])

  return throttledValue
}
```

## 📱 Responsive Hooks

### useMediaQuery Hook
```typescript
// hooks/use-media-query.ts
'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}
```

### useMobile Hook
```typescript
// hooks/use-mobile.tsx
'use client'

import { useMediaQuery } from './use-media-query'

export function useMobile(): boolean {
  return useMediaQuery('(max-width: 768px)')
}

export function useTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
}

export function useDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}

export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useMobile()
  const isTablet = useTablet()
  const isDesktop = useDesktop()

  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  if (isDesktop) return 'desktop'
  
  return 'desktop' // fallback
}
```

## 🎨 UI Hooks

### useToggle Hook
```typescript
// hooks/use-toggle.ts
'use client'

import { useState, useCallback } from 'react'

export function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(prev => !prev)
  }, [])

  return [value, toggle]
}
```

### useControllableState Hook
```typescript
// hooks/use-controllable-state.tsx
'use client'

import { useState, useCallback } from 'react'

interface UseControllableStateProps<T> {
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
}

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateProps<T>) {
  const [internalValue, setInternalValue] = useState(defaultValue)

  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const setValue = useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    },
    [isControlled, onChange]
  )

  return [currentValue, setValue] as const
}
```

### useClickOutside Hook
```typescript
// hooks/use-click-outside.ts
'use client'

import { useEffect, useRef } from 'react'

export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [callback])

  return ref
}
```

## 📝 Form Hooks

### useForm Hook
```typescript
// hooks/use-form.ts
'use client'

import { useState, useCallback } from 'react'
import { z } from 'zod'

interface UseFormProps<T> {
  initialValues: T
  validationSchema?: z.ZodSchema<T>
  onSubmit: (values: T) => void | Promise<void>
}

export function useForm<T>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const validate = useCallback((): boolean => {
    if (!validationSchema) return true

    try {
      validationSchema.parse(values)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof T] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }, [values, validationSchema])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    setError,
    handleSubmit,
    reset,
  }
}
```

### useMultistepForm Hook
```typescript
// hooks/use-multistep-form.tsx
'use client'

import { useState, useCallback } from 'react'

interface UseMultistepFormProps<T> {
  steps: React.ReactNode[]
  initialData: T
  onSubmit: (data: T) => void | Promise<void>
}

export function useMultistepForm<T>({
  steps,
  initialData,
  onSubmit,
}: UseMultistepFormProps<T>) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [data, setData] = useState<T>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const next = useCallback(() => {
    setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  const back = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const goToStep = useCallback((step: number) => {
    setCurrentStepIndex(Math.max(0, Math.min(step, steps.length - 1)))
  }, [steps.length])

  const updateData = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [data, onSubmit])

  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  return {
    currentStepIndex,
    currentStep: steps[currentStepIndex],
    data,
    isFirstStep,
    isLastStep,
    isSubmitting,
    next,
    back,
    goToStep,
    updateData,
    handleSubmit,
  }
}
```

## 🔧 Utility Hooks

### useLocalStorage Hook
```typescript
// hooks/use-local-storage.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key]
  )

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
```

### usePrevious Hook
```typescript
// hooks/use-previous.ts
'use client'

import { useRef, useEffect } from 'react'

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
```

## 📋 Hook Guidelines

### 1. Naming Convention
- Always start with `use`
- Use descriptive names
- Follow camelCase convention

### 2. Single Responsibility
- Each hook should have one clear purpose
- Keep hooks focused and simple
- Avoid mixing unrelated logic

### 3. Return Consistent Interface
- Use consistent return patterns
- Provide clear, typed interfaces
- Include loading and error states when appropriate

### 4. Performance Optimization
- Use `useCallback` and `useMemo` appropriately
- Avoid unnecessary re-renders
- Clean up side effects properly

### 5. Error Handling
- Handle errors gracefully
- Provide fallback values
- Log errors appropriately

## 🚀 Best Practices

### 1. Keep Hooks Simple
```typescript
// ✅ Good - Simple, focused hook
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue(prev => !prev), [])
  return [value, toggle] as const
}

// ❌ Bad - Complex, unfocused hook
export function useComplexState() {
  // Too many responsibilities
}
```

### 2. Use TypeScript
```typescript
// ✅ Good - Properly typed
export function useApi<T>(apiFunction: (...args: any[]) => Promise<T>) {
  // Implementation
}

// ❌ Bad - No types
export function useApi(apiFunction) {
  // Implementation
}
```

### 3. Handle Edge Cases
```typescript
// ✅ Good - Handles edge cases
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    // Handle localStorage errors
  })
}
```

### 4. Clean Up Side Effects
```typescript
// ✅ Good - Proper cleanup
export function useEventListener(event: string, handler: Function) {
  useEffect(() => {
    document.addEventListener(event, handler)
    return () => document.removeEventListener(event, handler)
  }, [event, handler])
}
```

---

*Following these hook guidelines ensures reusable, performant, and maintainable custom React hooks.*
