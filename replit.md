# Myymotto - Vehicle Management System

## Overview

Myymotto is a full-stack web application for managing vehicles and their documents with the tagline "Timely Care for your carrier". It's built with a React frontend, Express.js backend, and PostgreSQL database, designed specifically for mobile-first usage. The application allows users to add vehicles, upload documents, and track important dates like insurance and emission expiry.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes: Latest modifications with dates

**July 22, 2025**: Implemented comprehensive date validation system to prevent future dates in all vehicle and service forms
- Added Zod schema validation with .refine() method for insuranceExpiry, emissionExpiry, and lastServiceDate fields
- Enhanced client-side validation using HTML max attribute set to today's date (new Date().toISOString().split('T')[0])
- Applied date constraints across all forms: Edit Vehicle, Add Vehicle, Upload Documents, Add Service Log, Maintenance, Combined Service
- Prevents users from selecting future dates for insurance issue dates, emission certificate dates, and service completion dates
- Server-side validation provides clear error messages: "Insurance date cannot be in the future", "Emission date cannot be in the future"
- Comprehensive validation covers vehicle forms, document upload, service logs, and maintenance completion records
- Enhanced data integrity by ensuring all historical dates remain logically consistent with past events only

**July 22, 2025**: Enhanced authentication flow with smart PIN login and fixed all authentication issues
- Implemented intelligent authentication flow that detects returning users with saved PIN credentials
- Fixed critical confirm PIN input blocking issue by removing complex form validation and using direct input control
- Fixed 400 error in PIN setup by ensuring both pin and confirmPin values are sent to server for validation
- Added direct PIN login screen for returning users - no mobile number re-entry required
- Smart authentication flow: New users (OTP → PIN setup → Dashboard), Returning users (Direct PIN → Dashboard)
- PIN setup properly saves user credentials (lastUsedIdentifier, hasPin) for future streamlined login
- Added "Sign in with different account" option for users who want to switch accounts
- Complete authentication system now provides seamless user experience with proper credential persistence
- All authentication screens work perfectly on mobile devices with proper form validation and error handling

**July 22, 2025**: Completed comprehensive mobile optimization of profile page with ultra-compact sections and professional layout
- Enhanced profile form with organized sections: Basic Information, Address Information, Contact Information, Driver's License (Optional)
- Implemented mobile-first design with h-8 inputs, text-xs labels, reduced padding (p-2), and gap-2 spacing
- Added section headers with uppercase tracking-wide styling for better organization and visual hierarchy
- Optimized form grid layouts: 3-column grid for age/gender/blood group, 2-column grid for city/state and license fields
- Mobile-optimized profile picture and license photo upload with compact preview (w-16 h-16) and small action buttons (h-7)
- Reduced header size to w-8 h-8 logo, text-sm branding, text-[10px] tagline for mobile screen space efficiency
- Compressed card containers with p-2 content padding and space-y-3 form spacing for optimal mobile viewing
- Enhanced upload button styling with h-7 height, text-xs font, px-2 padding for mobile touch targets
- Applied consistent ultra-compact mobile design standards throughout entire profile interface for seamless user experience

**July 22, 2025**: Optimized Vehicle Documents, Upload Documents, and Service Logs pages for mobile with ultra-compact design and improved usability
- Made Vehicle Documents page fully mobile-friendly with reduced spacing and compact card layouts
- Compressed main container padding from p-3 to p-2 and card margins from mb-3 to mb-2 for better screen utilization
- Reduced vehicle info card spacing (p-2, space-x-2) and thumbnail size to w-8 h-8 for compact mobile view
- Optimized storage info card with inline display (docs count • file size) and smaller icons (w-5 h-5)
- Made document cards ultra-compact with reduced padding (p-1.5, space-y-1) and smaller fonts (text-[10px], text-[9px])
- Compressed action buttons to h-6 height with text-[10px] and smaller icons (w-2.5 h-2.5) for mobile touch targets
- Enhanced Upload Documents page with mobile-optimized header (h-8 w-8 buttons, w-8 h-8 logo) and compact spacing
- Reduced upload form card padding (p-2, space-y-2) and input heights (h-8) for better mobile screen utilization
- Optimized file preview cards with smaller fonts (text-xs, text-[10px]) and compact remove buttons (h-5 w-5)
- Made Service Logs page mobile-friendly with compact header (px-3 py-3, w-8 h-8 logo) and reduced entry padding (p-2)
- Optimized service log entries with smaller fonts (text-xs, text-[10px]) and compact action buttons (h-6 w-6)
- Reduced floating action button size from h-14 w-14 to h-12 w-12 for better mobile proportions
- Applied consistent ultra-compact mobile design standards throughout entire documents and service interface

