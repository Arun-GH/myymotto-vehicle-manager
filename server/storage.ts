import { vehicles, documents, users, userProfiles, otpVerifications, type Vehicle, type InsertVehicle, type Document, type InsertDocument, type User, type InsertUser, type UserProfile, type InsertUserProfile, type OtpVerification, type InsertOtpVerification } from "@shared/schema";
import { db } from "./db";
import { eq, and, gt } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // OTP methods
  createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification>;
  getValidOtp(identifier: string, otp: string): Promise<OtpVerification | undefined>;
  markOtpAsUsed(id: number): Promise<void>;
  
  // User Profile methods
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile & { userId: number }): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // Vehicle methods
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  
  // Document methods
  getDocumentsByVehicle(vehicleId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userProfiles: Map<number, UserProfile>;
  private vehicles: Map<number, Vehicle>;
  private documents: Map<number, Document>;
  private otpVerifications: Map<number, OtpVerification>;
  private currentUserId: number;
  private currentUserProfileId: number;
  private currentVehicleId: number;
  private currentDocumentId: number;
  private currentOtpId: number;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.vehicles = new Map();
    this.documents = new Map();
    this.otpVerifications = new Map();
    this.currentUserId = 1;
    this.currentUserProfileId = 1;
    this.currentVehicleId = 1;
    this.currentDocumentId = 1;
    this.currentOtpId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      email: insertUser.email || null,
      mobile: insertUser.mobile || null,
      isVerified: false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => 
      user.email === identifier || user.mobile === identifier || user.username === identifier
    );
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated: User = { ...existing, ...userUpdate };
    this.users.set(id, updated);
    return updated;
  }

  async createOtpVerification(insertOtp: InsertOtpVerification): Promise<OtpVerification> {
    const id = this.currentOtpId++;
    const otp: OtpVerification = {
      ...insertOtp,
      id,
      isUsed: insertOtp.isUsed || false,
      createdAt: new Date()
    };
    this.otpVerifications.set(id, otp);
    return otp;
  }

  async getValidOtp(identifier: string, otpCode: string): Promise<OtpVerification | undefined> {
    const otps = Array.from(this.otpVerifications.values());
    return otps.find(otp => 
      otp.identifier === identifier && 
      otp.otp === otpCode && 
      !otp.isUsed && 
      otp.expiresAt > new Date()
    );
  }

  async markOtpAsUsed(id: number): Promise<void> {
    const otp = this.otpVerifications.get(id);
    if (otp) {
      otp.isUsed = true;
      this.otpVerifications.set(id, otp);
    }
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createUserProfile(insertProfile: InsertUserProfile & { userId: number }): Promise<UserProfile> {
    const id = this.currentUserProfileId++;
    const profile: UserProfile = {
      ...insertProfile,
      alternatePhone: insertProfile.alternatePhone || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userProfiles.set(id, profile);
    return profile;
  }

  async updateUserProfile(userId: number, profileUpdate: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existing = await this.getUserProfile(userId);
    if (!existing) return undefined;
    
    const updated: UserProfile = { 
      ...existing, 
      ...profileUpdate,
      updatedAt: new Date(),
    };
    this.userProfiles.set(existing.id, updated);
    return updated;
  }

  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const vehicle: Vehicle = { 
      ...insertVehicle,
      chassisNumber: insertVehicle.chassisNumber || null,
      engineNumber: insertVehicle.engineNumber || null,
      ownerPhone: insertVehicle.ownerPhone || null,
      thumbnailPath: insertVehicle.thumbnailPath || null,
      insuranceExpiry: insertVehicle.insuranceExpiry || null,
      emissionExpiry: insertVehicle.emissionExpiry || null,
      rcExpiry: insertVehicle.rcExpiry || null,
      lastServiceDate: insertVehicle.lastServiceDate || null,
      id, 
      createdAt: new Date() 
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: number, vehicleUpdate: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const existing = this.vehicles.get(id);
    if (!existing) return undefined;
    
    const updated: Vehicle = { ...existing, ...vehicleUpdate };
    this.vehicles.set(id, updated);
    return updated;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    // Also delete associated documents
    const vehicleDocuments = Array.from(this.documents.values())
      .filter(doc => doc.vehicleId === id);
    
    vehicleDocuments.forEach(doc => this.documents.delete(doc.id));
    
    return this.vehicles.delete(id);
  }

  async getDocumentsByVehicle(vehicleId: number): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = { 
      ...insertDocument, 
      id, 
      uploadedAt: new Date() 
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      eq(users.username, identifier)
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userUpdate).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async createOtpVerification(insertOtp: InsertOtpVerification): Promise<OtpVerification> {
    const [otp] = await db.insert(otpVerifications).values(insertOtp).returning();
    return otp;
  }

  async getValidOtp(identifier: string, otpCode: string): Promise<OtpVerification | undefined> {
    const [otp] = await db.select().from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.identifier, identifier),
          eq(otpVerifications.otp, otpCode),
          eq(otpVerifications.isUsed, false),
          gt(otpVerifications.expiresAt, new Date())
        )
      );
    return otp || undefined;
  }

  async markOtpAsUsed(id: number): Promise<void> {
    await db.update(otpVerifications).set({ isUsed: true }).where(eq(otpVerifications.id, id));
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(insertProfile: InsertUserProfile & { userId: number }): Promise<UserProfile> {
    const [profile] = await db.insert(userProfiles).values(insertProfile).returning();
    return profile;
  }

  async updateUserProfile(userId: number, profileUpdate: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [profile] = await db.update(userProfiles).set(profileUpdate).where(eq(userProfiles.userId, userId)).returning();
    return profile || undefined;
  }

  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async updateVehicle(id: number, vehicleUpdate: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db.update(vehicles).set(vehicleUpdate).where(eq(vehicles.id, id)).returning();
    return vehicle || undefined;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getDocumentsByVehicle(vehicleId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.vehicleId, vehicleId));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
