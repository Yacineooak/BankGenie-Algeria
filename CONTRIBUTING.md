# Contributing to BankGenie

Thank you for your interest in contributing to BankGenie! This guide will help you understand our development process and how to contribute effectively.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Security Considerations](#security-considerations)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Unacceptable Behavior

Examples of unacceptable behavior include:

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 18.0 or higher
- **npm** 8.0 or higher
- **Git** for version control
- **PostgreSQL** 14.0 or higher (for database work)
- **Redis** 6.0 or higher (for caching features)

### Development Environment Setup

1. **Fork the Repository**

   ```bash
   # Fork the repository on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/bankgenie.git
   cd bankgenie
   ```

2. **Add Upstream Remote**

   ```bash
   git remote add upstream https://github.com/original-repo/bankgenie.git
   git remote -v
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Environment Configuration**

   ```bash
   cp .env.example .env.development
   # Edit .env.development with your local settings
   ```

5. **Database Setup**

   ```bash
   # Create development database
   createdb bankgenie_dev

   # Run migrations
   npm run db:migrate:dev

   # Seed test data
   npm run db:seed:dev
   ```

6. **Start Development Server**

   ```bash
   npm run dev
   ```

   The application should be available at `http://localhost:8080`

### Project Structure

```
bankgenie/
├── client/                 # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions
├── server/                # Backend Express application
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   └── middleware/        # Express middleware
├── shared/                # Shared types and utilities
├── docs/                  # Documentation
├── tests/                 # Test files
└── scripts/               # Build and deployment scripts
```

## 🔄 Development Workflow

### Branch Naming Convention

Use descriptive branch names that indicate the type of work:

- `feature/add-user-authentication`
- `bugfix/fix-login-redirect`
- `hotfix/security-patch`
- `docs/update-api-documentation`
- `refactor/optimize-database-queries`

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**

```bash
feat(auth): add two-factor authentication support

fix(api): resolve transaction processing timeout issue

docs(readme): update installation instructions

refactor(database): optimize user query performance
```

### Working on a Feature

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Keep Your Branch Updated**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

3. **Make Your Changes**

   - Write clean, readable code
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation if needed

4. **Test Your Changes**

   ```bash
   # Run all tests
   npm test

   # Run specific test suite
   npm run test:unit
   npm run test:integration
   npm run test:e2e

   # Check code coverage
   npm run test:coverage
   ```

5. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "feat(auth): add OAuth2 integration"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### TypeScript/JavaScript

We use **ESLint** and **Prettier** for code formatting and linting.

#### Code Style Rules

- Use **TypeScript** for all new code
- Prefer **const** over **let**, avoid **var**
- Use **arrow functions** for callbacks and short functions
- Use **async/await** instead of Promises where possible
- Always use **semicolons**
- Use **single quotes** for strings
- Maximum line length: **100 characters**

#### Example Code Style

```typescript
// ✅ Good
interface UserAccount {
  id: string;
  email: string;
  balance: number;
  createdAt: Date;
}

const calculateInterest = async (
  principal: number,
  rate: number,
  time: number,
): Promise<number> => {
  const interest = principal * rate * time;
  return parseFloat(interest.toFixed(2));
};

// ❌ Bad
var user_account = {
  id: "",
  email: "",
  balance: 0,
};

function calculateInterest(principal, rate, time) {
  return principal * rate * time;
}
```

### React Components

#### Component Structure

```tsx
// ✅ Good component structure
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserAccount } from "@/types/user";

interface AccountBalanceProps {
  userId: string;
  onBalanceUpdate?: (balance: number) => void;
}

export default function AccountBalance({
  userId,
  onBalanceUpdate,
}: AccountBalanceProps) {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, [userId]);

  const fetchBalance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/balance`);
      const data = await response.json();
      setBalance(data.balance);
      onBalanceUpdate?.(data.balance);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="account-balance">
      <h3>Account Balance</h3>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="balance-amount">{balance.toLocaleString()} DZD</div>
      )}
      <Button onClick={fetchBalance} disabled={isLoading}>
        Refresh Balance
      </Button>
    </div>
  );
}
```

#### Component Guidelines

- Use **functional components** with hooks
- Props interface should be clearly defined
- Use **TypeScript** for all components
- Handle loading and error states
- Use semantic HTML elements
- Implement proper accessibility attributes

### API Design

#### RESTful Conventions

```typescript
// ✅ Good API design
GET    /api/v1/users                    # List users
GET    /api/v1/users/{id}               # Get user by ID
POST   /api/v1/users                    # Create new user
PUT    /api/v1/users/{id}               # Update user
DELETE /api/v1/users/{id}               # Delete user

GET    /api/v1/users/{id}/accounts      # Get user's accounts
POST   /api/v1/users/{id}/accounts      # Create new account
```

#### Response Format

```typescript
// ✅ Standard response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
    timestamp: string;
  };
}

