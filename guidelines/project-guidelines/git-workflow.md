# Git Workflow

This document outlines the Git workflow and best practices for the Next.js Shadcn Dashboard Starter project.

## 🌿 Branch Strategy

### Main Branches

#### `main` Branch
- **Purpose**: Production-ready code
- **Protection**: Protected branch with required reviews
- **Deployment**: Automatically deploys to production
- **Rules**: 
  - No direct commits
  - Requires pull request
  - Requires passing CI/CD checks
  - Requires at least one approval

#### `develop` Branch
- **Purpose**: Integration branch for features
- **Protection**: Protected branch
- **Rules**:
  - No direct commits
  - Requires pull request from feature branches
  - Requires passing CI/CD checks

### Feature Branches

#### Naming Convention
```
feature/[ticket-number]-[short-description]
feature/123-user-authentication
feature/456-product-crud
feature/789-dashboard-charts
```

#### Workflow
1. Create feature branch from `develop`
2. Develop feature with atomic commits
3. Create pull request to `develop`
4. After review and merge, delete feature branch

### Hotfix Branches

#### Naming Convention
```
hotfix/[ticket-number]-[short-description]
hotfix/999-critical-security-fix
hotfix/888-login-bug-fix
```

#### Workflow
1. Create hotfix branch from `main`
2. Fix the issue with atomic commits
3. Create pull request to `main`
4. After merge, merge back to `develop`
5. Delete hotfix branch

## 📝 Commit Message Convention

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements
- **ci**: CI/CD changes
- **build**: Build system changes

### Examples
```bash
# Good commit messages
feat(auth): add Google OAuth integration
fix(dashboard): resolve chart rendering issue
docs(api): update authentication endpoints
style(components): format code with prettier
refactor(utils): extract common validation logic
test(auth): add unit tests for sign-in flow
chore(deps): update dependencies to latest versions
perf(api): optimize database queries
ci(github): add automated testing workflow
build(webpack): update build configuration

# Bad commit messages
fix bug
update code
changes
WIP
asdf
```

### Scope Examples
- `auth`: Authentication related changes
- `dashboard`: Dashboard components and pages
- `api`: API routes and server actions
- `ui`: UI components and styling
- `db`: Database schema and migrations
- `config`: Configuration files
- `docs`: Documentation updates

## 🔄 Pull Request Workflow

### Creating a Pull Request

#### Title Format
```
<type>(<scope>): <description>
feat(auth): add password reset functionality
fix(dashboard): resolve data table pagination issue
```

#### Description Template
```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Screenshots/videos attached (if UI changes)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is properly commented
- [ ] Documentation updated (if needed)
- [ ] No console.log statements left in code
- [ ] TypeScript types are properly defined
```

### Review Process

#### For Reviewers
1. **Code Quality**: Check for code quality and adherence to guidelines
2. **Functionality**: Verify the feature works as expected
3. **Testing**: Ensure adequate test coverage
4. **Documentation**: Check if documentation needs updates
5. **Performance**: Consider performance implications
6. **Security**: Review for security vulnerabilities

#### Review Checklist
- [ ] Code follows naming conventions
- [ ] Code is properly typed with TypeScript
- [ ] No hardcoded values or magic numbers
- [ ] Error handling is implemented
- [ ] Code is properly formatted
- [ ] No unused imports or variables
- [ ] Components are properly structured
- [ ] API routes follow RESTful conventions
- [ ] Database queries are optimized
- [ ] Authentication/authorization is properly implemented

## 🚀 Deployment Workflow

### Environment Branches
- `main` → Production
- `develop` → Staging
- Feature branches → Development

### Deployment Process
1. **Feature Development**: Work on feature branch
2. **Pull Request**: Create PR to `develop`
3. **Code Review**: Team reviews and approves
4. **Merge**: Merge to `develop` (deploys to staging)
5. **Testing**: Test on staging environment
6. **Release**: Create PR from `develop` to `main`
7. **Production**: Merge to `main` (deploys to production)

## 🛠️ Git Hooks

### Pre-commit Hooks
Configured via Husky to run:
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Tests**: Run relevant tests

### Pre-push Hooks
- **Full Test Suite**: Run all tests
- **Build Check**: Ensure project builds successfully
- **Type Check**: Full TypeScript compilation

## 📋 Branch Management

### Creating Branches
```bash
# Create and switch to new feature branch
git checkout -b feature/123-user-authentication

# Create branch from specific commit
git checkout -b feature/456-fix-commit abc1234

# Create branch from remote branch
git checkout -b feature/789-remote-feature origin/develop
```

### Branch Cleanup
```bash
# Delete local branch
git branch -d feature/123-user-authentication

# Delete remote branch
git push origin --delete feature/123-user-authentication

# Clean up merged branches
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d
```

## 🔍 Code Review Best Practices

### For Authors
1. **Small PRs**: Keep pull requests focused and small
2. **Clear Description**: Provide clear description of changes
3. **Test Coverage**: Ensure adequate test coverage
4. **Self Review**: Review your own code before requesting review
5. **Address Feedback**: Respond to review comments promptly

### For Reviewers
1. **Timely Reviews**: Review within 24 hours when possible
2. **Constructive Feedback**: Provide helpful, constructive feedback
3. **Ask Questions**: Ask clarifying questions when needed
4. **Test Changes**: Test the changes locally when possible
5. **Approve When Ready**: Don't block on minor issues

## 🚨 Emergency Procedures

### Hotfix Process
1. **Create Hotfix Branch**: From `main` branch
2. **Fix Issue**: Implement the fix with proper testing
3. **Create PR**: To `main` branch with hotfix label
4. **Fast Track Review**: Expedited review process
5. **Deploy**: Immediate deployment to production
6. **Backport**: Merge fix back to `develop`

### Rollback Process
1. **Identify Issue**: Determine what needs to be rolled back
2. **Create Rollback PR**: Revert specific commits
3. **Review**: Quick review of rollback changes
4. **Deploy**: Deploy rollback to production
5. **Investigate**: Investigate root cause of issue

## 📊 Git Statistics

### Useful Commands
```bash
# View commit history
git log --oneline --graph --all

# View file changes
git log --follow --stat -- path/to/file

# View contributor statistics
git shortlog -sn

# View branch information
git branch -a

# View remote information
git remote -v
```

## 🔧 Git Configuration

### Recommended Settings
```bash
# Set up user information
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set up default branch name
git config --global init.defaultBranch main

# Set up pull strategy
git config --global pull.rebase false

# Set up push strategy
git config --global push.default simple

# Set up aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

## 📚 Git Workflow Checklist

### Before Starting Work
- [ ] Pull latest changes from `develop`
- [ ] Create feature branch with proper naming
- [ ] Ensure local environment is set up correctly

### During Development
- [ ] Make atomic commits with clear messages
- [ ] Follow naming conventions
- [ ] Write tests for new functionality
- [ ] Update documentation as needed
- [ ] Keep commits focused and logical

### Before Creating PR
- [ ] Rebase on latest `develop`
- [ ] Run all tests locally
- [ ] Check code formatting
- [ ] Review own code
- [ ] Update documentation
- [ ] Remove any debug code

### During Review
- [ ] Respond to feedback promptly
- [ ] Make requested changes
- [ ] Test changes thoroughly
- [ ] Update PR description if needed

### After Merge
- [ ] Delete feature branch
- [ ] Update local branches
- [ ] Verify deployment
- [ ] Update project documentation

---

*Following these Git workflow guidelines ensures smooth collaboration and maintains code quality throughout the development process.*
