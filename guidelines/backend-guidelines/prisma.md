# Prisma

This document outlines the guidelines for using Prisma ORM in the Next.js Shadcn Dashboard Starter project.

## 🏗️ Prisma Architecture

### Prisma Configuration
```
prisma/
├── schema.prisma              # Database schema
├── migrations/                # Database migrations
└── seed.ts                    # Database seeding
lib/
├── db/
│   ├── index.ts              # Prisma client
│   └── queries/              # Database queries
└── prisma/
    └── client.ts             # Prisma client configuration
```

## 🎯 Prisma Client Setup

### Basic Prisma Client
```typescript
// lib/db/index.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Advanced Prisma Client
```typescript
// lib/prisma/client.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
```

## 🎯 Schema Definition

### Complete Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth.js required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?   // For credentials authentication
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  products      Product[]
  tasks         Task[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Application models
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  price       Float
  category    String
  photo_url   String
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   @default("TODO")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
}


// Inventory model
model Inventory {
  id                String  @id @default(cuid())
  quantity          Int     @default(0)
  lowStockThreshold Int     @default(10)
  sku               String? @unique
  barcode           String?
  weight            Decimal? @db.Decimal(8, 2)
  dimensions        Json?
  productId         String  @unique
  product           Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("inventory")
}

// Product SEO model
model ProductSEO {
  id          String  @id @default(cuid())
  title       String? @db.VarChar(60)
  description String? @db.VarChar(160)
  keywords    String[]
  productId   String  @unique
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_seo")
}

// Order model
model Order {
  id          String      @id @default(cuid())
  orderNumber String      @unique
  status      OrderStatus @default(PENDING)
  total       Decimal     @db.Decimal(10, 2)
  subtotal    Decimal     @db.Decimal(10, 2)
  tax         Decimal     @db.Decimal(10, 2)
  shipping    Decimal     @db.Decimal(10, 2)
  discount    Decimal     @db.Decimal(10, 2)
  shippingAddress Json
  billingAddress  Json
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  shippedAt   DateTime?
  deliveredAt DateTime?

  // Relations
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  items       OrderItem[]
  payments    Payment[]

  @@map("orders")
}

// Order Item model
model OrderItem {
  id        String  @id @default(cuid())
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  total     Decimal @db.Decimal(10, 2)
  orderId   String
  productId String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("order_items")
}

// Review model
model Review {
  id        String   @id @default(cuid())
  rating    Int      @db.SmallInt
  title     String?
  comment   String?
  isVerified Boolean @default(false)
  helpful   Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  userId    String
  productId String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@map("reviews")
}

// Notification model
model Notification {
  id        String             @id @default(cuid())
  type      NotificationType
  title     String
  message   String
  data      Json?
  read      Boolean            @default(false)
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt

  // Relations
  userId    String
  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

// Enums
enum UserRole {
  ADMIN
  USER
  MODERATOR
}

enum UserStatus {
  ACTIVE
  INACTIVE
  PENDING
  SUSPENDED
}

enum ProductCategory {
  ELECTRONICS
  CLOTHING
  BOOKS
  HOME
  SPORTS
  BEAUTY
  AUTOMOTIVE
  OTHER
}

enum ProductStatus {
  DRAFT
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum NotificationType {
  ORDER_UPDATE
  PRODUCT_UPDATE
  SYSTEM_ANNOUNCEMENT
  SECURITY_ALERT
  PROMOTION
}
```

## 🔧 Database Queries

### Basic CRUD Operations
```typescript
// lib/db/queries/user-queries.ts
import { prisma } from '@/lib/db'
import { UserRole, UserStatus } from '@prisma/client'

export class UserQueries {
  // Create user
  static async create(data: {
    email: string
    name: string
    password: string
    role?: UserRole
    status?: UserStatus
  }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  // Find user by ID
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        bio: true,
        website: true,
        location: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    })
  }

  // Find user by email
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true,
      },
    })
  }

  // Update user
  static async update(id: string, data: Partial<{
    name: string
    email: string
    avatar: string
    role: UserRole
    status: UserStatus
    bio: string
    website: string
    location: string
    phone: string
  }>) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        bio: true,
        website: true,
        location: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  // Delete user
  static async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    })
  }

  // Find many users with pagination
  static async findMany(params: {
    page: number
    limit: number
    search?: string
    role?: UserRole
    status?: UserStatus
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const { page, limit, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = params

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    if (status) {
      where.status = status
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
```

