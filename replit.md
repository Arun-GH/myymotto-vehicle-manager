# Vehicle Management System

## Overview

This is a full-stack web application for managing vehicles and their documents. It's built with a React frontend, Express.js backend, and PostgreSQL database, designed specifically for mobile-first usage. The application allows users to add vehicles, upload documents, and track important dates like insurance and emission expiry.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Uploads**: Multer middleware for handling document uploads
- **Session Management**: Express sessions with PostgreSQL storage

### Mobile-First Design
- **Layout**: Maximum width container (max-w-md) for mobile optimization
- **Navigation**: Bottom navigation bar with floating action button
- **Responsive**: Tailwind's responsive design system
- **Touch-Friendly**: Large touch targets and mobile-optimized interactions

## Key Components

### Database Schema
- **Vehicles Table**: Stores vehicle information including make, model, year, owner details, and expiry dates
- **Documents Table**: Stores uploaded files with metadata and vehicle associations
- **User System**: Basic user management structure (partially implemented)

### API Endpoints
- **Vehicle CRUD**: Complete create, read, update, delete operations for vehicles
- **Document Management**: Upload, retrieve, and delete vehicle documents
- **File Storage**: Local file system storage with configurable limits

### Frontend Pages
- **Dashboard**: Overview with statistics and vehicle list
- **Add Vehicle**: Form for creating new vehicle records
- **Vehicle Details**: Detailed view with document management
- **Documents**: Centralized document browser

### Core Features
- **Camera Integration**: Camera capture for document photos using device camera
- **File Upload**: Drag-and-drop and traditional file selection
- **Expiry Tracking**: Visual indicators for expired and expiring documents
- **Form Validation**: Client and server-side validation using Zod schemas

## Data Flow

1. **User Input**: Forms collect vehicle and document data
2. **Validation**: Zod schemas validate data on both client and server
3. **API Requests**: TanStack Query manages API calls and caching
4. **Database Operations**: Drizzle ORM handles type-safe database interactions
5. **File Storage**: Multer processes uploads to local filesystem
6. **Real-time Updates**: Query invalidation ensures fresh data after mutations

## External Dependencies

### Database
- **PostgreSQL**: Primary database using Neon serverless
- **Connection**: @neondatabase/serverless for serverless compatibility
- **Migrations**: Drizzle Kit for schema management

### File Handling
- **Storage**: Local filesystem in `uploads/` directory
- **Processing**: Multer with file type and size restrictions
- **Supported Types**: JPEG, PNG, WebP images and PDF documents

### Development Tools
- **Replit Integration**: Cartographer plugin for development environment
- **Error Handling**: Runtime error overlay for development
- **Hot Reload**: Vite HMR for fast development cycles

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds optimized React application to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Static Files**: Express serves built frontend files in production

### Environment Configuration
- **Development**: Uses Vite dev server with Express API proxy
- **Production**: Express serves static files and API endpoints
- **Database**: Environment variable `DATABASE_URL` for PostgreSQL connection

### File Structure
```
├── client/          # React frontend application
├── server/          # Express backend server
├── shared/          # Shared TypeScript schemas and types
├── uploads/         # File storage directory
└── dist/           # Built application output
```

### Scalability Considerations
- **Database**: Uses connection pooling via Drizzle
- **File Storage**: Currently local filesystem (can be migrated to cloud storage)
- **Caching**: TanStack Query provides client-side caching
- **Performance**: Vite optimization and lazy loading for large applications