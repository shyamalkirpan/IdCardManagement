# Student ID Card Management System

A modern, responsive web application for creating and managing student ID cards built with Next.js 15, React 19, TypeScript, and Supabase.

## Features

- **Multi-step Student Registration**: Intuitive form workflow for student data collection
- **Real-time ID Card Preview**: Live preview of student ID cards as data is entered
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Form Validation**: Comprehensive validation with error handling
- **Database Integration**: Supabase PostgreSQL backend for data persistence
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Package Manager**: Bun (recommended)
- **Validation**: Zod with TanStack Form
- **UI Components**: Radix UI primitives

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd student-id-app
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up the database:
```bash
# Run the SQL scripts in the scripts/ directory in your Supabase SQL editor
```

5. Start the development server:
```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main application with workflow orchestration
│   ├── dashboard/         # Student management dashboard
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── student-form.tsx   # Student data collection form
│   ├── id-card-preview.tsx # ID card display component
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client and types
│   ├── form-schemas.ts   # Zod validation schemas
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
├── docs/                  # Comprehensive documentation
├── scripts/              # Database setup scripts
└── middleware.ts         # Auth middleware (ready for implementation)
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Development Guide](docs/DEVELOPMENT.md)** - Setup and workflow
- **[API Reference](docs/API.md)** - Backend endpoints
- **[Components Guide](docs/COMPONENTS.md)** - Frontend architecture
- **[Database Setup](docs/DATABASE.md)** - Database configuration
- **[Supabase Setup](docs/SUPABASE_SETUP.md)** - Supabase-specific setup
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment

## Application Flow

```
Home Page → Student Form → ID Card Preview → Database Save
    ↓           ↓              ↓              ↓
  Landing   Data Collection  Live Preview   Persistence
```

## Database Schema

The application uses a PostgreSQL database with the following main table:

**students**
- `id` (Primary Key)
- `name`, `class`, `section`, `admission_number`
- `date_of_birth_day`, `date_of_birth_month`, `date_of_birth_year`
- `blood_group`, `contact`, `address`
- `photo_url` (optional)
- `created_at`, `updated_at`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the development guidelines in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Current Limitations

- No authentication system (middleware ready for implementation)
- No photo upload functionality
- No print/export capabilities
- No advanced search and filtering

## Future Enhancements

- 📷 Photo upload and management
- 🔐 User authentication and authorization
- 📊 Advanced student management dashboard
- 🖨️ Print and export functionality
- 🔍 Search, filter, and pagination
- 📱 Mobile application

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support:
- Check the [documentation](docs/)
- Review existing issues
- Create a new issue for bugs or feature requests