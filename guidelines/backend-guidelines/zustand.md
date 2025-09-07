# Zustand

This document outlines the guidelines for using Zustand for state management in the Next.js Shadcn Dashboard Starter project.

## 🏗️ Zustand Architecture

### Store Organization
```
stores/
├── auth-store.ts              # Authentication state
├── ui-store.ts                # UI state (modals, themes, etc.)
├── user-store.ts              # User management state
├── product-store.ts           # Product management state
├── notification-store.ts      # Notification state
└── index.ts                   # Store exports
```

## 🎯 Basic Store Pattern

### Simple Store
```typescript
// stores/counter-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useCounterStore = create<CounterState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    { name: 'counter-store' }
  )
)
```

### Store with Immer
```typescript
// stores/todo-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

interface TodoState {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  setFilter: (filter: 'all' | 'active' | 'completed') => void
  clearCompleted: () => void
}

export const useTodoStore = create<TodoState>()(
  devtools(
    immer((set) => ({
      todos: [],
      filter: 'all',

      addTodo: (text) =>
        set((state) => {
          state.todos.push({
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: new Date(),
          })
        }),

      toggleTodo: (id) =>
        set((state) => {
          const todo = state.todos.find((todo) => todo.id === id)
          if (todo) {
            todo.completed = !todo.completed
          }
        }),

      deleteTodo: (id) =>
        set((state) => {
          state.todos = state.todos.filter((todo) => todo.id !== id)
        }),

      setFilter: (filter) =>
        set((state) => {
          state.filter = filter
        }),

      clearCompleted: () =>
        set((state) => {
          state.todos = state.todos.filter((todo) => !todo.completed)
        }),
    })),
    { name: 'todo-store' }
  )
)
```

## 🔐 Authentication Store

