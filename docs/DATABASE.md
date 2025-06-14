# Database Setup Guide

## Overview
The Student ID Card System is designed to work with a SQL database for persistent storage. Currently, the application uses in-memory storage for demonstration purposes, but includes a complete database schema for production deployment.

## Database Schema

### Students Table
The main table for storing student information is defined in `scripts/create-students-table.sql`.

```sql
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class VARCHAR(10),
    section VARCHAR(5),
    date_of_birth_day VARCHAR(2),
    date_of_birth_month VARCHAR(2),
    date_of_birth_year VARCHAR(4),
    admission_no VARCHAR(50) NOT NULL UNIQUE,
    blood_group VARCHAR(5),
    contact_no VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Indexes
```sql
-- Index on admission_no for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_admission_no ON students(admission_no);

-- Index on name for search functionality
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
```

## Field Specifications

### Primary Key
- **id**: VARCHAR(10) - Auto-generated format: STU0001, STU0002, etc.

### Required Fields
- **name**: VARCHAR(255) - Student's full name
- **admission_no**: VARCHAR(50) - Unique admission number
- **contact_no**: VARCHAR(20) - Contact phone number
- **address**: TEXT - Full residential address

### Optional Fields
- **class**: VARCHAR(10) - Academic class (1st, 2nd, ..., 12th)
- **section**: VARCHAR(5) - Class section (A, B, C, D, E)
- **date_of_birth_day**: VARCHAR(2) - Birth day (01-31)
- **date_of_birth_month**: VARCHAR(2) - Birth month (01-12)
- **date_of_birth_year**: VARCHAR(4) - Birth year (YYYY)
- **blood_group**: VARCHAR(5) - Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)

### System Fields
- **created_at**: TIMESTAMP - Record creation time
- **updated_at**: TIMESTAMP - Last modification time (MySQL specific)

## Database Integration Steps

### 1. Choose Database System
**Recommended Options:**
- **MySQL**: Full-featured, good for production
- **PostgreSQL**: Advanced features, excellent for complex queries
- **SQLite**: Lightweight, good for development/small deployments

### 2. Environment Setup
Create a `.env.local` file with database connection details:

```env
# Database Configuration
DATABASE_URL="mysql://user:password@localhost:3306/student_id_db"
# or for PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/student_id_db"
# or for SQLite:
# DATABASE_URL="file:./student_id.db"
```

### 3. Install Database Client
Add appropriate database client to your project:

```bash
# For MySQL
bun add mysql2

# For PostgreSQL  
bun add pg @types/pg

# For SQLite
bun add better-sqlite3 @types/better-sqlite3

# ORM Options
bun add prisma @prisma/client
# or
bun add drizzle-orm
```

### 4. Database Initialization

#### Option A: Direct SQL Execution
```bash
# MySQL
mysql -u username -p database_name < scripts/create-students-table.sql

# PostgreSQL (adjust SQL syntax as needed)
psql -U username -d database_name -f scripts/create-students-table.sql

# SQLite
sqlite3 student_id.db < scripts/create-students-table.sql
```

#### Option B: Programmatic Setup
Create a setup script `scripts/setup-database.js`:

```javascript
import mysql from 'mysql2/promise';
import fs from 'fs';

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  const sql = fs.readFileSync('./scripts/create-students-table.sql', 'utf8');
  await connection.execute(sql);
  console.log('Database setup complete');
  
  await connection.end();
}

setupDatabase().catch(console.error);
```

## API Integration

### Current Implementation
The API route (`app/api/students/route.ts`) uses in-memory storage:

```typescript
// In-memory storage for demo purposes
const students: Array<any> = []
let nextId = 1
```

### Database Integration Template

#### Using Native MySQL Client
```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function POST(request: NextRequest) {
  try {
    const studentData = await request.json();
    
    // Generate ID
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM students'
    );
    const nextId = (rows as any)[0].count + 1;
    const id = `STU${String(nextId).padStart(4, "0")}`;
    
    // Insert student
    await pool.execute(`
      INSERT INTO students (
        id, name, class, section, 
        date_of_birth_day, date_of_birth_month, date_of_birth_year,
        admission_no, blood_group, contact_no, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, studentData.name, studentData.class, studentData.section,
      studentData.dateOfBirth.day, studentData.dateOfBirth.month, studentData.dateOfBirth.year,
      studentData.admissionNo, studentData.bloodGroup, studentData.contactNo, studentData.address
    ]);
    
    return NextResponse.json({ ...studentData, id }, { status: 201 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to save student data" }, { status: 500 });
  }
}
```

#### Using Prisma ORM
1. **Install and Configure Prisma**:
```bash
bun add prisma @prisma/client
npx prisma init
```

2. **Define Schema** (`prisma/schema.prisma`):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Student {
  id              String   @id @default(cuid())
  name            String
  class           String?
  section         String?
  dateOfBirthDay  String?  @map("date_of_birth_day")
  dateOfBirthMonth String? @map("date_of_birth_month") 
  dateOfBirthYear String?  @map("date_of_birth_year")
  admissionNo     String   @unique @map("admission_no")
  bloodGroup      String?  @map("blood_group")
  contactNo       String   @map("contact_no")
  address         String
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("students")
}
```

3. **Generate Client and Run Migrations**:
```bash
npx prisma generate
npx prisma db push
```

4. **Use in API Route**:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const studentData = await request.json();
    
    const student = await prisma.student.create({
      data: {
        name: studentData.name,
        class: studentData.class,
        section: studentData.section,
        dateOfBirthDay: studentData.dateOfBirth.day,
        dateOfBirthMonth: studentData.dateOfBirth.month,
        dateOfBirthYear: studentData.dateOfBirth.year,
        admissionNo: studentData.admissionNo,
        bloodGroup: studentData.bloodGroup,
        contactNo: studentData.contactNo,
        address: studentData.address,
      },
    });
    
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to save student data" }, { status: 500 });
  }
}
```

## Data Migration

### From In-Memory to Database
If you have existing data in the in-memory system, create a migration script:

```javascript
// scripts/migrate-data.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Your existing in-memory data
const existingStudents = [
  // ... student data
];

async function migrateData() {
  for (const student of existingStudents) {
    await prisma.student.create({
      data: {
        name: student.name,
        class: student.class,
        // ... map other fields
      },
    });
  }
  
  console.log(`Migrated ${existingStudents.length} students`);
}

migrateData().catch(console.error);
```

## Backup and Maintenance

### Regular Backups
```bash
# MySQL
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# PostgreSQL
pg_dump -U username database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# SQLite
cp student_id.db backup_$(date +%Y%m%d_%H%M%S).db
```

### Performance Optimization
- Monitor query performance on `admission_no` and `name` fields
- Consider additional indexes based on usage patterns
- Implement connection pooling for high-traffic scenarios
- Regular database maintenance and optimization

## Security Considerations

### Data Protection
- Use parameterized queries to prevent SQL injection
- Implement proper input validation
- Encrypt sensitive data at rest
- Use SSL/TLS for database connections
- Regular security updates for database system

### Access Control
- Create dedicated database user with minimal required permissions
- Use environment variables for sensitive configuration
- Implement application-level access controls
- Regular audit of database access logs