import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Link to user - temporarily nullable for migration
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  color: text("color").notNull(),
  licensePlate: text("license_plate").notNull().unique(),
  chassisNumber: text("chassis_number"),
  engineNumber: text("engine_number"),
  ownerName: text("owner_name").notNull(),
  ownerPhone: text("owner_phone"),
  thumbnailPath: text("thumbnail_path"),
  insuranceCompany: text("insurance_company"),
  insuranceExpiry: date("insurance_expiry"), // Issue date
  insuranceExpiryDate: date("insurance_expiry_date"), // Actual expiry date
  insuranceSumInsured: text("insurance_sum_insured"), // User-entered sum insured
  insurancePremiumAmount: text("insurance_premium_amount"), // User-entered premium
  emissionExpiry: date("emission_expiry"),
  rcExpiry: date("rc_expiry"),
  lastServiceDate: date("last_service_date"),
  currentOdometerReading: integer("current_odometer_reading"),
  averageUsagePerMonth: integer("average_usage_per_month"),
  serviceIntervalKms: integer("service_interval_kms"),
  serviceIntervalMonths: integer("service_interval_months"),
  vehicleType: text("vehicle_type").notNull(), // "2-wheeler", "3-wheeler", "4-wheeler" - REQUIRED
  fuelType: text("fuel_type"), // "petrol", "diesel", "electric", "hybrid"
  userType: text("user_type").notNull().default("Private"), // "Private", "Commercial", "Taxi services" - REQUIRED
  // OCR extracted insurance data
  ocrPolicyNumber: text("ocr_policy_number"),
  ocrSumInsured: text("ocr_sum_insured"),
  ocrPremiumAmount: text("ocr_premium_amount"),
  ocrInsuredName: text("ocr_insured_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  type: text("type").notNull(), // 'rc', 'insurance', 'emission', 'license', 'other'
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  scheduleData: jsonb("schedule_data").notNull(), // Store maintenance schedule JSON from APIs
  source: text("source").notNull(), // 'vehicledatabases.com', 'oem', 'manual'
  drivingCondition: text("driving_condition").notNull(), // 'normal', 'severe'
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsItems = pgTable("news_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(), // 'policy', 'launch', 'news'
  date: text("date").notNull(),
  source: text("source").notNull(),
  link: text("link").notNull(),
  priority: text("priority").notNull(), // 'high', 'medium', 'low'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const newsUpdateLog = pgTable("news_update_log", {
  id: serial("id").primaryKey(),
  updateType: text("update_type").notNull(), // 'scheduled', 'manual', 'api'
  source: text("source").notNull(), // 'perplexity', 'fallback'
  itemsUpdated: integer("items_updated").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  maintenanceType: text("maintenance_type").notNull(), // 'oil_change', 'tire_change', 'battery_replacement', etc.
  completedDate: date("completed_date"),
  warrantyCardPath: text("warranty_card_path"), // Path to uploaded warranty card image
  invoicePath: text("invoice_path"), // Path to uploaded invoice image
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serviceLogs = pgTable("service_logs", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  serviceType: text("service_type").notNull(), // Type of service performed
  serviceDate: date("service_date").notNull(),
  serviceCentre: text("service_centre").notNull(),
  billAmount: integer("bill_amount"), // Service bill amount in paise (₹100 = 10000 paise)
  serviceIntervalMonths: integer("service_interval_months"), // Months to next service (only for General Service (Paid))
  notes: text("notes"),
  invoicePath: text("invoice_path"), // Path to uploaded invoice image
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serviceAlerts = pgTable("service_alerts", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  eventName: text("event_name").notNull(), // Name of the scheduled service/event
  scheduledDate: date("scheduled_date").notNull(), // When the service is scheduled
  notes: text("notes"), // Short notes about the alert
  isActive: boolean("is_active").default(true).notNull(), // Whether alert is active
  isCompleted: boolean("is_completed").default(false).notNull(), // Whether the service was completed
  notificationSent: boolean("notification_sent").default(false).notNull(), // Whether 1-day prior notification was sent
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Subscription and Payment Management Tables
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Reference to users table
  subscriptionType: text("subscription_type").notNull().default("premium"), // "premium", "basic"
  subscriptionDate: timestamp("subscription_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  amount: integer("amount").notNull().default(10000), // Amount in paise (₹100 = 10000 paise)
  currency: text("currency").notNull().default("INR"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentHistory = pgTable("payment_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Reference to users table
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  amount: integer("amount").notNull(), // Amount in paise
  currency: text("currency").notNull().default("INR"),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpayOrderId: text("razorpay_order_id"),
  transactionId: text("transaction_id"),
  paymentStatus: text("payment_status").notNull(), // "success", "failed", "pending"
  paymentMethod: text("payment_method"), // "card", "netbanking", "upi", "wallet"
  invoiceGenerated: boolean("invoice_generated").default(false).notNull(),
  invoicePath: text("invoice_path"), // Path to generated invoice PDF
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Account Information table for comprehensive user account tracking
export const accountInformation = pgTable("account_information", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountType: text("account_type").notNull().default("individual"), // "individual", "business"
  subscriptionPlan: text("subscription_plan").notNull().default("premium"), // "free", "premium"
  accountStatus: text("account_status").notNull().default("active"), // "active", "suspended", "deactivated"
  totalSubscriptionPayments: integer("total_subscription_payments").notNull().default(0),
  totalAmountPaid: integer("total_amount_paid").notNull().default(0), // Total in paise
  lastPaymentDate: timestamp("last_payment_date"),
  nextBillingDate: timestamp("next_billing_date"),
  autoRenewal: boolean("auto_renewal").default(false).notNull(),
  billingAddress: text("billing_address"),
  gstNumber: text("gst_number"), // For business accounts
  panNumber: text("pan_number"), // For tax compliance
  preferredPaymentMethod: text("preferred_payment_method"), // "card", "upi", "netbanking"
  accountNotes: text("account_notes"), // Admin notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invoice Management table for detailed invoice tracking
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  paymentId: integer("payment_id").references(() => paymentHistory.id),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  invoiceNumber: text("invoice_number").notNull().unique(), // INV-2025-001
  invoiceType: text("invoice_type").notNull().default("subscription"), // "subscription", "renewal", "upgrade"
  invoiceStatus: text("invoice_status").notNull().default("generated"), // "generated", "sent", "paid", "overdue", "cancelled"
  invoiceDate: timestamp("invoice_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  amount: integer("amount").notNull(), // Amount in paise
  taxAmount: integer("tax_amount").notNull().default(0), // GST/Tax in paise
  totalAmount: integer("total_amount").notNull(), // Total including tax in paise
  currency: text("currency").notNull().default("INR"),
  description: text("description").notNull(), // "Myymotto Premium Subscription - 1 Year"
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address"),
  invoiceFilePath: text("invoice_file_path"), // PDF file path
  downloadCount: integer("download_count").notNull().default(0),
  lastDownloaded: timestamp("last_downloaded"),
  emailSent: boolean("email_sent").default(false).notNull(),
  emailSentAt: timestamp("email_sent_at"),
  remindersSent: integer("reminders_sent").notNull().default(0),
  lastReminderSent: timestamp("last_reminder_sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptionNotifications = pgTable("subscription_notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  notificationType: text("notification_type").notNull(), // "expiry_warning", "expired", "renewal_reminder"
  sentDate: timestamp("sent_date").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Document Expiry Tracking Table for Road Tax, Fitness Certificate, Travel Permits
export const documentExpiries = pgTable("document_expiries", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  documentType: text("document_type").notNull(), // "road_tax", "fitness_certificate", "travel_permits", "emission"
  expiryDate: date("expiry_date").notNull(),
  amount: integer("amount"), // Amount paid for document in paise
  issueDate: date("issue_date"),
  reminderSent: boolean("reminder_sent").default(false).notNull(),
  lastReminderDate: timestamp("last_reminder_date"),
  isActive: boolean("is_active").default(true).notNull(), // False when renewed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
}).extend({
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, "License plate is required"),
  chassisNumber: z.string().optional().nullable(),
  engineNumber: z.string().optional().nullable(),
  ownerName: z.string().min(1, "Owner name is required"),
  ownerPhone: z.string().optional().nullable(),
  thumbnailPath: z.string().optional().nullable(),
  insuranceCompany: z.string().optional().nullable(),
  insuranceExpiry: z.string().optional().nullable(), // Insurance expiry can be in future
  insuranceExpiryDate: z.string().optional().nullable(),
  insuranceSumInsured: z.string().optional().nullable(),
  insurancePremiumAmount: z.string().optional().nullable(),
  emissionExpiry: z.string().optional().nullable().refine((date) => {
    if (!date) return true; // Allow empty/null dates
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    return selectedDate <= today;
  }, "Emission date cannot be in the future"),
  rcExpiry: z.string().optional().nullable(), // RC expiry can be in future
  lastServiceDate: z.string().optional().nullable().refine((date) => {
    if (!date) return true; // Allow empty/null dates
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    return selectedDate <= today;
  }, "Last service date cannot be in the future"),
  currentOdometerReading: z.number().optional().nullable(),
  averageUsagePerMonth: z.number().optional().nullable(),
  serviceIntervalKms: z.number().optional().nullable(),
  serviceIntervalMonths: z.number().optional().nullable(),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  fuelType: z.string().optional().nullable(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertMaintenanceScheduleSchema = createInsertSchema(maintenanceSchedules).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  completedDate: z.string().optional().nullable(),
});

export const insertServiceLogSchema = createInsertSchema(serviceLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  serviceDate: z.string().min(1, "Service date is required"),
  serviceType: z.string().min(1, "Service type is required"),
  serviceCentre: z.string().min(1, "Service centre is required"),
});

export const insertDocumentExpirySchema = createInsertSchema(documentExpiries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiryDate: z.string().min(1, "Expiry date is required"),
  issueDate: z.string().optional().nullable(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertMaintenanceSchedule = z.infer<typeof insertMaintenanceScheduleSchema>;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;
export type ServiceLog = typeof serviceLogs.$inferSelect;
export type InsertServiceLog = z.infer<typeof insertServiceLogSchema>;
export type DocumentExpiry = typeof documentExpiries.$inferSelect;
export type InsertDocumentExpiry = z.infer<typeof insertDocumentExpirySchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  mobile: text("mobile"),
  isVerified: boolean("is_verified").default(false).notNull(),
  pin: text("pin"), // 4-6 digit PIN for quick login
  biometricEnabled: boolean("biometric_enabled").default(false).notNull(),
  subscriptionStatus: text("subscription_status").default("free"), // free, active, expired
  subscriptionExpiry: timestamp("subscription_expiry"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  isAdmin: boolean("is_admin").default(false), // Admin access flag
  adminRole: text("admin_role").default("user"), // 'user', 'admin', 'super_admin'
  isBlocked: boolean("is_blocked").default(false), // User blocking status
  blockedAt: timestamp("blocked_at"), // When user was blocked
  blockedReason: text("blocked_reason"), // Reason for blocking
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull(), // mobile or email
  otp: text("otp").notNull(),
  type: text("type").notNull(), // 'mobile' or 'email'
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender"), // "male", "female", "other", "prefer_not_to_say"
  address: text("address").notNull(),
  bloodGroup: text("blood_group").notNull(),
  state: text("state").notNull(),
  city: text("city").notNull(),
  pinCode: text("pin_code").notNull(),
  alternatePhone: text("alternate_phone"),
  email: text("email").notNull(),
  profilePicture: text("profile_picture"),
  driversLicenseNumber: text("drivers_license_number"),
  driversLicenseCopy: text("drivers_license_copy"),
  driversLicenseValidTill: date("drivers_license_valid_till"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dashboard widget configuration for customizable layout
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  widgetType: text("widget_type").notNull(), // "stats", "quick_actions", "recent_vehicles", "news", "reminders"
  position: integer("position").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  size: text("size").default("medium"), // "small", "medium", "large"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ratings table for user feedback and ratings
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  userName: text("user_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  emailId: text("email_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  feedback: text("feedback"), // optional feedback text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  mobile: true,
});

export const signInSchema = z.object({
  identifier: z.string().min(1, "Mobile number or email is required"),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(1, "Mobile number or email is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const setPinSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
  confirmPin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
}).refine(data => data.pin === data.confirmPin, {
  message: "PINs don't match",
  path: ["confirmPin"],
});

export const pinLoginSchema = z.object({
  identifier: z.string().min(1, "Mobile number or email is required"),
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
});

export const biometricSetupSchema = z.object({
  enabled: z.boolean(),
});

export const insertOtpSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(1, "Age must be greater than 0").max(120, "Age must be reasonable"),
  gender: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pinCode: z.string().min(6, "Pin code must be at least 6 digits").max(6, "Pin code must be 6 digits"),
  alternatePhone: z.string().optional(),
  email: z.string().email("Please enter a valid email address").min(1, "Email address is required"),
  profilePicture: z.string().optional().nullable(),
  driversLicenseNumber: z.string().optional(),
  driversLicenseCopy: z.string().optional().nullable(),
  driversLicenseValidTill: z.string().optional().nullable(),
});

export const insertServiceAlertSchema = createInsertSchema(serviceAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  eventName: z.string().min(1, "Event name is required"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  notes: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type VerifyOtpData = z.infer<typeof verifyOtpSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpSchema>;
export type ServiceAlert = typeof serviceAlerts.$inferSelect;
export type InsertServiceAlert = z.infer<typeof insertServiceAlertSchema>;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  type: text("type").notNull(), // 'insurance', 'emission', 'service'
  title: text("title").notNull(),
  message: text("message").notNull(),
  dueDate: date("due_date").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Emergency Contacts table
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  // Emergency Contact
  emergencyName: text("emergency_name"),
  emergencyPhone: text("emergency_phone"),
  // Insurance Company
  insuranceName: text("insurance_name"),
  insurancePhone: text("insurance_phone"),
  // Roadside Assistance
  roadsidePhone: text("roadside_phone"),
  // Service Centre
  serviceCentreName: text("service_centre_name"),
  serviceCentrePhone: text("service_centre_phone"),
  // Spare Parts Provider
  sparePartsName: text("spare_parts_name"),
  sparePartsPhone: text("spare_parts_phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;

export const insertRatingSchema = createInsertSchema(ratings, {
  rating: z.number().min(1).max(5),
  userName: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  emailId: z.string().email("Valid email is required"),
  feedback: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
});

// Broadcasts table for buy/sell/queries
export const broadcasts = pgTable("broadcasts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // "sell", "buy", "query"
  title: text("title").notNull(),
  description: text("description").notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id), // Only for sell type
  price: integer("price"), // For sell/buy posts, in rupees
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email"),
  location: text("location"), // City/area
  status: text("status").default("active").notNull(), // "active", "sold", "resolved", "expired"
  viewCount: integer("view_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"), // Auto-expire posts after certain time
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Broadcast responses/comments table
export const broadcastResponses = pgTable("broadcast_responses", {
  id: serial("id").primaryKey(),
  broadcastId: integer("broadcast_id").references(() => broadcasts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBroadcastSchema = createInsertSchema(broadcasts).omit({
  id: true,
  userId: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  price: z.number().optional().nullable(),
  contactPhone: z.string().min(10, "Valid contact phone is required"),
  contactEmail: z.string().email("Valid email is required").optional(),
  location: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
});

export const insertBroadcastResponseSchema = createInsertSchema(broadcastResponses).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  message: z.string().min(1, "Message is required").max(300, "Message must be less than 300 characters"),
  contactPhone: z.string().min(10, "Valid contact phone is required").optional(),
  contactEmail: z.string().email("Valid email is required").optional(),
});

export type Broadcast = typeof broadcasts.$inferSelect;
export type InsertBroadcast = z.infer<typeof insertBroadcastSchema>;
export type BroadcastResponse = typeof broadcastResponses.$inferSelect;
export type InsertBroadcastResponse = z.infer<typeof insertBroadcastResponseSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

// Traffic violations schema
export const trafficViolations = pgTable("traffic_violations", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  challanNumber: text("challan_number").notNull(),
  offense: text("offense").notNull(),
  fineAmount: integer("fine_amount").notNull(),
  violationDate: date("violation_date").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull(), // 'paid', 'unpaid', 'pending'
  paymentDate: date("payment_date"),
  lastChecked: timestamp("last_checked").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTrafficViolationSchema = createInsertSchema(trafficViolations).omit({
  id: true,
  createdAt: true,
});

export type TrafficViolation = typeof trafficViolations.$inferSelect;
export type InsertTrafficViolation = z.infer<typeof insertTrafficViolationSchema>;

// Subscription and Payment types
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentHistorySchema = createInsertSchema(paymentHistory).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionNotificationSchema = createInsertSchema(subscriptionNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertAccountInformationSchema = createInsertSchema(accountInformation).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.number().min(1, "User ID is required"),
  accountType: z.string().default("individual"),
  subscriptionPlan: z.string().default("premium"),
  accountStatus: z.string().default("active"),
  billingAddress: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  preferredPaymentMethod: z.string().optional(),
  accountNotes: z.string().optional(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.number().min(1, "User ID is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  totalAmount: z.number().min(1, "Total amount must be greater than 0"),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  description: z.string().min(1, "Description is required"),
  billingPeriodStart: z.string().min(1, "Billing period start is required"),
  billingPeriodEnd: z.string().min(1, "Billing period end is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = z.infer<typeof insertPaymentHistorySchema>;
export type SubscriptionNotification = typeof subscriptionNotifications.$inferSelect;
export type InsertSubscriptionNotification = z.infer<typeof insertSubscriptionNotificationSchema>;
export type AccountInformation = typeof accountInformation.$inferSelect;
export type InsertAccountInformation = z.infer<typeof insertAccountInformationSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export const insertNewsItemSchema = createInsertSchema(newsItems).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;
export type NewsItem = typeof newsItems.$inferSelect;

export const insertNewsUpdateLogSchema = createInsertSchema(newsUpdateLog).omit({
  id: true,
  lastUpdated: true,
});

export type InsertNewsUpdateLog = z.infer<typeof insertNewsUpdateLogSchema>;
export type NewsUpdateLog = typeof newsUpdateLog.$inferSelect;

// Dashboard widget types and schema
export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;

// Admin daily messages table for greetings and announcements
export const adminMessages = pgTable("admin_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  messageDate: date("message_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminMessageSchema = createInsertSchema(adminMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AdminMessage = typeof adminMessages.$inferSelect;
export type InsertAdminMessage = z.infer<typeof insertAdminMessageSchema>;
