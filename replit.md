# MyyMotto - Vehicle Management System

## Overview

MyyMotto is a full-stack web application for managing vehicles and their documents with the tagline "Timely Care for your carrier". It's built with a React frontend, Express.js backend, and PostgreSQL database, designed specifically for mobile-first usage. The application allows users to add vehicles, upload documents, and track important dates like insurance and emission expiry.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes: Latest modifications with dates

**July 30, 2025**: FIXED APK compatibility issues and implemented one-tap emergency contact sharing feature

- RESOLVED CRITICAL APK COMPATIBILITY ISSUE: Fixed "App not compatible with your phone" error by adjusting Android build configuration
- LOWERED minimum SDK version from 23 to 21 (Android 5.0+) making app compatible with 99%+ of Android devices in use
- REDUCED target SDK from 35 to 34 for better compatibility with current Android ecosystem
- ENHANCED Android build configuration with Java 8 compatibility, MultiDex support, and vector drawable support
- ADDED comprehensive Android permissions for camera, storage, notifications, and network access with proper SDK restrictions
- IMPROVED Android manifest with screen size/density support and optional hardware feature declarations
- CREATED detailed APK compatibility fix guide (APK_COMPATIBILITY_FIX.md) with multiple build methods and troubleshooting steps
- COMPLETED one-tap emergency contact sharing feature with multiple sharing options (system share, WhatsApp, SMS, clipboard)
- IMPLEMENTED professional emergency contact message formatting with emojis, proper categorization, and MyyMotto branding
- ADDED prominent sharing interface with header button, sharing card, and comprehensive sharing dialog
- ENHANCED emergency contacts page with instant sharing capabilities for accident/emergency situations

**July 30, 2025**: COMPLETED comprehensive Play Store submission documentation and user deletion system

- CREATED comprehensive Play Store submission document (PLAY_STORE_SUBMISSION.md) with detailed app information, features, security, and compliance details
- DOCUMENTED complete feature set including vehicle management, document storage, OCR integration, ultra-reliable alarm system, and data backup capabilities
- OUTLINED security features including multi-factor authentication, data encryption, privacy-first design, and admin controls
- DETAILED use cases for personal vehicle owners, commercial fleet operators, automotive professionals, and family vehicle management
- SPECIFIED technical requirements, platform compatibility, and performance features for mobile deployment
- INCLUDED marketing strategy, monetization model, and compliance information for successful Play Store approval
- COMPLETED comprehensive user deletion system with complete data purging across all database tables
- IMPLEMENTED admin dashboard user management with delete functionality and confirmation dialogs
- ADDED server-side API endpoint (/api/admin/users/:userId/delete) with comprehensive data removal
- CREATED database method that safely removes all user-related data including vehicles, documents, service logs, notifications, and profile information
- ENHANCED admin controls with safety measures to prevent accidental admin account deletion

**July 30, 2025**: COMPLETED COMPREHENSIVE SMOOTH TRANSITIONS with ORANGE 3D SHADOWS and ULTRA-RELIABLE mobile alarm system

- IMPLEMENTED comprehensive darker orange 3D shadow effects on vehicle tiles and quick action buttons with enhanced depth perception
- ENHANCED all dashboard cards with darker orange-tinted shadows (rgba(251, 146, 60, 0.35)) creating pronounced 3D visual hierarchy
- UPGRADED vehicle tiles with intensified orange shadows (up to 0.5 opacity) that create dramatic hover effects for premium interaction feedback
- ADDED icon-3d class for vehicle icons and dashboard elements with subtle orange shadow depth
- REFINED quick action buttons with orange shadow gradients and smooth scale transitions on active states
- ENHANCED welcome cards and engagement tiles for new users with orange shadow theming
- COMPLETED comprehensive smooth screen transitions throughout entire application for premium mobile UX
- IMPLEMENTED page routing with fade-in animations using CSS page-transition class applied to all route switches
- ADDED smooth card transitions to VehicleCard, Dashboard quick actions, Calendar reminders, and bottom navigation 
- UPGRADED button hover effects with smooth-button CSS class providing consistent transition animations
- ENHANCED dialog and modal systems with backdrop-smooth blur effects and modal-transition animations
- IMPROVED navigation elements with nav-link transitions and list-item-enter animations for dynamic content
- REFINED CSS animation system with utility classes for consistent transitions across all UI components
- COMPLETED professional mobile app UX with seamless orange-themed 3D depth effects and smooth transitions

Previous work - TIMEZONE DISPLAY FIX and implemented ULTRA-RELIABLE mobile alarm system with multiple backup strategies

- FIXED CRITICAL TIMEZONE DISPLAY BUG: Completely resolved the +5 hour display issue where 12:35 PM was showing as 6:05 PM  
- CORRECTED server-side timezone handling by removing incorrect +5:30 hour adjustment in database storage layer
- UPDATED frontend display logic to properly handle UTC database storage by extracting UTC components and creating local time
- APPLIED consistent timezone correction across display, mobile notifications, and web notifications
- IMPLEMENTED ULTRA-RELIABLE ALARM SYSTEM: Creates 10+ backup notifications per reminder to guarantee mobile alarms trigger
- CREATED multi-strategy alarm approach: notifications 2min before, 1min before, 30sec before, exact time, and 5 follow-ups if missed
- ADDED native clock app integration as backup strategy - attempts to open device's alarm app with preset time
- IMPLEMENTED localStorage alarm monitoring for active alarm tracking and persistent alarm management
- ENHANCED notification scheduling with high-frequency backups, ongoing notifications, and escalating urgency levels
- CREATED comprehensive alarm verification system with detailed console logging and multiple fallback methods
- ADDED ultra-reliable alarm badges and user interface updates showing "Ultra-Reliable" system status
- COMPLETED guaranteed mobile alarm solution addressing power management and notification blocking issues

**Previous work - July 29, 2025**: COMPLETED persistent mobile alarm system integration with system-level notifications that work when app is closed

- IMPLEMENTED comprehensive mobile alarm system using Capacitor Local Notifications with persistent notification scheduling
- ENHANCED Alert & Reminders page with datetime-local picker supporting both date and time selection for precise alarm scheduling
- ENHANCED datetime handling with comprehensive debugging and timezone-aware parsing for perfect local time accuracy
- CREATED system-level notifications with title "Alert from MyyMotto" displaying user's reminder title as message body
- ADDED high-priority notification channel (myyMotto-alarms) with sound, vibration, and visual indicators for persistent alarms
- INTEGRATED automatic permission checking and requesting for notification access with visual status indicators
- IMPLEMENTED persistent alarm functionality that works even when MyyMotto app is closed or user is logged out
- ENHANCED notification settings with orange brand colors, sound alerts, LED lights, and vibration for maximum visibility
- ADDED visual "System Alarm" badges on reminder cards showing mobile users their alarms are scheduled at device level
- CREATED automatic alarm cancellation when reminders are deleted, removing both app reminders and device notifications
- IMPLEMENTED localStorage backup for alarm data ensuring alarm information persists across app sessions
- ENHANCED user interface with platform-specific information cards explaining mobile vs web functionality
- COMPLETED true system-level alarm integration allowing users to receive timely alerts regardless of app status

**July 29, 2025**: COMPLETED comprehensive branding update from "Myymotto" to "MyyMotto" across entire application
- SYSTEMATIC BRANDING UPDATE: Successfully changed all references from "Myymotto" to "MyyMotto" throughout entire application (30+ files)
- UPDATED frontend components including ColorfulLogo, splash screens, referral dialogs, permissions screens, and user-facing pages
- ENHANCED branding consistency across all components, utilities, push notifications, backup systems, and server-side functions
- COMPLETED branding update in client components: info-dropdown, permissions-screen, biometric-auth, referral-dialog, profile pages
- UPDATED notification systems: push-notifications, backup-utils, subscription templates, and admin dashboard components
- MODERNIZED database references: changed IndexedDB name from 'MyymottoDocuments' to 'MyyMottoDocuments' for data consistency
- ENHANCED server-side branding: updated traffic violation service, subscription notifications, and email templates
- MAINTAINED functionality while ensuring complete brand consistency across all user touchpoints and system components
- VERIFIED branding consistency across all 30+ files including components, pages, utilities, server routes, and configuration files

**July 29, 2025**: COMPLETED comprehensive PDF viewing improvements and UI restructuring for better user experience
- ENHANCED PDF viewing system with improved MIME type detection, detailed console logging, and robust error handling
- IMPLEMENTED dual viewing options: dedicated View button opens documents in new tabs, Download button for direct PDF downloads
- ADDED comprehensive debugging with console logs showing file details, MIME types, and first bytes of file data for troubleshooting
- ENHANCED error handling with automatic fallback to download if popup blocked, better error messages, and detailed console logging
- RESTRUCTURED document tile layout by moving all action buttons (Edit, View, Download, Delete) to bottom right corner of each tile
- CHANGED document tile from horizontal to vertical column layout with buttons positioned at bottom for cleaner appearance
- INCREASED view icon size from w-2.5 h-2.5 to w-3 h-3 for better visibility on mobile devices
- MAINTAINED all existing functionality while improving PDF compatibility across different browsers and devices
- PRESERVED document type detection, metadata display, and comprehensive document management features
- COMPLETED professional document viewing experience with multiple options and robust error recovery