### Complex Queries
```typescript
// lib/db/queries/product-queries.ts
import { prisma } from '@/lib/db'
import { ProductCategory, ProductStatus } from '@prisma/client'

export class ProductQueries {
  // Find product with relations
  static async findByIdWithRelations(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        inventory: true,
        seo: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            reviews: true,
            orders: true,
          },
        },
      },
    })
  }

  // Find products with filters
  static async findManyWithFilters(params: {
    page: number
    limit: number
    search?: string
    category?: ProductCategory
    status?: ProductStatus
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    tags?: string[]
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const { 
      page, 
      limit, 
      search, 
      category, 
      status, 
      minPrice, 
      maxPrice, 
      inStock, 
      tags, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = params

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }
    
    if (category) {
      where.category = category
    }
    
    if (status) {
      where.status = status
    }
    
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = minPrice
      if (maxPrice) where.price.lte = maxPrice
    }
    
    if (inStock) {
      where.inventory = {
        quantity: { gt: 0 },
      }
    }
    
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          inventory: true,
          _count: {
            select: {
              reviews: true,
              orders: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Create product with relations
  static async createWithRelations(data: {
    name: string
    description: string
    price: number
    category: ProductCategory
    images: string[]
    tags: string[]
    userId: string
    inventory?: {
      quantity: number
      lowStockThreshold: number
      sku?: string
    }
    seo?: {
      title?: string
      description?: string
      keywords?: string[]
    }
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        images: data.images,
        tags: data.tags,
        userId: data.userId,
        inventory: data.inventory ? {
          create: data.inventory,
        } : undefined,
        seo: data.seo ? {
          create: data.seo,
        } : undefined,
      },
      include: {
        inventory: true,
        seo: true,
      },
    })
  }

  // Get product statistics
  static async getStats(productId: string) {
    const [reviewCount, averageRating, orderCount] = await Promise.all([
      prisma.review.count({ where: { productId } }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
      }),
      prisma.orderItem.count({ where: { productId } }),
    ])

    return {
      reviewCount,
      averageRating: averageRating._avg.rating || 0,
      orderCount,
    }
  }
}
```

## 🔄 Transactions

### Basic Transactions
```typescript
// lib/db/transactions.ts
import { prisma } from '@/lib/db'

export class DatabaseTransactions {
  // Create order with inventory update
  static async createOrderWithInventoryUpdate(data: {
    userId: string
    items: Array<{
      productId: string
      quantity: number
      price: number
    }>
    shippingAddress: any
    billingAddress: any
  }) {
    return prisma.$transaction(async (tx) => {
      // Check inventory availability
      for (const item of data.items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId },
        })

        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(`Insufficient inventory for product ${item.productId}`)
        }
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          userId: data.userId,
          subtotal: data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          tax: 0,
          shipping: 0,
          total: data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
            })),
          },
        },
      })

      // Update inventory
      for (const item of data.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        })
      }

      return order
    })
  }

  // Transfer user data
  static async transferUserData(fromUserId: string, toUserId: string) {
    return prisma.$transaction(async (tx) => {
      // Transfer products
      await tx.product.updateMany({
        where: { userId: fromUserId },
        data: { userId: toUserId },
      })

      // Transfer orders
      await tx.order.updateMany({
        where: { userId: fromUserId },
        data: { userId: toUserId },
      })

      // Transfer reviews
      await tx.review.updateMany({
        where: { userId: fromUserId },
        data: { userId: toUserId },
      })

      // Transfer notifications
      await tx.notification.updateMany({
        where: { userId: fromUserId },
        data: { userId: toUserId },
      })

      // Delete original user
      await tx.user.delete({
        where: { id: fromUserId },
      })
    })
  }
}
```

## 📊 Aggregations

