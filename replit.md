# Myymotto - Vehicle Management System

## Overview

Myymotto is a full-stack web application for managing vehicles and their documents with the tagline "Timely Care for your carrier". It's built with a React frontend, Express.js backend, and PostgreSQL database, designed specifically for mobile-first usage. The application allows users to add vehicles, upload documents, and track important dates like insurance and emission expiry.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes: Latest modifications with dates

**July 16, 2025**: Updated document field labeling in upload documents page
- Changed "Expiry Date" label to "Emission certificate issue date" when emission certificate document type is selected
- Changed "Expiry Date" label to "Date of Insurance issuance" when insurance document type is selected
- Improved user experience with contextually appropriate field labels for different document types
- Other document types (service and RC) still show "Expiry Date" label as appropriate

**July 16, 2025**: Removed Vehicle Details page completely from application flow
- Eliminated intermediate vehicle details page to streamline navigation
- Updated all vehicle card navigation to go directly to dashboard instead of details page
- Fixed edit and upload page navigation to redirect to dashboard after completion
- Removed vehicle-details.tsx file and cleaned up all related imports and routing
- Simplified app flow: Dashboard → Edit/Upload/Documents actions → Back to Dashboard

**July 16, 2025**: Enhanced document viewing with direct file opening and delete functionality
- Fixed documents page to open files directly when clicked instead of navigating to view page
- Added click handlers to both document names and View buttons for instant file opening
- Document files now open in new browser tabs for better user experience
- Enhanced user experience with cursor pointer styling for clickable document items
- Both driver's license and vehicle documents now support direct file viewing
- Added delete button next to view button for easy document removal
- Implemented confirmation dialog before deleting documents to prevent accidental deletions
- Added red styling for delete button with hover effects for clear visual distinction
- Document deletion includes proper cache invalidation and toast notifications for user feedback
- Fixed brand logo display issue on view documents page by using proper imported logo image instead of incorrect asset path

**July 16, 2025**: Implemented complete PIN and biometric authentication system
- Added PIN authentication fields (pin, biometricEnabled) to user database schema
- Created comprehensive PIN/biometric authentication API routes for existing users  
- Built dual-tab sign-in interface with OTP Login and PIN Login options
- New users flow: OTP verification → PIN setup → biometric setup → profile/dashboard
- Existing users can choose between OTP or PIN authentication methods
- Added PIN setup, PIN login, and biometric toggle functionality with skip options
- Enhanced security with fingerprint authentication for mobile devices using Capacitor
- Created BiometricAuth component with device compatibility checking
- Database schema updated and pushed with new authentication fields
- Complete authentication flow with proper localStorage state management

**July 16, 2025**: Enhanced notification system with improved timing logic
- Updated insurance notifications to trigger when 10+ months have passed since issuance date
- Updated emission notifications to trigger when 5+ months have passed since emission date  
- Added RC expiry notifications to trigger when current date is within 4 months of RC expiry
- Enhanced notification messages to clearly show dates and renewal requirements
- Improved notification timing to be more relevant to actual renewal periods

**July 16, 2025**: Updated vehicle card date display to show actual dates instead of relative time
- Changed insurance, emission, and service dates from "X days ago" format to actual calendar dates (MM/DD/YYYY)
- Enhanced user experience with precise date information on vehicle tiles
- Maintained color-coded status indicators for next service date

**July 16, 2025**: Updated document field labels for better clarity
- Changed "Insurance Expiry" to "Insurance Date of Issuance" across all forms and displays
- Changed "Emission Expiry" to "Latest Emission" across all forms and displays
- Updated vehicle card labels to match new terminology
- Enhanced user understanding of document date fields with clearer labeling

**July 16, 2025**: Enhanced driver's license functionality with validity date field
- Added driversLicenseValidTill field to user profile database schema
- Updated profile form to include "License Valid Till" date input field
- Enhanced profile display to show license validity date with formatted date display
- Fixed profile update validation issues with proper optional field handling
- Complete license management now includes number, validity date, and photo upload
- Database schema updated and pushed with new validity date field
- Integrated driver's license number input field with Indian license format placeholder
- Added driver's license copy photo upload and camera capture functionality
- Enhanced user profile display to show license information when available
- Updated database schema with driversLicenseNumber and driversLicenseCopy fields and pushed changes
- Driver's license section appears in dedicated section with clear optional labeling
- Complete photo management with upload, camera capture, preview, and removal capabilities
- Professional form layout with consistent h-9 input styling and proper validation