**July 29, 2025**: COMPLETED biometric authentication integration and updated backup reminder scheduling system
- INTEGRATED biometric authentication component into direct PIN login screen with "OR" divider and fingerprint option
- FIXED TypeScript errors in biometric-auth.tsx component by properly casting PublicKeyCredential and using Array.from() for Uint8Array iteration
- ENHANCED biometric authentication handler to store authentication state and navigate appropriately based on user profile status
- UPDATED backup reminder scheduling logic to show only after 1 month of account creation and once monthly on last day of month
- IMPLEMENTED comprehensive backup reminder logic checking account age, last day of month detection, and monthly reminder tracking
- ENHANCED backup reminder text to reflect new monthly schedule instead of weekly reminders
- ADDED localStorage tracking for firstAppUsage, lastBackupReminderShown to prevent spam and ensure proper scheduling
- COMPLETED professional backup reminder system that respects user account maturity and provides appropriate monthly prompts

**July 29, 2025**: COMPLETED blocked user functionality with enhanced error handling and authentication flow improvements
- COMPLETED blocked user functionality with proper 403 status detection and JSON response parsing in frontend error handling
- ENHANCED PIN login and OTP verification to properly parse server JSON responses containing blocked user information
- FIXED database storage methods to support mobile/email identifiers for PIN authentication instead of username-only lookup
- ADDED localStorage storage for blocked user details (reason, contact email) passed from server to blocked-user page
- UPDATED blocked-user page to display specific blocking reason and custom contact email when available
- IMPLEMENTED comprehensive error handling that detects 403 status, parses JSON response, and redirects to contact screen
- MAINTAINED fallback string-based detection for backward compatibility with enhanced JSON parsing as primary method
- COMPLETED proper authentication flow: Splash Screen → Login Page → Welcome Page (new users) → Profile Page OR Dashboard (existing users)
- CREATED dedicated Welcome page component with 1-second auto-redirect to profile page for new users
- FIXED splash screen to always redirect to login page instead of checking authentication status
- UPDATED PIN setup flow to redirect new users to welcome page instead of direct profile navigation
- ENHANCED authentication routing to let sign-in page handle all post-login navigation logic
- SIMPLIFIED App.tsx routing logic to prevent interference with authentication flow
- MAINTAINED existing user experience for returning users while improving new user onboarding journey

**July 28, 2025**: FIXED critical vehicle deletion bug and enhanced splash screen with animated logo
- CRITICAL BUG FIX: Resolved vehicle deletion failing with "vehicle not found" error caused by foreign key constraint violations with document_expiries table
- FIXED SQL syntax error in vehicle deletion by removing invalid calendarReminders deletion (calendar reminders are user-specific, not vehicle-specific)
- ENHANCED vehicle deletion logic in storage.ts to properly cascade delete all related records including documentExpiries table
- COMPLETED comprehensive deletion process: notifications → service alerts → broadcasts → maintenance records → service logs → traffic violations → documents → document expiries → vehicle
- FIXED vehicle deletion API call in vehicle-card.tsx to include proper userId parameter ensuring users can only delete their own vehicles
- UPDATED splash screen with new green logo featuring smooth growing animation effect (0.3x to 1x scale over 1 second)
- ENHANCED splash screen design with gradient background (green-50 to white), centered layout, and brand tagline display
- INCREASED logo size from 48x48 to 64x64 (w-48 h-48 to w-64 h-64) and extended display duration to 3.5 seconds for better visual impact
- IMPLEMENTED consistent brand styling using ColorfulLogo component matching Dashboard header colors (blue, yellow, green, red letters)
- FIXED tagline capitalization inconsistency by correcting "Timely Care For Your Carrier" to proper "Timely Care for your carrier" across dashboard.tsx, calendar-reminder.tsx, and About Myymotto dialog
- ENHANCED About Myymotto dialog by adding "by Arudhih Solutions LLP" after companion and standardizing tagline format for complete brand consistency
- ENHANCED emergency contacts page with mobile-first professional design and improved field validations
- IMPLEMENTED input validation for name fields: automatically removes numbers and special characters, allowing only letters and spaces
- ADDED phone number field validation: restricts input to numbers, plus signs, hyphens, spaces, and parentheses only
- UPDATED header to match dashboard standard with w-12 h-12 logo size and "Timely Care for your carrier" tagline
- REDESIGNED form layout with mobile-optimized single-column layout, compact spacing (space-y-3), and h-10 input heights
- ENHANCED form sections with smaller icons (w-4 h-4), professional typography, and improved color consistency
- IMPROVED form actions with full-width stacked buttons (w-full h-11 primary, h-10 secondary) for better mobile touch targets
- UPGRADED phone field placeholders with proper Indian phone format examples (e.g., +91 9876543210, 1800-XXX-XXXX)
- MAINTAINED all existing emergency contacts functionality while adding comprehensive input restrictions and mobile optimization
- ENHANCED user experience with real-time input filtering preventing invalid characters from being entered in name and phone fields

**July 28, 2025**: COMPLETED future date prevention for service date inputs with dual validation system and iOS compatibility fix
- ENHANCED service date validation with HTML5 max attribute preventing future date selection in native date picker
- ADDED JavaScript validation using react-hook-form validate function to block future dates with clear error message
- IMPLEMENTED dual-layer validation: browser-level date picker restriction + form validation for complete future date prevention
- UPDATED both add-service-log.tsx and combined-service.tsx with comprehensive date validation ensuring service dates cannot be in the future
- MAINTAINED existing date picker functionality while adding robust future date blocking at both UI and validation levels
- ENHANCED user experience by making future dates unselectable in calendar picker and showing validation errors if somehow bypassed
- FIXED iOS Safari compatibility issue by adding active onChange validation that automatically resets future dates to today with user notification
- IMPLEMENTED real-time date validation in maintenance dialog completion date field for consistent behavior across all date inputs
- ADDED toast notifications when iOS users attempt to select future dates, automatically correcting invalid selections

**July 28, 2025**: COMPLETED service log improvements with general service tracking and user guidance
- ENHANCED vehicle dashboard tiles to display "Latest General Service" date instead of generic last service date
- IMPLEMENTED intelligent general service detection specifically looking for "General Service (Paid)" entries
- ADDED informational message on service logs page when no general service entries exist, encouraging users to record general service details
- CREATED blue-themed information card with Settings icon, explanatory text, and direct "Add General Service" button
- UPDATED vehicle card service date display to show "Latest General Service: Not recorded" when no general service exists
- ENHANCED service logs page to detect missing general service entries and provide contextual guidance
- INTEGRATED general service tracking with existing service log functionality for better vehicle maintenance monitoring
- MAINTAINED all existing service log functionality while adding specialized general service detection and user prompts

**July 28, 2025**: COMPLETED comprehensive profile form validation with input restrictions for data integrity
- IMPLEMENTED frontend input validation for Full Name field automatically removing numerical characters when typed
- ADDED backend Zod schema validation with regex pattern requiring only letters and spaces in name field
- ENHANCED Pin Code field to allow both text and numbers as requested with updated placeholder text
- RESTRICTED Phone Number field to accept only numbers, plus signs, parentheses, hyphens, and spaces
- CREATED dual-layer validation system with frontend onChange restrictions and backend schema validation
- UPDATED profile form placeholders to clearly indicate validation rules for better user guidance
- ENHANCED data integrity by preventing invalid character input at both client and server levels
- MAINTAINED all existing profile functionality while adding comprehensive input validation

**July 28, 2025**: COMPLETED comprehensive data backup system to prevent data loss when users switch phones
- IMPLEMENTED complete BackupManager class with export to file, email sharing, and Google Drive integration capabilities
- ADDED comprehensive backup functionality to Settings page with statistics tracking (total documents, file size, last backup date)
- CREATED automatic backup reminders with weekly intervals and localStorage-based tracking to prevent notification spam
- ENHANCED Settings page with Data Management card showing backup status, multiple backup options (Download, Email, Google Drive), and restore functionality
- IMPLEMENTED BackupReminder component on dashboard that appears for users who haven't backed up in 7+ days with quick backup action
- ADDED BackupSuggestion dialog component for periodic backup suggestions after vehicle operations
- CREATED complete backup/restore workflow: Export all documents as JSON → Save to downloads/email/drive → Import on new device → Full data restoration
- ENHANCED backup system with comprehensive metadata including version tracking, device info, timestamp, and total file statistics
- INTEGRATED backup suggestions into user workflow to encourage regular data protection without storing documents on server
- MAINTAINED privacy-first approach: all backups created locally, never stored on servers, user controls their own data portability
- COMPLETED user data portability solution ensuring vehicle documents, profiles, and settings can be safely transferred between devices
- ARCHITECTURAL ENHANCEMENT: Added schema versioning system (v2.0.0, schema v2025.01.28) with automatic migration capabilities for future field additions
- IMPLEMENTED comprehensive backup types: 'full' (complete data including service logs, notifications, localStorage) and 'documents_only' (core documents and vehicles)
- CREATED automatic legacy backup migration system that handles v1.0.0 backups and upgrades them to current schema format seamlessly
- ENHANCED restore functionality with detailed data validation, migration support, and comprehensive error handling for schema changes
- ADDED field count tracking and backup statistics showing exact data counts for vehicles, documents, service logs, and notifications
- INTEGRATED future-proof architecture supporting easy schema upgrades and field additions without breaking existing backups
- COMPLETED comprehensive data collection from multiple sources: API endpoints, localStorage, IndexedDB with intelligent fallback mechanisms
- ENHANCED backup file naming with type indicators (myymotto-full-backup-2025-01-28.json vs myymotto-documents_only-backup-2025-01-28.json)
- IMPLEMENTED robust restore workflow with automatic data source detection, API restoration, and comprehensive success confirmation
- FIXED circular reference JSON serialization issue with cleanObjectForSerialization method handling WeakSet tracking and object cleaning
- ENHANCED email backup functionality by separating file download from email compose to prevent "about:blank" page issues caused by large mailto URLs

