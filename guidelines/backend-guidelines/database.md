# Database

This document outlines the guidelines for database design, queries, and management in the Next.js Shadcn Dashboard Starter project using PostgreSQL and Prisma.

## 🏗️ Database Architecture

### Database Organization
```
prisma/
├── schema.prisma              # Database schema
├── migrations/                # Database migrations
│   ├── 20240101000000_init/
│   │   └── migration.sql
│   └── 20240102000000_add_user_fields/
│       └── migration.sql
└── seed.ts                    # Database seeding
```

## 🎯 Database Schema Design

### User Schema
```prisma
// prisma/schema.prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?   // For credentials authentication
  avatar        String?
  role          UserRole  @default(USER)
  status        UserStatus @default(ACTIVE)
  bio           String?
  website       String?
  location      String?
  phone         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?

  // Relations
  accounts      Account[]
  sessions      Session[]
  products      Product[]
  orders        Order[]
  reviews       Review[]
  notifications Notification[]

  @@map("users")
}

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
```

### Product Schema
```prisma
model Product {
  id          String        @id @default(cuid())
  name        String
  description String
  price       Decimal       @db.Decimal(10, 2)
  category    ProductCategory
  status      ProductStatus @default(DRAFT)
  images      String[]
  tags        String[]
  inventory   Inventory?
  specifications Json?
  seo         ProductSEO?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  publishedAt DateTime?

  // Relations
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders      OrderItem[]
  reviews     Review[]
  categories  ProductCategoryRelation[]

  @@map("products")
}

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

model ProductSEO {
  id          String  @id @default(cuid())
  title       String? @db.VarChar(60)
  description String? @db.VarChar(160)
  keywords    String[]
  productId   String  @unique
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_seo")
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
```

### Order Schema
```prisma
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

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

### Review Schema
```prisma
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
```

### Notification Schema
```prisma
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

enum NotificationType {
  ORDER_UPDATE
  PRODUCT_UPDATE
  SYSTEM_ANNOUNCEMENT
  SECURITY_ALERT
  PROMOTION
}
```

## 🔧 Database Queries

### User Queries
```typescript
// lib/db/queries/user-queries.ts
import { prisma } from '@/lib/db'
import { UserRole, UserStatus } from '@prisma/client'

export class UserQueries {
  // Get user by ID
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

  // Get user by email
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true,
      },
    })
  }

  // Get users with pagination and filters
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

  // Get user statistics
  static async getStats(userId: string) {
    const [productCount, orderCount, reviewCount] = await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.order.count({ where: { userId } }),
      prisma.review.count({ where: { userId } }),
    ])

    return {
      productCount,
      orderCount,
      reviewCount,
    }
  }
}
```

### Product Queries
```typescript
// lib/db/queries/product-queries.ts
import { prisma } from '@/lib/db'
import { ProductCategory, ProductStatus } from '@prisma/client'

export class ProductQueries {
  // Get product by ID
  static async findById(id: string) {
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

  // Get products with pagination and filters
  static async findMany(params: {
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

  // Create product
  static async create(data: {
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

  // Update product
  static async update(id: string, data: Partial<{
    name: string
    description: string
    price: number
    category: ProductCategory
    status: ProductStatus
    images: string[]
    tags: string[]
  }>) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        inventory: true,
        seo: true,
      },
    })
  }

  // Delete product
  static async delete(id: string) {
    return prisma.product.delete({
      where: { id },
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

### Order Queries
```typescript
// lib/db/queries/order-queries.ts
import { prisma } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

export class OrderQueries {
  // Get order by ID
  static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              },
            },
          },
        },
        payments: true,
      },
    })
  }

  // Get orders with pagination and filters
  static async findMany(params: {
    page: number
    limit: number
    userId?: string
    status?: OrderStatus
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const { page, limit, userId, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = params

    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Create order
  static async create(data: {
    userId: string
    items: Array<{
      productId: string
      quantity: number
      price: number
    }>
    shippingAddress: any
    billingAddress: any
    notes?: string
  }) {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    
    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.1 // 10% tax
    const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
    const total = subtotal + tax + shipping

    return prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    })
  }

  // Update order status
  static async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { 
        status,
        ...(status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
    })
  }

  // Get order statistics
  static async getStats(userId?: string) {
    const where = userId ? { userId } : {}
    
    const [totalOrders, totalRevenue, averageOrderValue] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where,
        _avg: { total: true },
      }),
    ])

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      averageOrderValue: averageOrderValue._avg.total || 0,
    }
  }
}
```

## 🔄 Database Transactions

### Transaction Examples
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

## 📊 Database Seeding

### Seed Data
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
      status: 'ACTIVE',
    },
  })

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Sample Product 1',
        description: 'This is a sample product description',
        price: 29.99,
        category: 'ELECTRONICS',
        status: 'ACTIVE',
        images: ['https://example.com/image1.jpg'],
        tags: ['electronics', 'sample'],
        userId: admin.id,
        inventory: {
          create: {
            quantity: 100,
            lowStockThreshold: 10,
            sku: 'SP001',
          },
        },
        seo: {
          create: {
            title: 'Sample Product 1 - Electronics',
            description: 'Buy Sample Product 1 online',
            keywords: ['electronics', 'sample', 'product'],
          },
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sample Product 2',
        description: 'Another sample product description',
        price: 49.99,
        category: 'CLOTHING',
        status: 'ACTIVE',
        images: ['https://example.com/image2.jpg'],
        tags: ['clothing', 'sample'],
        userId: admin.id,
        inventory: {
          create: {
            quantity: 50,
            lowStockThreshold: 5,
            sku: 'SP002',
          },
        },
      },
    }),
  ])

  console.log('Seed data created successfully!')
  console.log('Admin user:', admin.email)
  console.log('Test user:', user.email)
  console.log('Products created:', products.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## 📋 Database Guidelines

### 1. Schema Design
- Use descriptive table and column names
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

### 3. Data Validation
- Implement database constraints
- Use Prisma validation
- Handle data integrity
- Validate input data
- Use proper error handling

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

### 1. Use Proper Indexes
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

### 2. Use Transactions
```typescript
// ✅ Good - Use transactions
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data: userData })
  await tx.profile.create({ data: profileData })
})
```

### 3. Optimize Queries
```typescript
// ✅ Good - Optimized query
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
  take: 10,
  skip: 0,
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

### 5. Use Proper Types
```typescript
// ✅ Good - Proper types
const user: User = await prisma.user.findUnique({
  where: { id: userId },
})
```

---

*Following these database guidelines ensures efficient, secure, and maintainable database operations in your Next.js application.*
