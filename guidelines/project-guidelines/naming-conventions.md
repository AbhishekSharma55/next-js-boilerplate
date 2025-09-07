# Naming Conventions

This document outlines the naming conventions used throughout the Next.js Shadcn Dashboard Starter project to ensure consistency and maintainability.

## 🎯 General Principles

### 1. Clarity Over Brevity
- Use descriptive names that clearly indicate purpose
- Avoid abbreviations unless they're widely understood
- Prefer longer, clear names over short, ambiguous ones

### 2. Consistency
- Follow established patterns throughout the project
- Use the same naming style for similar concepts
- Maintain consistency across files, components, and functions

### 3. TypeScript-Friendly
- Use names that work well with TypeScript inference
- Avoid reserved keywords and built-in types
- Use names that enhance type safety

## 📁 File and Directory Naming

### Files
| Type | Convention | Example | Notes |
|------|------------|---------|-------|
| React Components | PascalCase | `UserProfile.tsx` | Component files |
| Pages | lowercase | `page.tsx` | Next.js App Router pages |
| API Routes | lowercase | `route.ts` | Next.js API routes |
| Utilities | camelCase | `formatDate.ts` | Utility functions |
| Hooks | camelCase with `use` prefix | `useAuth.ts` | Custom React hooks |
| Types | camelCase | `userTypes.ts` | TypeScript type definitions |
| Constants | camelCase | `apiConstants.ts` | Constant definitions |
| Configuration | kebab-case | `next.config.ts` | Config files |
| Styles | kebab-case | `globals.css` | CSS files |

### Directories
| Type | Convention | Example | Notes |
|------|------------|---------|-------|
| Feature Directories | kebab-case | `user-profile/` | Feature folders |
| Component Directories | kebab-case | `ui-components/` | Component folders |
| Utility Directories | kebab-case | `auth-utils/` | Utility folders |
| Page Directories | lowercase | `dashboard/` | Page route folders |
| API Directories | lowercase | `api/` | API route folders |

## 🧩 Component Naming

### React Components
```typescript
// ✅ Good - PascalCase, descriptive
export default function UserProfileCard() { ... }
export default function ProductListTable() { ... }
export default function SignInForm() { ... }

// ❌ Bad - Unclear or inconsistent
export default function Card() { ... } // Too generic
export default function userProfile() { ... } // Wrong case
export default function SigninForm() { ... } // Inconsistent spacing
```

### Component Props
```typescript
// ✅ Good - camelCase, descriptive
interface UserProfileProps {
  userId: string
  showAvatar: boolean
  onEdit: () => void
  className?: string
}

// ❌ Bad - Unclear or inconsistent
interface Props {
  id: string // Too generic
  show_avatar: boolean // Wrong case
  on_edit: () => void // Wrong case
}
```

### Component Variants
```typescript
// ✅ Good - Use variant prop with clear values
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'destructive'
  size: 'sm' | 'md' | 'lg'
}

// ❌ Bad - Unclear variant names
interface ButtonProps {
  type: 'btn1' | 'btn2' | 'btn3' // Unclear
  size: 's' | 'm' | 'l' // Too abbreviated
}
```

## 🔧 Function and Variable Naming

### Functions
```typescript
// ✅ Good - Verb-based, descriptive
const getUserById = (id: string) => { ... }
const validateEmail = (email: string) => { ... }
const formatCurrency = (amount: number) => { ... }
const handleSubmit = (data: FormData) => { ... }

// ❌ Bad - Unclear or inconsistent
const get = (id: string) => { ... } // Too generic
const validate = (email: string) => { ... } // Unclear what it validates
const format = (amount: number) => { ... } // Unclear format
const submit = (data: FormData) => { ... } // Should be handleSubmit
```

### Variables
```typescript
// ✅ Good - Noun-based, descriptive
const userEmail = 'user@example.com'
const isLoading = false
const productList = []
const errorMessage = ''

// ❌ Bad - Unclear or inconsistent
const email = 'user@example.com' // Could be any email
const loading = false // Should be isLoading
const list = [] // Too generic
const err = '' // Too abbreviated
```

