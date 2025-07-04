# Contributing to HybridNotes

Thank you for your interest in contributing to HybridNotes! We welcome contributions from the community and are excited to see what you can bring to this project.

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Git
- A Google Gemini API key

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/hybridnotes.git
   cd hybridnotes
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
5. **Open your browser** and navigate to `http://localhost:5173`

## 🔄 Development Workflow

### Making Changes

1. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   
2. **Make your changes** following our coding standards (see below)

3. **Test your changes** thoroughly:
   - Test with different PDF types (text-based, scanned)
   - Test in different languages
   - Test different export formats
   - Test responsive design on mobile/tablet

4. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m "feat: add support for batch PDF processing"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

### Commit Message Guidelines

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```bash
feat: add OCR support for image-based PDFs
fix: resolve language selection not persisting
docs: update installation instructions
style: improve button hover animations
```

## 📝 Coding Standards

### TypeScript/React Guidelines

- **Use TypeScript**: All new code should be written in TypeScript
- **Functional Components**: Use React functional components with hooks
- **Type Safety**: Define proper interfaces and types
- **Props**: Always define prop interfaces
- **Hooks**: Follow React hooks best practices

### Code Style

- **ESLint**: Follow the existing ESLint configuration
- **Formatting**: Use consistent indentation (2 spaces)
- **Naming**: Use camelCase for variables and functions, PascalCase for components
- **File Structure**: Group related functionality in appropriate directories

Example component structure:
```typescript
import React, { useState } from 'react'
import './ComponentName.css'

interface ComponentNameProps {
  title: string
  onAction: (value: string) => void
  disabled?: boolean
}

const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  onAction,
  disabled = false
}) => {
  const [state, setState] = useState<string>('')

  return (
    <div className="component-name">
      {/* Component JSX */}
    </div>
  )
}

export default ComponentName
```

### CSS Guidelines

- **Component-based**: Each component should have its own CSS file
- **BEM-like naming**: Use descriptive class names
- **Responsive**: Ensure mobile-first responsive design
- **Modern CSS**: Use CSS Grid, Flexbox, and CSS custom properties

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, please test:

- [ ] PDF upload with different file types
- [ ] All language options (English, German, French, Russian)
- [ ] All export formats (.txt, .md, mirror .pdf)
- [ ] Additional notes functionality
- [ ] Responsive design on different screen sizes
- [ ] Error handling (invalid API key, network issues)
- [ ] Performance with large PDF files

### Future: Automated Testing

We plan to add automated testing in the future. Contributions for test setup are welcome!

## 🎯 Areas for Contribution

-> Your imagination is needed here.

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to recreate the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, Node.js version
6. **Screenshots**: If applicable
7. **Console Errors**: Any error messages from browser console

## 💡 Feature Requests

For feature requests, please:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** if you have one in mind
4. **Consider the scope** - keep features focused
5. **Think about users** - how will this benefit users?

## 📚 Documentation

Documentation improvements are always welcome:

- **README updates**: Keep installation and usage instructions current
- **Code comments**: Add JSDoc comments for complex functions
- **API documentation**: Document service functions
- **User guides**: Create tutorials for advanced features

## 🌍 Internationalization

We support multiple languages for note output. Help us improve:

- **Language accuracy**: Improve existing language prompts
- **New languages**: Add support for additional languages
- **UI translation**: Translate the interface itself
- **Cultural context**: Ensure culturally appropriate formatting

## 🔒 Security

If you discover a security vulnerability:

1. **Please chill** This app runs offline, except of the API components. No data is stored permamently. Wikileaks might not be interested about your findings.
2. **Report the Bug** Open an Issue.
3. **Provide solution** because this would be very nice.

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to HybridNotes! Together, we're building a better bridge between paper notes and digital knowledge management. 🚀