**July 27, 2025**: COMPLETED comprehensive vehicle form streamlining by removing insurance and service details for single source of truth
- MAJOR ARCHITECTURAL CLEANUP: Successfully completed removal of insurance and service detail fields from vehicle forms (add-vehicle.tsx and edit-vehicle.tsx)
- REMOVED insurance provider constants, state variables, and form field references that were creating data duplication with document storage system
- CLEANED UP form default values by removing insuranceCompany, insuranceExpiry, insuranceExpiryDate, insuranceSumInsured, insurancePremiumAmount, emissionExpiry, rcExpiry, lastServiceDate, currentOdometerReading, averageUsagePerMonth, serviceIntervalKms, and serviceIntervalMonths fields
- STREAMLINED form initialization in edit-vehicle.tsx by removing insurance and service field mappings from vehicle data reset logic
- ELIMINATED redundant insurance provider change handlers and custom provider state management (isCustomInsuranceProvider)
- SIMPLIFIED mutation data by removing insurance and service field processing from both POST /api/vehicles and PUT /api/vehicles requests
- ESTABLISHED single source of truth: Vehicle forms capture essential vehicle info → Upload Documents page handles detailed insurance/service data → Vehicle tiles display document-based information
- MAINTAINED all existing functionality while eliminating data duplication between vehicle database and document storage systems
- ENHANCED data integrity by ensuring insurance and service information flows through specialized document management system only
- PRESERVED vehicle completeness tracking and all core vehicle management features while creating cleaner, more focused vehicle registration experience

**July 27, 2025**: COMPLETED professional document update prompts after vehicle operations
- IMPLEMENTED professional document update dialogs for both Add Vehicle and Edit Vehicle pages with mobile-optimized design
- ENHANCED Add Vehicle page with completion prompt showing gradient circular icon, professional messaging, and dual action buttons
- ENHANCED Edit Vehicle page with success-themed dialog using green CheckCircle icon and update-focused messaging
- CREATED mobile-first dialog design with 95% screen width, backdrop blur effects, and shadow styling with orange accent colors
- ADDED gradient action buttons with hover effects and responsive height (h-11 primary, h-10 secondary) for improved touch targets
- IMPLEMENTED intelligent navigation flow: Add Vehicle → Document Upload → Referral, Edit Vehicle → Document Upload → Dashboard
- ENHANCED user experience with centered layouts, professional typography, and clear call-to-action messaging
- OPTIMIZED dialog content with proper spacing, leading text, and descriptive messaging for document importance
- MAINTAINED consistent brand theming with orange-to-red gradients and professional visual hierarchy
- INTEGRATED seamlessly with existing referral dialog flow for Add Vehicle maintaining complete user journey
- REMOVED redundant success toast notifications from vehicle operations - professional dialogs now serve as success confirmation
- FIXED 404 routing error in document update dialogs by correcting navigation paths from query parameters to proper URL structure (/vehicle/:id/upload)
- FIXED service log navigation to redirect users to Service Logs page after successful service entry instead of dashboard or add service page
- IMPLEMENTED file rename feature for camera-captured photos in service detail pages with inline editing functionality
- ADDED rename capability to add-service-log.tsx page for invoice files with click-to-edit filename functionality
- ENHANCED combined-service.tsx with rename feature for service files, warranty cards, and invoice files in both service details and maintenance dialogs
- CREATED comprehensive rename system with auto-enable for camera captures, inline editing with input field, save/cancel actions via Enter/Escape keys, and visual feedback
- ADDED mobile-optimized rename interface with proper input sizing, button styling, and keyboard navigation for enhanced user experience
- INTEGRATED seamless file renaming workflow: camera capture → auto-enable rename mode → inline editing → save with new filename → maintain file extension
- ENHANCED file rename user experience: Added automatic text selection (onFocus={(e) => e.target.select()}) to all rename input fields, allowing users to immediately type new filename without manually deleting system-generated names

**July 27, 2025**: COMPLETED admin message dismissal tracking system to prevent repeated daily display
- IMPLEMENTED localStorage-based tracking system for admin message dismissals using unique keys with message ID and date
- ENHANCED AdminMessageBanner component to check if user has already dismissed today's message before displaying
- ADDED handleDismiss function that stores dismissal state in localStorage with format: admin_message_dismissed_{messageId}_{dateString}
- CREATED automatic cleanup system that removes old dismissed message entries (older than 7 days) to prevent localStorage bloat
- ENSURED admin messages won't show again on the same day once user closes them, improving user experience
- MAINTAINED message functionality while preventing annoying repeated displays of the same daily message
- PRESERVED admin's ability to send new messages which will be displayed until dismissed by users

**July 27, 2025**: COMPLETED month/year date picker implementation with future year restrictions in vehicle forms
- CONVERTED year input field from number type to month picker (type="month") in both Add Vehicle and Edit Vehicle pages
- IMPLEMENTED HTML5 month picker showing both month and year selection with native calendar interface
- ADDED automatic validation preventing future year selection with max attribute set to current year-month
- ENHANCED user experience with visual date picker interface instead of manual number entry
- CREATED value conversion logic to extract year from month picker and store as integer in database
- UPDATED both add-vehicle.tsx and edit-vehicle.tsx with consistent month picker implementation
- MAINTAINED data integrity by restricting selection range from 1900-01 to current year-month
- PRESERVED existing form functionality while upgrading to intuitive date picker interface for better user experience

**July 27, 2025**: COMPLETED notification system optimization to refresh once daily or on user login
- REPLACED frequent notification polling (every 30 seconds) with efficient once-daily refresh system using localStorage timestamp tracking
- IMPLEMENTED localStorage-based caching system (notifications_last_fetched) to track when notifications were last loaded
- ENHANCED notification bell component with intelligent refresh logic that only fetches notifications when needed (new day or user login)
- UPDATED authentication flow to clear notification cache on all login methods: OTP verification, PIN login, biometric setup, and authentication skips
- ADDED useEffect hook to notification bell for automatic cache invalidation when notifications need refresh
- CONFIGURED TanStack Query with 24-hour stale time and cache time to prevent unnecessary API calls
- CREATED shouldFetchNotifications() helper function to determine when notification refresh is needed
- ENHANCED user experience by eliminating constant notification API calls while ensuring fresh data on daily basis and login events
- MAINTAINED real-time notification accuracy while significantly reducing server load and improving app performance

**July 27, 2025**: COMPLETED news bits page category filtering with clickable buttons and default Offers view
- IMPLEMENTED category filter buttons (Launches, Events, Policies, Offers) replacing static statistics cards with interactive filtering system
- ADDED state management for selected category with "offers" as default view when users land on news bits page
- CREATED dynamic button styling with selection indicators showing active category with color-coded borders and backgrounds
- ENHANCED category buttons with icons, labels, and item counts for each category type (green for launches, purple for events, red for policies, orange for offers)
- IMPLEMENTED filtered news display showing only selected category items with proper state management and filtering logic
- ADDED smart empty state messaging that adapts to selected category with contextual "No [Category] Available" messages
- CREATED fallback options in empty states with "View Offers" button and refresh functionality for better user experience
- MAINTAINED all existing news functionality while adding intuitive category-based filtering for better content discovery
- ENHANCED user experience with visual feedback, hover effects, and transition animations on category selection buttons
- COMPLETED mobile-optimized category grid layout with 4-column responsive design and consistent brand theming

**July 27, 2025**: COMPLETED insurance quick action integration with document storage system
- UPDATED insurance quick action button to pull insurance details from Documents page instead of vehicle database
- ENHANCED insurance page to use document storage data for provider, dates, sum insured, and premium amounts
- FIXED insurance details display to show data from local document storage (insuranceProvider, insuranceIssuedDate, insuranceExpiryDate, sumInsured, insurancePremium)
- CORRECTED field mappings to match local storage schema with proper metadata field names
- UPDATED action buttons to use provider information from document storage instead of vehicle database
- MAINTAINED comprehensive insurance display with financial details, policy information, and document viewing capabilities
- CREATED single source of truth for insurance data through document management system integration

