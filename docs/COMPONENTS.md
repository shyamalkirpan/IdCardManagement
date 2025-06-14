# Component Architecture Documentation

## Overview
The Student ID Card System follows a component-based architecture using React functional components with TypeScript. The application uses Next.js App Router and implements a multi-step workflow pattern.

## Component Hierarchy

```
app/
├── layout.tsx (Root Layout)
└── page.tsx (Home - Main Orchestrator)
    ├── StudentForm
    └── IdCardPreview

components/
├── student-form.tsx
├── id-card-preview.tsx
├── theme-provider.tsx
└── ui/ (shadcn/ui components)
```

## Core Components

### 1. Home Component (`app/page.tsx`)
**Purpose**: Main application orchestrator that manages the multi-step workflow.

**State Management**:
```typescript
const [showForm, setShowForm] = useState(false)
const [showPreview, setShowPreview] = useState(false)
const [studentData, setStudentData] = useState<StudentData | null>(null)
```

**Workflow States**:
- **Landing**: Initial state with "Create New Student ID" button
- **Form**: Student data collection form
- **Preview**: ID card preview with save/edit options

**Key Functions**:
- `handleFormSubmit()`: Transitions from form to preview
- `handleSaveToDatabase()`: Saves data via API call
- `handleReset()`: Returns to landing state

**Props Interface**:
```typescript
export interface StudentData {
  id?: string
  name: string
  class: string
  section: string
  dateOfBirth: {
    day: string
    month: string
    year: string
  }
  admissionNo: string
  bloodGroup: string
  contactNo: string
  address: string
}
```

### 2. StudentForm Component (`components/student-form.tsx`)
**Purpose**: Collects and validates student information through a multi-field form.

**Props Interface**:
```typescript
interface StudentFormProps {
  onSubmit: (data: StudentData) => void
  onCancel: () => void
  initialData?: StudentData | null
}
```

**Form Fields**:
- Text inputs: name, admissionNo, contactNo
- Select dropdowns: class, section, bloodGroup, dateOfBirth parts
- Textarea: address
- Checkbox: acceptance validation

**Validation**:
- Required fields: name, dateOfBirth, admissionNo, contactNo, address
- Custom validation: acceptance checkbox must be checked
- HTML5 validation: required attributes on inputs

**State Management**:
```typescript
const [formData, setFormData] = useState<StudentData>({...})
const [accepted, setAccepted] = useState(false)
```

**Data Options**:
```typescript
const classes = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"]
const sections = ["A", "B", "C", "D", "E"]
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
```

### 3. IdCardPreview Component (`components/id-card-preview.tsx`)
**Purpose**: Renders a visual representation of the student ID card.

**Props Interface**:
```typescript
interface IdCardPreviewProps {
  studentData: StudentData
}
```

**Design Features**:
- Gradient background (blue to purple)
- Student avatar (first letter of name)
- Formatted data display
- Academic year validation note
- Responsive card layout

**Utility Functions**:
```typescript
const formatDate = (dateObj: { day: string; month: string; year: string }) => {
  return `${dateObj.day}/${dateObj.month}/${dateObj.year}`
}
```

## UI Component Library

### shadcn/ui Components Used
- **Form Elements**: Button, Input, Label, Select, Checkbox, Textarea
- **Layout**: Card, CardContent, CardHeader, CardTitle, CardDescription
- **Feedback**: Toast (via Sonner)

### Custom Styling Patterns
- **Gradient Backgrounds**: Different color schemes for each view
- **Button Variants**: Color-coded by function (green=save, yellow=navigation, blue=primary)
- **Responsive Design**: Mobile-first approach with breakpoint handling

## Hooks and Utilities

### Custom Hooks
- `useIsMobile()`: Detects mobile screen sizes (768px breakpoint)
- `useToast()`: Toast notification system integration

**Hook Location**: Use hooks from `/hooks/` directory (not `/components/ui/`)

### Utility Functions
- `cn()` from `lib/utils.ts`: Tailwind class merging utility
- Date formatting helpers in IdCardPreview

## Data Flow

### 1. Form Submission Flow
```
StudentForm (user input) 
  → handleFormSubmit() 
  → Home component state update 
  → IdCardPreview rendering
```

### 2. Save to Database Flow
```
IdCardPreview (save button) 
  → handleSaveToDatabase() 
  → API call to /api/students 
  → State update with server response
```

### 3. Edit Flow
```
IdCardPreview (edit button) 
  → setShowForm(true) 
  → StudentForm with initialData 
  → Form pre-populated with existing data
```

## Styling Architecture

### CSS Framework
- **Primary**: Tailwind CSS with custom configuration
- **Component Library**: Radix UI primitives via shadcn/ui
- **Theme System**: CSS variables for consistent theming

### Color Scheme
```css
/* Landing Page */
bg-gradient-to-br from-blue-50 to-indigo-100

/* Form Page */
bg-gradient-to-br from-orange-50 to-yellow-50

/* ID Card */
bg-gradient-to-br from-blue-600 to-purple-700
```

### Responsive Design
- Mobile-first approach
- Breakpoint: 768px (mobile vs desktop)
- Flexible card layouts
- Touch-friendly form controls

## Component Best Practices

### TypeScript Usage
- All components use TypeScript with proper interface definitions
- Props are fully typed with optional/required markers
- State management includes proper type annotations

### React Patterns
- Functional components with hooks
- Controlled form inputs
- Conditional rendering for multi-step workflow
- Props drilling for data passing

### Accessibility
- Semantic HTML elements
- Proper form labels and associations
- Keyboard navigation support (via Radix UI)
- Screen reader friendly text

## Testing Considerations

### Component Testing Strategy
- **Unit Tests**: Individual component rendering and behavior
- **Integration Tests**: Multi-component workflows
- **Form Testing**: Input validation and submission
- **API Integration**: Mock API responses

### Test Files Structure (Recommended)
```
__tests__/
├── components/
│   ├── StudentForm.test.tsx
│   ├── IdCardPreview.test.tsx
│   └── Home.test.tsx
└── api/
    └── students.test.ts
```

## Performance Considerations

### Optimization Opportunities
- **Memoization**: Consider React.memo for pure components
- **Form Optimization**: Debounce input validation
- **State Management**: Local state is sufficient for current scope
- **Bundle Size**: Tree-shaking with ES6 imports

### Current Performance Notes
- No unnecessary re-renders in current implementation
- Minimal state updates
- Efficient form field updates with spread operator