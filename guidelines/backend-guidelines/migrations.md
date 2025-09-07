# Migrations

This document outlines the guidelines for managing database migrations in the Next.js Shadcn Dashboard Starter project using Prisma.

## 🏗️ Migration Architecture

### Migration Organization
```
prisma/
├── migrations/
│   ├── 20240101000000_init/
│   │   └── migration.sql
│   ├── 20240102000000_add_user_fields/
│   │   └── migration.sql
│   ├── 20240103000000_add_product_tables/
│   │   └── migration.sql
│   └── migration_lock.toml
├── schema.prisma
└── seed.ts
```

## 🎯 Migration Types

### 1. Initial Migration
```sql
-- prisma/migrations/20240101000000_init/migration.sql
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "bio" TEXT,
    "website" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');
```

### 2. Add New Fields
```sql
-- prisma/migrations/20240102000000_add_user_fields/migration.sql
-- AlterTable
ALTER TABLE "users" ADD COLUMN "bio" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "phone" TEXT;

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");
```

### 3. Add New Tables
```sql
-- prisma/migrations/20240103000000_add_product_tables/migration.sql
-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "images" TEXT[],
    "tags" TEXT[],
    "specifications" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "sku" TEXT,
    "barcode" TEXT,
    "weight" DECIMAL(8,2),
    "dimensions" JSONB,
    "productId" TEXT NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_sku_key" ON "inventory"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_productId_key" ON "inventory"("productId");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_userId_idx" ON "products"("userId");

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('ELECTRONICS', 'CLOTHING', 'BOOKS', 'HOME', 'SPORTS', 'BEAUTY', 'AUTOMOTIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 4. Modify Existing Tables
```sql
-- prisma/migrations/20240104000000_modify_user_table/migration.sql
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");
```

### 5. Data Migration
```sql
-- prisma/migrations/20240105000000_migrate_user_data/migration.sql
-- Update existing users to have default role
UPDATE "users" SET "role" = 'USER' WHERE "role" IS NULL;

-- Update existing users to have default status
UPDATE "users" SET "status" = 'ACTIVE' WHERE "status" IS NULL;

-- Set default names for users without names
UPDATE "users" SET "name" = 'User' WHERE "name" IS NULL OR "name" = '';
```

## 🔧 Migration Commands

### Basic Migration Commands
```bash
# Generate migration from schema changes
npx prisma migrate dev --name add_user_fields

# Apply migrations to production
npx prisma migrate deploy

# Reset database and apply all migrations
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Create migration without applying
npx prisma migrate dev --create-only --name add_new_table
```

### Advanced Migration Commands
```bash
# Generate migration with custom name
npx prisma migrate dev --name "add_product_categories"

# Generate migration for specific environment
npx prisma migrate dev --name "add_user_roles" --schema=./prisma/schema.prisma

# Deploy migrations to specific environment
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Reset database with seed
npx prisma migrate reset --force

# Check migration status with details
npx prisma migrate status --schema=./prisma/schema.prisma
```

## 🎯 Migration Best Practices

### 1. Naming Conventions
```bash
# ✅ Good - Descriptive names
npx prisma migrate dev --name "add_user_authentication_fields"
npx prisma migrate dev --name "create_product_inventory_tables"
npx prisma migrate dev --name "add_order_status_enum"

# ❌ Bad - Generic names
npx prisma migrate dev --name "update"
npx prisma migrate dev --name "fix"
npx prisma migrate dev --name "changes"
```

### 2. Migration Structure
```sql
-- ✅ Good - Well-structured migration
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "shipping" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "billingAddress" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 3. Data Migration
```sql
-- ✅ Good - Safe data migration
-- Add new column with default value
ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- Update existing records with default value
UPDATE "users" SET "lastLoginAt" = "createdAt" WHERE "lastLoginAt" IS NULL;

-- Make column NOT NULL after data migration
ALTER TABLE "users" ALTER COLUMN "lastLoginAt" SET NOT NULL;
```

### 4. Rollback Considerations
```sql
-- ✅ Good - Reversible migration
-- Add column
ALTER TABLE "users" ADD COLUMN "phone" TEXT;

-- Create index
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- Rollback would be:
-- DROP INDEX "users_phone_idx";
-- ALTER TABLE "users" DROP COLUMN "phone";
```

## 🔄 Migration Workflow