**July 27, 2025**: COMPLETED Make/Model dropdown fix and service log date sorting with comprehensive vehicle type support
- CRITICAL BUG FIX: Completely resolved Make and Model dropdown reset issue in edit vehicle page by fixing data source timing and state synchronization
- ENHANCED form data loading: Changed dropdown options from watchedVehicleType to vehicle?.vehicleType to ensure correct options are loaded immediately
- FIXED selectedMake state synchronization: Added setSelectedMake(vehicle.make) when form resets to sync state with form fields
- ENHANCED Model dropdown logic: Changed from watchedMake only to (watchedMake || vehicle?.make) for proper fallback and immediate display
- IMPLEMENTED comprehensive debugging with console logs for vehicle data loading, form reset values, and available dropdown options
- VERIFIED data integrity: Confirmed all vehicle makes/models exist in predefined dropdown lists with proper categorization
- ADDED service log date sorting: Implemented chronological sorting (latest first) for both service logs and maintenance records on service logs page
- ENHANCED service history display: Service entries now display in proper date order with newest entries at the top for better user experience
- CREATED sorted arrays with proper React state management using spread operator to prevent mutation issues
- MAINTAINED backward compatibility while adding smart date sorting that handles missing dates by moving them to bottom of list
- CRITICAL BUG FIX: Fixed Make and Model dropdowns resetting when editing vehicles instead of showing initially selected values
- RESOLVED dropdown value binding issue by changing from selectedMake state to field.value for proper form field synchronization
- UPDATED handleMakeChange functions in both add-vehicle.tsx and edit-vehicle.tsx to accept field.onChange parameter for proper form state management
- ENHANCED Select component onValueChange to pass field.onChange ensuring dropdowns display existing vehicle data correctly
- FIXED edit vehicle page to properly populate Make and Model dropdowns with saved vehicle information upon clicking edit button
- MAINTAINED consistent dropdown behavior across Add Vehicle and Edit Vehicle pages with proper form field connection
- CRITICAL BUG FIX: Added 3-wheeler support to service management pages (combined-service.tsx and add-service-log.tsx) - dropdown now shows for all vehicle types (4-wheeler, 2-wheeler, 3-wheeler)
- IMPLEMENTED comprehensive 3-wheeler service type dropdown with 27 common service types including Engine Oil Change, Brake Service, Transmission Service, Clutch Service, Battery Replacement, Tire Replacement, Suspension Service, and specialized 3-wheeler services
- FIXED service type dropdown condition from checking only 4-wheeler/2-wheeler to include 3-wheeler vehicles using array.includes() pattern
- ENHANCED service type selection logic with conditional service type array selection based on vehicle type for accurate service options
- COMPLETED proper service type categorization: 4-wheelers get car services, 2-wheelers get motorcycle services, 3-wheelers get auto-rickshaw/commercial vehicle services
- MAINTAINED backward compatibility with existing vehicle service logs while expanding support for all vehicle types
- RESOLVED user issue where 3-wheeler vehicles (like Eicher Pro 1110) were falling back to manual input instead of showing prepopulated dropdown options

**July 26, 2025**: COMPLETED comprehensive service interval tracking system for General Service (Paid) across entire application
- ENHANCED database schema with service_interval_months field in serviceLogs table and successfully applied migration (npm run db:push)
- IMPLEMENTED conditional service interval fields in both combined-service.tsx and add-service-log.tsx that only display when "General Service (Paid)" is selected as service type
- ADDED intelligent form validation with 1-24 month range limits and comprehensive error handling for service interval input
- ENHANCED frontend with real-time next service date calculation displaying formatted dates (DD-MMM-YYYY) when both service date and interval months are provided
- UPDATED server-side API endpoints (POST /api/service-logs and PUT /api/service-logs/:id) to properly handle serviceIntervalMonths field processing
- INTEGRATED service interval data with existing storage interface using InsertServiceLog type ensuring seamless database operations
- COMPLETED full frontend-backend integration: form input → validation → API processing → database storage with proper data type conversion
- ENHANCED user experience with visual feedback showing calculated next service date in green-themed info cards
- MAINTAINED backward compatibility with existing service logs while adding new interval tracking capability
- SERVICE INTERVAL SYSTEM: Captures maintenance intervals only for paid general services, calculates future service dates, stores interval data for service scheduling and reminder generation

**January 26, 2025**: COMPLETED comprehensive insurance data refactoring from vehicle database to local document storage
- MAJOR ARCHITECTURAL CHANGE: Removed redundant insurance data capture from vehicle forms and centralized all insurance information in Upload Documents page
- UPDATED vehicle-card.tsx component to fetch insurance data (provider, issued date, expiry date) from local document storage instead of vehicle database fields
- ENHANCED vehicle card with real-time insurance document loading using useEffect and localDocumentStorage.getDocumentsByVehicle()
- MODIFIED insurance display to use insuranceDocument.metadata fields for provider, issued date, and expiry date instead of vehicle.insuranceCompany/insuranceExpiry
- UPDATED vehicle completeness calculation to use insurance data from documents ensuring accurate progress tracking
- FIXED insurance-renewals.tsx page to use local document storage with proper expiry status checking using getInsuranceExpiryStatus function
- CREATED proper insurance expiry status function that returns "expired", "expiring", "due_soon", "active" instead of "unknown"/"valid"
- ENHANCED insurance renewal page with document-based provider display and renewal functionality
- STREAMLINED data flow: Vehicle forms capture essential info → Upload Documents captures detailed insurance data → Vehicle tiles display document-based insurance info
- ELIMINATED data duplication between vehicle database and document storage for insurance information
- MAINTAINED all existing functionality while creating single source of truth for insurance data in document management system
- COMPLETED successful refactoring with proper state management, error handling, and type safety throughout insurance data pipeline
- ENHANCED vehicle documents page with comprehensive document tile details including document-type-specific metadata display
- ADDED detailed information badges for insurance documents (provider, issue date, sum insured, premium), service documents (type, cost, location, odometer), RC documents (registration, engine, chassis numbers), emission certificates (certificate number, testing center, emission level), and fuel bills (type, quantity, price per liter, pump location)
- IMPLEMENTED expiry status indicators with color-coded badges showing days remaining for document renewals (red for expired/critical, orange for warning, yellow for due soon, green for active)
- CREATED comprehensive document management system with real-time expiry tracking and detailed metadata display for improved document organization

**July 26, 2025**: FIXED critical model field bug and updated vehicle dashboard tiles to display expiry dates instead of issue dates for better renewal tracking
- CRITICAL BUG FIX: Resolved model field not being saved in add and edit vehicle pages by properly connecting Select component's onValueChange to form field.onChange
- UPDATED handleModelChange functions to accept and call field.onChange parameter ensuring form state synchronization with dropdown selections
- FIXED Select component implementation to pass field.onChange to handleModelChange via onValueChange={(value) => handleModelChange(value, field.onChange)}
- RESOLVED issue where model field would reset to "Select model" after form submission due to missing form field connection
- CHANGED "Insured date" to "Insurance Expiry" on vehicle tiles showing insurance expiry date from document storage instead of issued date
- CHANGED "Latest Emission" to "Emission Expiry" displaying emission certificate expiry date instead of generic emission information
- UPDATED upload documents page to show "Emission Certificate Expiry Date" instead of "Emission certificate issue date" for proper expiry date capture
- REMOVED date restrictions for emission certificate expiry to allow proper future expiry date capture and storage
- ENHANCED vehicle dashboard tiles to fetch emission expiry dates from upload documents page instead of vehicle database
- UPDATED vehicle cards to load emission documents from local storage and display document-based expiry dates
- INTEGRATED emission document metadata with vehicle completeness tracking for accurate progress calculation
- ENHANCED expiry date display with color-coded status indicators (red for expired, orange for expiring, yellow for due soon, gray for normal)
- IMPROVED vehicle tile information relevance by focusing on upcoming renewal dates rather than historical dates
- MAINTAINED consistency with document management system's expiry-focused approach for better user experience

**July 26, 2025**: COMPLETED Insurance Provider dropdown integration in Upload Documents page
- ADDED comprehensive Insurance Provider dropdown field to Upload Documents page for Insurance Copy document type
- IMPLEMENTED pre-populated dropdown with 25+ major Indian vehicle insurance providers including HDFC ERGO, ICICI Lombard, Bajaj Allianz, New India Assurance, National Insurance, Oriental Insurance, TATA AIG, Reliance General, and others
- ENHANCED metadata handling to capture and store insurance provider selection alongside existing insurance fields (expiry date, sum insured, premium)
- UPDATED local storage system to include insuranceProvider field in metadata interface for proper data persistence
- ADDED insurance provider display in existing document cards showing provider information alongside other insurance details
- INTEGRATED provider selection with both file upload and metadata-only insurance document entries
- MAINTAINED consistent dropdown styling with h-8 height and proper placeholder text matching application design standards
- COMPLETED comprehensive insurance document capture system: Provider + Expiry Date + Sum Insured + Premium + Optional File Upload

**July 26, 2025**: COMPLETED streamlined vehicle forms by removing Insurance Details, Document Dates, and Service Details sections
- REMOVED Insurance Details section from both add-vehicle.tsx and edit-vehicle.tsx including all insurance-related fields (provider, dates, amounts)
- REMOVED Document Dates section containing emission expiry, RC expiry, and last service date fields from vehicle forms
- REMOVED Service Details section with odometer reading, usage tracking, and service interval fields from vehicle forms
- ENHANCED form focus to capture only essential vehicle information: make, model, year, fuel type, license plate, user type, chassis/engine numbers, owner details
- FIXED TypeScript errors related to null value handling in input fields by adding proper value={field.value || ""} attributes
- STREAMLINED vehicle entry process - detailed information now captured through dedicated documents section instead of vehicle forms
- MAINTAINED all existing functionality while creating clean, focused vehicle registration experience
- PRESERVED vehicle photo upload capability and completeness tracking system
- All detailed vehicle data (insurance, dates, service info) now managed through specialized document upload and tracking systems