// Example successful response
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "balance": 50000.00
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// Example error response
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Account balance is insufficient for this transaction",
    "details": {
      "currentBalance": 1000.00,
      "requiredAmount": 5000.00
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Database Conventions

#### Table Naming

- Use **snake_case** for table and column names
- Use **plural** names for tables
- Use **descriptive** names

```sql
-- ✅ Good table structure
CREATE TABLE user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  account_number VARCHAR(20) UNIQUE NOT NULL,
  account_type VARCHAR(20) NOT NULL,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'DZD',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_user_accounts_user_id ON user_accounts(user_id);
CREATE INDEX idx_user_accounts_account_number ON user_accounts(account_number);
CREATE INDEX idx_user_accounts_status ON user_accounts(status);
```

## 🧪 Testing Guidelines

### Test Structure

We use **Vitest** for unit and integration tests, and **Playwright** for end-to-end tests.

#### Unit Tests

```typescript
// tests/utils/calculateInterest.test.ts
import { describe, it, expect } from "vitest";
import { calculateInterest } from "@/utils/financial";

describe("calculateInterest", () => {
  it("should calculate simple interest correctly", () => {
    const principal = 10000;
    const rate = 0.05; // 5%
    const time = 2; // 2 years

    const result = calculateInterest(principal, rate, time);

    expect(result).toBe(1000);
  });

  it("should handle zero values gracefully", () => {
    expect(calculateInterest(0, 0.05, 1)).toBe(0);
    expect(calculateInterest(1000, 0, 1)).toBe(0);
    expect(calculateInterest(1000, 0.05, 0)).toBe(0);
  });

  it("should throw error for negative values", () => {
    expect(() => calculateInterest(-1000, 0.05, 1)).toThrow(
      "Principal amount cannot be negative",
    );
  });
});
```

#### Integration Tests

```typescript
// tests/api/users.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "@/server";
import { cleanupDatabase, createTestUser } from "@/tests/helpers";

describe("User API", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("GET /api/v1/users/:id", () => {
    it("should return user details for valid ID", async () => {
      const testUser = await createTestUser({
        email: "test@example.com",
        name: "Test User",
      });

      const response = await request(app)
        .get(`/api/v1/users/${testUser.id}`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe("test@example.com");
      expect(response.body.data.name).toBe("Test User");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .get("/api/v1/users/non-existent-id")
        .set("Authorization", "Bearer valid-token")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("USER_NOT_FOUND");
    });
  });
});
```

#### End-to-End Tests

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from "@playwright/test";

test.describe("User Login", () => {
  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill("[data-testid=email-input]", "test@example.com");
    await page.fill("[data-testid=password-input]", "password123");
    await page.click("[data-testid=login-button]");

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("[data-testid=welcome-message]")).toContainText(
      "Welcome back",
    );
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill("[data-testid=email-input]", "invalid@example.com");
    await page.fill("[data-testid=password-input]", "wrongpassword");
    await page.click("[data-testid=login-button]");

    await expect(page.locator("[data-testid=error-message]")).toContainText(
      "Invalid email or password",
    );
  });
});
```

### Test Coverage Requirements

- **Unit Tests**: Minimum 80% code coverage
- **Integration Tests**: All API endpoints must have tests
- **E2E Tests**: Critical user flows must be covered

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for specific files
npm test -- --run calculateInterest
```

## 📬 Pull Request Process

### Before Submitting

1. **Ensure Tests Pass**

   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```

2. **Update Documentation**

   - Update README.md if needed
   - Add API documentation for new endpoints
   - Update CHANGELOG.md

3. **Check Code Quality**
   ```bash
   npm run lint:fix
   npm run format
   ```

### PR Template

When creating a pull request, use this template:

```markdown
## Description

Brief description of the changes made.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## How Has This Been Tested?

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing

## Screenshots (if applicable)

Add screenshots here.

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
```

### Review Process

1. **Automated Checks**: All PRs must pass CI/CD checks
2. **Code Review**: At least one maintainer must approve
3. **Testing**: New features must include comprehensive tests
4. **Documentation**: Updates must be documented

### Merging

- Use **"Squash and merge"** for feature branches
- Use **"Rebase and merge"** for hotfixes
- Use **"Create a merge commit"** for release branches

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Environment Information**

   - Operating System
   - Node.js version
   - Browser (if applicable)
   - BankGenie version

2. **Steps to Reproduce**

   ```markdown
   1. Go to '...'
   2. Click on '....'
   3. Scroll down to '....'
   4. See error
   ```

3. **Expected Behavior**
   A clear description of what you expected to happen.

4. **Actual Behavior**
   A clear description of what actually happened.

5. **Screenshots/Logs**
   Add screenshots and relevant logs.

### Feature Requests

When requesting features, include:

1. **Use Case**: Describe the problem you're trying to solve
2. **Proposed Solution**: Describe your ideal solution
3. **Alternatives**: Describe alternatives you've considered
4. **Additional Context**: Add any other context or screenshots

## 🔒 Security Considerations

### Security Guidelines

- **Never commit secrets**: Use environment variables
- **Validate all inputs**: Sanitize user inputs
- **Use HTTPS**: All communications must be encrypted
- **Implement proper authentication**: Use JWT tokens
- **Follow OWASP guidelines**: Web application security best practices

### Reporting Security Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead, email us directly at: security@bankgenie.com

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community discussions
- **Discord**: Real-time chat with the community
- **Email**: For direct support (support@bankgenie.com)

### Documentation

- [API Documentation](docs/api-reference.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture Overview](docs/architecture.md)
- [Security Guidelines](docs/security.md)

## 🙏 Recognition

Contributors who make significant contributions will be:

- Added to the CONTRIBUTORS.md file
- Mentioned in release notes
- Invited to join the core maintainer team (for exceptional contributors)

## 📄 License

By contributing to BankGenie, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to BankGenie! Your efforts help make banking technology more accessible and secure for everyone.
