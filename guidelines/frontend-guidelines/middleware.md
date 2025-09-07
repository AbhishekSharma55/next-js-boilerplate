# Middleware

This document outlines the guidelines for implementing and using Next.js middleware in the Next.js Shadcn Dashboard Starter project.

## 🛡️ Middleware Overview

### What is Middleware?
Middleware in Next.js allows you to run code before a request is completed. It can modify the request/response, redirect users, rewrite URLs, and more.

### Middleware File Location
```
src/
└── middleware.ts                 # Main middleware file
```

## 🔐 Authentication Middleware

### Basic Authentication Middleware
```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req: NextRequest) {
    // Add any additional middleware logic here
    console.log('Middleware executed for:', req.nextUrl.pathname)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        // Protect API routes
        if (req.nextUrl.pathname.startsWith('/api/protected')) {
          return !!token
        }
        
        // Allow public routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
}
```

### Advanced Authentication Middleware
```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/config'

export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Redirect authenticated users away from auth pages
    if (token && pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Redirect unauthenticated users to sign-in
    if (!token && pathname.startsWith('/dashboard')) {
      const signInUrl = new URL('/auth/sign-in', req.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Role-based access control
    if (pathname.startsWith('/dashboard/admin')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // API route protection
    if (pathname.startsWith('/api/protected')) {
      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Always allow public routes
        if (pathname.startsWith('/auth') || pathname === '/') {
          return true
        }

        // Check authentication for protected routes
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/protected')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
}
```

## 🌍 Internationalization Middleware

### i18n Middleware
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const locales = ['en', 'es', 'fr', 'de']
const defaultLocale = 'en'

function getLocale(request: NextRequest): string {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocaleFromAcceptLanguage(request) || defaultLocale
    return locale
  }

  return pathname.split('/')[1]
}

function getLocaleFromAcceptLanguage(request: NextRequest): string | null {
  const acceptLanguage = request.headers.get('accept-language')
  if (!acceptLanguage) return null

  const languages = acceptLanguage
    .split(',')
    .map((lang) => lang.split(';')[0].trim())
    .map((lang) => lang.split('-')[0])

  for (const lang of languages) {
    if (locales.includes(lang)) {
      return lang
    }
  }

  return null
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocaleFromAcceptLanguage(request) || defaultLocale
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico).*)',
  ],
}
```

## 🔒 Security Middleware

### Security Headers Middleware
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
```

### Rate Limiting Middleware
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const key = identifier
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const pathname = request.nextUrl.pathname

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const isAllowed = rateLimit(ip, 100, 60000) // 100 requests per minute

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }

  // Apply stricter rate limiting to auth routes
  if (pathname.startsWith('/api/auth/')) {
    const isAllowed = rateLimit(ip, 10, 60000) // 10 requests per minute

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many authentication attempts' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
```

## 🔄 URL Rewriting Middleware

### URL Rewriting
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rewrite API routes to external service
  if (pathname.startsWith('/api/external/')) {
    const newPath = pathname.replace('/api/external', '')
    const url = new URL(newPath, 'https://external-api.com')
    
    // Copy query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value)
    })

    return NextResponse.rewrite(url)
  }

  // Rewrite legacy routes
  if (pathname.startsWith('/legacy/')) {
    const newPath = pathname.replace('/legacy', '/dashboard')
    return NextResponse.rewrite(new URL(newPath, request.url))
  }

  // Rewrite based on user agent
  if (pathname === '/mobile' && request.headers.get('user-agent')?.includes('Mobile')) {
    return NextResponse.rewrite(new URL('/dashboard/mobile', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/external/:path*',
    '/legacy/:path*',
    '/mobile',
  ],
}
```

## 📊 Analytics Middleware

### Analytics Tracking
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Track page views
  if (pathname.startsWith('/dashboard')) {
    // Add analytics tracking
    response.headers.set('X-Analytics-Track', 'dashboard-page')
  }

  // Track API usage
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Analytics-Track', 'api-usage')
  }

  // Add custom headers for analytics
  response.headers.set('X-Page-View', pathname)
  response.headers.set('X-Timestamp', new Date().toISOString())

  return response
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
```

## 🎯 A/B Testing Middleware

### A/B Testing
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // A/B testing for specific routes
  if (pathname === '/dashboard/overview') {
    const userId = request.cookies.get('user-id')?.value || 'anonymous'
    const variant = getABTestVariant(userId, 'dashboard-overview')
    
    if (variant === 'B') {
      return NextResponse.rewrite(new URL('/dashboard/overview-v2', request.url))
    }
    
    response.headers.set('X-AB-Test-Variant', variant)
  }

  return response
}

function getABTestVariant(userId: string, testName: string): 'A' | 'B' {
  // Simple hash-based variant assignment
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return Math.abs(hash) % 2 === 0 ? 'A' : 'B'
}

export const config = {
  matcher: ['/dashboard/overview'],
}
```

## 🔧 Middleware Utilities

### Middleware Helper Functions
```typescript
// src/lib/middleware-utils.ts
import { NextRequest, NextResponse } from 'next/server'

export function createRedirectResponse(url: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(url, request.url))
}

export function createRewriteResponse(url: string, request: NextRequest): NextResponse {
  return NextResponse.rewrite(new URL(url, request.url))
}

export function createJsonResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function getClientIP(request: NextRequest): string {
  return (
    request.ip ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown'
}

export function isMobile(request: NextRequest): boolean {
  const userAgent = getUserAgent(request)
  return /Mobile|Android|iPhone|iPad/.test(userAgent)
}

export function isBot(request: NextRequest): boolean {
  const userAgent = getUserAgent(request)
  return /bot|crawler|spider|crawling/i.test(userAgent)
}
```

## 📋 Middleware Checklist

When implementing middleware, ensure:

- [ ] Middleware is properly configured with matcher
- [ ] Authentication logic is secure and tested
- [ ] Rate limiting is implemented for API routes
- [ ] Security headers are properly set
- [ ] Error handling is implemented
- [ ] Performance impact is minimized
- [ ] Middleware is tested thoroughly
- [ ] Documentation is updated
- [ ] Monitoring is in place
- [ ] Fallbacks are provided for edge cases

## 🚀 Best Practices

### 1. Keep Middleware Lightweight
- Minimize processing time
- Avoid heavy computations
- Use efficient data structures

### 2. Handle Errors Gracefully
- Provide fallbacks for failures
- Log errors appropriately
- Don't break the user experience

### 3. Test Thoroughly
- Test all code paths
- Test edge cases
- Test performance impact

### 4. Monitor Performance
- Track middleware execution time
- Monitor error rates
- Set up alerts for issues

### 5. Security First
- Validate all inputs
- Implement proper authentication
- Use secure headers
- Protect against common attacks

---

*Following these middleware guidelines ensures secure, performant, and maintainable middleware implementations.*
