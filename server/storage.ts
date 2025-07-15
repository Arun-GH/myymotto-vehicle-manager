import { vehicles, documents, users, userProfiles, type Vehicle, type InsertVehicle, type Document, type InsertDocument, type User, type InsertUser, type UserProfile, type InsertUserProfile } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  private currentUserId: number;
  private currentUserProfileId: number;
  private currentVehicleId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.vehicles = new Map();
    this.documents = new Map();
    this.currentUserId = 1;
    this.currentUserProfileId = 1;
    this.currentVehicleId = 1;
    this.currentDocumentId = 1;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
      ownerPhone: insertVehicle.ownerPhone || null,
      insuranceExpiry: insertVehicle.insuranceExpiry || null,
      emissionExpiry: insertVehicle.emissionExpiry || null,
      rcExpiry: insertVehicle.rcExpiry || null,
      serviceDate: insertVehicle.serviceDate || null,
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

export const storage = new MemStorage();