**July 16, 2025**: Enhanced vehicle cards and added insurance company field
- Added insurance company name input field to Insurance Copy tile on Add Vehicle and Edit Vehicle pages
- Updated database schema with insuranceCompany field and pushed changes to database
- Enhanced VehicleDocumentSection component to support text input fields with placeholders
- Insurance company field includes helpful placeholder: "e.g., HDFC ERGO, ICICI Lombard, Bajaj Allianz"
- Improved vehicle card layout with "Documents:" label followed by "View | Edit | Upload" actions separated by pipes
- Consistent h-9 input height styling across all form fields for professional appearance
- Maintained original header design with orange gradient borders for brand consistency

**July 16, 2025**: Fixed runtime errors and implemented complete subscription system
- Fixed AlertTriangle runtime error in add-vehicle page by adding missing import
- Fixed ColorfulLogo runtime error in upload-documents page by adding missing import  
- Implemented subscription system with Rs 100/year payment using Razorpay payment gateway
- Updated database schema with subscription fields (subscriptionStatus, subscriptionExpiry, razorpayOrderId, razorpayPaymentId)
- Created comprehensive subscription page with pricing, features list, and Razorpay payment integration
- Added vehicle limit validation: free users can add 2 vehicles, subscribed users can add up to 4 vehicles
- Enhanced error handling with subscription prompts showing "Subscribe for just ₹100/- per year" messaging
- Backend API routes for creating and verifying Razorpay subscription payments
- Updated vehicle creation validation to check subscription status and enforce limits properly
- All error messages now clearly display the subscription fee of ₹100/- per year

**July 16, 2025**: Added comprehensive Service Details section to vehicle forms
- Created separate Service Details section with blue gradient header and Settings icon
- Added database fields for currentOdometerReading, averageUsagePerMonth, serviceIntervalKms, serviceIntervalMonths
- Updated vehicle forms (Add and Edit) to include service tracking inputs with proper validation
- Service section captures current odometer reading, monthly usage patterns, and service interval preferences
- Enhanced vehicle management with detailed service tracking capabilities for better maintenance planning
- Updated database schema and form mutations to handle new service-related fields
- Added "Next Service Date" to vehicle tiles that calculates date by adding service interval months to last service date
- Next service date displays with color-coded status: red (overdue), orange (due soon), yellow (due this month), gray (future)
- Changed "months" to "mths" in service interval field labels for better mobile display

**July 16, 2025**: Added profile picture upload/capture functionality with camera and file upload options
- Implemented complete photo upload system for user profile pages with camera capture and file selection
- Added profile picture display as circular images with remove functionality
- Updated database schema with profilePicture field for storing image paths
- Enhanced profile forms with photo upload UI including Camera and Upload buttons
- Profile pictures display in both view and edit modes with proper image handling
- Integrated with existing file upload API for seamless image storage and retrieval

**July 16, 2025**: Enhanced referral system to trigger on every vehicle addition  
- Updated referral prompt to appear for every vehicle addition instead of just the second vehicle
- Modified dialog messaging to be appropriate for all users regardless of vehicle count
- Maximized sharing opportunities by prompting users after each positive engagement (vehicle addition)
- Created ReferralDialog component with WhatsApp sharing functionality and pre-written message highlighting app benefits
- Included "Share Now" and "Maybe Later" options with localStorage reminder system
- Referral message includes app features, tagline, and direct app link for easy sharing
- Designed to encourage viral growth at optimal user engagement moments