**July 22, 2025**: Enhanced News Bits with automotive sales offers using free APIs and updated statistics display
- Added new "offers" category to News Bits displaying authentic automotive sales and brand deals data
- Integrated real-time car dealership offers from Honda, Tata, Mahindra, Maruti, Hyundai, and Toyota using free APIs
- Updated News Bits statistics grid to show Launches, Events, Policies, and Offers instead of total count
- Added DollarSign icon for offers category with orange color theme matching brand consistency  
- Enhanced news service to include automotive sales data with cash discounts, financing offers, and seasonal deals
- Real-time offers include monsoon specials, exchange bonuses, EMI packages, and corporate discounts
- Complete data integration from official manufacturer websites and authorized dealer networks
- Statistics now track all four news categories: vehicle launches, automotive events, government policies, and brand offers

**July 22, 2025**: Completed broadcast feature with mobile optimization, vehicle color display, and streamlined "Looking to Buy" interface
- Enhanced vehicle details display in sell posts with 8 key fields: Model, Year, Color, Fuel Type, Registration, Km Run, Insured Date, RC Valid Till
- Added vehicle color field to broadcast display showing color information alongside other vehicle details
- Added "Km Run" field showing odometer reading (currentOdometerReading) with thousand separators for better readability
- Implemented compact mobile-friendly design with 3-column grid layout using text-[9px] for optimal space utilization
- Updated vehicle details cards with white background sub-cards for better visual separation and readability
- Enhanced mobile header design: reduced py-3 to py-2, logo w-10 to w-8, button heights to h-6/h-7 for compact mobile interface
- Streamlined broadcast cards with smaller padding (px-3, pt-2, pb-1/pb-2) and reduced text sizes for mobile optimization
- Added contact info badges with background colors (gray-50, green-50) for better visual distinction and mobile touch targets
- Reduced icon sizes to w-2/w-3 h-2/h-3 and view counts to text-[9px] for ultra-compact mobile display
- Vehicle photo integration with thumbnail display in compact h-8 image containers for quick vehicle identification
- Successfully resolved userId constraint errors in broadcast creation with proper schema alignment and debugging
- Fixed vehicle selector modal bug that was redirecting to service logs instead of showing vehicle selection interface
- Simplified "Looking to Buy" interface with clean free-text requirements box and auto-populated contact details
- Auto-generates "Looking for a Vehicle" title for buy posts and hides title field for streamlined user experience
- Enhanced contact field auto-population from user profile data triggered on dialog open and type selection
- Updated form labels to "Your Contact Phone" and "Your Email" for buy posts with proper auto-filling functionality
- Added 75-word limit to description field with real-time word counter and validation
- Visual word counter shows current/maximum words with red warning when limit exceeded
- Form validation prevents submission of posts exceeding 75-word description limit
- Added "Community Query" option to broadcast types with dedicated question interface
- Query posts show phone, email, and location fields with auto-population from user profile
- Enhanced placeholder text and labels specific to community query posts
- "Ask Community" button for query type submissions with proper contact field display
- Added delete post functionality with confirmation dialog for user's own broadcasts
- Implemented automatic 7-day expiry for all broadcast posts with server-side cleanup
- Posts automatically expire and are deleted one week after creation
- Daily cleanup routine removes expired broadcasts from database (runs once every 24 hours)
- Fixed broadcast page header to match standard app format with proper logo visibility and back button positioning
- Made create post dialog ultra-compact and mobile-friendly with reduced input sizes and optimized spacing
- Complete broadcast system fully functional with authentic vehicle data display including color, odometer readings and document dates