### Constants
```typescript
// ✅ Good - SCREAMING_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_PAGE_SIZE = 10

// ✅ Good - camelCase for object constants
const apiEndpoints = {
  users: '/api/users',
  products: '/api/products'
}

// ❌ Bad - Inconsistent casing
const apiBaseUrl = 'https://api.example.com' // Should be SCREAMING_SNAKE_CASE
const maxRetryAttempts = 3 // Should be SCREAMING_SNAKE_CASE
```

## 🎣 Hook Naming

### Custom Hooks
```typescript
// ✅ Good - Always start with 'use'
const useAuth = () => { ... }
const useLocalStorage = (key: string) => { ... }
const useDebounce = (value: any, delay: number) => { ... }
const useDataTable = (data: any[]) => { ... }

// ❌ Bad - Missing 'use' prefix
const auth = () => { ... } // Should be useAuth
const localStorage = (key: string) => { ... } // Should be useLocalStorage
```

### Hook Return Values
```typescript
// ✅ Good - Descriptive return object
const useAuth = () => {
  return {
    user: null,
    isLoading: false,
    signIn: () => {},
    signOut: () => {},
    isAuthenticated: false
  }
}

// ❌ Bad - Unclear return values
const useAuth = () => {
  return {
    data: null, // Too generic
    loading: false, // Should be isLoading
    login: () => {}, // Should be signIn
    logout: () => {} // Should be signOut
  }
}
```

## 🗄️ Database and API Naming

### Database Tables
```sql
-- ✅ Good - snake_case, plural, descriptive
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100)
);

-- ❌ Bad - Inconsistent casing or unclear names
CREATE TABLE User ( -- Should be lowercase, plural
  ID SERIAL PRIMARY KEY, -- Should be lowercase
  Email VARCHAR(255) -- Should be lowercase
);
```

### API Endpoints
```typescript
// ✅ Good - RESTful, kebab-case, descriptive
GET /api/users
GET /api/users/123
POST /api/users
PUT /api/users/123
DELETE /api/users/123

GET /api/user-profiles
GET /api/user-profiles/123

// ❌ Bad - Inconsistent or unclear
GET /api/getUsers // Should be GET /api/users
POST /api/createUser // Should be POST /api/users
GET /api/userProfile // Should be kebab-case
```

### API Response Objects
```typescript
// ✅ Good - Consistent with database, clear structure
interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

interface UserProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  avatar?: string
}

// ❌ Bad - Inconsistent naming
interface User {
  ID: string // Should be lowercase
  Email: string // Should be lowercase
  user_name: string // Should be camelCase
  created_at: string // Should be camelCase
}
```

## 🎨 CSS and Styling Naming

### CSS Classes
```css
/* ✅ Good - BEM methodology, kebab-case */
.user-profile-card { }
.user-profile-card__header { }
.user-profile-card__content { }
.user-profile-card--featured { }

/* ✅ Good - Utility classes, kebab-case */
.text-center { }
.bg-primary { }
.p-4 { }
.mt-8 { }

/* ❌ Bad - Inconsistent or unclear */
.userProfileCard { } /* Should be kebab-case */
.user_profile_card { } /* Should be kebab-case */
.centerText { } /* Should be kebab-case */
```

### CSS Custom Properties
```css
/* ✅ Good - kebab-case, descriptive */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --border-radius-lg: 0.5rem;
}

/* ❌ Bad - Inconsistent casing */
:root {
  --colorPrimary: #3b82f6; /* Should be kebab-case */
  --COLOR_SECONDARY: #64748b; /* Should be lowercase */
  --spacing_sm: 0.5rem; /* Should be kebab-case */
}
```

## 📝 Type and Interface Naming

### TypeScript Types
```typescript
// ✅ Good - PascalCase, descriptive
type UserRole = 'admin' | 'user' | 'guest'
type ApiResponse<T> = {
  data: T
  message: string
  success: boolean
}

// ✅ Good - Interface naming
interface User {
  id: string
  email: string
  name: string
}

interface UserCreateRequest {
  email: string
  password: string
  name: string
}

// ❌ Bad - Unclear or inconsistent
type role = 'admin' | 'user' // Should be PascalCase
type apiResponse = { ... } // Should be PascalCase
interface user { ... } // Should be PascalCase
```

