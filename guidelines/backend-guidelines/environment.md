# Environment Variables

This document outlines the guidelines for managing environment variables in the Next.js Shadcn Dashboard Starter project.

## 🏗️ Environment Architecture

### Environment Files
```
.env.local                 # Local development
.env.development          # Development environment
.env.staging              # Staging environment
.env.production           # Production environment
.env.example              # Example file
```

## 🎯 Environment Setup

### Basic Environment Configuration
```bash
# .env.local
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Email
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# File Upload
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Sentry
SENTRY_DSN="your-sentry-dsn"
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# Redis
REDIS_URL="redis://localhost:6379"

# API Keys
OPENAI_API_KEY="your-openai-api-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
```

### Advanced Environment Configuration
```bash
# .env.production
# Database
DATABASE_URL="postgresql://username:password@production-db:5432/database_name"
DATABASE_URL_READONLY="postgresql://readonly:password@production-db:5432/database_name"

# NextAuth.js
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
GITHUB_ID="your-production-github-client-id"
GITHUB_SECRET="your-production-github-client-secret"

# Email
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# File Upload
UPLOADTHING_SECRET="your-production-uploadthing-secret"
UPLOADTHING_APP_ID="your-production-uploadthing-app-id"

# Sentry
SENTRY_DSN="your-production-sentry-dsn"
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# Redis
REDIS_URL="redis://production-redis:6379"

# API Keys
OPENAI_API_KEY="your-production-openai-api-key"
STRIPE_SECRET_KEY="your-production-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-production-stripe-publishable-key"

# Monitoring
UPTIME_ROBOT_API_KEY="your-uptime-robot-api-key"
NEW_RELIC_LICENSE_KEY="your-new-relic-license-key"

# CDN
CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
CLOUDFLARE_ZONE_ID="your-cloudflare-zone-id"
```

## 🔧 Environment Validation

### Zod Schema Validation
```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_URL_READONLY: z.string().url().optional(),
  
  // NextAuth.js
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  
  // Email
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().transform(Number).optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // File Upload
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),
  
  // Sentry
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // API Keys
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  
  // Monitoring
  UPTIME_ROBOT_API_KEY: z.string().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  
  // CDN
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CLOUDFLARE_ZONE_ID: z.string().optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
})

export const env = envSchema.parse(process.env)

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>
```

### Environment Validation with Error Handling
```typescript
// lib/env-validation.ts
import { z } from 'zod'

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentError'
  }
}

const validateEnvironment = () => {
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    throw new EnvironmentError(
      `Missing required environment variables: ${missingVars.join(', ')}`
    )
  }

  // Validate URLs
  const urlVars = ['DATABASE_URL', 'NEXTAUTH_URL']
  for (const varName of urlVars) {
    try {
      new URL(process.env[varName]!)
    } catch {
      throw new EnvironmentError(`Invalid URL in ${varName}`)
    }
  }

  // Validate secrets
  if (process.env.NEXTAUTH_SECRET!.length < 32) {
    throw new EnvironmentError('NEXTAUTH_SECRET must be at least 32 characters long')
  }
}

export { validateEnvironment, EnvironmentError }
```

## 🔧 Environment Utilities

### Environment Helper Functions
```typescript
// lib/env-utils.ts
export const isDevelopment = () => process.env.NODE_ENV === 'development'
export const isProduction = () => process.env.NODE_ENV === 'production'
export const isStaging = () => process.env.NODE_ENV === 'staging'

export const getEnvironment = () => {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV
  }
  return process.env.NODE_ENV || 'development'
}

export const getDatabaseUrl = () => {
  if (isProduction() && process.env.DATABASE_URL_READONLY) {
    return process.env.DATABASE_URL_READONLY
  }
  return process.env.DATABASE_URL
}

export const getApiUrl = () => {
  if (isProduction()) {
    return process.env.NEXTAUTH_URL
  }
  return 'http://localhost:3000'
}

export const getCorsOrigin = () => {
  if (isProduction()) {
    return process.env.NEXTAUTH_URL
  }
  return ['http://localhost:3000', 'http://localhost:3001']
}
```

