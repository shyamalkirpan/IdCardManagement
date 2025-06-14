# Development Workflow Guide

## Getting Started

### Prerequisites
- **Runtime**: Bun (recommended) or Node.js 18+
- **Package Manager**: Uses npm scripts but bun is preferred for execution
- **IDE**: VS Code with TypeScript and Tailwind CSS extensions recommended

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd student-id-app

# Install dependencies
bun install

# Start development server
bun run dev
```

### Development Server
```bash
# Start with hot reload
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linting
bun run lint
```

## Project Structure

```
student-id-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── students/      # Student management endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (main orchestrator)
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── id-card-preview.tsx
│   ├── student-form.tsx
│   └── theme-provider.tsx
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/               # Static assets
├── scripts/              # Database and utility scripts
├── styles/               # Additional CSS files
└── docs/                 # Documentation
```

## Development Workflow

### 1. Feature Development Process

#### Planning Phase
1. **Understand Requirements**: Review feature specifications
2. **Check Architecture**: Review `docs/COMPONENTS.md` for patterns
3. **Plan Database Changes**: Check `docs/DATABASE.md` if data model changes needed
4. **Create Branch**: Use descriptive branch names

```bash
# Create feature branch
git checkout -b feature/add-photo-upload
git checkout -b fix/form-validation-bug
git checkout -b refactor/api-error-handling
```

#### Implementation Phase
1. **Follow Existing Patterns**: Match code style and architecture
2. **Use TypeScript**: All new code should be properly typed
3. **Test Locally**: Verify functionality works as expected
4. **Check Mobile**: Test responsive design

#### Code Review Phase
1. **Self Review**: Check your own code before submitting
2. **Run Quality Checks**: Ensure linting passes
3. **Test Edge Cases**: Verify error handling and validation
4. **Update Documentation**: Update relevant docs if needed

### 2. Code Style Guidelines

#### TypeScript Standards
```typescript
// ✅ Good: Proper interfaces and type safety
interface StudentFormProps {
  onSubmit: (data: StudentData) => void
  onCancel: () => void
  initialData?: StudentData | null
}

// ✅ Good: Explicit return types for functions
const formatDate = (dateObj: DateObject): string => {
  return `${dateObj.day}/${dateObj.month}/${dateObj.year}`
}

// ❌ Avoid: Any types
const handleData = (data: any) => { ... }
```

#### React Component Patterns
```typescript
// ✅ Good: Functional components with proper hooks
export default function StudentForm({ onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState<StudentData>({...})
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle submission
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* JSX content */}
    </form>
  )
}

// ❌ Avoid: Class components (unless specifically needed)
class StudentForm extends React.Component { ... }
```

#### Styling Conventions
```typescript
// ✅ Good: Tailwind classes with consistent patterns
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  <Card className="w-full max-w-md">
    <Button className="bg-blue-600 hover:bg-blue-700">
      Submit
    </Button>
  </Card>
</div>

// ✅ Good: Color-coded button patterns
<Button className="bg-green-600 hover:bg-green-700">Save</Button>
<Button className="bg-yellow-500 hover:bg-yellow-600">Back</Button>
<Button variant="outline">Cancel</Button>
```

### 3. Testing Strategy

#### Manual Testing Checklist
- **Form Validation**: Test required fields, invalid inputs
- **Multi-step Flow**: Home → Form → Preview → Save
- **Error Handling**: API failures, network issues
- **Responsive Design**: Mobile and desktop layouts
- **Browser Compatibility**: Chrome, Firefox, Safari, Edge

#### Automated Testing (Future Implementation)
```bash
# Install testing dependencies
bun add -d jest @testing-library/react @testing-library/jest-dom

# Test structure (recommended)
__tests__/
├── components/
│   ├── StudentForm.test.tsx
│   ├── IdCardPreview.test.tsx
│   └── Home.test.tsx
├── api/
│   └── students.test.ts
└── utils/
    └── formatters.test.ts
```

### 4. Database Development

#### Current State
- **Development**: In-memory storage in API route
- **Production Ready**: SQL schema in `scripts/create-students-table.sql`

#### Database Workflow
1. **Schema Changes**: Update `scripts/create-students-table.sql`
2. **API Updates**: Modify `app/api/students/route.ts`
3. **Type Updates**: Update `StudentData` interface in `app/page.tsx`
4. **Component Updates**: Update form fields and validation

#### Local Database Setup (Optional)
```bash
# MySQL setup
docker run --name student-db -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=student_id -p 3306:3306 -d mysql:8.0

# Run schema
mysql -h localhost -u root -p student_id < scripts/create-students-table.sql

