# Contributing to Smart Reconciliation

Thank you for considering contributing to Smart Reconciliation! This document provides guidelines for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Documentation Organization](#documentation-organization)
- [Code Contributions](#code-contributions)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Getting Started

1. **Read the documentation** - Start with [docs/README.md](docs/README.md)
2. **Set up your environment** - Follow [Developer Guide](docs/03-development/developer-guide.md)
3. **Understand the architecture** - Review [Architecture](docs/02-architecture/architecture.md)

## Documentation Organization

### Critical Rule: Never Create Docs in Root

**NEVER create documentation files directly in the `docs/` folder root.**

Our documentation is organized into purpose-based folders:

```
docs/
├── 01-product/          # Product strategy & requirements
├── 02-architecture/     # System design & database
├── 03-development/      # Developer guides & API reference
├── 04-ai-integration/   # AI capabilities & implementation
├── 05-deployment/       # Deployment, configuration & operations
├── 06-testing/          # Test documentation & test cases
└── 99-archive/          # Completed implementation docs
```

### Where to Place New Documentation

| Document Type | Correct Folder | Examples |
|--------------|----------------|----------|
| Product requirements, roadmap | `01-product/` | PRDs, feature specs |
| Architecture diagrams, ADRs | `02-architecture/` | C4 diagrams, database schema |
| Development guides, API docs | `03-development/` | Setup guides, API reference |
| AI features, specifications | `04-ai-integration/` | AI tool specs, prompts |
| Deployment guides, runbooks | `05-deployment/` | Docker guides, operations |
| Test plans, test cases | `06-testing/` | Testing strategy, test data |
| Implementation summaries | `99-archive/` | Post-implementation notes |

### Documentation Checklist

Before adding documentation:

- [ ] Identified the correct folder using the table above
- [ ] Read the folder's README to confirm it's the right place
- [ ] Checked if the information should be added to an existing document
- [ ] Used a descriptive file name (e.g., `database-migration-guide.md`)
- [ ] Added cross-references to related documentation
- [ ] Updated the folder's README if adding a significant new document

## Code Contributions

### Development Workflow

1. **Create a branch** - Use descriptive names (e.g., `feature/add-csv-parser`, `fix/null-pointer-exception`)
2. **Follow micro-steps** - Make small, incremental changes
3. **Write tests** - All new features should have tests
4. **Update documentation** - Keep docs in sync with code changes

### Code Standards

- **Java 21** - Use modern Java features appropriately
- **Spring Boot 3.5.10** - Follow Spring best practices
- **Tests Required** - Unit and integration tests for new features
- **Code Style** - Follow existing code conventions
- **No Warnings** - Code should compile without warnings

### Testing Requirements

```bash
# Run all tests before committing
./mvnw test

# Verify build compiles
./mvnw compile

# Full build with tests
./mvnw clean package
```

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat: Add CSV file parser with schema detection

Implemented CSVParserService with automatic column type detection
and validation. Supports files up to 10MB with configurable limits.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

```
docs: Add API endpoint documentation for file upload

Added comprehensive documentation for the /api/files/upload endpoint
including request format, response schema, and error codes.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Pull Request Process

### Before Creating a PR

1. **Run tests** - Ensure all tests pass
2. **Update docs** - Documentation reflects your changes (in correct folders!)
3. **Clean history** - Squash fixup commits if needed
4. **Verify build** - Compilation succeeds without warnings

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Testing
How have the changes been tested?

## Documentation
- [ ] Documentation updated in appropriate folder
- [ ] API reference updated (if applicable)
- [ ] README updated (if needed)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation added in correct folder (not docs/ root)
- [ ] No build warnings or errors
```

## AI-Assisted Development

When using AI assistants (like Claude Code):

### Documentation Rules for AI

AI assistants must follow these rules when creating documentation:

1. **Never create docs in `docs/` root** - Always use subfolders
2. **Check CLAUDE.md** - Read documentation organization guidelines
3. **Reference folder READMEs** - Understand each folder's purpose
4. **Update existing docs** - Add to existing files when appropriate
5. **Archive implementation notes** - Temporary docs go to `99-archive/`

### Code Review Focus

When reviewing AI-generated code:

- [ ] Code quality and adherence to standards
- [ ] Test coverage and quality
- [ ] **Documentation placement** - Verify docs are in correct folders
- [ ] Security considerations
- [ ] Performance implications

## Questions or Issues?

- **Documentation Questions** - Check [docs/README.md](docs/README.md)
- **Development Questions** - See [Developer Guide](docs/03-development/developer-guide.md)
- **Issues** - Open a GitHub issue with details

---

Thank you for contributing to Smart Reconciliation! Your adherence to these guidelines helps maintain code quality and documentation organization.