### Complete Auth Store
```typescript
// stores/auth-store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user' | 'moderator'
  permissions: string[]
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  session: {
    token: string | null
    expiresAt: number | null
  }
}

interface AuthActions {
  // State setters
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSession: (token: string, expiresAt: number) => void
  
  // Auth actions
  signIn: (credentials: { email: string; password: string }) => Promise<void>
  signUp: (userData: { email: string; password: string; name: string }) => Promise<void>
  signOut: () => void
  refreshToken: () => Promise<void>
  
  // User actions
  updateProfile: (updates: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string; newPassword: string) => Promise<void>
  
  // Utility actions
  clearError: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
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
        session: {
          token: null,
          expiresAt: null,
        },

        // State setters
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

        setSession: (token, expiresAt) =>
          set((state) => {
            state.session = { token, expiresAt }
          }),

        // Auth actions
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
              const error = await response.json()
              throw new Error(error.message || 'Sign in failed')
            }

            const data = await response.json()
            set((state) => {
              state.user = data.user
              state.isAuthenticated = true
              state.session = {
                token: data.token,
                expiresAt: data.expiresAt,
              }
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Sign in failed'
              state.isLoading = false
            })
            throw error
          }
        },

        signUp: async (userData) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          try {
            const response = await fetch('/api/auth/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData),
            })

            if (!response.ok) {
              const error = await response.json()
              throw new Error(error.message || 'Sign up failed')
            }

            const data = await response.json()
            set((state) => {
              state.user = data.user
              state.isAuthenticated = true
              state.session = {
                token: data.token,
                expiresAt: data.expiresAt,
              }
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Sign up failed'
              state.isLoading = false
            })
            throw error
          }
        },

        signOut: () =>
          set((state) => {
            state.user = null
            state.isAuthenticated = false
            state.session = { token: null, expiresAt: null }
            state.error = null
          }),

        refreshToken: async () => {
          const { session } = get()
          if (!session.token) return

          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.token}`,
              },
            })

            if (!response.ok) {
              throw new Error('Token refresh failed')
            }

            const data = await response.json()
            set((state) => {
              state.session = {
                token: data.token,
                expiresAt: data.expiresAt,
              }
            })
          } catch (error) {
            // If refresh fails, sign out the user
            set((state) => {
              state.user = null
              state.isAuthenticated = false
              state.session = { token: null, expiresAt: null }
            })
          }
        },

        // User actions
        updateProfile: async (updates) => {
          const { user, session } = get()
          if (!user || !session.token) return

          set((state) => {
            state.isLoading = true
            state.error = null
          })

          try {
            const response = await fetch('/api/user/profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`,
              },
              body: JSON.stringify(updates),
            })

            if (!response.ok) {
              const error = await response.json()
              throw new Error(error.message || 'Profile update failed')
            }

            const updatedUser = await response.json()
            set((state) => {
              state.user = updatedUser
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Profile update failed'
              state.isLoading = false
            })
            throw error
          }
        },

        changePassword: async (currentPassword, newPassword) => {
          const { session } = get()
          if (!session.token) return

          set((state) => {
            state.isLoading = true
            state.error = null
          })

          try {
            const response = await fetch('/api/user/change-password', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`,
              },
              body: JSON.stringify({ currentPassword, newPassword }),
            })

            if (!response.ok) {
              const error = await response.json()
              throw new Error(error.message || 'Password change failed')
            }

            set((state) => {
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Password change failed'
              state.isLoading = false
            })
            throw error
          }
        },

        // Utility actions
        clearError: () =>
          set((state) => {
            state.error = null
          }),

        hasPermission: (permission) => {
          const { user } = get()
          return user?.permissions.includes(permission) || false
        },

        hasRole: (role) => {
          const { user } = get()
          return user?.role === role || false
        },
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          session: state.session,
        }),
      }
    ),
    { name: 'auth-store' }
  )
)
```

## 🎨 UI Store Pattern

### UI State Management
```typescript
// stores/ui-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

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
  
  // Toast messages
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>
}

interface UIActions {
  // Modal actions
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  toggleModal: (modalId: string) => void
  closeAllModals: () => void
  
  // Sidebar actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleTheme: () => void
  
  // Loading actions
  setLoading: (key: string, loading: boolean) => void
  clearLoading: (key: string) => void
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Toast actions
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      modals: {},
      sidebarOpen: false,
      theme: 'system',
      loading: {},
      notifications: [],
      toasts: [],

      // Modal actions
      openModal: (modalId) =>
        set((state) => {
          state.modals[modalId] = true
        }),

      closeModal: (modalId) =>
        set((state) => {
          state.modals[modalId] = false
        }),

      toggleModal: (modalId) =>
        set((state) => {
          state.modals[modalId] = !state.modals[modalId]
        }),

      closeAllModals: () =>
        set((state) => {
          state.modals = {}
        }),

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen
        }),

      setSidebarOpen: (open) =>
        set((state) => {
          state.sidebarOpen = open
        }),

      // Theme actions
      setTheme: (theme) =>
        set((state) => {
          state.theme = theme
        }),

      toggleTheme: () =>
        set((state) => {
          state.theme = state.theme === 'light' ? 'dark' : 'light'
        }),

      // Loading actions
      setLoading: (key, loading) =>
        set((state) => {
          state.loading[key] = loading
        }),

      clearLoading: (key) =>
        set((state) => {
          delete state.loading[key]
        }),

      // Notification actions
      addNotification: (notification) =>
        set((state) => {
          state.notifications.push({
            ...notification,
            id: Date.now().toString(),
          })
        }),

      removeNotification: (id) =>
        set((state) => {
          state.notifications = state.notifications.filter((n) => n.id !== id)
        }),

      clearNotifications: () =>
        set((state) => {
          state.notifications = []
        }),

      // Toast actions
      addToast: (toast) =>
        set((state) => {
          state.toasts.push({
            ...toast,
            id: Date.now().toString(),
          })
        }),

      removeToast: (id) =>
        set((state) => {
          state.toasts = state.toasts.filter((t) => t.id !== id)
        }),

      clearToasts: () =>
        set((state) => {
          state.toasts = []
        }),
    })),
    { name: 'ui-store' }
  )
)
```

## 📊 Data Store Pattern

### CRUD Operations Store
```typescript
// stores/user-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'moderator'
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface UserFilters {
  search?: string
  role?: string
  isActive?: boolean
}

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UserState {
  users: User[]
  selectedUser: User | null
  filters: UserFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

interface UserActions {
  // State setters
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
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateUserAsync: (id: string, updates: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  
  // Utility actions
  clearError: () => void
  resetFilters: () => void
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      users: [],
      selectedUser: null,
      filters: {},
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      isLoading: false,
      error: null,

      // State setters
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
          const params = new URLSearchParams({
            ...filters,
            page: pagination.page.toString(),
            limit: pagination.limit.toString(),
          })

          const response = await fetch(`/api/users?${params}`)
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

      updateUserAsync: async (id, updates) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          })

          if (!response.ok) {
            throw new Error('Failed to update user')
          }

          const updatedUser = await response.json()
          set((state) => {
            const index = state.users.findIndex((user) => user.id === id)
            if (index !== -1) {
              state.users[index] = updatedUser
            }
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to update user'
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

      // Utility actions
      clearError: () =>
        set((state) => {
          state.error = null
        }),

      resetFilters: () =>
        set((state) => {
          state.filters = {}
          state.pagination = { page: 1, limit: 10, total: 0, totalPages: 0 }
        }),
    })),
    { name: 'user-store' }
  )
)
```

## 🔧 Store Composition

### Combining Stores
```typescript
// stores/index.ts
export { useAuthStore } from './auth-store'
export { useUIStore } from './ui-store'
export { useUserStore } from './user-store'
export { useProductStore } from './product-store'
export { useNotificationStore } from './notification-store'

// Store selectors
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  signIn: state.signIn,
  signOut: state.signOut,
}))

export const useUI = () => useUIStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  theme: state.theme,
  modals: state.modals,
  toggleSidebar: state.toggleSidebar,
  setTheme: state.setTheme,
  openModal: state.openModal,
  closeModal: state.closeModal,
}))

export const useUsers = () => useUserStore((state) => ({
  users: state.users,
  selectedUser: state.selectedUser,
  filters: state.filters,
  pagination: state.pagination,
  isLoading: state.isLoading,
  error: state.error,
  fetchUsers: state.fetchUsers,
  createUser: state.createUser,
  updateUser: state.updateUserAsync,
  deleteUser: state.deleteUser,
  setFilters: state.setFilters,
  setSelectedUser: state.setSelectedUser,
}))
```

## 🎯 Advanced Patterns

### Store with Subscriptions
```typescript
// stores/websocket-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface WebSocketState {
  isConnected: boolean
  messages: Array<{ id: string; content: string; timestamp: Date }>
  error: string | null
}

interface WebSocketActions {
  connect: () => void
  disconnect: () => void
  sendMessage: (message: string) => void
  clearMessages: () => void
}

type WebSocketStore = WebSocketState & WebSocketActions

export const useWebSocketStore = create<WebSocketStore>()(
  devtools(
    (set, get) => {
      let ws: WebSocket | null = null

      return {
        isConnected: false,
        messages: [],
        error: null,

        connect: () => {
          if (ws?.readyState === WebSocket.OPEN) return

          ws = new WebSocket('ws://localhost:8080')

          ws.onopen = () => {
            set({ isConnected: true, error: null })
          }

          ws.onmessage = (event) => {
            const message = JSON.parse(event.data)
            set((state) => ({
              messages: [
                ...state.messages,
                {
                  id: Date.now().toString(),
                  content: message.content,
                  timestamp: new Date(),
                },
              ],
            }))
          }

          ws.onclose = () => {
            set({ isConnected: false })
          }

          ws.onerror = (error) => {
            set({ error: 'WebSocket connection failed' })
          }
        },

        disconnect: () => {
          if (ws) {
            ws.close()
            ws = null
            set({ isConnected: false })
          }
        },

        sendMessage: (message) => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ content: message }))
          }
        },

        clearMessages: () => {
          set({ messages: [] })
        },
      }
    },
    { name: 'websocket-store' }
  )
)
```

### Store with Middleware
```typescript
// stores/analytics-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'

interface AnalyticsState {
  events: Array<{ id: string; event: string; data: any; timestamp: Date }>
  addEvent: (event: string, data: any) => void
  clearEvents: () => void
}

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    subscribeWithSelector((set) => ({
      events: [],

      addEvent: (event, data) =>
        set((state) => ({
          events: [
            ...state.events,
            {
              id: Date.now().toString(),
              event,
              data,
              timestamp: new Date(),
            },
          ],
        })),

      clearEvents: () => set({ events: [] }),
    })),
    { name: 'analytics-store' }
  )
)

// Subscribe to specific state changes
useAnalyticsStore.subscribe(
  (state) => state.events,
  (events) => {
    // Send events to analytics service
    events.forEach((event) => {
      console.log('Analytics event:', event)
    })
  }
)
```

## 📋 Zustand Guidelines

### 1. Store Structure
- Keep stores focused on a single domain
- Use descriptive names for actions
- Separate state from actions
- Use TypeScript for type safety

### 2. Performance
- Use selectors to prevent unnecessary re-renders
- Implement proper memoization
- Use shallow comparison when needed
- Avoid storing large objects in state

### 3. Error Handling
- Implement proper error states
- Provide user-friendly error messages
- Log errors for debugging
- Implement retry mechanisms

### 4. Testing
- Test store logic in isolation
- Mock external dependencies
- Test error scenarios
- Use proper test utilities

### 5. Persistence
- Use persist middleware for important state
- Be selective about what to persist
- Handle hydration properly
- Consider storage limitations

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
const { users, isLoading, error } = useUserStore()

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

*Following these Zustand guidelines ensures scalable, maintainable, and performant state management in your Next.js application.*
