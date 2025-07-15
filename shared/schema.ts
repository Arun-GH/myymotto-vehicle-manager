import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  color: text("color").notNull(),
  licensePlate: text("license_plate").notNull().unique(),
  chassisNumber: text("chassis_number").notNull(),
  engineNumber: text("engine_number").notNull(),
  ownerName: text("owner_name").notNull(),
  ownerPhone: text("owner_phone"),
  thumbnailPath: text("thumbnail_path"),
  insuranceExpiry: date("insurance_expiry"),
  emissionExpiry: date("emission_expiry"),
  rcExpiry: date("rc_expiry"),
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

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
}).extend({
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, "License plate is required"),
  chassisNumber: z.string().min(1, "Chassis number is required"),
  engineNumber: z.string().min(1, "Engine number is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  ownerPhone: z.string().optional(),
  thumbnailPath: z.string().optional().nullable(),
  insuranceExpiry: z.string().optional().nullable(),
  emissionExpiry: z.string().optional().nullable(),
  rcExpiry: z.string().optional().nullable(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  mobile: text("mobile"),
  isVerified: boolean("is_verified").default(false).notNull(),
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
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type VerifyOtpData = z.infer<typeof verifyOtpSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpSchema>;
