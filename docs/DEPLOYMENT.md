# Deployment Guide

## Overview
This guide covers various deployment options for the Student ID Card System, from development to production environments.

## Prerequisites

### System Requirements
- Node.js 18+ or Bun runtime
- Database system (MySQL, PostgreSQL, or SQLite)
- SSL certificate for production (recommended)

### Environment Setup
Create environment files for different stages:

**`.env.local` (Development):**
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/student_id_dev"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"
NODE_ENV="development"

# Optional: Analytics, monitoring
ANALYTICS_ID=""
SENTRY_DSN=""
```

**`.env.production` (Production):**
```env
# Database
DATABASE_URL="mysql://user:password@prod-db:3306/student_id_prod"

# Next.js
NEXT_PUBLIC_API_URL="https://your-domain.com"
NODE_ENV="production"

# Security
SESSION_SECRET="your-secure-session-secret"
ENCRYPTION_KEY="your-encryption-key"

# Monitoring
ANALYTICS_ID="your-analytics-id"
SENTRY_DSN="your-sentry-dsn"
```

## Deployment Options

### 1. Vercel (Recommended for Next.js)

#### Setup Steps
1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy from project root
   vercel
   ```

2. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add production environment variables
   - Separate variables for Preview and Production environments

3. **Database Setup**:
   - Use Vercel Postgres, PlanetScale, or external database
   - Configure `DATABASE_URL` in environment variables

4. **Build Configuration**:
   ```json
   // vercel.json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/next"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

#### Vercel-Specific Features
- **Automatic Deployments**: Git push triggers deployment
- **Preview Deployments**: Every PR gets a preview URL
- **Edge Functions**: API routes run on Vercel Edge Runtime
- **Built-in Analytics**: Page performance monitoring

### 2. Netlify

#### Setup Steps
1. **Build Configuration**:
   ```toml
   # netlify.toml
   [build]
     command = "bun run build"
     publish = ".next"
     
   [build.environment]
     NODE_ENV = "production"
     
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

2. **Database Integration**:
   - Use Netlify Edge Functions for API routes
   - Connect to external database service
   - Configure environment variables in Netlify dashboard

### 3. Docker Containerization

#### Dockerfile
```dockerfile
# Use Node.js LTS Alpine image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Rebuild source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose (with Database)
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/student_id
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=student_id
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/create-students-table.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    restart: unless-stopped

volumes:
  mysql_data:
```

#### Build and Deploy
```bash
# Build image
docker build -t student-id-app .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### 4. AWS Deployment

#### Using AWS Amplify
1. **Setup Amplify**:
   ```bash
   npm install -g @aws-amplify/cli
   amplify init
   amplify add hosting
   ```

2. **Build Settings**:
   ```yaml
   # amplify.yml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

#### Using AWS EC2 + RDS
1. **EC2 Instance Setup**:
   ```bash
   # Install Node.js and dependencies
   sudo yum update -y
   sudo yum install -y nodejs npm git
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Clone and setup application
   git clone <your-repo>
   cd student-id-app
   npm install
   npm run build
   ```

2. **RDS Database Setup**:
   ```bash
   # Connect to RDS MySQL instance
   mysql -h your-rds-endpoint -u admin -p
   
   # Create database and run schema
   CREATE DATABASE student_id_prod;
   USE student_id_prod;
   SOURCE scripts/create-students-table.sql;
   ```

3. **PM2 Configuration**:
   ```json
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'student-id-app',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'development',
         PORT: 3000
       },
       env_production: {
         NODE_ENV: 'production',
         PORT: 3000,
         DATABASE_URL: 'mysql://user:pass@rds-endpoint:3306/student_id_prod'
       }
     }]
   }
   ```

### 5. Google Cloud Platform

#### Using Cloud Run
1. **Containerize** (use Dockerfile above)

2. **Deploy to Cloud Run**:
   ```bash
   # Build and push to Container Registry
   gcloud builds submit --tag gcr.io/PROJECT_ID/student-id-app
   
   # Deploy to Cloud Run
   gcloud run deploy student-id-app \
     --image gcr.io/PROJECT_ID/student-id-app \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

3. **Cloud SQL Database**:
   ```bash
   # Create Cloud SQL instance
   gcloud sql instances create student-id-db \
     --database-version=MYSQL_8_0 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

## Production Optimizations

### Performance
1. **Next.js Optimizations**:
   ```javascript
   // next.config.mjs
   const nextConfig = {
     images: {
       unoptimized: false, // Enable image optimization
       domains: ['your-domain.com']
     },
     compress: true,
     poweredByHeader: false,
     generateEtags: true,
   }
   ```

2. **Database Optimizations**:
   - Connection pooling
   - Query optimization
   - Caching layer (Redis)
   - Read replicas for scaling

3. **CDN Setup**:
   - Configure CloudFront, Cloudflare, or similar
   - Cache static assets
   - Optimize image delivery

### Security
1. **Environment Security**:
   ```env
   # Use strong secrets
   SESSION_SECRET="random-256-bit-key"
   ENCRYPTION_KEY="another-256-bit-key"
   
   # Database security
   DATABASE_URL="mysql://limited_user:strong_password@secure-host:3306/db"
   ```

2. **Application Security**:
   - HTTPS enforcement
   - Security headers
   - Input validation
   - Rate limiting
   - CORS configuration

3. **Database Security**:
   - Firewall rules
   - SSL connections
   - Backup encryption
   - Access logging

### Monitoring
1. **Application Monitoring**:
   ```javascript
   // Add to app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

2. **Error Tracking**:
   ```bash
   npm install @sentry/nextjs
   ```

3. **Health Checks**:
   ```javascript
   // app/api/health/route.ts
   export async function GET() {
     return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
   }
   ```

## Backup and Recovery

### Automated Backups
```bash
#!/bin/bash
# backup-script.sh

# Database backup
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > \
  backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to cloud storage (AWS S3 example)
aws s3 cp backup_*.sql s3://your-backup-bucket/database/

# Clean old local backups
find . -name "backup_*.sql" -mtime +7 -delete
```

### Disaster Recovery Plan
1. **Database Recovery**: Restore from latest backup
2. **Application Recovery**: Redeploy from Git repository
3. **Data Recovery**: Point-in-time recovery procedures
4. **Rollback Strategy**: Previous deployment version

## Scaling Considerations

### Horizontal Scaling
- Load balancers
- Multiple application instances
- Database read replicas
- Microservices architecture

### Vertical Scaling
- Increase server resources
- Database optimization
- Caching strategies
- Performance monitoring

## Maintenance

### Regular Tasks
- **Security Updates**: Keep dependencies updated
- **Database Maintenance**: Regular optimization and cleanup
- **Backup Verification**: Test backup restoration
- **Performance Monitoring**: Track metrics and optimize

### Update Process
```bash
# Update dependencies
bun update

# Run tests
bun run test

# Build and test
bun run build

# Deploy to staging
# Test staging environment
# Deploy to production
```

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version and dependencies
2. **Database Connection**: Verify connection string and network access
3. **Environment Variables**: Ensure all required variables are set
4. **SSL Issues**: Check certificate configuration
5. **Memory Issues**: Monitor resource usage and optimize

### Debug Commands
```bash
# Check application logs
docker logs student-id-app

# Database connection test
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1"

# Health check
curl https://your-domain.com/api/health
```