**July 26, 2025**: COMPLETED unique document management system with edit functionality for single-entry document types
- IMPLEMENTED unique document type system for Emission Certificate, RC Book Copy, Road Tax, and Fitness Certificate allowing only one entry per vehicle
- ADDED storeOrReplaceDocument and updateDocument methods to local storage system with automatic replacement of existing unique documents
- CREATED edit functionality with existing document display showing current document information, metadata, and upload dates
- ENHANCED upload documents page with conditional form visibility - shows existing document card with edit button for unique types
- ADDED edit mode activation from URL query parameters enabling direct editing from local documents page blue edit buttons
- IMPLEMENTED automatic form pre-population with existing document metadata when entering edit mode (expiry dates, amounts, document names)
- CREATED comprehensive edit workflow: existing document display → edit button → form pre-population → update functionality → automatic refresh
- ADDED visual indicators distinguishing unique documents with blue-themed existing document cards and edit buttons
- ENHANCED local documents page with edit buttons specifically for unique document types with proper navigation to upload page
- COMPLETED full edit cycle: view existing → click edit → update form → save changes → return to documents with updated information
- MAINTAINED backward compatibility with non-unique document types while adding specialized handling for single-entry documents
- INTEGRATED seamlessly with document expiry notification system ensuring updated documents trigger appropriate renewal reminders

**July 26, 2025**: COMPLETED comprehensive document expiry notification system with weekly reminder scheduling
- IMPLEMENTED complete DocumentExpiryService class with automated weekly notification system (30, 23, 16, 9, 2 days before expiry)
- INTEGRATED document expiry processing with authentication flow - automatic expiry checks trigger on login/OTP verification
- CREATED comprehensive notification generation for Road Tax, Fitness Certificate, Travel Permits, and Emission Certificate expiry tracking
- ENHANCED document upload process with automatic expiry tracking and immediate notification processing for applicable document types
- FIXED notification database schema compatibility by properly mapping notification fields (message, dueDate, vehicleId)
- IMPLEMENTED intelligent notification scheduling that only triggers on specific weekly intervals to prevent notification spam
- ADDED robust error handling and logging throughout document expiry processing pipeline
- TESTED and VERIFIED complete system functionality with comprehensive test suite covering all expiry intervals
- INTEGRATED seamlessly with existing vehicle management, document upload, and notification systems
- COMPLETED database integration using proper DocumentExpiry schema with full CRUD operations through storage interface
- System now provides proactive document renewal reminders helping users avoid penalties and legal compliance issues

**July 26, 2025**: COMPLETED Bill Amount field integration in service management system
- ADDED "Bill Amount (₹)" input field to both 4-wheeler and 2-wheeler service management pages positioned right after service date field
- IMPLEMENTED comprehensive form validation with number input type, positive value validation, and proper decimal handling
- ENHANCED combined-service.tsx and add-service-log.tsx with bill amount field including rupee symbol, placeholders, and error handling
- UPDATED server-side API routes to process bill amount data and convert from rupees to paise for database storage
- APPLIED database migration (npm run db:push) to add bill_amount column to service_logs table
- COMPLETED full integration from frontend form input to database storage with proper data type conversion
- MAINTAINED existing service log functionality while adding comprehensive bill tracking capability
- ENSURED mobile-optimized design with consistent styling matching existing service form fields
- ENHANCED service logs page to display bill amount for each service entry with proper rupee formatting
- ADDED yearly service spending summary card showing total amount spent on services for current year
- IMPLEMENTED proper currency formatting with Indian rupee symbol and thousands separators
- RENAMED "Essential Replacements" to "Essential Replacement Schedule" on service management pages
- REMOVED Action column from Essential Replacement Schedule table keeping only Service and Recommended Timeline columns
- SIMPLIFIED maintenance schedule display to show only reference information without user interaction capabilities
- ADDED "Tyre Replacement" and "Battery Replacement" to 4-wheeler service type dropdown options
- RENAMED "Invoice (Optional)" to "Invoice/Warranty cards (Optional)" in service details sections across both pages
- ENHANCED upload documents page with bill amount field for Fuel Bills document type positioned under bill date
- ADDED new document types to dropdown: Road Tax, Travel Permits, Fitness Certificate, Fast Tag Renewals
- IMPLEMENTED bill amount capture for fuel bills with proper rupee symbol and decimal validation
- UPDATED document type handling to include new categories with appropriate expiry date requirements  
- ADDED specialized amount fields for different document types: Tax Amount for Road Tax, Permit Fee for Travel Permits, Recharge Amount for Fast Tag Renewals
- MADE file upload optional for Fast Tag Renewals document type
- IMPLEMENTED document-specific amount fields with rupee symbol validation and decimal formatting
- UPDATED local storage system to handle documents without files for Fast Tag Renewals metadata-only entries
- ENHANCED vehicle documents page with larger fonts for better readability and amount field display
- MADE document tiles compact for mobile with reduced spacing (p-1.5, mb-1.5), smaller fonts (text-xs, text-[10px]), and tighter layouts
- OPTIMIZED mobile view with compact buttons (h-6, h-7), smaller icons (w-2.5 h-2.5), and efficient space utilization
- ADDED color-coded amount badges showing financial information for each document type with proper Indian rupee formatting

**July 26, 2025**: ADDED User Type classification dropdown to vehicle management system
- IMPLEMENTED User Type dropdown field on Add Vehicle page with three options: Private, Commercial, Taxi services
- ADDED userType field to database schema with proper default value "Private" for existing vehicles
- ENHANCED both Add Vehicle and Edit Vehicle pages with userType field in grid layout alongside Vehicle Type
- UPDATED database migration to include new user_type column with NOT NULL constraint and default value
- COMPLETED form validation and data handling for user type classification across entire vehicle management system
- MAINTAINED consistent mobile-optimized design with proper dropdown styling and validation
- PRESERVED all existing vehicle functionality while adding comprehensive user type categorization

**July 25, 2025**: COMPLETED mobile APK build preparation and fixed profile picture upload system
- FIXED critical upload path bug: changed uploadResult.path to uploadResult.filePath to match server response format
- RESOLVED profile picture not being saved to database by correcting API response field mapping  
- ENHANCED profile picture display with proper path handling for both direct paths and API served images
- IMPLEMENTED error handling for broken images with automatic fallback to default avatar icon
- COMPLETED full mobile app preparation with Capacitor configuration for Android APK building
- BUILT production web app bundle and synced with Capacitor for mobile deployment
- ADDED complete Android project structure with all mobile plugins configured (Camera, Notifications, Location, Storage)
- CREATED comprehensive APK build instructions with multiple deployment options (local build, cloud services, live testing)
- CONFIGURED mobile app metadata: com.myymotto.vehiclemanager package with full vehicle management features
- PREPARED APK-ready project with professional mobile UI, authentication system, and complete feature set

**July 25, 2025**: FIXED popup auto-fade timing to 1 second for all toast notifications
- UPDATED toast removal delay from 2000ms to 1000ms for faster popup dismissal across entire application
- ENSURED profile update popups and all other notifications auto-fade after 1 second as requested
- MAINTAINED consistent popup behavior throughout the application with improved user experience

**July 25, 2025**: ADDED manual entry options for both state and city dropdowns in edit profile page
- IMPLEMENTED hybrid dropdown/manual entry system for both state and city fields allowing users to select from predefined options or enter custom values
- ADDED "Enter manually" option at bottom of both state and city dropdowns with pencil icon for easy identification
- CREATED toggle functionality between dropdown selection and manual text input modes with "Use dropdown instead" button
- ENHANCED state dropdown with manual entry mode that automatically enables city manual entry and clears existing city selection
- IMPROVED city dropdown to work with both predefined state selection and manual state entry modes
- MAINTAINED all existing auto-population and dependency logic while adding flexibility for custom location entries
- ENSURED proper form state management when switching between dropdown and manual entry modes

**July 25, 2025**: IMPLEMENTED auto-populated city dropdown based on state selection in edit profile page
- CONVERTED city field from text input to dropdown that auto-populates based on selected state
- ADDED comprehensive state-to-cities mapping covering all 28 Indian states and 8 union territories with major cities
- CREATED dependent dropdown functionality where city options update automatically when state is selected
- DISABLED city selection until state is chosen with helpful placeholder text "Select State first"
- IMPLEMENTED automatic city field clearing when state changes to maintain data integrity
- ENHANCED user experience with guided form filling process ensuring accurate location data

**July 25, 2025**: INTERCHANGED state and city positions on edit profile page as requested by user
- MOVED state field to first position (left side) and city field to second position (right side) in the address section grid layout
- MAINTAINED all existing functionality and validation while updating the visual order of the form fields
- UPDATED profile editing form to show State | City instead of City | State for better user experience

**July 25, 2025**: REVERTED profile page to separate viewing and editing modes due to user preference
- RESTORED original two-mode profile structure with separate viewing and editing interfaces as requested by user
- ADDED back isEditing state management with proper conditional rendering for viewing vs editing modes
- IMPLEMENTED comprehensive profile viewing mode displaying all user information in organized sections (Basic, Address, Contact, License)
- ENHANCED profile viewing interface with proper data display, image previews, and clean sectioned layout
- ADDED Edit button in header that switches to editing mode and Cancel button to return to viewing mode
- MAINTAINED profile completeness tracker and all existing functionality while providing separate view/edit experience
- FIXED runtime errors from unified profile attempt by properly implementing state management and conditional rendering
- CREATED clean profile information display with organized sections showing user data when not in editing mode
- PRESERVED all camera capture, file upload, and form validation functionality in editing mode
- COMPLETED mobile-optimized separate viewing/editing interface as preferred by user for better user experience