**July 16, 2025**: Enhanced header design with orange gradient borders and unified design across all pages
- Implemented custom header gradient design with orange borders at top and bottom edges while keeping center white for perfect logo visibility
- Updated ColorfulLogo component to use brown color (#92400e) for letter "t" in "Myymotto" for better visual distinction
- Changed tagline "Timely Care for your carrier" color to warm red (text-red-600) across all pages for brand consistency
- Applied consistent header design across ALL pages (Dashboard, Emergency Contacts, Profile, Add Vehicle, Documents, Vehicle Details, Edit Vehicle, Upload Documents, Service Centers)
- Standardized logo size (w-14 h-14), button styles (gray-600 with red-50 hover), and tagline styling throughout the application
- Enhanced brand identity with clear logo visibility against white background while maintaining elegant orange accent borders

**July 16, 2025**: Completed Emergency Contacts feature with navigation reorganization
- Built complete Emergency Contacts system with database schema, API routes, and mobile-first UI
- Created comprehensive contact management for emergency, insurance, roadside assistance, service center, and spare parts providers
- Implemented form validation, edit/display modes, and clickable phone number links for easy calling
- Reorganized navigation structure: replaced Documents with Emergency Contacts in bottom navigation bar
- Removed Emergency and Service buttons from Quick Actions, keeping only Add Vehicle and Documents
- Added Emergency Contacts icon (Users) to bottom navigation for easier access
- Enhanced user experience with categorized contact sections and orange shadow design consistency

**July 15, 2025**: Added comprehensive user interface improvements and vehicle management features
- Enhanced notification bell with dark blue color (blue-800), larger size (w-7 h-7), and bold styling for better visibility against red header background
- Applied consistent orange shadow effects to all Card components across every page and component for unified design
- Redesigned dashboard layout with compact stats tiles and reorganized Quick Actions section above Your Vehicles
- Fixed Documents page upload functionality with proper navigation links to upload and view document pages
- Added orange shadow effects throughout interface for visual cohesion (lighter shadows on Quick Action buttons, darker shadows on vehicle cards)
- Updated stats tiles with harmonious orange color scheme - light orange for Total Vehicles, bright orange for Expiring Soon, deeper orange for Expired
- Fixed broken navigation links in Vehicle Details page for upload documents functionality
- Added comprehensive vehicle removal feature for sold vehicles with prominent "Remove Vehicle (Sold)" button and enhanced confirmation dialogs
- Fixed Edit button functionality in Vehicle Details page header to properly navigate to edit page
- Updated Vehicle Details page branding to use colorful Myymotto logo consistent with other pages
- Added Cancel buttons to all editing pages (Edit Vehicle, Add Vehicle, Upload Documents) with smart navigation back to appropriate pages

**July 15, 2025**: Implemented smart notifications system for renewal alerts
- Created comprehensive notification database schema with vehicleId, type, title, message, dueDate, isRead, and createdAt fields
- Added notification storage methods for creating, reading, and marking notifications as read
- Implemented notification API routes for fetching, creating, and managing notifications
- Enhanced floating action button with notification bell showing unread count badge
- Created NotificationsPanel component with categorized notification display (insurance, emission, service)
- Added "Check Renewals" button to manually trigger notification generation for testing
- Implemented generateRenewalNotifications logic to check vehicles and create alerts 1 month before expiry
- Notifications system tracks insurance expiry, emission certificate expiry, and service reminders (every 4 months)
- Added Badge UI component for notification categorization and status display
- Integrated notification polling every 30 seconds for real-time updates

**July 15, 2025**: Added document upload system and service center search
- Created document upload page for vehicle-specific documents (/vehicle/:id/upload)
- Added support for uploading emission certificates, insurance copies, service invoices, and RC book copies
- Integrated camera capture functionality for document photography
- Document types with expiry date tracking and file management
- Multiple file upload support with file preview and removal capabilities
- Created service center search page with location-based results and map integration
- Added search icon functionality to navigate to service centers (/service-centers)
- Implemented geolocation to find nearby automotive service centers
- Service center cards show distance, ratings, services, and contact options
- Created edit vehicle page with full form pre-populated with existing data
- Added edit vehicle route (/vehicle/:id/edit) to router
- Enhanced vehicle editing with thumbnail image update capability
- Form validation and error handling for vehicle updates
- Reorganized dashboard and added vehicle management links
- Moved "Your Vehicles" section above "Quick Actions" on dashboard
- Added Edit and Upload links next to "View Documents" on vehicle cards
- Enhanced vehicle card navigation with separate Edit and Upload actions
- Added vehicle thumbnail photo upload feature
- Added thumbnailPath field to vehicle database schema
- Created file upload UI with image preview and removal functionality
- Implemented general file upload API endpoint for handling images
- Updated vehicle cards to display thumbnail images when available
- Added static file serving for uploaded images
- Enhanced vehicle form with drag-and-drop photo upload
- Fixed date field validation and form errors
- Fixed "invalid input syntax for type date" errors by properly handling empty date strings
- Updated form submission to convert empty date strings to null values for database
- Added nullable date field validation in Zod schema for RC, insurance, and emission expiry
- Improved date field handling with trim() function to remove whitespace
- Removed serviceDate field from vehicle schema and form to simplify the form
- Fixed ResizeObserver runtime errors and updated branding
- Implemented comprehensive ResizeObserver polyfill with debounced callbacks to prevent loop errors
- Created custom DebounceResizeObserver class that replaces native ResizeObserver globally
- Added multiple layers of error suppression including console method overrides
- Fixed dropdown component resize errors that occurred during make/model selection
- Added frame-based delays to prevent rapid-fire resize callbacks causing overlay errors
- Updated Myymotto branding with colorful letters
- Created ColorfulLogo component with custom letter colors: M(dark blue), y(yellow), y(yellow), m(dark blue), o(bright green), t(light blue), t(light blue), o(bright green)
- Updated all instances of "Myymotto" across Dashboard, Documents, Profile, and Sign-in pages
- Applied consistent colorful branding throughout the application headers and welcome messages
- Enhanced visual identity with multi-colored logo display while maintaining brand recognition
- Made chassis and engine numbers optional fields with validation warnings displayed on dashboard when missing
- Updated form labels to indicate optional fields and provide user guidance
- Created comprehensive document viewer with category-based browsing (insurance, emission, service logs, RC book)
- Added document management with file timestamps, sizes, and direct file viewing in new tabs
- Implemented proper navigation flow: dashboard → category selection → document list → file viewer with back navigation
- Connected "View Documents" link to new categorized document browser (/vehicle/:id/documents)
- Added last service date field to vehicle forms and database schema
- Display last service date on vehicle cards with relative time formatting (e.g., "2 weeks ago")
- Enhanced vehicle tracking with maintenance history capture for better vehicle care management
- Updated renewal tracking to show days/months instead of years for better time awareness
- Insurance and emission certificates now show precise time remaining (e.g., "3m left", "15d left")
- Service tracking shows when next service is due based on 4-month intervals from last service date
- Color-coded status indicators: green (valid), orange (expiring soon), red (expired/overdue)

**January 15, 2025**: Migrated authentication system to PostgreSQL database
- Fixed critical OTP verification issues by migrating from in-memory to database storage
- Implemented DatabaseStorage class to replace MemStorage for persistent OTP and user data
- Fixed "Invalid OTP" errors that occurred due to server restarts clearing in-memory data
- Enhanced authentication system with reliable PostgreSQL-backed OTP verification
- Updated database schema with proper indexing and constraints for authentication
- Authentication flow now works reliably: Sign-in → OTP verification → Dashboard or Profile creation
- OTP codes are now displayed in server console logs for development testing
- Resolved persistent authentication issues with database-backed storage solution

**January 15, 2025**: Added comprehensive user profile system
- Created user profile database schema with personal information fields (name, age, address, blood group, state, city, pin code, alternate phone)
- Implemented profile creation/editing page with form validation using React Hook Form and Zod
- Added profile-first authentication flow - automatically redirects to profile setup on first visit
- Integrated profile management with existing vehicle management system
- Added profile route to navigation system

**January 15, 2025**: Updated vehicle form and app branding
- Replaced VIN number with chassis number and engine number fields
- Added comprehensive vehicle make/model dropdown selections for Indian market
- Created separate document upload sections for Emission Certificate, RC Book Copy, Insurance Copy, and Service Invoice
- Added date fields for document expiry tracking with integrated camera and file upload
- Rebranded application as "Myymotto" with tagline "Timely Care for your carrier"
- Updated all headers and welcome messages with new branding

**January 15, 2025**: Applied warm red colorful theme design
- Updated CSS color palette to warm red theme with hsl(0, 72%, 51%) primary and hsl(14, 100%, 57%) accent colors
- Added colorful gradient backgrounds (warm red to orange) for headers and buttons
- Implemented colorful card designs with hover effects and shadows
- Added relevant icons throughout interface using Lucide React
- Applied colorful bottom navigation with different color highlights per section
- Enhanced floating action button with gradient background and hover animations
- Created warm background patterns and colorful stats cards
- Improved visual hierarchy with colorful status indicators and icons

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
- **User Profiles Table**: Complete user profile management with personal information (name, age, address, blood group, state, city, pin code, alternate phone)
- **User System**: Basic user management structure with profile integration

### API Endpoints
- **Vehicle CRUD**: Complete create, read, update, delete operations for vehicles
- **Document Management**: Upload, retrieve, and delete vehicle documents
- **User Profile Management**: Create, read, and update user profile information
- **File Storage**: Local file system storage with configurable limits

### Frontend Pages
- **Profile**: User profile creation and editing (first page after sign-in)
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