### Environment Configuration
```typescript
// lib/config.ts
import { env } from './env'

export const config = {
  // Database
  database: {
    url: env.DATABASE_URL,
    readonlyUrl: env.DATABASE_URL_READONLY,
  },
  
  // NextAuth.js
  auth: {
    url: env.NEXTAUTH_URL,
    secret: env.NEXTAUTH_SECRET,
    providers: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_ID,
        clientSecret: env.GITHUB_SECRET,
      },
    },
  },
  
  // Email
  email: {
    host: env.EMAIL_SERVER_HOST,
    port: env.EMAIL_SERVER_PORT,
    user: env.EMAIL_SERVER_USER,
    password: env.EMAIL_SERVER_PASSWORD,
    from: env.EMAIL_FROM,
  },
  
  // File Upload
  upload: {
    secret: env.UPLOADTHING_SECRET,
    appId: env.UPLOADTHING_APP_ID,
  },
  
  // Sentry
  sentry: {
    dsn: env.SENTRY_DSN,
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
    authToken: env.SENTRY_AUTH_TOKEN,
  },
  
  // Redis
  redis: {
    url: env.REDIS_URL,
  },
  
  // API Keys
  apis: {
    openai: env.OPENAI_API_KEY,
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    },
  },
  
  // Monitoring
  monitoring: {
    uptimeRobot: env.UPTIME_ROBOT_API_KEY,
    newRelic: env.NEW_RELIC_LICENSE_KEY,
  },
  
  // CDN
  cdn: {
    cloudflare: {
      apiToken: env.CLOUDFLARE_API_TOKEN,
      zoneId: env.CLOUDFLARE_ZONE_ID,
    },
  },
  
  // Environment
  environment: {
    nodeEnv: env.NODE_ENV,
    vercelEnv: env.VERCEL_ENV,
  },
}
```

## 🔒 Security Best Practices

### Environment Security
```typescript
// lib/security.ts
export const sanitizeEnv = () => {
  // Remove sensitive data from logs
  const sensitiveKeys = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_SECRET',
    'EMAIL_SERVER_PASSWORD',
    'UPLOADTHING_SECRET',
    'SENTRY_AUTH_TOKEN',
    'REDIS_URL',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'UPTIME_ROBOT_API_KEY',
    'NEW_RELIC_LICENSE_KEY',
    'CLOUDFLARE_API_TOKEN',
  ]

  const sanitizedEnv = { ...process.env }
  
  for (const key of sensitiveKeys) {
    if (sanitizedEnv[key]) {
      sanitizedEnv[key] = '***REDACTED***'
    }
  }
  
  return sanitizedEnv
}

export const logEnvironment = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Environment variables:', sanitizeEnv())
  }
}
```

### Environment Validation Middleware
```typescript
// middleware/env-validation.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateEnvironment } from '@/lib/env-validation'

export const envValidationMiddleware = (request: NextRequest) => {
  try {
    validateEnvironment()
    return NextResponse.next()
  } catch (error) {
    console.error('Environment validation failed:', error)
    return new NextResponse('Environment configuration error', { status: 500 })
  }
}
```

## 📋 Environment Guidelines

### 1. File Organization
- Use `.env.local` for local development
- Use `.env.example` as a template
- Never commit `.env.local` to version control
- Use environment-specific files for different stages

### 2. Variable Naming
- Use UPPERCASE with underscores
- Use descriptive names
- Group related variables
- Use consistent prefixes

### 3. Security
- Never commit secrets to version control
- Use environment-specific secrets
- Rotate secrets regularly
- Use proper access controls

### 4. Validation
- Validate all environment variables
- Use Zod schemas for type safety
- Handle missing variables gracefully
- Log validation errors

### 5. Documentation
- Document all environment variables
- Provide examples
- Explain required vs optional
- Include setup instructions

## 🚀 Best Practices

### 1. Use Environment Validation
```typescript
// ✅ Good - Validate environment
import { env } from '@/lib/env'

const config = {
  database: {
    url: env.DATABASE_URL,
  },
}

// ❌ Bad - No validation
const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
}
```

### 2. Use Type-Safe Environment
```typescript
// ✅ Good - Type-safe
import { env } from '@/lib/env'

const apiKey = env.OPENAI_API_KEY // string | undefined

// ❌ Bad - No types
const apiKey = process.env.OPENAI_API_KEY // string | undefined
```

### 3. Handle Missing Variables
```typescript
// ✅ Good - Handle missing variables
const apiKey = env.OPENAI_API_KEY
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required')
}

// ❌ Bad - No error handling
const apiKey = process.env.OPENAI_API_KEY
```

### 4. Use Environment-Specific Configs
```typescript
// ✅ Good - Environment-specific
const config = {
  apiUrl: isProduction() ? 'https://api.production.com' : 'http://localhost:3000',
}

// ❌ Bad - Hardcoded values
const config = {
  apiUrl: 'https://api.production.com',
}
```

### 5. Secure Environment Variables
```typescript
// ✅ Good - Secure handling
const sanitizedEnv = sanitizeEnv()
console.log('Environment:', sanitizedEnv)

// ❌ Bad - Log sensitive data
console.log('Environment:', process.env)
```

---

*Following these environment guidelines ensures secure, maintainable, and scalable configuration management in your Next.js application.*