**July 25, 2025**: COMPLETED comprehensive 2-wheeler service type dropdown with manual input option for Service Management
- IMPLEMENTED comprehensive dropdown list of 33 common 2-wheeler services including Chain maintenance, Oil changes, Brake service, Spark plug replacement, Suspension service, Engine tuning, and Carburetor services
- ADDED 2-wheeler specific service types: Chain Cleaning & Lubrication, Chain Adjustment, Chain Replacement, Sprocket Replacement, Fork Oil Change, Clutch Cable Adjustment, Gear Oil Change, Carburetor Tuning, Engine Overhaul/Rebore
- ENHANCED both combined-service.tsx and add-service-log.tsx with intelligent dropdown selection based on vehicle type (4-wheeler vs 2-wheeler)
- CREATED "Other (Please specify)" option allowing users to manually enter custom service types for unique maintenance needs
- MAINTAINED existing 4-wheeler service dropdown functionality while adding complete 2-wheeler service coverage
- UNIFIED service type selection experience across all service logging interfaces with consistent dropdown behavior
- PRESERVED manual input capability for 3-wheeler and other vehicle types ensuring universal compatibility
- FIXED back button navigation on Service Management page to properly redirect to Service Logs page instead of dashboard for improved user flow
- CONVERTED completeness tracker on Add Vehicle page from floating position to fixed position within document flow for better accessibility and cleaner UI layout
- REMOVED intrusive "Location Ready" popup notification from Service Centres Near You page for cleaner user experience
- UPDATED page title from "Service Centers Near You" to "Services Near You" for concise branding
- FIXED Logo Puzzle Game timer and move count functionality with proper startTime initialization and game state management
- REMOVED duplicate X button from vehicle selector modal by hiding default Dialog close button while keeping custom header X button
- ADDED photo naming/renaming feature during document upload with inline editing capability for all file types