### Complex Aggregations
```typescript
// lib/db/aggregations.ts
import { prisma } from '@/lib/db'

export class DatabaseAggregations {
  // Get user statistics
  static async getUserStats(userId: string) {
    const [productCount, orderCount, reviewCount, totalSpent] = await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.order.count({ where: { userId } }),
      prisma.review.count({ where: { userId } }),
      prisma.order.aggregate({
        where: { userId },
        _sum: { total: true },
      }),
    ])

    return {
      productCount,
      orderCount,
      reviewCount,
      totalSpent: totalSpent._sum.total || 0,
    }
  }

  // Get product statistics
  static async getProductStats(productId: string) {
    const [reviewCount, averageRating, orderCount, totalRevenue] = await Promise.all([
      prisma.review.count({ where: { productId } }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
      }),
      prisma.orderItem.count({ where: { productId } }),
      prisma.orderItem.aggregate({
        where: { productId },
        _sum: { total: true },
      }),
    ])

    return {
      reviewCount,
      averageRating: averageRating._avg.rating || 0,
      orderCount,
      totalRevenue: totalRevenue._sum.total || 0,
    }
  }

  // Get sales analytics
  static async getSalesAnalytics(params: {
    startDate: Date
    endDate: Date
    groupBy: 'day' | 'week' | 'month'
  }) {
    const { startDate, endDate, groupBy } = params

    const sales = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return sales.map(sale => ({
      date: sale.createdAt,
      total: sale._sum.total || 0,
      count: sale._count.id,
    }))
  }
}
```

## 🔧 Prisma Utilities

### Query Utilities
```typescript
// lib/db/utils.ts
import { prisma } from '@/lib/db'

export class PrismaUtils {
  // Execute raw SQL
  static async executeRaw<T = any>(query: string, params: any[] = []): Promise<T[]> {
    return prisma.$queryRawUnsafe(query, ...params)
  }

  // Check database connection
  static async checkConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database connection failed:', error)
      return false
    }
  }

  // Get database info
  static async getDatabaseInfo() {
    const [version, tables, indexes] = await Promise.all([
      prisma.$queryRaw`SELECT version()`,
      prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `,
      prisma.$queryRaw`
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE schemaname = 'public'
      `,
    ])

    return {
      version,
      tables,
      indexes,
    }
  }

  // Clean up database
  static async cleanup() {
    await prisma.$disconnect()
  }
}
```

## 📋 Prisma Guidelines

### 1. Schema Design
- Use descriptive model and field names
- Implement proper relationships
- Use appropriate data types
- Add necessary indexes
- Consider data constraints

### 2. Query Optimization
- Use select to limit returned fields
- Implement proper pagination
- Use database indexes
- Avoid N+1 queries
- Use transactions for complex operations

### 3. Error Handling
- Handle Prisma errors gracefully
- Use proper error types
- Log errors for debugging
- Implement retry mechanisms
- Validate input data

### 4. Performance
- Monitor query performance
- Use database profiling
- Implement caching strategies
- Optimize slow queries
- Consider read replicas

### 5. Security
- Use parameterized queries
- Implement proper authentication
- Validate user permissions
- Encrypt sensitive data
- Use database backups

## 🚀 Best Practices

### 1. Use Proper Types
```typescript
// ✅ Good - Proper types
const user: User = await prisma.user.findUnique({
  where: { id: userId },
})

// ❌ Bad - No types
const user = await prisma.user.findUnique({
  where: { id: userId },
})
```

### 2. Use Select for Performance
```typescript
// ✅ Good - Use select
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
})

// ❌ Bad - Select all fields
const users = await prisma.user.findMany()
```

### 3. Use Transactions
```typescript
// ✅ Good - Use transactions
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data: userData })
  await tx.profile.create({ data: profileData })
})
```

### 4. Handle Errors
```typescript
// ✅ Good - Error handling
try {
  const user = await prisma.user.create({ data: userData })
  return user
} catch (error) {
  if (error.code === 'P2002') {
    throw new Error('User already exists')
  }
  throw error
}
```

### 5. Use Proper Indexes
```prisma
// ✅ Good - Proper indexes
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String
  
  @@index([email])
  @@index([name])
}
```

---

*Following these Prisma guidelines ensures efficient, secure, and maintainable database operations in your Next.js application.*
