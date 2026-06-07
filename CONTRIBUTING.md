# Contributing to Skill Issue

Thank you for your interest in contributing to Skill Issue! We welcome contributions from the community and appreciate your help in making this project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Message Conventions](#commit-message-conventions)
- [Testing](#testing)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Coding Standards](#coding-standards)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) to understand the community standards we uphold.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher recommended)
- **npm** or **yarn** (npm comes with Node.js)
- **Git**
- A **GitHub account**

### Forking and Cloning the Repository

1. **Fork the repository**
   - Visit [SkillIssue on GitHub](https://github.com/heyabhishekbajpai/SkillIssue)
   - Click the **"Fork"** button in the top-right corner
   - This creates a copy of the repository under your GitHub account

2. **Clone your fork locally**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SkillIssue.git
   cd SkillIssue
   ```

3. **Add the upstream remote**
   ```bash
   git remote add upstream https://github.com/heyabhishekbajpai/SkillIssue.git
   ```

4. **Verify your remotes**
   ```bash
   git remote -v
   # origin (your fork)
   # upstream (original repository)
   ```

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the necessary environment variables. Ask a maintainer for the required configuration or check `.env.example` if available.

Example variables may include:
- Supabase API keys
- Appwrite credentials
- MongoDB connection string
- GitHub API tokens (for development)

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### 4. Verify Setup

- Navigate to `http://localhost:5173` in your browser
- Ensure the application loads without errors
- Run tests to confirm everything is working

---

## Making Changes

### 1. Create a Feature Branch

Always create a new branch for your work. Use descriptive branch names that reflect the purpose of your changes.

```bash
# Update your local main branch first
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
# or for bug fixes:
# git checkout -b fix/bug-description
```

**Branch Naming Conventions:**
- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring
- `test/description` - for adding or improving tests
- `chore/description` - for maintenance tasks

### 2. Make Your Changes

- Keep changes focused and related to a single issue or feature
- Write clear, self-documenting code
- Update relevant documentation as you make changes
- Test your changes thoroughly

### 3. Keep Your Branch Updated

```bash
# Fetch the latest changes from upstream
git fetch upstream

# Rebase your branch on top of main
git rebase upstream/main

# If there are conflicts, resolve them and continue
git rebase --continue
```

---

## Commit Message Conventions

We follow the **Conventional Commits** standard for commit messages. This helps maintain a clean commit history and enables automated changelog generation.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, or tooling changes

### Examples

```
feat(skills): add ability to filter skills by difficulty level

- Added difficulty filter UI component
- Integrated filter with skill search API
- Updated tests for new filtering logic

Closes #123
```

```
fix(auth): resolve session timeout issue

The session was incorrectly invalidating after 30 minutes instead of 24 hours.
Updated token refresh logic to use correct TTL value.

Closes #456
```

```
docs(contributing): update development setup instructions
```

### Best Practices

- Keep the subject line under 50 characters
- Use imperative mood ("add feature" not "added feature")
- Reference issue numbers in the footer (e.g., `Closes #123`)
- Wrap the body at 72 characters for readability
- Explain **what** and **why**, not **how**

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm test -- --watch
```

### Writing Tests

- Place test files alongside their source files with `.test.jsx` or `.test.js` suffix
- Use descriptive test names that explain what is being tested
- Aim for meaningful test coverage (focus on critical paths)
- Use React Testing Library for component tests (already configured)

### Test Example

```javascript
// components/MyComponent.test.jsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render the component with correct text', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## Submitting Pull Requests

### 1. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 2. Create a Pull Request

1. Visit your fork on GitHub
2. You should see a prompt to create a pull request for your branch
3. Click **"Compare & pull request"**
4. Fill in the PR title and description using the template provided
5. Ensure all CI checks pass
6. Click **"Create pull request"**

### 3. PR Title and Description Guidelines

**Title Format:**
Follow the same convention as commit messages:
```
feat(component): add new skill preview feature
fix(api): resolve MongoDB connection timeout
```

**Description Template:**
```
## Description
Brief description of what this PR does.

## Changes
- Change 1
- Change 2
- Change 3

## Related Issues
Closes #issue_number

## How to Test
Steps to verify the changes work as expected.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

### 4. Address Feedback

- Be responsive to review comments
- Discuss any concerns respectfully
- Push additional commits to address feedback
- Request re-review when updates are complete

### 5. Merge

Once approved and all checks pass, a maintainer will merge your PR. Congratulations! 🎉

---

## Reporting Bugs

### Before Reporting

- Check existing issues to avoid duplicates
- Verify the bug still exists on the `main` branch
- Test with the latest development version

### How to Report

1. Go to [Issues](https://github.com/heyabhishekbajpai/SkillIssue/issues)
2. Click **"New Issue"**
3. Select **"Bug Report"**
4. Fill in all requested information

### Bug Report Template

```markdown
## Description
Clear description of the bug.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Node version: [if applicable]

## Screenshots
If applicable, add screenshots or videos.

## Logs
Paste any relevant error logs or console output.
```

---

## Suggesting Enhancements

### Before Suggesting

- Check existing issues and discussions
- Verify the enhancement aligns with the project's vision
- Consider the impact and effort required

### How to Suggest

1. Go to [Issues](https://github.com/heyabhishekbajpai/SkillIssue/issues)
2. Click **"New Issue"**
3. Select **"Feature Request"**
4. Fill in all requested information

### Feature Request Template

```markdown
## Description
Clear description of the enhancement.

## Problem
What problem does this solve or what need does it address?

## Solution
How you envision this working.

## Alternatives
Other approaches you've considered.

## Additional Context
Mockups, examples, or other relevant information.
```

---

## Coding Standards

### General Principles

- **Readability**: Code should be clear and easy to understand
- **Consistency**: Follow existing code patterns in the project
- **DRY**: Don't Repeat Yourself – extract common logic
- **SOLID**: Write maintainable, modular code

### JavaScript/React Guidelines

#### Naming Conventions

```javascript
// Constants
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// Functions and variables (camelCase)
const getUserProfile = () => { /* ... */ };
let isLoading = false;

// React Components (PascalCase)
const SkillCard = () => { /* ... */ };

// Private functions (leading underscore)
const _formatDate = (date) => { /* ... */ };
```

#### File Structure

```javascript
// 1. Imports
import React, { useState } from 'react';
import { Button } from './components/Button';

// 2. Constants
const DEFAULT_TIMEOUT = 5000;

// 3. Component
const MyComponent = () => {
  const [state, setState] = useState(null);
  
  return <div>{state}</div>;
};

// 4. Exports
export default MyComponent;
```

#### React Best Practices

- Use functional components and hooks
- Extract components into separate files when they get large
- Use meaningful prop names
- Prop destructuring at function parameters
- Use `const` for components and functions

```javascript
// ✅ Good
const MyComponent = ({ title, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return <div>{title}</div>;
};

// ❌ Avoid
function MyComponent(props) {
  var isOpen = false;
  return <div>{props.title}</div>;
}
```

### CSS/Tailwind Guidelines

- Use Tailwind CSS classes for styling
- Organize utilities in a logical order (layout, spacing, colors, typography)
- Extract repeated utility patterns into components or custom classes
- Keep utility classes readable and maintainable

```jsx
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-gray-900">Title</h2>
  <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>

// ❌ Avoid - too many utility classes on one element
<div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-2xl shadow-2xl">
```

### Code Comments

- Comment **why**, not **what**
- Keep comments concise and relevant
- Update comments when code changes

```javascript
// ✅ Good
// Retry failed requests with exponential backoff to handle rate limiting
const retryWithBackoff = async (fn, maxAttempts = 3) => { /* ... */ };

// ❌ Avoid
// Loop through 3 times
for (let i = 0; i < 3; i++) { /* ... */ }
```

### Error Handling

- Always handle errors appropriately
- Provide meaningful error messages
- Log errors for debugging

```javascript
// ✅ Good
try {
  const data = await fetchSkills();
  setSkills(data);
} catch (error) {
  console.error('Failed to fetch skills:', error);
  showErrorNotification('Unable to load skills. Please try again.');
}
```

### API/Service Layer

- Create reusable service functions
- Handle errors consistently
- Use appropriate HTTP methods

```javascript
// lib/skillService.js
export const fetchSkills = async (filters = {}) => {
  try {
    const response = await fetch('/api/skills', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Skill fetch failed:', error);
    throw error;
  }
};
```

---

## Additional Resources

- [Project README](README.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vitest Documentation](https://vitest.dev)

---

## Questions or Need Help?

- Open a discussion in [GitHub Discussions](https://github.com/heyabhishekbajpai/SkillIssue/discussions)
- Check existing issues for similar questions
- Reach out to the maintainers on GitHub

---

**Thank you for contributing to Skill Issue! We look forward to seeing your contributions.** 🚀
