# API Documentation

## Overview
The Student ID Card System provides RESTful API endpoints for managing student data. Currently implemented with in-memory storage for demonstration purposes.

## Base URL
```
/api/students
```

## Endpoints

### POST /api/students
Creates a new student record.

**Request Body:**
```json
{
  "name": "string (required)",
  "class": "string (optional)",
  "section": "string (optional)",
  "dateOfBirth": {
    "day": "string (required)",
    "month": "string (required)", 
    "year": "string (required)"
  },
  "admissionNo": "string (required)",
  "bloodGroup": "string (optional)",
  "contactNo": "string (required)",
  "address": "string (required)"
}
```

**Response (201 Created):**
```json
{
  "id": "STU0001",
  "name": "John Doe",
  "class": "10th",
  "section": "A",
  "dateOfBirth": {
    "day": "15",
    "month": "08",
    "year": "2008"
  },
  "admissionNo": "ADM2024001",
  "bloodGroup": "O+",
  "contactNo": "+1234567890",
  "address": "123 Main Street, City",
  "createdAt": "2024-06-14T10:30:00.000Z"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to save student data"
}
```

### GET /api/students
Retrieves all student records.

**Response (200 OK):**
```json
[
  {
    "id": "STU0001",
    "name": "John Doe",
    "class": "10th",
    "section": "A",
    "dateOfBirth": {
      "day": "15",
      "month": "08", 
      "year": "2008"
    },
    "admissionNo": "ADM2024001",
    "bloodGroup": "O+",
    "contactNo": "+1234567890",
    "address": "123 Main Street, City",
    "createdAt": "2024-06-14T10:30:00.000Z"
  }
]
```

## Data Types

### StudentData Interface
```typescript
interface StudentData {
  id?: string;           // Auto-generated (STU0001, STU0002, etc.)
  name: string;          // Student full name
  class: string;         // Academic class (1st, 2nd, ..., 12th)
  section: string;       // Class section (A, B, C, D, E)
  dateOfBirth: {
    day: string;         // Day (01-31)
    month: string;       // Month (01-12)
    year: string;        // Year (YYYY)
  };
  admissionNo: string;   // Unique admission number
  bloodGroup: string;    // Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
  contactNo: string;     // Contact phone number
  address: string;       // Full address
  createdAt?: string;    // ISO timestamp (auto-generated)
}
```

## Validation Rules

### Required Fields
- `name`: Must not be empty
- `dateOfBirth`: All three fields (day, month, year) required
- `admissionNo`: Must not be empty and should be unique
- `contactNo`: Must not be empty
- `address`: Must not be empty

### Optional Fields
- `class`: Can be empty, valid values: 1st-12th
- `section`: Can be empty, valid values: A-E
- `bloodGroup`: Can be empty, valid values: A+, A-, B+, B-, AB+, AB-, O+, O-

## Error Handling

### Common Error Responses
- **400 Bad Request**: Invalid request body or missing required fields
- **500 Internal Server Error**: Server processing error

### Error Response Format
```json
{
  "error": "Error description"
}
```

## Implementation Notes

### Current Limitations
- **In-Memory Storage**: Data is lost when server restarts
- **No Authentication**: No access control implemented
- **No Validation**: Server-side validation is minimal
- **No Pagination**: GET endpoint returns all records
- **No Filtering**: Cannot filter or search records
- **No Updates/Deletes**: Only CREATE and READ operations supported

### Future Enhancements
- Database integration (see `scripts/create-students-table.sql`)
- Input validation with Zod schemas
- Authentication and authorization
- Pagination and filtering
- PUT/PATCH and DELETE endpoints
- File upload for student photos
- Bulk operations