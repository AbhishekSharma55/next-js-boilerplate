# Assets

This document outlines the guidelines for managing static assets, images, and public files in the Next.js Shadcn Dashboard Starter project.

## 📁 Asset Organization

### Public Directory Structure
```
public/
├── assets/                      # Static assets
│   ├── images/                  # Images
│   │   ├── logos/              # Logo files
│   │   ├── icons/              # Icon files
│   │   ├── avatars/            # Avatar placeholders
│   │   └── backgrounds/        # Background images
│   ├── fonts/                  # Custom fonts
│   ├── videos/                 # Video files
│   └── documents/              # PDFs, docs, etc.
├── favicon.ico                 # Site favicon
├── next.svg                    # Next.js logo
├── vercel.svg                  # Vercel logo
└── robots.txt                  # SEO robots file
```

### Asset Naming Conventions
```
images/
├── logo-primary.svg           # Primary logo
├── logo-secondary.svg         # Secondary logo
├── logo-dark.svg              # Dark theme logo
├── logo-light.svg             # Light theme logo
├── avatar-placeholder.png     # Default avatar
├── hero-background.jpg        # Hero section background
└── error-illustration.svg     # Error page illustration
```

## 🖼️ Image Management

### Image Optimization
```typescript
// Using Next.js Image component
import Image from 'next/image'

export function HeroSection() {
  return (
    <div className="relative h-96">
      <Image
        src="/assets/images/hero-background.jpg"
        alt="Hero background"
        fill
        className="object-cover"
        priority // For above-the-fold images
      />
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <h1 className="text-white text-4xl font-bold">Welcome</h1>
      </div>
    </div>
  )
}
```

### Responsive Images
```typescript
export function ProductImage({ product }: { product: Product }) {
  return (
    <div className="relative aspect-square">
      <Image
        src={product.image}
        alt={product.name}
        fill
        className="object-cover rounded-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}
```

### Image with Fallback
```typescript
export function UserAvatar({ user }: { user: User }) {
  return (
    <div className="relative h-12 w-12">
      <Image
        src={user.avatar || '/assets/images/avatar-placeholder.png'}
        alt={user.name}
        fill
        className="rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.src = '/assets/images/avatar-placeholder.png'
        }}
      />
    </div>
  )
}
```

## 🎨 Icon Management

### Using Lucide React Icons
```typescript
import { 
  Home, 
  User, 
  Settings, 
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react'

export function Navigation() {
  return (
    <nav className="flex items-center space-x-4">
      <Home className="h-5 w-5" />
      <User className="h-5 w-5" />
      <Settings className="h-5 w-5" />
    </nav>
  )
}
```

### Custom Icon Component
```typescript
// components/icons.tsx
import { LucideIcon } from 'lucide-react'
import { 
  Home,
  User,
  Settings,
  Bell,
  Search
} from 'lucide-react'

export const icons = {
  home: Home,
  user: User,
  settings: Settings,
  bell: Bell,
  search: Search,
} as const

export type IconName = keyof typeof icons

interface IconProps {
  name: IconName
  className?: string
  size?: number
}

export function Icon({ name, className, size = 20 }: IconProps) {
  const IconComponent = icons[name]
  return <IconComponent className={className} size={size} />
}
```

### SVG Icons
```typescript
// For custom SVG icons
export function CustomIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}
```

## 🎵 Media Assets

### Video Files
```typescript
export function VideoPlayer({ src }: { src: string }) {
  return (
    <video
      className="w-full h-auto rounded-lg"
      controls
      preload="metadata"
      poster="/assets/images/video-poster.jpg"
    >
      <source src={src} type="video/mp4" />
      <source src={src.replace('.mp4', '.webm')} type="video/webm" />
      Your browser does not support the video tag.
    </video>
  )
}
```

### Audio Files
```typescript
export function AudioPlayer({ src }: { src: string }) {
  return (
    <audio
      className="w-full"
      controls
      preload="metadata"
    >
      <source src={src} type="audio/mpeg" />
      <source src={src.replace('.mp3', '.ogg')} type="audio/ogg" />
      Your browser does not support the audio element.
    </audio>
  )
}
```

## 📄 Document Assets

### PDF Viewer
```typescript
export function PDFViewer({ src }: { src: string }) {
  return (
    <div className="w-full h-96">
      <iframe
        src={src}
        className="w-full h-full border rounded-lg"
        title="PDF Document"
      />
    </div>
  )
}
```