# Update .env.local
echo "DATABASE_URL=mysql://root:password@localhost:3306/student_id" >> .env.local
```

### 5. API Development

#### Current API Structure
```typescript
// GET /api/students - Retrieve all students
// POST /api/students - Create new student

// Expected expansion:
// GET /api/students/:id - Get single student
// PUT /api/students/:id - Update student
// DELETE /api/students/:id - Delete student
```

#### API Development Guidelines
1. **Follow REST Conventions**: Use appropriate HTTP methods
2. **Error Handling**: Return consistent error formats
3. **Validation**: Validate input data before processing
4. **Documentation**: Update `docs/API.md` for changes

```typescript
// ✅ Good: Proper error handling
export async function POST(request: NextRequest) {
  try {
    const studentData = await request.json()
    
    // Validation
    if (!studentData.name || !studentData.admissionNo) {
      return NextResponse.json(
        { error: "Name and admission number are required" },
        { status: 400 }
      )
    }
    
    // Process data
    const result = await saveStudent(studentData)
    return NextResponse.json(result, { status: 201 })
    
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### 6. Component Development

#### Component Creation Checklist
1. **Check Existing Components**: Reuse UI components from `components/ui/`
2. **Follow Naming**: Use PascalCase for components, kebab-case for files
3. **TypeScript Interfaces**: Define proper prop interfaces
4. **Responsive Design**: Mobile-first approach
5. **Accessibility**: Use semantic HTML and ARIA attributes

#### New Component Template
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface NewComponentProps {
  title: string
  onAction: () => void
  isLoading?: boolean
}

export default function NewComponent({ title, onAction, isLoading = false }: NewComponentProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onAction} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Loading..." : "Action"}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 7. Performance Optimization

#### Development Tools
```bash
# Bundle analysis
bun run build
npx @next/bundle-analyzer

# Performance monitoring
bun add @vercel/analytics
```

#### Optimization Guidelines
1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Dynamic imports for large components
3. **Memoization**: React.memo for expensive renders
4. **Database**: Optimize queries and use indexes

### 8. Debugging

#### Common Issues and Solutions

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules
bun install
```

**TypeScript Errors:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update type definitions
bun add -d @types/node @types/react @types/react-dom
```

**Styling Issues:**
```bash
# Regenerate Tailwind
bunx tailwindcss -i ./styles/globals.css -o ./dist/output.css --watch
```

#### Debug Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### 9. Git Workflow

#### Commit Standards
```bash
# Good commit messages
git commit -m "feat: add student photo upload functionality"
git commit -m "fix: resolve form validation edge case"
git commit -m "refactor: improve API error handling"
git commit -m "docs: update component architecture guide"

# Commit types: feat, fix, refactor, docs, style, test, chore
```

#### Branch Strategy
```bash
# Main branches
main           # Production ready code
develop        # Integration branch (if using)

# Feature branches
feature/xyz    # New features
fix/xyz        # Bug fixes
refactor/xyz   # Code improvements
docs/xyz       # Documentation updates
```

### 10. Quality Assurance

#### Pre-commit Checklist
- [ ] Code compiles without errors
- [ ] TypeScript types are correct
- [ ] Responsive design works on mobile
- [ ] Form validation works properly
- [ ] API endpoints respond correctly
- [ ] No console errors in browser
- [ ] Code follows existing patterns
- [ ] Documentation updated if needed

#### Code Review Guidelines
1. **Functionality**: Does the code work as intended?
2. **Security**: Are there any security vulnerabilities?
3. **Performance**: Are there any performance issues?
4. **Maintainability**: Is the code readable and maintainable?
5. **Standards**: Does it follow project conventions?

### 11. Environment Management

#### Development Environment
```env
# .env.local
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=memory://local
```

#### Staging Environment
```env
# .env.staging
NODE_ENV=staging
NEXT_PUBLIC_API_URL=https://staging.your-domain.com
DATABASE_URL=mysql://user:pass@staging-db:3306/student_id_staging
```

#### Production Environment
```env
# .env.production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
DATABASE_URL=mysql://user:pass@prod-db:3306/student_id_prod
```

## Useful Commands

```bash
# Development
bun run dev                 # Start development server
bun run build              # Build for production
bun run start              # Start production server
bun run lint               # Run ESLint

# Database
mysql -u root -p < scripts/create-students-table.sql

# Git
git status                 # Check working directory
git add .                  # Stage changes
git commit -m "message"    # Commit changes
git push origin branch     # Push to remote

# Docker (if using)
docker-compose up -d       # Start services
docker-compose logs -f app # View logs
docker-compose down        # Stop services
```