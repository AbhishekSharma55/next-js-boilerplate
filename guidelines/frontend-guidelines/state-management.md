# State Management

This document outlines the guidelines for state management in the Next.js Shadcn Dashboard Starter project using Zustand, React hooks, and other state management patterns.

## 🏗️ State Management Architecture

### State Layers
```
State Management Layers:
├── Server State (React Query/SWR)
├── Global Client State (Zustand)
├── Component State (useState/useReducer)
└── URL State (nuqs)
```

### State Organization
```
stores/
├── auth-store.ts              # Authentication state
├── ui-store.ts                # UI state (modals, themes, etc.)
├── user-store.ts              # User-specific state
└── index.ts                   # Store exports
```

## 🎯 Zustand Store Patterns

### Basic Store Structure
```typescript
// stores/auth-store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => void
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        setUser: (user) =>
          set((state) => {
            state.user = user
            state.isAuthenticated = !!user
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading
          }),

        setError: (error) =>
          set((state) => {
            state.error = error
          }),

        signIn: async (credentials) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          try {
            const response = await fetch('/api/auth/signin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials),
            })

            if (!response.ok) {
              throw new Error('Invalid credentials')
            }

            const user = await response.json()
            set((state) => {
              state.user = user
              state.isAuthenticated = true
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Sign in failed'
              state.isLoading = false
            })
          }
        },

        signOut: () =>
          set((state) => {
            state.user = null
            state.isAuthenticated = false
            state.error = null
          }),

        clearError: () =>
          set((state) => {
            state.error = null
          }),
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      }
    ),
    { name: 'auth-store' }
  )
)
```

### UI Store Pattern
```typescript
// stores/ui-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  // Modal state
  modals: Record<string, boolean>
  
  // Sidebar state
  sidebarOpen: boolean
  
  // Theme state
  theme: 'light' | 'dark' | 'system'
  
  // Loading states
  loading: Record<string, boolean>
  
  // Notifications
  notifications: Notification[]
}

interface UIActions {
  // Modal actions
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  toggleModal: (modalId: string) => void
  
  // Sidebar actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // Loading actions
  setLoading: (key: string, loading: boolean) => void
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      modals: {},
      sidebarOpen: false,
      theme: 'system',
      loading: {},
      notifications: [],

      // Modal actions
      openModal: (modalId) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: true },
        })),

      closeModal: (modalId) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: false },
        })),

      toggleModal: (modalId) =>
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: !state.modals[modalId],
          },
        })),

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Theme actions
      setTheme: (theme) => set({ theme }),

      // Loading actions
      setLoading: (key, loading) =>
        set((state) => ({
          loading: { ...state.loading, [key]: loading },
        })),

      // Notification actions
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: Date.now().toString() },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    { name: 'ui-store' }
  )
)
```

### Feature-Specific Store
```typescript
// stores/user-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface UserState {
  users: User[]
  selectedUser: User | null
  filters: UserFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

interface UserActions {
  setUsers: (users: User[]) => void
  setSelectedUser: (user: User | null) => void
  setFilters: (filters: UserFilters) => void
  setPagination: (pagination: PaginationState) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // CRUD operations
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  removeUser: (id: string) => void
  
  // Async operations
  fetchUsers: () => Promise<void>
  createUser: (userData: CreateUserData) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      users: [],
      selectedUser: null,
      filters: {},
      pagination: { page: 1, limit: 10, total: 0 },
      isLoading: false,
      error: null,

      // Synchronous actions
      setUsers: (users) =>
        set((state) => {
          state.users = users
        }),

      setSelectedUser: (user) =>
        set((state) => {
          state.selectedUser = user
        }),

      setFilters: (filters) =>
        set((state) => {
          state.filters = filters
        }),

      setPagination: (pagination) =>
        set((state) => {
          state.pagination = pagination
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading
        }),

      setError: (error) =>
        set((state) => {
          state.error = error
        }),

      // CRUD operations
      addUser: (user) =>
        set((state) => {
          state.users.push(user)
        }),

      updateUser: (id, updates) =>
        set((state) => {
          const index = state.users.findIndex((user) => user.id === id)
          if (index !== -1) {
            state.users[index] = { ...state.users[index], ...updates }
          }
        }),

      removeUser: (id) =>
        set((state) => {
          state.users = state.users.filter((user) => user.id !== id)
        }),

      // Async operations
      fetchUsers: async () => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const { filters, pagination } = get()
          const response = await fetch(
            `/api/users?${new URLSearchParams({
              ...filters,
              page: pagination.page.toString(),
              limit: pagination.limit.toString(),
            })}`
          )

          if (!response.ok) {
            throw new Error('Failed to fetch users')
          }

          const data = await response.json()
          set((state) => {
            state.users = data.users
            state.pagination = data.pagination
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch users'
            state.isLoading = false
          })
        }
      },

      createUser: async (userData) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          })

          if (!response.ok) {
            throw new Error('Failed to create user')
          }

          const user = await response.json()
          set((state) => {
            state.users.push(user)
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to create user'
            state.isLoading = false
          })
        }
      },

      deleteUser: async (id) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            throw new Error('Failed to delete user')
          }

          set((state) => {
            state.users = state.users.filter((user) => user.id !== id)
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to delete user'
            state.isLoading = false
          })
        }
      },
    })),
    { name: 'user-store' }
  )
)
```

## 🔄 React Query Integration

