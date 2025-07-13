# Personal Finance Management System

## Overview

This is a comprehensive personal finance management application built with React (TypeScript) on the frontend and Express.js on the backend. The system helps users track income, expenses, installment payments, and manage debt collection from debtors. It features a modern UI built with shadcn/ui components and uses PostgreSQL with Drizzle ORM for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Driver**: Neon serverless PostgreSQL driver
- **Build Tool**: ESBuild for server bundling
- **Runtime**: Node.js with ESM modules

## Key Components

### Database Schema
The system uses five main entities:
- **Users**: Basic user authentication and identification
- **Transactions**: Financial transactions including credits, fixed expenses, installments, and loans
- **Debtors**: People who owe money to the user
- **Debtor Payments**: Payment records for debt collection
- **Monthly Balances**: Calculated monthly financial summaries

### Frontend Components
- **Dashboard**: Overview of financial health with cards, charts, and summaries
- **Transactions**: Management of all financial transactions
- **Debtors**: Debt collection tracking and payment management
- **Reports**: Financial analytics with charts and export functionality
- **Forms**: Transaction and debtor creation forms with validation

### Backend API Routes
- `/api/dashboard` - Dashboard summary data
- `/api/transactions` - CRUD operations for transactions
- `/api/debtors` - CRUD operations for debtors
- `/api/export/excel` - Excel export functionality
- `/api/export/csv` - CSV export functionality

## Data Flow

1. **User Input**: Forms capture financial data (transactions, debtors)
2. **Validation**: Client-side validation with Zod schemas
3. **API Communication**: TanStack Query manages server communication
4. **Data Persistence**: Drizzle ORM handles database operations
5. **Real-time Updates**: Query invalidation ensures fresh data
6. **Dashboard Display**: Calculated metrics displayed in charts and cards

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Charts**: Recharts for financial data visualization
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL
- **Export**: ExcelJS for spreadsheet generation
- **Session Management**: connect-pg-simple for session storage

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: tsx for TypeScript execution with file watching
- **Database**: Neon serverless PostgreSQL instance

### Production Build
- **Frontend**: Static files built with Vite and served by Express
- **Backend**: ESBuild bundles server code into single executable
- **Database**: Drizzle migrations for schema management

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment designation (development/production)

## Changelog

```
Changelog:
- July 13, 2025. Migration from Replit Agent to Replit environment completed
  - Migrated from Neon PostgreSQL to SQLite for local development
  - Fixed database connection and API validation issues
  - Successfully seeded with complete financial data from user requirements
  - All API endpoints working with 200 status codes
- July 06, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```