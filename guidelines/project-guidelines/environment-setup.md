# Environment Setup

This document provides comprehensive instructions for setting up the development environment for the Next.js Shadcn Dashboard Starter project.

## 🚀 Prerequisites

### Required Software
- **Node.js**: Version 18.x or 20.x (LTS recommended)
- **pnpm**: Package manager (recommended over npm/yarn)
- **Git**: Version control
- **PostgreSQL**: Database (version 13+ recommended)
- **VS Code**: Recommended editor with extensions

### Optional Software
- **Docker**: For containerized development
- **Postman/Insomnia**: API testing
- **TablePlus/DBeaver**: Database management

## 📦 Package Manager Setup

### Install pnpm
```bash
# Using npm
npm install -g pnpm

# Using Homebrew (macOS)
brew install pnpm

# Using curl
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Verify installation
pnpm --version
```

### Why pnpm?
- **Faster**: Up to 2x faster than npm
- **Disk Efficient**: Shared dependency storage
- **Strict**: Prevents phantom dependencies
- **Compatible**: Works with npm/yarn workspaces

## 🗄️ Database Setup

### PostgreSQL Installation

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb next_shadcn_dashboard
```

#### Windows
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer with default settings
3. Remember the password for `postgres` user
4. Create database using pgAdmin or command line

#### Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb next_shadcn_dashboard
```

### Database Configuration
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE next_shadcn_dashboard;

-- Create user (optional)
CREATE USER dashboard_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE next_shadcn_dashboard TO dashboard_user;

-- Exit psql
\q
```

## 🔧 Environment Variables

### Create Environment File
```bash
# Copy example environment file
cp .env.example.txt .env.local
```

### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/next_shadcn_dashboard"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Sentry (Optional)
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_SENTRY_ORG="your-sentry-org"
NEXT_PUBLIC_SENTRY_PROJECT="your-sentry-project"
NEXT_PUBLIC_SENTRY_DISABLED="true" # Set to "false" to enable
```

### Environment Variable Descriptions

#### Database
- **DATABASE_URL**: PostgreSQL connection string
- Format: `postgresql://username:password@host:port/database`

#### Authentication
- **NEXTAUTH_URL**: Base URL of your application
- **NEXTAUTH_SECRET**: Secret key for JWT signing (generate with `openssl rand -base64 32`)

#### OAuth Providers
- **GOOGLE_CLIENT_ID/SECRET**: Google OAuth credentials
- **GITHUB_ID/SECRET**: GitHub OAuth credentials

#### Monitoring
- **SENTRY_DSN**: Sentry error tracking DSN
- **SENTRY_ORG/PROJECT**: Sentry organization and project names

## 🛠️ Development Setup

### 1. Clone Repository
```bash
# Clone the repository
git clone https://github.com/your-username/next-shadcn-dashboard-starter.git
cd next-shadcn-dashboard-starter
```

### 2. Install Dependencies
```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm list
```

### 3. Database Setup
```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Seed database (if available)
pnpm prisma db seed
```

### 4. Start Development Server
```bash
# Start development server
pnpm dev

# Server will be available at http://localhost:3000
```

## 🔍 VS Code Setup

### Recommended Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### Workspace Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🐳 Docker Setup (Optional)

### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: next_shadcn_dashboard
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs postgres
```

## 🔧 Development Scripts

### Available Scripts
```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format code with Prettier

# Database
pnpm prisma generate  # Generate Prisma client
pnpm prisma migrate dev # Run migrations
pnpm prisma studio    # Open Prisma Studio
pnpm prisma db seed   # Seed database

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -h localhost -p 5432 -U postgres -d next_shadcn_dashboard

# Check environment variables
echo $DATABASE_URL
```

#### 2. Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
pnpm dev -- -p 3001
```

#### 3. Prisma Issues
```bash
# Reset database
pnpm prisma migrate reset

# Regenerate client
pnpm prisma generate

# Check schema
pnpm prisma validate
```

#### 4. Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

#### 5. TypeScript Issues
```bash
# Check TypeScript configuration
pnpm tsc --noEmit

# Clear Next.js cache
rm -rf .next
pnpm dev
```

### Environment-Specific Issues

#### macOS
```bash
# Install Xcode command line tools
xcode-select --install

# Fix permission issues
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Windows
```bash
# Enable Developer Mode
# Settings > Update & Security > For developers > Developer mode

# Install Windows Build Tools
npm install --global windows-build-tools
```

#### Linux
```bash
# Install build essentials
sudo apt-get update
sudo apt-get install build-essential

# Fix permission issues
sudo chown -R $(whoami) ~/.npm
```

## 🔍 Verification Steps

### 1. Check Installation
```bash
# Check Node.js version
node --version  # Should be 18.x or 20.x

# Check pnpm version
pnpm --version  # Should be 8.x+

# Check PostgreSQL
psql --version  # Should be 13+
```

### 2. Test Database Connection
```bash
# Test connection
pnpm prisma db pull

# Should show database schema
```

### 3. Test Application
```bash
# Start development server
pnpm dev

# Open browser to http://localhost:3000
# Should see the application running
```

### 4. Test Authentication
```bash
# Navigate to /auth/sign-in
# Should see sign-in form
# Test with test credentials (if available)
```

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Prisma Discord](https://discord.gg/prisma)
- [Tailwind CSS Discord](https://discord.gg/tailwindcss)

### Tools
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)
- [Docker Documentation](https://docs.docker.com/)

## 🎯 Next Steps

After completing the setup:

1. **Explore the Codebase**: Familiarize yourself with the project structure
2. **Read Documentation**: Review the guidelines and documentation
3. **Run Tests**: Ensure all tests pass
4. **Make a Change**: Try making a small change to verify everything works
5. **Join the Community**: Connect with other developers

---

*Following these setup instructions will get you ready to contribute to the project effectively.*