### Document Download
```typescript
export function DocumentDownload({ 
  src, 
  filename, 
  children 
}: { 
  src: string
  filename: string
  children: React.ReactNode 
}) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button onClick={handleDownload} className="flex items-center gap-2">
      {children}
    </button>
  )
}
```

## 🎨 Font Management

### Custom Fonts
```typescript
// lib/font.ts
import { Inter, Poppins, Roboto_Mono } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
})

export const fontVariables = [
  inter.variable,
  poppins.variable,
  robotoMono.variable,
].join(' ')
```

### Using Custom Fonts
```typescript
// app/layout.tsx
import { fontVariables } from '@/lib/font'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={fontVariables}>
        {children}
      </body>
    </html>
  )
}
```

### Font Loading Optimization
```typescript
// For critical fonts
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  variable: '--font-inter',
})

// For non-critical fonts
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
})
```

## 🎯 Asset Optimization

### Image Optimization
```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
}
```

### Asset Preloading
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/assets/images/hero-background.jpg"
          as="image"
        />
        <link
          rel="preload"
          href="/assets/fonts/custom-font.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

## 🔧 Asset Utilities

### Asset URL Helper
```typescript
// lib/assets.ts
export function getAssetUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `/${cleanPath}`
}

export function getImageUrl(path: string): string {
  return getAssetUrl(`assets/images/${path}`)
}

export function getIconUrl(path: string): string {
  return getAssetUrl(`assets/icons/${path}`)
}

// Usage
const logoUrl = getImageUrl('logo-primary.svg')
const iconUrl = getIconUrl('custom-icon.svg')
```

### Asset Validation
```typescript
// lib/asset-validation.ts
export function validateImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext))
}

export function validateVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov']
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext))
}

export function validateAudioUrl(url: string): boolean {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a']
  return audioExtensions.some(ext => url.toLowerCase().endsWith(ext))
}
```

## 📱 Responsive Assets

### Responsive Images
```typescript
export function ResponsiveImage({ 
  src, 
  alt, 
  className 
}: { 
  src: string
  alt: string
  className?: string 
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  )
}
```

### Responsive Icons
```typescript
export function ResponsiveIcon({ 
  name, 
  className 
}: { 
  name: IconName
  className?: string 
}) {
  return (
    <Icon
      name={name}
      className={cn(
        'h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6',
        className
      )}
    />
  )
}
```

## 🎨 Theme Assets

### Theme-Specific Assets
```typescript
export function ThemedLogo({ className }: { className?: string }) {
  return (
    <picture>
      <source
        srcSet="/assets/images/logo-dark.svg"
        media="(prefers-color-scheme: dark)"
      />
      <Image
        src="/assets/images/logo-light.svg"
        alt="Logo"
        width={120}
        height={40}
        className={className}
      />
    </picture>
  )
}
```

### CSS Custom Properties for Assets
```css
/* globals.css */
:root {
  --logo-url: url('/assets/images/logo-light.svg');
  --hero-bg: url('/assets/images/hero-background-light.jpg');
}

[data-theme="dark"] {
  --logo-url: url('/assets/images/logo-dark.svg');
  --hero-bg: url('/assets/images/hero-background-dark.jpg');
}

.hero-section {
  background-image: var(--hero-bg);
}
```

## 📋 Asset Checklist

When adding assets, ensure:

- [ ] Asset is properly organized in the correct directory
- [ ] Asset follows naming conventions
- [ ] Image is optimized for web (WebP/AVIF when possible)
- [ ] Alt text is provided for images
- [ ] Responsive versions are created when needed
- [ ] Asset is properly referenced in code
- [ ] Fallback is provided for critical assets
- [ ] Asset is accessible
- [ ] File size is optimized
- [ ] Asset is properly cached

## 🚀 Best Practices

### 1. Optimize Images
- Use Next.js Image component
- Provide multiple formats (WebP, AVIF)
- Use appropriate sizes for different devices
- Implement lazy loading for below-the-fold images

### 2. Organize Assets
- Use clear directory structure
- Follow consistent naming conventions
- Group related assets together
- Keep assets organized by type

### 3. Performance
- Preload critical assets
- Use appropriate image formats
- Implement proper caching strategies
- Optimize file sizes

### 4. Accessibility
- Provide alt text for images
- Use semantic HTML for media
- Ensure proper contrast ratios
- Test with screen readers

### 5. Responsive Design
- Create multiple image sizes
- Use responsive images
- Test on different devices
- Optimize for different screen densities

---

*Following these asset guidelines ensures optimal performance, accessibility, and maintainability of static assets.*
