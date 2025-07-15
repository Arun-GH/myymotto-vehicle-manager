import { vehicles, documents, users, type Vehicle, type InsertVehicle, type Document, type InsertDocument, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  private vehicles: Map<number, Vehicle>;
  private documents: Map<number, Document>;
  private currentUserId: number;
  private currentVehicleId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.documents = new Map();
    this.currentUserId = 1;
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