### Development Workflow
```bash
# 1. Make changes to schema.prisma
# 2. Generate migration
npx prisma migrate dev --name "descriptive_migration_name"

# 3. Review generated migration
# 4. Test migration locally
npx prisma migrate reset

# 5. Commit migration files
git add prisma/migrations/
git commit -m "feat: add user authentication fields"
```

### Production Workflow
```bash
# 1. Deploy migration to staging
npx prisma migrate deploy

# 2. Test application with new migration
# 3. Deploy to production
npx prisma migrate deploy

# 4. Verify migration status
npx prisma migrate status
```

### Team Workflow
```bash
# 1. Pull latest changes
git pull origin main

# 2. Apply new migrations
npx prisma migrate dev

# 3. Generate Prisma client
npx prisma generate

# 4. Start development
npm run dev
```

## 🛠️ Migration Scripts

### Custom Migration Scripts
```typescript
// scripts/migrate-data.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateUserData() {
  try {
    console.log('Starting user data migration...')
    
    // Get all users without phone numbers
    const usersWithoutPhone = await prisma.user.findMany({
      where: {
        phone: null,
      },
    })
    
    console.log(`Found ${usersWithoutPhone.length} users without phone numbers`)
    
    // Update users with default phone number
    for (const user of usersWithoutPhone) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phone: '000-000-0000',
        },
      })
    }
    
    console.log('User data migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateUserData()
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })
```

### Migration Validation
```typescript
// scripts/validate-migration.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function validateMigration() {
  try {
    console.log('Validating migration...')
    
    // Check if all required tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    const requiredTables = ['users', 'products', 'orders', 'inventory']
    const existingTables = tables.map((t: any) => t.table_name)
    
    for (const table of requiredTables) {
      if (!existingTables.includes(table)) {
        throw new Error(`Required table ${table} not found`)
      }
    }
    
    // Check if all required columns exist
    const userColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `
    
    const requiredColumns = ['id', 'email', 'name', 'role', 'status']
    const existingColumns = userColumns.map((c: any) => c.column_name)
    
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column)) {
        throw new Error(`Required column ${column} not found in users table`)
      }
    }
    
    console.log('Migration validation passed!')
  } catch (error) {
    console.error('Migration validation failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run validation
validateMigration()
  .catch((error) => {
    console.error('Validation script failed:', error)
    process.exit(1)
  })
```

## 📋 Migration Guidelines

### 1. Planning Migrations
- Plan migrations carefully
- Consider data migration needs
- Test migrations thoroughly
- Document migration purposes
- Consider rollback strategies

### 2. Naming Conventions
- Use descriptive migration names
- Include date and purpose
- Use consistent naming patterns
- Avoid generic names
- Include version numbers when needed

### 3. Data Safety
- Backup data before migrations
- Test migrations on copies
- Use transactions for complex migrations
- Validate data integrity
- Handle edge cases

### 4. Performance
- Consider migration performance
- Use indexes appropriately
- Batch large data operations
- Monitor migration execution
- Optimize slow migrations

### 5. Team Collaboration
- Coordinate migration timing
- Communicate migration changes
- Use version control
- Review migration code
- Document migration procedures

## 🚀 Best Practices

### 1. Use Descriptive Names
```bash
# ✅ Good - Descriptive names
npx prisma migrate dev --name "add_user_authentication_fields"
npx prisma migrate dev --name "create_product_inventory_tables"
npx prisma migrate dev --name "add_order_status_enum"

# ❌ Bad - Generic names
npx prisma migrate dev --name "update"
npx prisma migrate dev --name "fix"
```

### 2. Test Migrations
```bash
# ✅ Good - Test migrations
npx prisma migrate reset
npx prisma migrate dev --name "test_migration"
npx prisma migrate status
```

### 3. Use Transactions
```sql
-- ✅ Good - Use transactions
BEGIN;
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
CREATE INDEX "users_phone_idx" ON "users"("phone");
COMMIT;
```

### 4. Handle Data Migration
```sql
-- ✅ Good - Safe data migration
ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
UPDATE "users" SET "lastLoginAt" = "createdAt" WHERE "lastLoginAt" IS NULL;
ALTER TABLE "users" ALTER COLUMN "lastLoginAt" SET NOT NULL;
```

### 5. Document Changes
```sql
-- ✅ Good - Documented migration
-- Add user authentication fields
-- This migration adds phone and lastLoginAt fields to users table
-- Phone field is optional, lastLoginAt defaults to createdAt

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
```

---

*Following these migration guidelines ensures safe, reliable, and maintainable database schema changes in your Next.js application.*