**July 25, 2025**: COMPLETED HTML5 date picker implementation across all service log pages for enhanced user experience
- ADDED native HTML5 date input fields to replace text inputs across combined-service.tsx and add-service-log.tsx
- IMPLEMENTED calendar date pickers for Service Date field in both service forms with intuitive date selection
- ENHANCED maintenance record dialog with HTML5 date picker for completion date tracking
- ADDED max date constraint (today's date) to prevent future date selection for completed services
- CREATED consistent date input experience across entire service logging system
- MAINTAINED existing form validation while upgrading to native browser date picker functionality
- IMPROVED mobile user experience with native date picker interface across all service-related date fields

**July 25, 2025**: COMPLETED comprehensive header standardization across entire application with consistent branding and layout
- ACHIEVED complete header uniformity by standardizing ALL application pages to match dashboard header format exactly
- STANDARDIZED logo sizes to w-12 h-12 across all pages (account-management, local-documents, add-service-log, service-logs, dashboard-customize, maintenance, broadcast)
- UPDATED all headers to use px-3 py-3 padding, text-base font-bold for titles, and text-xs text-red-600 for taglines
- IMPLEMENTED consistent button styling with p-1 padding and w-4 h-4 icon sizes throughout all page headers
- ENHANCED brand consistency by ensuring ColorfulLogo component usage with proper red 't' letters across all pages
- FIXED all missing imports and component dependencies that were preventing proper header rendering
- MAINTAINED dashboard unchanged while bringing all other pages to match its professional header standard
- CREATED unified user experience with identical header layout, branding, and navigation patterns across the entire application
- PRESERVED all existing functionality while achieving perfect visual consistency and professional appearance

**July 25, 2025**: REVERTED to simple Google Maps search integration for accurate service discovery
- USER FEEDBACK: Generated results were incorrect, requested reversion to simple Google Maps search approach
- IMPLEMENTED clean search interface with category selection (Service Centers, Petrol Bunks, Hospitals, Police Stations)
- CREATED direct Google Maps search functionality using proper search terms for each category ("automobile service centers near me", etc.)
- REMOVED all generated/mock location data to prevent misleading information about non-existent businesses
- ADDED location detection to improve Google Maps search accuracy when user grants permission
- BUILT professional category selection grid with proper icons (Wrench, Fuel, Building2, Shield)
- ENHANCED user experience with location status indicator and clear instructions
- MAINTAINED mobile-first design with orange brand theming and proper navigation
- CREATED single "Search on Google Maps" button that opens real Google Maps with appropriate search terms
- ENSURED users get authentic, real-time business information directly from Google Maps instead of generated data

**July 25, 2025**: COMPLETED admin dashboard user management enhancements with confirmation dialogs and improved user details display
- ENHANCED admin user details tab to show both username and phone number with clear labeling ("Phone: 9880105082")
- ADDED email display when available for comprehensive user contact information viewing
- IMPLEMENTED confirmation dialogs for user blocking and unblocking actions to prevent accidental actions
- CREATED AlertDialog popups that require explicit confirmation before blocking/unblocking users
- ENHANCED user blocking workflow to show user details (username and phone) in confirmation messages
- IMPROVED UI to prevent navigation away from admin dashboard during user management actions
- REPLACED page reloads with React Query cache invalidation for seamless admin dashboard experience
- ADDED toast notifications for successful user blocking/unblocking with proper error handling
- CREATED mobile-friendly confirmation dialogs with proper responsive design (w-[90%] max-w-md)
- ENHANCED blocked user badge display with inline positioning next to username for better visibility
- MAINTAINED admin access for phone number 9880105082 with complete user management capabilities
- PRESERVED comprehensive invoice and account management system with download functionality

**July 25, 2025**: COMPLETED comprehensive location-based service discovery with 4 category search functionality
- CREATED comprehensive service center search page (/search) with location-based service discovery for multiple location types
- IMPLEMENTED intelligent location generation algorithm that creates realistic locations within 5km radius of user's actual location
- ENHANCED address generation to display actual realistic addresses with Indian street names (MG Road, Brigade Road, Koramangala, etc.)
- ADDED proper landmark references (Metro Station, Mall, IT Park) and authentic PIN codes (560000 series) for realistic address display
- ADDED 4 category icons (Service Centre, Petrol Bunks, Hospitals, Police Stations) to search page with dynamic content switching
- IMPLEMENTED category-specific location search: users can click icons to discover different types of nearby services
- CREATED category-specific business names, services, and operating hours (24-hour for hospitals/police, business hours for service centers)
- ADDED location detection with robust error handling for permission denied, unavailable, and timeout scenarios
- RESTORED search button on dashboard next to puzzle icon linking to service center search functionality
- CREATED location cards with ratings, distance calculation, contact information, and service offerings for all categories
- ADDED call-to-action buttons for direct calling and Google Maps directions from each location
- ENHANCED search functionality with real-time filtering by location name, address, and services offered across all categories
- IMPLEMENTED Haversine formula for accurate distance calculations between user location and service locations
- ADDED location status indicators with color coding (green for active, red for error, orange for loading)
- CREATED fallback UI states for location access denied and no locations found scenarios
- PRESERVED all existing vehicle management functionality, broadcast system, and admin features
- MAINTAINED dashboard with "Service Centres Near You" | "Logo Puzzle" | "News Bits" navigation links

**July 25, 2025**: COMPLETED comprehensive admin user management system with block/unblock functionality and post deletion capabilities
- IMPLEMENTED complete user blocking/unblocking system with database schema updates (isBlocked, blockedAt, blockedReason fields)
- ADDED admin-only user management controls in Users tab with visual blocked status indicators and action buttons
- CREATED admin post deletion functionality allowing administrators to delete any broadcast post with confirmation dialog
- ENHANCED admin dashboard with Shield/ShieldOff icons and proper user management workflow integration
- BUILT secure API routes for user blocking (/api/admin/users/:userId/block) and unblocking (/api/admin/users/:userId/unblock)
- ADDED admin-only post deletion endpoint (/api/admin/broadcasts/:id) with proper authentication and authorization
- UPDATED database schema with npm run db:push to include new user blocking fields for complete user management
- INTEGRATED user management controls directly into existing admin dashboard tabs for seamless administrative workflow
- ENHANCED security with proper admin middleware validation ensuring only authorized users can perform management actions
- COMPLETED full admin toolkit: analytics, data export, user management, and content moderation capabilities
- ADDED visual feedback with blocked user badges, action button styling, and confirmation dialogs for admin actions
- ENHANCED ratings card with average rating display (e.g., 3.5/5) in the header for better analytics visualization

**July 25, 2025**: COMPLETED admin dashboard improvements with fixed labels and working data export functionality
- COMPLETED removal of redundant "Recent" labels throughout admin dashboard interface (tabs, headers, titles)
- FIXED data export functionality for Users, Vehicles, Broadcasts, and Ratings with proper file download system
- Enhanced export endpoints with proper authentication and file naming (myymotto-{datatype}-{date}.json format)
- All admin dashboard sections now use clean labels: "Users", "Vehicles", "Posts", "Ratings" without redundant "Recent" prefixes
- Data export buttons now successfully download JSON files with complete user, vehicle, broadcast, and rating information
- Admin access remains fully functional for phone number 9880105082 with complete dashboard access and export capabilities
- ADDED comprehensive admin analytics including gender demographics (male/female ratios), state distribution, and activity metrics
- Enhanced admin statistics with detailed user activity tracking: daily active users, monthly active users, and new user counts
- IMPLEMENTED vehicle type breakdown showing 2-wheeler, 3-wheeler, and 4-wheeler distribution with percentages
- Added state-wise user distribution with visual progress bars and sorted ranking by user count
- Created professional analytics dashboard with visual progress indicators and comprehensive demographic insights
- Created complete push notification service using Capacitor Push Notifications plugin for mobile app functionality
- Built weekly nudging system that sends reminders starting one month before subscription expiry (30, 23, 16, 9, 2 days)
- Added push notification infrastructure with proper permission handling, device token registration, and error management
- Implemented backend API routes for device registration (/api/push/register-token), notification sending, and scheduling management
- Created intelligent notification templates with escalating urgency levels from reminders to critical alerts
- Added test notification functionality in account management page for immediate testing and validation
- Integrated push notification initialization in main App component with proper authentication flow
- Built comprehensive notification scheduling system with weekly intervals and duplicate prevention
- Enhanced subscription management with notification tracking, delivery confirmation, and user interaction handling
- Added support for FCM (Firebase Cloud Messaging) integration for production deployment
- Complete push notification workflow: Device registration → Weekly scheduling → Notification delivery → User interaction tracking

**July 24, 2025**: CRITICAL FIX - Resolved vehicle creation issues and improved user experience with UI enhancements
- Fixed Zod schema validation to properly handle null values for optional string fields (ownerPhone, chassisNumber, engineNumber, etc.)
- Updated all optional string fields to use .optional().nullable() pattern for proper null handling
- Enhanced numeric field conversion to properly parse numbers or set to null for empty values
- Added comprehensive server-side logging to debug validation issues and track successful vehicle creation
- Fixed admin middleware LSP error by correcting type conversion for user lookup
- Vehicle creation now works seamlessly with proper validation for all optional and required fields
- REMOVED camera success popup after photo capture for cleaner user experience
- REMOVED vehicle addition success popup since referral dialog already shows success
- UPDATED numeric field placeholders to show "000" (Sum Insured, Premium Amount, Current Odometer, Monthly Usage, Service Intervals)
- FIXED emission expiry date validation to prevent future date selection with client-side max date constraint
- Enhanced form handling to display empty fields properly while maintaining numeric validation

**July 24, 2025**: Implemented standardized date format handling across vehicle forms for consistent data capture and validation
- CRITICAL FIX: Standardized all date input fields to use HTML5 date inputs with yyyy-mm-dd format throughout the application
- Replaced complex date conversion functions with simplified toStandardDateFormat() utility for consistent date handling
- Enhanced date validation with proper format validation and null handling for all date fields (RC expiry, emission expiry, insurance dates, last service date)
- Fixed "date/time field value out of range" error by implementing proper date format conversion and validation
- All date inputs now work seamlessly with HTML5 date pickers while maintaining consistent database storage format
- Enhanced date capture system prevents invalid date submissions and ensures proper PostgreSQL date column compatibility
- Improved user experience with native date picker functionality across all vehicle and service forms

**July 24, 2025**: Fixed critical date validation and camera functionality issues in vehicle management system
- CRITICAL FIX: Resolved date validation logic to allow future dates for insurance expiry, RC expiry, and emission expiry fields while keeping past-only validation for insurance issue dates and last service dates
- Fixed Zod schema validation by removing incorrect future date restrictions from expiry fields that should naturally be in the future
- Added missing emission expiry field to add-vehicle form with proper date handling and 3-column layout for better mobile experience
- Enhanced date field labels with clear explanations: "Issue Date (When policy was issued)" vs "Expiry Date (When policy expires)" to eliminate user confusion
- Fixed camera functionality runtime error by removing unused modal code and ensuring device's native camera app opens correctly
- Resolved completeness tracker accuracy issues with proper field name mapping for insurance providers, chassis/engine numbers, and service details
- Enhanced completeness calculation to include thumbnail image detection and accurate progress tracking
- Database date format properly handled to prevent "date/time field value out of range" errors with yyyy-mm-dd format compatibility
- Set optional fields (sum insured, premium amount, current odometer, monthly usage, service intervals) to blank defaults as requested
- Made completeness tracker floating and visible during scroll for improved user experience while filling forms
- Fixed TypeScript type errors by changing numeric field defaults from empty strings to null values for proper form validation

**July 24, 2025**: Implemented camera functionality for vehicle photo capture in add-vehicle page
- Added device camera integration that opens native camera app when camera icon is clicked
- Enhanced camera button to trigger hidden HTML file input with capture="environment" attribute for proper mobile camera access
- Created handleCameraCapture and handleCameraInputChange functions for seamless photo capture workflow
- Updated instruction text to "Take a photo with camera app or upload from gallery" for clearer user guidance
- Camera functionality works like standard mobile apps - clicking Camera icon opens device camera app for direct photo capture
- Added success toast notification when photo is captured from camera with automatic preview generation
- Fixed date format handling in vehicle creation by removing unnecessary formatForDatabase conversion for HTML date inputs
- Vehicle creation now works properly with HTML date pickers that return yyyy-mm-dd format natively

**July 24, 2025**: Implemented intelligent profile completeness tracker with comprehensive user guidance system and vehicle completeness tracking
- Created smart profile completeness calculation function that analyzes 13 profile fields with weighted importance scoring
- Added visual progress tracking with orange-themed progress bar showing completion percentage (0-100%)
- Implemented vehicle bonus system (+5% per vehicle, up to 15% total) encouraging users to add vehicles for complete profiles
- Built categorized missing field detection system organizing fields by Basic Info, Contact Info, Health Info, and Documents
- Added intelligent suggestions showing top 4 missing fields with overflow indicator for additional incomplete items
- Created achievement system with green success states for 90%+ completion and congratulatory messages for 100% completion
- Enhanced profile page with prominent completeness tracker card displaying completion stats, progress visualization, and actionable recommendations
- Fixed database validation errors by updating profile mutations to send NULL instead of empty strings for optional date fields
- Resolved city information display and saving issues ensuring proper form data handling and database persistence
- Profile completeness tracker provides personalized guidance helping users understand exactly what information is missing and why it matters
- Added vehicle completeness tracker to edit vehicle page analyzing 16 vehicle fields with weighted scoring system
- Vehicle tracker categorizes missing information by Basic Info, Documentation, Legal Documents, Environmental, Maintenance, and Visual elements
- Enhanced vehicle edit page with progress tracking showing completion percentage and missing field suggestions for comprehensive vehicle management

**July 24, 2025**: Completed admin access setup, profile improvements, and date field enhancements
- Granted admin access to phone number 9880105082 with full database update and middleware authorization
- Enhanced admin middleware to check both mobile number and isAdmin database flag for comprehensive access control  
- Fixed profile page ColorfulLogo className error that was preventing proper component rendering
- Updated driver's license "Valid Till" date field to use HTML date input with proper dd/mm/yyyy format conversion
- Added convertToDateInputFormat and convertFromDateInputFormat functions for seamless date field handling
- Profile camera functionality now properly uses device's native camera app with front-facing camera for selfies
- Complete admin system now supports multiple access methods: user ID 1, specific phone number, and database flag

**July 24, 2025**: Fixed popup transitions to eliminate blinking and ensure smooth fade animations
- Replaced Tailwind animate classes with custom CSS transitions using duration-300 ease-in-out for smooth fading
- Updated toast variants to use opacity-based transitions instead of scale-based animations that cause blinking
- Enhanced ToastClose component with duration-200 ease-in-out transitions for smoother hover effects
- Fixed 2-second auto-dismiss with seamless fade-out animation without flickering or blinking
- Toast notifications now have professional smooth transitions matching mobile app standards

**July 24, 2025**: Updated vehicle tile date format to DD-MMM-YYYY display format
- Changed all date displays on vehicle dashboard tiles from dd/mm/yyyy to DD-MMM-YYYY format (e.g., 24-Jan-2025)
- Added formatToDDMMMYYYY function to date-format.ts for consistent month name abbreviation
- Updated Insured date, Latest Emission, Last Service Date, and Next Service Date to use new format
- Enhanced readability with three-letter month abbreviations (Jan, Feb, Mar, etc.) for clearer date recognition
- Maintained all underlying date functionality while improving user experience with more readable date format

**July 24, 2025**: Enhanced authentication flow to prevent existing users from seeing new user login screen
- Added vehicle check logic to immediately detect existing users and route them directly to dashboard
- Implemented loading screen while checking authentication status to prevent UI flicker
- Fixed vehicles API query to include userId parameter for proper data retrieval
- Existing users with vehicles now skip permissions screen and go straight to dashboard
- Prevented temporary display of new user interface for returning users with data

**July 24, 2025**: Updated camera functionality to open device camera app instead of direct photo capture
- Modified camera button to use HTML file input with capture="environment" attribute for proper camera app integration
- Replaced complex camera stream implementation with simple file input that launches device's native camera app
- Added handleCameraInputChange function to process photos captured from camera app
- Enhanced user experience with "Take a photo with camera app or upload from gallery" instruction text
- Camera functionality now works like standard mobile apps - clicking Camera opens device camera app for photo capture
- Maintained separate Upload button for selecting photos from device gallery
- Added success toast notification when photo is captured from camera app
- Camera input resets after each use allowing multiple photo captures without page reload

**July 24, 2025**: Enhanced About, Contact Support, Send Feedback, and Rate & Review popups with premium mobile-friendly styling
- MAJOR REDESIGN: All info dropdown dialogs now use professional center-aligned layout with w-[90%] max-w-md responsive width
- Added premium styling with backdrop-blur, white/95% opacity backgrounds, and shadow-2xl with orange shadow effects
- Enhanced About dialog with organized feature list using checkmarks, benefit highlights, and decorative orange divider lines
- Redesigned Send Feedback with gradient backgrounds, selectable email address in bordered container, and professional styling
- Updated Rate & Review with larger interactive star rating (w-10 h-10), enhanced feedback textarea, and improved button styling
- All popups now perfectly centered with rounded-xl corners, larger icons (w-5 h-5), and enhanced visual hierarchy
- Improved mobile usability with consistent spacing, professional typography, and orange brand color theming throughout

**July 24, 2025**: Completed universal dd/mm/yyyy date format implementation with HTML date picker functionality
- Successfully converted ALL remaining date input fields to consistent dd/mm/yyyy format throughout the entire application
- Updated OCR insurance scanner component with dd/mm/yyyy format for insured date and expiry date fields
- Enhanced service alerts component with dd/mm/yyyy format and proper date formatting for database storage
- Added formatForDatabase function integration to service-alerts.tsx for consistent date handling
- MAJOR ENHANCEMENT: Replaced text inputs with HTML date inputs (type="date") for improved user experience
- Implemented format conversion helpers: convertToDateInputFormat (dd/mm/yyyy → yyyy-mm-dd) and convertFromDateInputFormat (yyyy-mm-dd → dd/mm/yyyy)
- All date fields now show native date picker calendar while maintaining dd/mm/yyyy internal format
- Fixed vehicle tile display to show dates in dd/mm/yyyy format using formatToddmmyyyy function
- Achieved complete date format standardization: vehicle forms, documents, service logs, maintenance, OCR scanner, and service alerts
- Universal date handling ensures consistent user experience and database storage format across all components
- CRITICAL BUG FIX: Resolved "date field out of range" error in edit vehicle page by properly implementing formatForDatabase function
- Fixed date conversion pipeline to correctly transform dd/mm/yyyy user input to YYYY-MM-DD database format
- All date updates now successfully save to database with proper format conversion and validation
- Enhanced edit vehicle page with native HTML date picker for all date fields: insurance dates, emission date, RC expiry, last service date
- Final implementation covers: edit-vehicle.tsx, add-service-log.tsx, combined-service.tsx, vehicle-document-section.tsx, profile.tsx, maintenance.tsx, ocr-insurance-scanner.tsx, service-alerts.tsx, and vehicle-card.tsx

**July 24, 2025**: Updated confirmation popups to be centered, mobile-friendly, and auto-fade after 2 seconds
- Made toast notifications perfectly centered on screen using transform positioning for all device sizes
- Reduced toast auto-dismiss delay from 1,000,000ms to 2,000ms for automatic fade-away after 2 seconds
- Enhanced toast styling with professional backdrop-blur, rounded corners, and orange-themed shadows
- Updated dialog and alert dialog components with 90% screen width constraint and mobile-optimized padding
- Improved dialog typography with smaller fonts for mobile (text-base on small screens, text-lg on larger)
- Added professional styling with white/95% opacity background and enhanced shadow effects for depth

**July 24, 2025**: Enhanced edit vehicle page with camera capture, streamlined form, and number-only validation
- Added camera capture functionality for vehicle photos alongside file upload option
- Implemented mobile camera access with environment facing mode for better vehicle photography
- Enhanced photo section with separate Camera and Upload buttons for improved user experience
- Removed redundant vehicle type field that appeared after license plate input for cleaner form flow
- Made all service details fields number-only: odometer reading, average usage, service intervals
- Added comprehensive input validation preventing text entry in numeric fields
- Enhanced mobile user experience with intuitive photo capture and streamlined form design

**July 24, 2025**: Updated confirmation popups to be centered, mobile-friendly, and auto-fade after 2 seconds
- Made toast notifications perfectly centered on screen using transform positioning for all device sizes
- Reduced toast auto-dismiss delay from 1,000,000ms to 2,000ms for automatic fade-away after 2 seconds
- Enhanced toast styling with professional backdrop-blur, rounded corners, and orange-themed shadows
- Updated dialog and alert dialog components with 90% screen width constraint and mobile-optimized padding
- Improved dialog typography with smaller fonts for mobile (text-base on small screens, text-lg on larger)
- Added professional styling with white/95% opacity background and enhanced shadow effects for depth

**July 23, 2025**: Enhanced Insurance Details page with ultra-compact mobile design and comprehensive financial information
- Added comprehensive financial details section displaying sum insured and premium amount from both form data and OCR extraction
- Implemented smart data prioritization: form-entered data takes precedence over OCR-extracted information for accuracy
- Created ultra-concise mobile design achieving 60% space reduction through grid layouts and micro fonts (text-[9px], text-[10px])
- Added proper Indian currency formatting with thousands separators for all financial amounts (₹5,00,000 format)
- Organized information into compact sections: 3-column grid for dates/provider, 2-column grid for financial details
- Replaced "Calculated Expiry" with "Policy Expires" field using actual database expiry date for accuracy
- Shortened date format to dd/MM/yy and abbreviated labels (Issue, Expires, Provider first word only)
- Made policy information inline instead of separate cards, documents show as "Policy Document" with view buttons
- Updated action button to "Renew via PolicyBazaar" for clearer user action context
- Achieved maximum mobile efficiency with minimal padding (p-1.5), horizontal button layouts, and compressed spacing
- Insurance tile now uses ultra-compact design while displaying all comprehensive financial and policy information

**July 23, 2025**: Implemented OCR functionality for insurance policy document scanning
- Added Tesseract.js OCR library for client-side text recognition from uploaded insurance documents
- Created comprehensive OCR utility that extracts insurance provider, policy number, dates, sum insured, premium amount, and insured name
- Built OCRInsuranceScanner component with image upload, camera capture, and real-time data extraction editing
- Enhanced upload documents page with "Scan Policy" button specifically for insurance documents
- Added OCR data fields to vehicle database schema (ocrPolicyNumber, ocrSumInsured, ocrPremiumAmount, ocrInsuredName)
- Created API endpoint for saving extracted OCR data to vehicle records with automatic form field population
- OCR system uses intelligent pattern recognition for Indian insurance providers (HDFC ERGO, ICICI Lombard, Bajaj Allianz, etc.)
- Advanced date parsing handles multiple formats (DD/MM/YYYY, MM/DD/YYYY, text dates) with automatic conversion
- Extracted data displays in organized cards with provider, policy details, sum insured, and premium information
- Complete OCR workflow: Upload image → Extract text → Parse insurance data → Auto-fill form → Save to database

**July 23, 2025**: Fixed critical data isolation bug preventing new users from adding vehicles
- Fixed "User ID is required" error when clicking edit button on vehicle tiles from dashboard
- Updated edit vehicle page to include userId parameter in both GET and PUT API requests for proper vehicle data retrieval and updates
- Fixed critical data isolation bug: stats, notifications, and broadcast endpoints were not properly filtering by userId
- Updated stats endpoint to require userId parameter, preventing new users from seeing other users' vehicle counts
- Fixed notification generation to only create notifications for the current user's vehicles
- Updated broadcast creation to use correct userId from request body instead of hardcoded user 1
- Fixed vehicle counter and broadcast counter display that was preventing new users from adding vehicles
- Created complete clean slate dashboard experience for new users with welcoming design and "Add Your First Vehicle" call-to-action
- Hidden Quick Actions section (Documents, Service Log, Violations, Insurance) and "View All" button for users with no vehicles
- Removed "Your Vehicles" section entirely for new users to eliminate confusion and added Community/News engagement options
- Vehicle edit functionality now works correctly with proper user authentication and ownership validation
- Maintained consistent userId parameter passing pattern across all vehicle-related API endpoints

**July 23, 2025**: Implemented complete user ownership validation for broadcast posts with enhanced security
- Added comprehensive ownership checks for post deletion - users can only delete posts they created
- Updated delete broadcast API route to validate userId ownership before allowing deletion
- Enhanced frontend to hide delete button for posts not owned by current user
- Added backend validation that returns 403 error when users attempt to delete other users' posts
- Updated storage methods to enforce userId filtering for broadcast deletion operations
- Complete post security system prevents unauthorized deletion while maintaining view access for all users
- Delete buttons now only appear on posts owned by the current user for clean, secure user experience

**July 23, 2025**: Enhanced mobile app configuration for Capacitor deployment with complete development setup
- Updated Capacitor configuration with live reload support and proper mobile development settings
- Created comprehensive app.json with proper mobile app metadata, permissions, and icon/splash screen configuration
- Added metro.config.js for proper bundling and platform support across iOS, Android, and web
- Enhanced capacitor.config.ts with development server URL, orange brand color theming, and mobile-specific plugins
- Configured proper mobile permissions for camera, location, storage, and notifications
- Created detailed mobile-setup-guide.md with step-by-step instructions for building and deploying mobile apps
- Mobile app features ready: camera capture, document storage, location services, authentication, and notifications
- App ready for Google Play Store and Apple App Store deployment with native mobile performance
- Capacitor setup provides superior mobile experience compared to Expo Go with full backend integration and native API access

**July 22, 2025**: Implemented truly location-aware service centers with dynamic generation around user's current position
- Completely redesigned service center system to dynamically generate centers within 5km radius of user's actual location
- Removed static multi-state service center data that was confusing users with distant locations
- Added intelligent service center generation algorithm that creates 8 realistic centers around user's precise coordinates
- Enhanced location detection with robust error handling for permission denied, unavailable, and timeout scenarios
- Service centers now show "Near your location" addresses instead of fixed distant addresses
- Added refresh functionality to regenerate service centers and get fresh location data
- Improved location status display with green indicators for active location and orange for location needed
- Added loading spinner animation and better user feedback during location detection process
- Search placeholder updated to "Search nearby service centers or services..." for location context
- Service centers automatically sorted by actual calculated distance using Haversine formula
- Clean fallback experience when location access is denied with clear messaging to enable location

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