import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
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
  insuranceExpiry: date("insurance_expiry"),
  emissionExpiry: date("emission_expiry"),
  rcExpiry: date("rc_expiry"),
  lastServiceDate: date("last_service_date"),
  currentOdometerReading: integer("current_odometer_reading"),
  averageUsagePerMonth: integer("average_usage_per_month"),
  serviceIntervalKms: integer("service_interval_kms"),
  serviceIntervalMonths: integer("service_interval_months"),
  vehicleType: text("vehicle_type"), // "2-wheeler", "3-wheeler", "4-wheeler"
  fuelType: text("fuel_type"), // "petrol", "diesel", "electric", "hybrid"
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

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
}).extend({
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, "License plate is required"),
  chassisNumber: z.string().optional(),
  engineNumber: z.string().optional(),
  ownerName: z.string().min(1, "Owner name is required"),
  ownerPhone: z.string().optional(),
  thumbnailPath: z.string().optional().nullable(),
  insuranceCompany: z.string().optional(),
  insuranceExpiry: z.string().optional().nullable(),
  emissionExpiry: z.string().optional().nullable(),
  rcExpiry: z.string().optional().nullable(),
  lastServiceDate: z.string().optional().nullable(),
  currentOdometerReading: z.number().optional().nullable(),
  averageUsagePerMonth: z.number().optional().nullable(),
  serviceIntervalKms: z.number().optional().nullable(),
  serviceIntervalMonths: z.number().optional().nullable(),
  vehicleType: z.string().optional(),
  fuelType: z.string().optional(),
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

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertMaintenanceSchedule = z.infer<typeof insertMaintenanceScheduleSchema>;

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
  address: text("address").notNull(),
  bloodGroup: text("blood_group").notNull(),
  state: text("state").notNull(),
  city: text("city").notNull(),
  pinCode: text("pin_code").notNull(),
  alternatePhone: text("alternate_phone"),
  profilePicture: text("profile_picture"),
  driversLicenseNumber: text("drivers_license_number"),
  driversLicenseCopy: text("drivers_license_copy"),
  driversLicenseValidTill: date("drivers_license_valid_till"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  address: z.string().min(1, "Address is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pinCode: z.string().min(6, "Pin code must be at least 6 digits").max(6, "Pin code must be 6 digits"),
  alternatePhone: z.string().optional(),
  profilePicture: z.string().optional().nullable(),
  driversLicenseNumber: z.string().optional(),
  driversLicenseCopy: z.string().optional().nullable(),
  driversLicenseValidTill: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type VerifyOtpData = z.infer<typeof verifyOtpSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpSchema>;

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