### Generic Types
```typescript
// ✅ Good - Single uppercase letter, descriptive
interface ApiResponse<T> { ... }
interface PaginatedResponse<T> { ... }
interface FormField<T> { ... }

// ❌ Bad - Unclear generic names
interface ApiResponse<Data> { ... } // Should be single letter
interface PaginatedResponse<Item> { ... } // Should be single letter
```

## 🔄 State Management Naming

### Zustand Store
```typescript
// ✅ Good - Descriptive store name and actions
interface AuthStore {
  user: User | null
  isLoading: boolean
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => void
  setUser: (user: User) => void
}

// ❌ Bad - Unclear or inconsistent
interface Store {
  data: any // Too generic
  loading: boolean // Should be isLoading
  login: () => {} // Should be signIn
  logout: () => {} // Should be signOut
}
```

### Form State
```typescript
// ✅ Good - Clear form state naming
interface SignInFormState {
  email: string
  password: string
  isLoading: boolean
  errors: Record<string, string>
}

// ❌ Bad - Unclear form state
interface FormState {
  data: any // Too generic
  loading: boolean // Should be isLoading
  err: Record<string, string> // Should be errors
}
```

## 🎯 Event Handler Naming

### Event Handlers
```typescript
// ✅ Good - handle + EventName pattern
const handleSubmit = (e: FormEvent) => { ... }
const handleClick = (e: MouseEvent) => { ... }
const handleChange = (e: ChangeEvent) => { ... }
const handleKeyDown = (e: KeyboardEvent) => { ... }

// ✅ Good - Specific event handlers
const handleUserSelect = (user: User) => { ... }
const handleProductDelete = (productId: string) => { ... }
const handleFormReset = () => { ... }

// ❌ Bad - Unclear or inconsistent
const submit = (e: FormEvent) => { ... } // Should be handleSubmit
const onClick = (e: MouseEvent) => { ... } // Should be handleClick
const onUserSelect = (user: User) => { ... } // Should be handleUserSelect
```

## 📋 Naming Checklist

When naming anything in the project, ask:

- [ ] Is the name descriptive and clear?
- [ ] Does it follow the established convention for its type?
- [ ] Is it consistent with similar items in the codebase?
- [ ] Does it avoid abbreviations unless widely understood?
- [ ] Is it TypeScript-friendly?
- [ ] Does it follow the camelCase/PascalCase/kebab-case rules?
- [ ] Is it not too long or too short?
- [ ] Does it avoid reserved keywords?

## 🚀 Best Practices

### 1. Use Descriptive Names
```typescript
// ✅ Good
const isUserAuthenticated = true
const hasPermissionToEdit = false
const shouldShowConfirmation = true

// ❌ Bad
const auth = true
const canEdit = false
const show = true
```

### 2. Be Consistent
```typescript
// ✅ Good - Consistent naming pattern
const getUserById = (id: string) => { ... }
const getUserByEmail = (email: string) => { ... }
const getUserByToken = (token: string) => { ... }

// ❌ Bad - Inconsistent naming
const getUserById = (id: string) => { ... }
const fetchUserByEmail = (email: string) => { ... }
const findUserByToken = (token: string) => { ... }
```

### 3. Use Boolean Prefixes
```typescript
// ✅ Good - Clear boolean naming
const isLoading = false
const hasError = false
const canEdit = true
const shouldRender = true

// ❌ Bad - Unclear boolean naming
const loading = false
const error = false
const edit = true
const render = true
```

### 4. Avoid Magic Numbers and Strings
```typescript
// ✅ Good - Use named constants
const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_PAGE_SIZE = 10
const API_TIMEOUT = 5000

// ❌ Bad - Magic numbers
if (attempts < 3) { ... }
const pageSize = 10
setTimeout(() => {}, 5000)
```

---

*Consistent naming conventions make code more readable, maintainable, and easier to understand for all team members.*
