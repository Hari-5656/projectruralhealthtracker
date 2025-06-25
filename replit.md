# Healthcare Vaccination Management System

## Overview

This is a full-stack web application designed for managing healthcare vaccination records. The system provides a comprehensive platform for health workers and administrators to track patient information, manage vaccination schedules, and monitor vaccination progress.

## System Architecture

The application follows a modern full-stack architecture with the following key components:

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom medical theme colors
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript throughout the entire stack
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express session with memory store
- **Authentication**: Session-based authentication with bcrypt for password hashing

### Build System
- **Frontend Build**: Vite for fast development and optimized production builds
- **Backend Build**: esbuild for server-side bundling
- **Development**: Hot module replacement and live reloading in development

## Key Components

### Authentication System
- Session-based authentication using Express sessions
- Role-based access control (Admin and Health Worker roles)
- Password hashing with bcryptjs
- Protected routes with middleware authentication

### Patient Management
- Complete patient registration with demographic information
- Unique patient ID generation (format: RH001234)
- Age group categorization (infant, child, pregnant, elderly, adult)
- QR code generation for quick patient identification
- Medical history and allergy tracking

### Vaccination Management
- Vaccination scheduling and tracking system
- Vaccine inventory management
- Vaccination status monitoring (scheduled, completed, overdue)
- Appointment scheduling system

### User Interface
- Responsive design optimized for both desktop and mobile
- Medical-themed color scheme with accessibility considerations
- Mobile navigation with bottom navigation bar
- Dashboard with key metrics and quick actions
- Search functionality across patients and records

## Data Flow

1. **Authentication Flow**: Users log in through the login page, which creates a server session and stores user information
2. **Patient Registration**: Health workers create patient records with demographic and medical information
3. **Vaccination Scheduling**: Appointments are scheduled based on patient age groups and vaccination requirements
4. **Record Management**: Vaccination records are updated as treatments are administered
5. **QR Code Integration**: QR codes enable quick patient lookup and record access

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon database connection for PostgreSQL
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **bcryptjs**: Password hashing and authentication
- **express-session**: Session management
- **wouter**: Lightweight React router

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety across the stack
- **tailwindcss**: Utility-first CSS framework
- **@hookform/resolvers**: Form validation integration
- **zod**: Schema validation

## Deployment Strategy

### Development Environment
- Uses Replit development environment with PostgreSQL 16
- Vite development server with hot module replacement
- Express server running on Node.js 20

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild bundles server code for Node.js execution
- Database: PostgreSQL with Drizzle migrations
- Deployment target: Autoscale deployment on Replit

### Database Management
- Schema defined in `shared/schema.ts` with Drizzle ORM
- Migration management through `drizzle-kit`
- Connection pooling with Neon serverless driver

## Changelog
- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.