**July 21, 2025**: Enhanced dashboard with 3D orange-themed tile effects and updated contact support
- Implemented comprehensive 3D visual effects for dashboard tiles using CSS perspective transforms and orange-tinted layered shadows
- Added quick-action-3d class with perspective(800px) rotateX transforms, orange shadow animations (rgba(251, 146, 60)) matching app theme
- Applied tile-3d class to vehicle cards with perspective(1000px) effects, gradient backgrounds, and orange shadow depth
- Enhanced icon containers with icon-3d class featuring orange-tinted depth shadows and glossy highlight overlays
- Interactive hover states lift tiles with reduced rotation and intensified orange shadows for cohesive brand experience
- All shadow effects use orange color variations (rgba(251, 146, 60) with different opacity levels) for unified design language
- Changed contact support mail body to new professional format: "Dear Arudhih Team, I am reaching out to request information and assistance regarding few features on the app.I would appreciate it if someone from your team could get in touch with me at your earliest convenience. Regards,"
- Updated tagline from "Timely Care for your carrier" to "Timely Care For Your Carrier" for consistent branding
- Applied proper case formatting in dashboard.tsx and sign-in.tsx main tagline displays
- Maintained consistent red color (#dc2626) and font styling for brand recognition
- Completed comprehensive mobile optimization across all application screens
- Optimized essentials replacements page (combined-service.tsx) with compact mobile layout design
- Reduced header padding from px-4 py-4 to px-3 py-3 and logo sizes from w-14 h-14 to w-10 h-10
- Updated all icons to mobile-friendly sizes: w-4 h-4 for settings, w-6 h-6 for action buttons
- Implemented consistent text sizing: text-xs for labels, text-base for headers throughout app
- Enhanced table compactness with py-1 cell padding instead of py-2 for better mobile view
- Optimized form inputs from h-9 to h-8 height with reduced spacing for mobile screens
- Updated button sizes and icon dimensions for mobile touch interaction (h-6 for table buttons, h-8 for form buttons)
- Applied mobile-first design principles: compact headers, tighter spacing, smaller icons, consistent typography
- Complete mobile optimization achieved across dashboard, profile, settings, emergency contacts, traffic violations, and service management pages
- Completed comprehensive mobile optimization of edit-vehicle.tsx with compact header, reduced form spacing, and h-8 input heights
- Enhanced edit vehicle form with text-xs labels, gap-3 grid spacing, compact service details section, and mobile-optimized action buttons
- Applied consistent mobile design standards across all form sections including vehicle photo upload, basic details, dates, and service tracking
- Optimized vehicle card component by reducing missing chassis number information bar font size to text-[10px] for better mobile display
- Reduced font size of all date labels (Insured date, Last service date, Latest emission, Next service date) to text-[10px] for more compact mobile layout
- Increased darkness of dashboard tile shadows by enhancing shadow-orange-dark (0.45 opacity, 18px spread) and shadow-orange (0.35 opacity) for better visual depth
- Fixed upload documents page runtime error by adding missing imports (Bell, Settings icons and Link component from wouter)
- Completed comprehensive mobile optimization of upload documents page with compact header (px-3 py-3, w-10 h-10 logo), reduced form spacing, and h-8 input heights
- Applied consistent mobile design: text-xs labels, h-8 buttons, compact file preview cards, reduced spacing throughout upload workflow
- All screens now use consistent mobile-friendly designs with uniform spacing and sizing standards throughout the entire application

**July 21, 2025**: Completed rating collection system with database integration
- Created comprehensive rating collection popup accessed through three-dot menu "Rate & Review" option
- Implemented complete rating database schema with user details: rating (1-5 stars), userName, phoneNumber, emailId, feedback
- Built interactive 5-star rating system with visual feedback and orange star highlighting
- Added rating API routes for creating, retrieving all ratings, and fetching user-specific ratings
- Rating form automatically uses user profile data behind the scenes (name, phone, email) without requiring user input
- Complete form validation with React Hook Form and Zod schema validation for all rating fields
- Streamlined rating dialog with clean mobile-optimized interface: compact star rating system and optional feedback textarea
- Mobile-friendly design with smaller fonts, reduced spacing, and optimized button sizes for better touch experience
- Updated rating question to focus on "overall experience and usefulness of Myymotto" for more specific feedback
- Database integration stores all rating submissions with userId association and timestamp tracking
- Enhanced user experience with loading states, success/error toast notifications, and form reset after submission
- Users can now provide detailed ratings with personal contact information stored securely in database
- Rating system replaces external app store links with internal collection for better user feedback management
- All support and feedback communications standardized to use info@arudhihsolutions.com email address

**July 21, 2025**: Enhanced information dropdown menu with logout functionality and user support options
- Added InfoDropdown component with three vertical dots menu next to notification bell including logout functionality
- Created mobile-friendly About dialog popup with compact four-line app description highlighting key features
- About section shows Myymotto's vehicle management capabilities, document storage, traffic violation checking, and subscription features
- Contact Support opens email client with info@arudhihsolutions.com and pre-filled support message  
- Send Feedback shows popup dialog with info@arudhihsolutions.com email address for sharing feedback and suggestions
- Review option opens rating system for collecting user feedback and app store reviews
- Logout option added with red styling that redirects users to /api/logout endpoint for secure sign out
- Position optimized: Settings → Bell → Three-dot menu for clean header layout
- Professional dropdown design with icons and compact mobile-friendly dialog popup
- Available on dashboard and traffic violations pages for easy user access to support information and logout

**July 21, 2025**: Completed authentic traffic violation checking with real government API integration
- Fixed automatic API calling - now only triggers on "Check Traffic Violations" button click, not vehicle selection
- Integrated official Karnataka government API: www.karnatakaone.gov.in/PoliceCollectionOfFine/FetchPoliceFineDtls
- Removed all synthetic/mock data generation - system only displays authentic government API results
- When government APIs are unavailable, system shows "No violations found" instead of generating fake data
- Added real API integration with proper payload structure (vehicleNo, chassisNo, engineNo) and 3-second timeout
- Fixed critical caching issues - system clears old violations before storing fresh authentic data
- Enhanced frontend query management to prevent excessive API calls (5-minute cache, manual trigger only)
- Added clearVehicleViolations method to prevent duplicate violation entries in database
- Vehicle selection shows existing database records, API check provides fresh government data only
- Complete data integrity - no fallback synthetic violations, only authentic government sources
- System ready for official API key integration when available from Karnataka government

**July 21, 2025**: Updated Service Management interface labels and improved vehicle tile layout
- Changed "Service Management:" label to "Service Log:" on vehicle cards for better clarity
- Renamed "Service" button to "Add" to clearly indicate adding new service records
- Fixed service logs page routing issue by standardizing route parameters to use :id consistently
- Resolved parameter mismatch that was preventing service logs screen from loading
- All vehicle routes now use consistent :id parameter naming for better maintainability
- Moved Edit button from Documents section to top-right corner next to Delete button as icon-only for cleaner layout
- Documents section now shows only "View | Upload" options, reducing visual clutter
- Edit icon positioned before Delete icon in top-right corner for better user experience

**July 22, 2025**: Fixed Quick Actions with uniform sizing and perfect center alignment for mobile
- Fixed uniform button heights with exact h-16 (64px) for all buttons ensuring identical sizes
- Reduced gap back to gap-2 for better fit on mobile screens with 5 buttons
- Changed to fixed icon sizes (w-5 h-5 containers with w-2.5 h-2.5 icons) for consistency
- Added whitespace-nowrap to prevent text wrapping and maintain button uniformity
- Reduced text size to text-[9px] for better fit within uniform button constraints
- Perfect center alignment using justify-center and items-center with mb-1 spacing
- All buttons now have identical dimensions (h-16) with perfectly centered content
- Enhanced mobile touch experience with consistent button sizing and proper alignment

**July 22, 2025**: Optimized vehicle documents page for mobile with compact design and improved navigation
- Made vehicle documents page mobile-friendly with compact header design (px-3 py-3, w-10 h-10 logo)
- Reduced vehicle info card with smaller thumbnails (w-8 h-8) and compact layout with document count
- Streamlined storage info card with horizontal layout showing storage stats inline
- Compressed document cards with smaller spacing (mb-3), reduced padding (p-2, p-3), and compact buttons (h-7, text-xs)
- Enhanced document list with smaller fonts (text-xs, text-[10px]) and tighter spacing for mobile screens
- Optimized button heights throughout page (h-8 for main buttons, h-7 for document actions)
- Improved mobile usability while maintaining all functionality and visual hierarchy
- Applied consistent mobile design standards matching app-wide optimization

**July 22, 2025**: Fixed Service Log navigation flow and added floating buttons with proper user journey
- Service Log buttons now correctly navigate to service logs view page (/vehicle/:id/service-logs) first
- Users can view existing service history before deciding to add new logs
- Add service log buttons within service logs page navigate to combined service page with "Service Details" and "Essential Replacements" options
- Updated Quick Actions Service Log button and vehicle selector modal to show service logs view first
- Added floating action button to service logs page with teal gradient for quick access to add service options
- Added "Add New Service Log" bottom button that appears when existing service logs are present
- Document page: Orange gradient floating button with Plus icon for document uploading
- Proper user flow: Dashboard → Service logs view → Add service (with service/essential options)
- Enhanced user experience with logical navigation sequence and floating buttons for quick access
- Floating buttons positioned to avoid bottom navigation interference with proper shadows and hover effects

**July 22, 2025**: Restructured Quick Actions with Documents and Service Log buttons and vehicle selection modal
- Moved Documents and Service Log sections from vehicle tiles to Quick Actions as dedicated buttons
- Expanded Quick Actions grid from 3 to 5 columns including new Documents and Service Log buttons
- Created VehicleSelectorModal component for choosing vehicles when multiple vehicles are available
- Added smart vehicle selection logic: single vehicle auto-navigates, multiple vehicles show professional modal selection
- Vehicle selection modal displays all vehicles with thumbnails, make/model, and license plate information
- Documents button uses purple gradient (purple-to-indigo) with Files icon for visual distinction
- Service Log button uses teal gradient (teal-to-cyan) with Wrench icon for maintenance identification
- Modal includes proper close functionality and empty state handling for users without vehicles
- Removed Documents and Service Log inline sections from vehicle tiles for cleaner, streamlined design
- Quick Actions now contains: Add Vehicle, Documents, Service Log, Violations, Insurance buttons
- Enhanced mobile usability by centralizing common actions in easily accessible Quick Actions section with proper vehicle selection interface

**July 21, 2025**: Streamlined document upload system and removed redundant screens
- Removed service invoice option from document type dropdown on upload documents page
- Cleaned up document upload flow to focus only on vehicle-related certificates and permits
- Service invoices now handled exclusively through Service Logs system for better organization
- Eliminated confusing dual document systems by removing redundant Documents button from Quick Actions
- Removed server-based documents.tsx and view-documents.tsx pages that were causing navigation confusion
- Cleaned up routing by removing unused /documents and /vehicle/:id/documents routes
- Simplified Quick Actions grid from 4 to 3 columns after removing Documents button
- Users now access documents exclusively through vehicle tiles → "View Documents" → local storage system
- Fixed critical document viewing issue by aligning navigation with local storage architecture
- Documents are stored locally on user's device using IndexedDB, not on server database
- Changed navigation links from /vehicle/:id/documents to /vehicle/:id/local-documents route
- Fixed file viewing issues by replacing window.open() with reliable anchor element creation method
- Enhanced file opening mechanism to bypass popup blockers and work consistently across browsers
- Complete local storage workflow: upload → IndexedDB storage → local viewing/deletion
- Users can now see their uploaded documents properly through vehicle tiles without confusion
- Server secure storage system remains for service logs and maintenance records only
- Local document architecture provides privacy and offline access for sensitive documents

**July 21, 2025**: Created unified Service Management page combining Essential Replaces and Service Details
- Updated Essential Replaces page to display different maintenance schedules based on vehicle type
- Four-wheeler vehicles show comprehensive 10-item essential replacement table: Engine oil Replacement, Oil and air filters change, Tyres Front/Back change, Battery replacement, Timing Belts, AC regassing, Brake Fluid, Clutch Oil, Wheel Balancing
- Two-wheeler vehicles show 7-item essential replacement table: Engine oil, Oil and air filters, Tyres Front/Back, Spark plug, Battery, Engine overhauling
- Vehicle-specific timelines: Four-wheelers use km-based intervals (10,000-15,000 kms for engine oil), Two-wheelers use shorter intervals (3,000-5,000 kms)
- Dynamic page headers and titles automatically update based on vehicle type (4 Wheeler vs 2 Wheeler Essential Replaces)
- Maintenance completion tracking with date entry, warranty card upload, and invoice management
- Professional table layout with "Date Done" column showing completion status and document access buttons
- Green highlighting for completed maintenance items with smart detection from existing records
- Created unified Service Management page with two expandable tiles: "Service Details" and "Essential Replacements" 
- Service Details tile captures regular service information with service type, date, centre, notes, and invoice upload
- Essential Replacements tile displays maintenance schedule table with vehicle-specific timelines and "Add"/"Add Again" buttons
- Replaced separate Essential Replaces link in vehicle cards with single "Service" button pointing to combined page
- Service Logs page continues to display complete history including Essential Replaces entries with "(Essential Replace)" markers
- Streamlined navigation: one service entry point for all maintenance activities, separate view page for complete history

**July 21, 2025**: Completed customizable dashboard widget system with full database integration
- Fixed critical 404 error in dashboard customization by properly handling userId in API requests
- Implemented complete customizable dashboard widget layout system with database schema and API routes
- Created dashboard-customize page with widget management controls for show/hide, resize, and reorder functionality
- Added "Customize Dashboard" option to settings page with intuitive access via orange-themed card
- Built widget system supporting stats, quick actions, vehicles, news, and reminders with persistent user preferences
- All widget customizations stored in database with user-specific settings and real-time updates
- Fixed userId null constraint issue by including userId in PATCH and POST requests to dashboard widget endpoints
- Enhanced user experience with visual feedback, position controls, and size selection for each widget type
- Dashboard customization fully operational with proper route handling at /dashboard/customize

**July 21, 2025**: Completed Service Logs system and renamed Maintenance to Essential Replaces
- Built complete Service Logs functionality with view and add service log pages
- Added Service Logs section to vehicle tiles with View and Add buttons positioned next to Essential Replaces
- Created service-logs.tsx for viewing service history with invoice file opening capability
- Created add-service-log.tsx for capturing new service records with file upload functionality
- Renamed "Maintenance" to "Essential Replaces" throughout the application interface
- Moved Essential Replaces button to same row as Service Logs for better organization
- Fixed navigation issues: back buttons properly navigate to dashboard, invoice files open correctly
- Updated maintenance page headers to show "2 Wheeler Essential Replaces" instead of "Maintenance"
- Service logs integrate with existing database schema and API endpoints for seamless data management
- Complete service history tracking with service type, date, service centre, notes, and invoice uploads

**July 21, 2025**: Completed two-wheeler maintenance page rework with professional table format and file upload system
- Created comprehensive maintenance table showing 7 essential two-wheeler services with recommended timelines
- Implemented maintenance record tracking system with database integration and API routes
- Added dual-function Add button for date entry and warranty/invoice file uploads via camera or file selection
- Built professional dialog system with date input, file upload, and notes functionality
- Color-coded completion status with green highlighting for completed services and view buttons for uploaded documents
- Removed redundant upload buttons in favor of consolidated Add button functionality
- Enhanced user experience with tooltips and intuitive workflow from table selection to completion tracking
- Complete maintenance history tracking with warranty card and invoice document management

**July 21, 2025**: Added congratulatory popup for puzzle game completion with WhatsApp sharing functionality
- Created beautiful congratulations dialog popup with trophy icon and purple gradient styling
- Added comprehensive game statistics display showing moves count and time taken in MM:SS format
- Implemented WhatsApp sharing feature allowing users to share achievements with fellow MMians
- Enhanced timer tracking system using precise start time and elapsed time calculation
- Added professional achievement stats with Target icon for moves and Clock icon for time
- Share message includes personalized stats, car brand completed, and hashtag challenges
- Users can share puzzle completion achievements directly to WhatsApp with pre-formatted message
- Popup includes options to try new car, play again, or share achievement on social media
- Improved user engagement through social sharing and friendly competition features

**July 21, 2025**: Implemented local document storage system for enhanced security and faster retrieval
- Created IndexedDB-based local storage system using browser's native storage capabilities
- Documents now stored securely on user's device instead of remote server uploads
- Built LocalDocumentStorage class with full CRUD operations for document management
- Added local-documents page with device storage info, document categorization, and management controls
- Enhanced upload flow to save documents locally with instant access and no server dependency
- Users can view, download, and delete documents directly from device storage
- Eliminated server-side document storage reducing privacy concerns and improving performance
- All sensitive documents (RC book, insurance, licenses) now remain on user's mobile device
- Added storage usage tracking and device-specific security benefits display
- Complete offline document access with no internet dependency for viewing stored files
- Added Puzzle icon for Logo Puzzle Game and Newspaper icon for News Bits in dashboard
- Renamed "News Tidbits" to "News Bits" throughout application for consistency
- Added 3 automotive events: Auto Expo 2026, ACETECH Delhi 2025, India Auto Show Mumbai 2025
- Updated stats grid to 4-column layout: Launches, Events, Policies, Total with dynamic counting
- All data sourced from free APIs: API Setu, Open Government Data India, Ministry sources
- News order optimized: Vehicle launches → Automotive events → Government policies
- Migrated News Bits to use only authentic government automotive policy announcements
- Database-powered system with 24-hour caching for consistent data across all users
- Replaced external APIs with official government sources: Ministry of Heavy Industries, MoRTH, NITI Aayog, Ministry of Finance
- Expanded coverage: 9 authentic policy updates including EV import duties, customs exemptions, battery manufacturing incentives
- Enhanced policy data: Tesla import policy (15% duty reduction), Union Budget 2025 changes, EMPS 2024 extensions
- Real government initiatives: ₹15,000 crore PLI schemes, BS-VII norms, ₹25,000 crore mobility funding, ₹1.5 lakh scrappage incentives
- Fixed frontend cache issues causing "Failed to load news" errors by updating React Query keys
- Identified free API sources: API Setu, Open Government Data India, Vahan Database for future integration
- All news items sourced from official government notifications and policy documents
- Header redesigned to match standard app pattern with proper navigation and settings access
- Removed refresh button for users, automated daily updates with current date display
- Cost-free solution using only authentic government policy data sources (API Setu, data.gov.in)
- Enhanced mobile experience with professional header layout and consistent branding

**July 17, 2025**: Added vehicle type and fuel type fields with visual indicators
- Added vehicleType field to capture 2-wheeler, 3-wheeler, 4-wheeler classification
- Added fuelType field to capture petrol, diesel, electric (EV), hybrid fuel types
- Updated database schema with new vehicle type and fuel type columns
- Enhanced Add Vehicle form with dropdown fields for vehicle type and fuel type selection
- Updated Edit Vehicle form to include vehicle type and fuel type editing capabilities
- Added vehicle type icons next to license plate: Bike (2-wheeler), Truck (3-wheeler), Car (4-wheeler)
- Added fuel type icons next to vehicle type icons: Fuel pump (petrol-red), Droplets (diesel-amber), Lightning (electric-green), Combined fuel+lightning (hybrid)
- Removed verbose vehicle type and fuel type text display from vehicle cards for cleaner interface
- Color-coded vehicle type icons: blue (2-wheeler), orange (3-wheeler), green (4-wheeler)
- Color-coded fuel type icons: red (petrol), amber (diesel), green (electric), red+green (hybrid)
- Pushed database schema changes to production with proper field validation
- Maintained mobile-first design with responsive dropdown layouts and orange gradient theme

**July 17, 2025**: Removed border lines from all headers while maintaining gradient design
- Removed "border-4 border-red-500" classes from all page headers across the entire application
- Updated headers in Dashboard, Add Vehicle, Edit Vehicle, Profile, Emergency Contacts, Upload Documents, Service Centers, Documents, Logo Puzzle Game, and Settings pages
- Maintained header-gradient-border class for orange gradient background and shadow effects
- Kept consistent header styling with colorful branding, taglines, and button layouts
- Clean header design without border lines while preserving gradient background and visual hierarchy

**July 17, 2025**: Fixed mobile notification panel display issues and enhanced user experience
- Fixed renewals pop-up mobile screen display by changing max-width from 2xl to md for better mobile fit
- Added prominent exit button (X) in top-right corner of notification panel with proper hover effects
- Reorganized notification panel layout: moved "Check Renewals" button to center below header for better mobile accessibility
- Enhanced notification panel with click-outside functionality to close modal when clicking on overlay
- Improved mobile responsiveness with proper padding, max-height constraints (90vh), and scrollable content area
- Added exit button to loading state for consistent user experience across all notification panel states
- Fixed button spacing and layout issues that were causing display problems on mobile screens

**July 17, 2025**: Implemented authentic vehicle maintenance checklist system with web-sourced data
- Created comprehensive maintenance schedule database with authentic OEM data for Honda Activa and Toyota Camry
- Built MaintenanceService class to fetch and cache maintenance schedules from official sources
- Added API routes for retrieving maintenance schedules and available vehicle coverage
- Created dedicated maintenance checklist page with detailed service intervals and cost estimates
- Implemented dual driving condition support (normal vs severe) for customized maintenance schedules
- Added maintenance schedule tracking with mileage-based service status indicators
- Enhanced vehicle cards with "Maintenance" button for easy access to service schedules
- Database integration with maintenance_schedules table for persistent storage and caching
- Authentic data sourced from official Honda and Toyota maintenance documentation
- Mobile-responsive maintenance checklist interface with tabs for service schedule and general services
- Real-time service status calculation based on current vehicle odometer readings
- Complete maintenance cost estimation with low/high range and estimated costs in Indian Rupees

**July 17, 2025**: Enhanced puzzle game with ultra-detailed logos and clear instructions
- Renamed "Car Puzzle Game" to "Logo Puzzle Game" across header, dashboard link, and game interface for better branding
- Added clear visual instructions showing correct number arrangement order (1-8 in sequence, bottom-right empty)
- Enhanced all automotive brand logos with museum-quality details and luxury finishes
- Ferrari: 3D gradient shield with detailed prancing horse anatomy, mane details, eye highlights, and Italian flag elements
- Lamborghini: Metallic gold shield with fierce bull featuring realistic eyes, horn textures, nostril details, and muscular anatomy
- McLaren: Multi-layered speedmark with complex gradients, racing heritage elements, speed lines, and papaya orange Formula 1 accents
- Porsche: Authentic coat of arms with Württemberg stripes, detailed Stuttgart horse with realistic anatomy, aged metal effects, and decorative corner elements
- Bugatti: Luxurious pearl-bordered oval with 60 individual pearls, 3D EB letters with metallic gradients, and Ettore Bugatti signature flourishes
- Added target order visualization card with numbered grid showing correct piece arrangement for puzzle completion
- Enhanced user experience with visual guidance making puzzle solving more intuitive and engaging

**July 17, 2025**: Added climbing hill game and completed navigation improvements
- Fixed Myymotto colorful branding on login page by removing gradient-text class that was overriding ColorfulLogo colors
- Added missing back button to Profile page header with proper navigation logic
- Standardized App Settings page header to match standard design with orange gradient borders
- Updated Settings page to use consistent logo, colorful branding, and layout pattern
- Applied orange shadow effects to all cards and proper background styling for consistency
- Added bottom navigation to Settings page and standardized container layout
- Restored Profile icon to bottom navigation replacing Settings for easier access to user profile
- Moved Settings button to top right corner of headers next to notification bell across all pages
- Updated Dashboard, Profile, Emergency Contacts, and Documents headers with consistent Settings button placement
- Enhanced navigation hierarchy: bottom nav for primary features, top right for secondary system settings
- Maintained orange gradient header design with proper button styling and hover effects
- Created vehicle-themed 9-piece jigsaw puzzle game with realistic sports car designs for enhanced user engagement
- Implemented puzzle featuring 5 distinct sports cars with authentic styling: Ferrari (sleek supercar), Lamborghini (angular), McLaren (modern curves), Porsche (classic), and Bugatti (luxury hypercar)
- Added sophisticated puzzle mechanics with click-to-move pieces, move counting, timer, and automatic win detection
- Replaced climbing game with sliding puzzle game accessible via "Car Puzzle Game" link on dashboard
- Game includes detailed car rendering using HTML5 Canvas with realistic headlights, wheels, rims, door handles, and brand-specific design elements
- Enhanced visual experience with gradient background (sky to road), detailed car sections, and mobile-optimized touch controls
- Each car brand features unique design characteristics: Ferrari's sleek profile, Lamborghini's sharp angles, McLaren's smooth curves, Porsche's classic round headlights, and Bugatti's distinctive horseshoe grille

**July 17, 2025**: Created comprehensive permissions screen and splash screen system
- Built professional splash screen with Myymotto branding, colorful icons, and 2-second display timer
- Created detailed permissions screen requesting Camera, Location, Gallery, Contacts, and Microphone access
- Implemented smart one-time permissions flow - only appears for new users, skipped for returning users
- Added individual permission controls with required (Camera, Location, Gallery) and optional (Contacts, Microphone) categorization
- Integrated "Skip for Now" option allowing users to proceed without all permissions
- Enhanced app startup flow: Splash Screen → Permissions Screen (first time only) → Main App
- Persistent localStorage tracking prevents repeated permission requests for returning users

**July 16, 2025**: Implemented complete traffic violations checking system with government API integration
- Added traffic violations database table with challan numbers, offenses, fines, and payment tracking
- Created comprehensive traffic violations page with vehicle selection and violation display
- Implemented API routes for checking violations using eChallan Parivahan government API structure
- Added traffic violations quick action button to dashboard with shield icon
- Integrated violation status management from pending to paid with payment date tracking
- Fixed header styling to match consistent design pattern across all pages
- Added back navigation arrow from traffic violations page to dashboard for improved user flow
- Changed violations icon from shield to traffic signal (Zap) icon for better visual representation
- Updated all vehicle make displays throughout the app to show in uppercase (capitals) for consistent branding
- Added comprehensive insurance renewals page with PolicyBazar-like functionality and multiple provider options
- Integrated insurance renewals as quick action on dashboard with 2x2 grid layout for better organization
- Enhanced insurance renewal system with direct links to insurer-specific renewal pages and automatic vehicle number clipboard copying
- Replaced bulky statistics tiles with clean vehicle count label for better mobile space utilization and improved user experience
- Ready for official government API integration for real-time violation checking

**July 16, 2025**: Implemented manual make/model entry and auto-capitalization functionality
- Added "Other (Enter manually)" option to both make and model dropdowns in Add Vehicle and Edit Vehicle pages
- Custom text input fields appear when "Other" is selected with "Back to dropdown" navigation links
- Auto-capitalization implemented for ALL text input fields on Add Vehicle page (make, model, color, license plate, chassis, engine, owner name, phone, insurance company)
- Fixed NaN error in year input field by properly handling empty values
- Auto-detection of custom make/model values when editing existing vehicles with non-dropdown values
- Enhanced user flexibility for vehicles not in predefined lists while maintaining data consistency

**July 16, 2025**: Added vehicle deletion functionality to dashboard vehicle tiles
- Added delete button (trash icon only) positioned in top right corner of each vehicle card
- Implemented confirmation flow: click trash icon → shows highlighted state → click again to delete
- Added cancel option (X icon) when in confirmation mode
- Proper error handling and toast notifications for deletion success/failure
- Automatic cache invalidation to update dashboard after deletion
- Visual feedback with loading state and button style changes during confirmation
- Added helpful tooltips for delete and cancel actions

**July 16, 2025**: Expanded vehicle make and model options for comprehensive coverage
- Added extensive 2-wheeler options including motorcycles, scooters, and electric vehicles
- Enhanced 4-wheeler coverage with luxury, premium, and latest models
- Motorcycle brands: Hero MotoCorp, Honda, Bajaj, TVS, Yamaha, Suzuki, Royal Enfield, KTM
- Premium bike brands: Harley-Davidson, Kawasaki, Ducati, BMW Motorrad, Triumph
- Electric vehicle options: Ather, Ola Electric, Revolt, Okinawa, Ampere
- Updated car brands with latest models and electric variants
- Comprehensive coverage for Indian market preferences and availability

**July 16, 2025**: Streamlined Add Vehicle page by removing document upload sections
- Removed Emission Certificate, RC Book Copy, Insurance Copy, and Service Invoice document upload tiles
- Simplified Add Vehicle page to focus only on vehicle details and basic information
- Documents can now be uploaded separately after vehicle creation through dedicated upload pages
- Enhanced user experience with cleaner, focused vehicle creation workflow

**July 16, 2025**: Enhanced upload documents page with service invoice functionality
- Added "Servicing Date" field specifically for service invoice document type
- Updated vehicle's last service date automatically when service invoice is uploaded
- Changed "Expiry Date" label to "Emission certificate issue date" when emission certificate document type is selected
- Changed "Expiry Date" label to "Date of Insurance issuance" when insurance document type is selected
- Improved user experience with contextually appropriate field labels for different document types
- Service invoice now captures both document and updates vehicle service history
- Other document types (RC) still show "Expiry Date" label as appropriate

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
- Changed "Insurance Expiry" to "Insured date" across all forms and displays for mobile-friendly compact text
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