# Types

This document outlines the guidelines for creating and managing TypeScript types in the Next.js Shadcn Dashboard Starter project.

## 🏗️ Type Organization

### Type Directory Structure
```
types/
├── index.ts                     # Main type exports
├── data-table.ts                # Data table types
├── next-auth.d.ts               # NextAuth.js type extensions
├── api.ts                       # API response types
├── user.ts                      # User-related types
├── product.ts                   # Product-related types
├── auth.ts                      # Authentication types
└── common.ts                    # Common/shared types
```

## 🎯 Type Categories

### 1. Domain Types
Types that represent business entities and domain concepts.

```typescript
// types/user.ts
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  permissions: Permission[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export type UserRole = 'admin' | 'user' | 'moderator'

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

export interface UserProfile extends User {
  bio?: string
  website?: string
  location?: string
  socialLinks: SocialLink[]
}

export interface SocialLink {
  platform: 'twitter' | 'linkedin' | 'github' | 'website'
  url: string
  username?: string
}

// User creation and update types
export interface CreateUserData {
  email: string
  name: string
  role?: UserRole
  password: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: UserRole
  avatar?: string
  bio?: string
  website?: string
  location?: string
}

// User query and filter types
export interface UserFilters {
  role?: UserRole
  search?: string
  isActive?: boolean
  createdAfter?: string
  createdBefore?: string
}

export interface UserQuery {
  filters?: UserFilters
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}
```

### 2. API Types
Types for API requests, responses, and error handling.

```typescript
// types/api.ts
// Base API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  fieldErrors?: Record<string, string>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// API request types
export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string>
}

// API endpoint types
export interface ApiEndpoints {
  users: {
    list: '/api/users'
    create: '/api/users'
    get: (id: string) => `/api/users/${id}`
    update: (id: string) => `/api/users/${id}`
    delete: (id: string) => `/api/users/${id}`
  }
  products: {
    list: '/api/products'
    create: '/api/products'
    get: (id: string) => `/api/products/${id}`
    update: (id: string) => `/api/products/${id}`
    delete: (id: string) => `/api/products/${id}`
  }
}

// HTTP status codes
export type HttpStatus = 
  | 200 | 201 | 204
  | 400 | 401 | 403 | 404 | 422 | 429
  | 500 | 502 | 503 | 504

// API error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiErrorResponse {
  error: string
  message: string
  statusCode: HttpStatus
  validationErrors?: ValidationError[]
}
```

### 3. Component Types
Types for React components, props, and state.

```typescript
// types/components.ts
import { ReactNode } from 'react'

// Base component props
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  id?: string
  'data-testid'?: string
}

// Button component types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
}

// Form component types
export interface FormProps extends BaseComponentProps {
  onSubmit: (data: FormData) => void | Promise<void>
  initialData?: Record<string, any>
  validationSchema?: any
  loading?: boolean
}

export interface FormFieldProps extends BaseComponentProps {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  value?: string
  onChange?: (value: string) => void
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
}

// Table component types
export interface TableProps<T> extends BaseComponentProps {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  pagination?: PaginationProps
  sorting?: SortingProps
  filtering?: FilteringProps
  onRowClick?: (row: T) => void
  onSelectionChange?: (selectedRows: T[]) => void
}

export interface ColumnDef<T> {
  id: string
  header: string | ReactNode
  accessorKey?: keyof T
  cell?: (props: { row: T; value: any }) => ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
}

// Pagination types
export interface PaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

// Sorting types
export interface SortingProps {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

// Filtering types
export interface FilteringProps {
  filters: Record<string, any>
  onFilterChange: (filters: Record<string, any>) => void
  onFilterReset: () => void
}
```

### 4. Hook Types
Types for custom React hooks.

```typescript
// types/hooks.ts
import { Dispatch, SetStateAction } from 'react'

// Generic hook types
export interface UseStateReturn<T> {
  value: T
  setValue: Dispatch<SetStateAction<T>>
  reset: () => void
}

export interface UseToggleReturn {
  value: boolean
  toggle: () => void
  setTrue: () => void
  setFalse: () => void
}

// API hook types
export interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export interface UseQueryReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
  isStale: boolean
}

// Form hook types
export interface UseFormReturn<T> {
  values: T
  errors: Record<keyof T, string>
  isSubmitting: boolean
  setValue: (field: keyof T, value: any) => void
  setError: (field: keyof T, error: string) => void
  handleSubmit: (e: React.FormEvent) => void
  reset: () => void
}

// Local storage hook types
export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T) => void
  removeValue: () => void
}

// Media query hook types
export interface UseMediaQueryReturn {
  matches: boolean
  breakpoint: 'mobile' | 'tablet' | 'desktop'
}
```

### 5. Utility Types
Common utility types used throughout the application.

```typescript
// types/common.ts
// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// Array utility types
export type NonEmptyArray<T> = [T, ...T[]]
export type ArrayElement<T> = T extends (infer U)[] ? U : never

// Object utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

// Function utility types
export type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>
export type EventHandler<T = any> = (event: T) => void | Promise<void>

// ID types
export type ID = string | number
export type UUID = string
export type CUID = string

// Date types
export type ISOString = string
export type Timestamp = number

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error'
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Theme types
export type Theme = 'light' | 'dark' | 'system'
export type ColorScheme = 'light' | 'dark'

// Size types
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

// Direction types
export type Direction = 'ltr' | 'rtl'
export type Alignment = 'start' | 'center' | 'end'
export type Justification = 'start' | 'center' | 'end' | 'between' | 'around'

// Validation types
export type ValidationResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  fieldErrors?: Record<string, string>
}

// Error types
export type AppError = {
  code: string
  message: string
  details?: any
  stack?: string
}

// Event types
export type CustomEvent<T = any> = {
  type: string
  payload: T
  timestamp: number
}
```