### Server State Management
```typescript
// hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUserStore } from '@/stores/user-store'

export function useUsers() {
  const queryClient = useQueryClient()
  const { filters, pagination } = useUserStore()

  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', filters, pagination],
    queryFn: async () => {
      const response = await fetch(
        `/api/users?${new URLSearchParams({
          ...filters,
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        })}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      if (!response.ok) {
        throw new Error('Failed to create user')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to update user')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete user')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return {
    users: users?.users || [],
    pagination: users?.pagination,
    isLoading,
    error,
    refetch,
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  }
}
```

## 🎯 Component State Patterns

### Local State with useState
```typescript
// components/user-form.tsx
'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/user-store'

export function UserForm({ user, onSave }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createUser, updateUser } = useUserStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      if (user) {
        await updateUser(user.id, formData)
      } else {
        await createUser(formData)
      }
      onSave?.()
    } catch (error) {
      setErrors({ submit: 'Failed to save user' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
      
      <div>
        <label htmlFor="role">Role</label>
        <select
          id="role"
          value={formData.role}
          onChange={handleInputChange('role')}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save User'}
      </button>
    </form>
  )
}
```

### Complex State with useReducer
```typescript
// hooks/use-form-reducer.ts
import { useReducer } from 'react'

interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
}

type FormAction =
  | { type: 'SET_VALUE'; field: string; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'SET_TOUCHED'; field: string; touched: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_VALID'; isValid: boolean }
  | { type: 'RESET'; initialValues: Record<string, any> }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: '' },
      }
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      }
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: action.touched },
      }
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting }
    case 'SET_VALID':
      return { ...state, isValid: action.isValid }
    case 'RESET':
      return {
        values: action.initialValues,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: false,
      }
    default:
      return state
  }
}

export function useFormReducer(initialValues: Record<string, any>) {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
  })

  const setValue = (field: string, value: any) => {
    dispatch({ type: 'SET_VALUE', field, value })
  }

  const setError = (field: string, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error })
  }

  const setTouched = (field: string, touched: boolean) => {
    dispatch({ type: 'SET_TOUCHED', field, touched })
  }

  const setSubmitting = (isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', isSubmitting })
  }

  const setValid = (isValid: boolean) => {
    dispatch({ type: 'SET_VALID', isValid })
  }

  const reset = () => {
    dispatch({ type: 'RESET', initialValues })
  }

  return {
    ...state,
    setValue,
    setError,
    setTouched,
    setSubmitting,
    setValid,
    reset,
  }
}
```

## 🔗 URL State Management

### Using nuqs for URL State
```typescript
// hooks/use-url-state.ts
import { useQueryState, useQueryStates } from 'nuqs'
import { parseAsString, parseAsInteger, parseAsArrayOf } from 'nuqs'

export function useUserFilters() {
  const [search, setSearch] = useQueryState('search', parseAsString)
  const [role, setRole] = useQueryState('role', parseAsString)
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10))
  const [sortBy, setSortBy] = useQueryState('sortBy', parseAsString)
  const [sortOrder, setSortOrder] = useQueryState('sortOrder', parseAsString)

  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    role: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    sortBy: parseAsString,
    sortOrder: parseAsString,
  })

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setFilters({
      search: null,
      role: null,
      page: 1,
      limit: 10,
      sortBy: null,
      sortOrder: null,
    })
  }

  return {
    filters,
    updateFilters,
    resetFilters,
    // Individual setters for convenience
    setSearch,
    setRole,
    setPage,
    setLimit,
    setSortBy,
    setSortOrder,
  }
}
```

## 📋 State Management Guidelines

### 1. Choose the Right State Solution
- **Component State**: Use `useState` for local component state
- **Global State**: Use Zustand for global application state
- **Server State**: Use React Query for server data
- **URL State**: Use nuqs for URL-synchronized state

### 2. State Organization
- Group related state together
- Use descriptive names for state and actions
- Keep state as flat as possible
- Separate concerns between different stores

### 3. Performance Optimization
- Use selectors to prevent unnecessary re-renders
- Implement proper memoization
- Use Zustand's shallow comparison
- Optimize React Query cache settings

### 4. Error Handling
- Implement proper error states
- Provide user-friendly error messages
- Log errors for debugging
- Implement retry mechanisms

### 5. Testing
- Test state logic in isolation
- Mock external dependencies
- Test error scenarios
- Use proper test utilities

## 🚀 Best Practices

### 1. Use Selectors
```typescript
// ✅ Good - Use selectors
const user = useAuthStore(state => state.user)
const isAuthenticated = useAuthStore(state => state.isAuthenticated)

// ❌ Bad - Access entire store
const { user, isAuthenticated } = useAuthStore()
```

### 2. Implement Proper Loading States
```typescript
// ✅ Good - Proper loading states
const { users, isLoading, error } = useUsers()

if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
return <UserList users={users} />
```

### 3. Use TypeScript
```typescript
// ✅ Good - Properly typed
interface UserStore {
  users: User[]
  addUser: (user: User) => void
}

// ❌ Bad - No types
const useUserStore = create((set) => ({
  users: [],
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
}))
```

### 4. Handle Errors Gracefully
```typescript
// ✅ Good - Error handling
const createUser = async (userData: CreateUserData) => {
  try {
    setLoading(true)
    const user = await api.createUser(userData)
    setUsers(prev => [...prev, user])
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

### 5. Optimize Re-renders
```typescript
// ✅ Good - Optimized selectors
const user = useAuthStore(useCallback(state => state.user, []))
const isAuthenticated = useAuthStore(useCallback(state => state.isAuthenticated, []))
```

---

*Following these state management guidelines ensures scalable, maintainable, and performant state management in your Next.js application.*