## 🔧 Type Utilities

### Type Guards
```typescript
// types/guards.ts
// User type guards
export function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string'
  )
}

export function isUserRole(role: any): role is UserRole {
  return ['admin', 'user', 'moderator'].includes(role)
}

// API response type guards
export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.success === 'boolean'
  )
}

export function isApiError(obj: any): obj is ApiError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.code === 'string' &&
    typeof obj.message === 'string'
  )
}

// Form validation type guards
export function isValidationError(obj: any): obj is ValidationError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.field === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.code === 'string'
  )
}
```

### Type Assertions
```typescript
// types/assertions.ts
// Safe type assertions
export function assertIsUser(obj: any): asserts obj is User {
  if (!isUser(obj)) {
    throw new Error('Object is not a valid User')
  }
}

export function assertIsApiResponse<T>(obj: any): asserts obj is ApiResponse<T> {
  if (!isApiResponse(obj)) {
    throw new Error('Object is not a valid ApiResponse')
  }
}

// Type narrowing
export function narrowToUser(obj: any): User | null {
  return isUser(obj) ? obj : null
}

export function narrowToApiResponse<T>(obj: any): ApiResponse<T> | null {
  return isApiResponse<T>(obj) ? obj : null
}
```

## 📝 Type Documentation

### JSDoc Comments
```typescript
/**
 * Represents a user in the system
 * @interface User
 */
export interface User {
  /** Unique identifier for the user */
  id: string
  
  /** User's email address (must be unique) */
  email: string
  
  /** User's display name */
  name: string
  
  /** Optional avatar URL */
  avatar?: string
  
  /** User's role in the system */
  role: UserRole
  
  /** List of permissions granted to the user */
  permissions: Permission[]
  
  /** When the user was created (ISO string) */
  createdAt: string
  
  /** When the user was last updated (ISO string) */
  updatedAt: string
  
  /** When the user last logged in (ISO string) */
  lastLoginAt?: string
}

/**
 * User roles available in the system
 * @typedef {('admin' | 'user' | 'moderator')} UserRole
 */
export type UserRole = 'admin' | 'user' | 'moderator'

/**
 * Creates a new user with the provided data
 * @param data - User creation data
 * @returns Promise that resolves to the created user
 * @throws {ValidationError} When validation fails
 * @throws {ConflictError} When user already exists
 */
export async function createUser(data: CreateUserData): Promise<User> {
  // Implementation
}
```

## 🎯 Type Patterns

### Discriminated Unions
```typescript
// types/state.ts
export type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: any }
  | { status: 'error'; error: string }

export type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
```

### Generic Constraints
```typescript
// types/generics.ts
export interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
  create(data: Omit<T, 'id'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

export interface Service<T extends { id: string }> {
  get(id: string): Promise<T | null>
  list(filters?: any): Promise<T[]>
  create(data: Omit<T, 'id'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  remove(id: string): Promise<void>
}
```

### Conditional Types
```typescript
// types/conditional.ts
export type NonNullable<T> = T extends null | undefined ? never : T

export type ApiResponse<T> = T extends string 
  ? { message: T }
  : { data: T }

export type EventHandler<T> = T extends 'click'
  ? (event: MouseEvent) => void
  : T extends 'change'
  ? (event: ChangeEvent) => void
  : (event: Event) => void
```

## 📋 Type Guidelines

### 1. Naming Convention
- Use PascalCase for interfaces and types
- Use descriptive names that indicate purpose
- Use consistent naming patterns across the application

### 2. Organization
- Group related types together
- Use barrel exports for clean imports
- Separate domain types from utility types

### 3. Documentation
- Document complex types with JSDoc comments
- Provide examples for generic types
- Explain the purpose and usage of each type

### 4. Reusability
- Create generic types for common patterns
- Use utility types to avoid duplication
- Extract common interfaces

### 5. Type Safety
- Use strict TypeScript configuration
- Avoid `any` type when possible
- Use type guards for runtime validation

## 🚀 Best Practices

### 1. Use Specific Types
```typescript
// ✅ Good - Specific types
interface User {
  id: string
  email: string
  name: string
}

// ❌ Bad - Generic types
interface User {
  id: any
  email: any
  name: any
}
```

### 2. Use Union Types
```typescript
// ✅ Good - Union types
type Status = 'loading' | 'success' | 'error'

// ❌ Bad - String types
type Status = string
```

### 3. Use Generic Types
```typescript
// ✅ Good - Generic types
interface ApiResponse<T> {
  data: T
  success: boolean
}

// ❌ Bad - Specific types
interface UserApiResponse {
  data: User
  success: boolean
}
```

### 4. Use Utility Types
```typescript
// ✅ Good - Utility types
type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>

// ❌ Bad - Manual types
interface CreateUserData {
  email: string
  name: string
  role: UserRole
}
```

### 5. Use Type Guards
```typescript
// ✅ Good - Type guards
function isUser(obj: any): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj
}

// ❌ Bad - Type assertions
const user = obj as User
```

---

*Following these type guidelines ensures type-safe, maintainable, and well-documented TypeScript code.*
