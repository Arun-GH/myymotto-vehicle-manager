import { vehicles, documents, users, userProfiles, otpVerifications, notifications, emergencyContacts, trafficViolations, maintenanceSchedules, maintenanceRecords, serviceLogs, serviceAlerts, newsItems, newsUpdateLog, dashboardWidgets, ratings, broadcasts, broadcastResponses, adminMessages, accountInformation, invoices, type Vehicle, type InsertVehicle, type Document, type InsertDocument, type User, type InsertUser, type UserProfile, type InsertUserProfile, type OtpVerification, type InsertOtpVerification, type Notification, type InsertNotification, type EmergencyContact, type InsertEmergencyContact, type TrafficViolation, type InsertTrafficViolation, type MaintenanceSchedule, type InsertMaintenanceSchedule, type MaintenanceRecord, type InsertMaintenanceRecord, type ServiceLog, type InsertServiceLog, type ServiceAlert, type InsertServiceAlert, type NewsItem, type InsertNewsItem, type NewsUpdateLog, type InsertNewsUpdateLog, type DashboardWidget, type InsertDashboardWidget, type Rating, type InsertRating, type Broadcast, type InsertBroadcast, type BroadcastResponse, type InsertBroadcastResponse, type AdminMessage, type InsertAdminMessage, type AccountInformation, type InsertAccountInformation, type Invoice, type InsertInvoice } from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, lte, lt, desc, gte, isNull, or, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  verifyPin(identifier: string, pin: string): Promise<User | undefined>;
  updateUserPin(id: number, pin: string): Promise<User | undefined>;
  updateBiometricSetting(id: number, enabled: boolean): Promise<User | undefined>;
  
  // OTP methods
  createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification>;
  getValidOtp(identifier: string, otp: string): Promise<OtpVerification | undefined>;
  markOtpAsUsed(id: number): Promise<void>;
  
  // User Profile methods
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile & { userId: number }): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // Vehicle methods
  getVehicles(userId: number): Promise<Vehicle[]>;
  getVehicle(id: number, userId: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle & { userId: number }): Promise<Vehicle>;
  updateVehicle(id: number, userId: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number, userId: number): Promise<boolean>;
  
  // Document methods
  getDocumentsByVehicle(vehicleId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  getNotificationsByVehicle(vehicleId: number, userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  generateRenewalNotifications(userId: number): Promise<void>;
  
  // Emergency Contact methods
  getEmergencyContact(userId: number): Promise<EmergencyContact | undefined>;
  createEmergencyContact(contact: InsertEmergencyContact & { userId: number }): Promise<EmergencyContact>;
  updateEmergencyContact(userId: number, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined>;
  
  // Traffic Violation methods
  getTrafficViolations(vehicleId: number): Promise<TrafficViolation[]>;
  createTrafficViolation(violation: InsertTrafficViolation): Promise<TrafficViolation>;
  updateTrafficViolationStatus(violationId: number, status: string, paymentDate?: string): Promise<TrafficViolation | undefined>;
  deleteTrafficViolation(violationId: number): Promise<boolean>;
  
  // Maintenance Schedule methods
  getMaintenanceSchedule(make: string, model: string, year: number, drivingCondition: string): Promise<MaintenanceSchedule | undefined>;
  createMaintenanceSchedule(schedule: InsertMaintenanceSchedule): Promise<MaintenanceSchedule>;
  updateMaintenanceSchedule(id: number, schedule: Partial<InsertMaintenanceSchedule>): Promise<MaintenanceSchedule | undefined>;

  // Maintenance Record methods
  getMaintenanceRecords(vehicleId: number): Promise<MaintenanceRecord[]>;
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  createMaintenanceRecord(record: InsertMaintenanceRecord & { warrantyCardPath?: string | null; invoicePath?: string | null }): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | undefined>;
  deleteMaintenanceRecord(id: number): Promise<boolean>;
  
  // Service Log methods
  getServiceLogs(vehicleId: number): Promise<ServiceLog[]>;
  getServiceLog(id: number): Promise<ServiceLog | undefined>;
  createServiceLog(serviceLog: InsertServiceLog): Promise<ServiceLog>;
  updateServiceLog(id: number, serviceLog: Partial<InsertServiceLog>): Promise<ServiceLog | undefined>;
  deleteServiceLog(id: number): Promise<boolean>;

  // Service Alert methods
  getServiceAlerts(vehicleId: number): Promise<ServiceAlert[]>;
  getServiceAlert(id: number): Promise<ServiceAlert | undefined>;
  createServiceAlert(serviceAlert: InsertServiceAlert): Promise<ServiceAlert>;
  updateServiceAlert(id: number, serviceAlert: Partial<InsertServiceAlert>): Promise<ServiceAlert | undefined>;
  deleteServiceAlert(id: number): Promise<boolean>;
  getActiveServiceAlerts(): Promise<ServiceAlert[]>;
  
  // News methods
  getNewsItems(): Promise<NewsItem[]>;
  createNewsItem(newsItem: InsertNewsItem): Promise<NewsItem>;
  updateNewsItem(id: number, newsItem: Partial<InsertNewsItem>): Promise<NewsItem | undefined>;
  deleteNewsItem(id: number): Promise<boolean>;
  clearAllNews(): Promise<void>;
  createNewsUpdateLog(log: InsertNewsUpdateLog): Promise<NewsUpdateLog>;
  getLastNewsUpdate(): Promise<NewsUpdateLog | undefined>;

  // Dashboard Widget methods
  getDashboardWidgets(userId: number): Promise<DashboardWidget[]>;
  createDashboardWidget(widget: InsertDashboardWidget): Promise<DashboardWidget>;
  updateDashboardWidget(id: number, updates: Partial<InsertDashboardWidget>): Promise<DashboardWidget>;
  deleteDashboardWidget(id: number): Promise<void>;
  initializeDefaultWidgets(userId: number): Promise<DashboardWidget[]>;

  // Rating methods
  createRating(rating: InsertRating & { userId: number }): Promise<Rating>;
  getRatings(): Promise<Rating[]>;
  getUserRatings(userId: number): Promise<Rating[]>;

  // Broadcast methods
  getBroadcasts(): Promise<Broadcast[]>;
  getBroadcast(id: number): Promise<Broadcast | undefined>;
  createBroadcast(broadcast: InsertBroadcast & { userId: number }): Promise<Broadcast>;
  updateBroadcast(id: number, broadcast: Partial<InsertBroadcast>): Promise<Broadcast | undefined>;
  deleteBroadcast(id: number, userId: number): Promise<boolean>;
  getBroadcastsByType(type: string): Promise<Broadcast[]>;
  incrementBroadcastViews(id: number): Promise<void>;
  cleanupExpiredBroadcasts(): Promise<number>;
  getUserActiveBroadcastCount(userId: number): Promise<number>;

  // Broadcast Response methods
  getBroadcastResponses(broadcastId: number): Promise<BroadcastResponse[]>;
  createBroadcastResponse(response: InsertBroadcastResponse & { userId: number }): Promise<BroadcastResponse>;
  markResponseAsRead(id: number): Promise<void>;
  
  // Admin methods
  getAdminStats(): Promise<any>;
  getRecentUsers(limit?: number): Promise<User[]>;
  getRecentVehicles(limit?: number): Promise<Vehicle[]>;
  getRecentBroadcasts(limit?: number): Promise<Broadcast[]>;
  getRecentRatings(limit?: number): Promise<Rating[]>;
  getAllUsersData(): Promise<User[]>;
  getAllVehiclesData(): Promise<Vehicle[]>;
  getAllBroadcastsData(): Promise<Broadcast[]>;
  getAllRatingsData(): Promise<Rating[]>;
  
  // Subscription Management methods
  getCurrentSubscription(userId: string): Promise<any>;
  getPaymentHistory(userId: string): Promise<any[]>;
  createSubscription(subscription: any): Promise<any>;
  createPaymentRecord(payment: any): Promise<any>;
  getPaymentById(paymentId: number): Promise<any>;
  getActiveSubscriptions(): Promise<any[]>;
  getRecentSubscriptionNotification(userId: string, type: string): Promise<any>;
  createSubscriptionNotification(notification: any): Promise<any>;
  deactivateSubscription(subscriptionId: number): Promise<void>;
  
  // Push notification methods
  registerPushToken(userId: string, token: string, platform: string): Promise<void>;
  getUserPushTokens(userId: string): Promise<string[]>;
  
  // Admin message methods
  createAdminMessage(message: InsertAdminMessage): Promise<AdminMessage>;
  getTodaysAdminMessage(): Promise<AdminMessage | undefined>;
  updateAdminMessage(id: number, message: Partial<InsertAdminMessage>): Promise<AdminMessage | undefined>;
  deleteAdminMessage(id: number): Promise<boolean>;
  
  // Account Information methods
  getAccountInformation(userId: number): Promise<AccountInformation | undefined>;
  createAccountInformation(account: InsertAccountInformation): Promise<AccountInformation>;
  updateAccountInformation(userId: number, account: Partial<InsertAccountInformation>): Promise<AccountInformation | undefined>;
  getAllAccountInformation(): Promise<AccountInformation[]>;
  
  // Invoice Management methods
  getInvoices(userId: number): Promise<Invoice[]>;
  getAllInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  generateInvoiceNumber(): Promise<string>;
  markInvoiceAsPaid(id: number, paymentDate: Date): Promise<Invoice | undefined>;
  getInvoicesByDateRange(startDate: Date, endDate: Date): Promise<Invoice[]>;
  getOverdueInvoices(): Promise<Invoice[]>;
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

  async verifyPin(identifier: string, pin: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if ((user.mobile === identifier || user.email === identifier) && user.pin === pin) {
        return user;
      }
    }
    return undefined;
  }

  async updateUserPin(id: number, pin: string): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated: User = { ...existing, pin };
    this.users.set(id, updated);
    return updated;
  }

  async updateBiometricSetting(id: number, enabled: boolean): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated: User = { ...existing, biometricEnabled: enabled };
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
    const profile = Array.from(this.userProfiles.values()).find(
      (profile) => profile.userId === userId
    );
    
    // Grant admin access to user with mobile 9880105082
    if (profile && (profile.alternatePhone === '+919880105082' || profile.alternatePhone === '9880105082')) {
      profile.isAdmin = true;
    }
    
    return profile;
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

  // Notification methods (stub implementations for MemStorage)
  async getNotifications(): Promise<Notification[]> {
    return [];
  }

  async getNotificationsByVehicle(vehicleId: number): Promise<Notification[]> {
    return [];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = {
      id: 1,
      vehicleId: notification.vehicleId || null,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      dueDate: notification.dueDate,
      isRead: notification.isRead || false,
      createdAt: new Date()
    };
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    // Stub implementation
  }

  async generateRenewalNotifications(): Promise<void> {
    const currentDate = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(currentDate.getMonth() + 1);

    const vehicles = await this.getVehicles();
    
    for (const vehicle of vehicles) {
      // Check insurance renewal (when 10 months or more have passed since issuance)
      if (vehicle.insuranceExpiry) {
        const insuranceIssuanceDate = new Date(vehicle.insuranceExpiry);
        const tenMonthsFromIssuance = new Date(insuranceIssuanceDate);
        tenMonthsFromIssuance.setMonth(tenMonthsFromIssuance.getMonth() + 10);
        
        if (currentDate >= tenMonthsFromIssuance) {
          await this.createNotification({
            vehicleId: vehicle.id,
            type: 'insurance',
            title: `Insurance Renewal Due - ${vehicle.make} ${vehicle.model}`,
            message: `Insurance for your ${vehicle.make} ${vehicle.model} was issued on ${insuranceIssuanceDate.toLocaleDateString()}. Time to renew!`,
            dueDate: vehicle.insuranceExpiry,
            isRead: false
          });
        }
      }

      // Check emission renewal (when 5 months or more have passed since emission date)
      if (vehicle.emissionExpiry) {
        const emissionDate = new Date(vehicle.emissionExpiry);
        const fiveMonthsFromEmission = new Date(emissionDate);
        fiveMonthsFromEmission.setMonth(fiveMonthsFromEmission.getMonth() + 5);
        
        if (currentDate >= fiveMonthsFromEmission) {
          await this.createNotification({
            vehicleId: vehicle.id,
            type: 'emission',
            title: `Emission Certificate Renewal Due - ${vehicle.make} ${vehicle.model}`,
            message: `Latest emission certificate for your ${vehicle.make} ${vehicle.model} was from ${emissionDate.toLocaleDateString()}. Time to renew!`,
            dueDate: vehicle.emissionExpiry,
            isRead: false
          });
        }
      }

      // Check RC expiry (when current date is 4 months and less than RC expiry date)
      if (vehicle.rcExpiry) {
        const rcExpiryDate = new Date(vehicle.rcExpiry);
        const fourMonthsBeforeExpiry = new Date(rcExpiryDate);
        fourMonthsBeforeExpiry.setMonth(fourMonthsBeforeExpiry.getMonth() - 4);
        
        if (currentDate >= fourMonthsBeforeExpiry && currentDate < rcExpiryDate) {
          await this.createNotification({
            vehicleId: vehicle.id,
            type: 'rc',
            title: `RC Renewal Due - ${vehicle.make} ${vehicle.model}`,
            message: `Your RC expires on ${rcExpiryDate.toLocaleDateString()}. Renew it before expiry to avoid penalties.`,
            dueDate: vehicle.rcExpiry,
            isRead: false
          });
        }
      }

      // Check last service date for service reminder (every 4 months)
      if (vehicle.lastServiceDate) {
        const lastService = new Date(vehicle.lastServiceDate);
        const nextServiceDue = new Date(lastService);
        nextServiceDue.setMonth(lastService.getMonth() + 4);
        
        if (nextServiceDue <= oneMonthFromNow && nextServiceDue > currentDate) {
          await this.createNotification({
            vehicleId: vehicle.id,
            type: 'service',
            title: `Service Reminder - ${vehicle.make} ${vehicle.model}`,
            message: `Your vehicle is due for service on ${nextServiceDue.toLocaleDateString()}. Book an appointment now.`,
            dueDate: nextServiceDue.toISOString().split('T')[0],
            isRead: false
          });
        }
      }
    }
  }

  // Service Alert methods (stub implementations for MemStorage)
  async getServiceAlerts(vehicleId: number): Promise<ServiceAlert[]> {
    return [];
  }

  async getServiceAlert(id: number): Promise<ServiceAlert | undefined> {
    return undefined;
  }

  async createServiceAlert(serviceAlert: InsertServiceAlert): Promise<ServiceAlert> {
    const newAlert: ServiceAlert = {
      id: 1,
      vehicleId: serviceAlert.vehicleId,
      eventName: serviceAlert.eventName,
      scheduledDate: serviceAlert.scheduledDate,
      notes: serviceAlert.notes || null,
      isActive: serviceAlert.isActive || true,
      isCompleted: serviceAlert.isCompleted || false,
      notificationSent: serviceAlert.notificationSent || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return newAlert;
  }

  async updateServiceAlert(id: number, serviceAlert: Partial<InsertServiceAlert>): Promise<ServiceAlert | undefined> {
    return undefined;
  }

  async deleteServiceAlert(id: number): Promise<boolean> {
    return false;
  }

  async getActiveServiceAlerts(): Promise<ServiceAlert[]> {
    return [];
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

  async verifyPin(identifier: string, pin: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(
        eq(users.username, identifier),
        eq(users.pin, pin)
      )
    );
    return user || undefined;
  }

  async updateUserPin(id: number, pin: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ pin })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateBiometricSetting(id: number, enabled: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ biometricEnabled: enabled })
      .where(eq(users.id, id))
      .returning();
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

  async getVehicles(userId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.userId, userId)).orderBy(vehicles.createdAt);
  }

  async getVehicle(id: number, userId: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.userId, userId)));
    return vehicle || undefined;
  }

  async createVehicle(insertVehicle: InsertVehicle & { userId: number }): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async updateVehicle(id: number, userId: number, vehicleUpdate: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db.update(vehicles).set(vehicleUpdate).where(and(eq(vehicles.id, id), eq(vehicles.userId, userId))).returning();
    return vehicle || undefined;
  }

  async deleteVehicle(id: number, userId: number): Promise<boolean> {
    try {
      console.log(`Attempting to delete vehicle ${id} and related records`);
      
      // Delete all related records in order to avoid foreign key constraints
      
      // Delete related notifications
      const notificationsDeleted = await db.delete(notifications).where(eq(notifications.vehicleId, id));
      console.log(`Deleted ${notificationsDeleted.rowCount || 0} notifications`);
      
      // Delete related service alerts
      const serviceAlertsDeleted = await db.delete(serviceAlerts).where(eq(serviceAlerts.vehicleId, id));
      console.log(`Deleted ${serviceAlertsDeleted.rowCount || 0} service alerts`);
      
      // Delete related broadcasts (vehicleId can be null for some broadcasts)
      const broadcastsDeleted = await db.delete(broadcasts).where(eq(broadcasts.vehicleId, id));
      console.log(`Deleted ${broadcastsDeleted.rowCount || 0} broadcasts`);
      
      // Delete related maintenance records
      const maintenanceDeleted = await db.delete(maintenanceRecords).where(eq(maintenanceRecords.vehicleId, id));
      console.log(`Deleted ${maintenanceDeleted.rowCount || 0} maintenance records`);
      
      // Delete related service logs
      const serviceLogsDeleted = await db.delete(serviceLogs).where(eq(serviceLogs.vehicleId, id));
      console.log(`Deleted ${serviceLogsDeleted.rowCount || 0} service logs`);
      
      // Delete related traffic violations
      const violationsDeleted = await db.delete(trafficViolations).where(eq(trafficViolations.vehicleId, id));
      console.log(`Deleted ${violationsDeleted.rowCount || 0} traffic violations`);
      
      // Delete related documents
      const documentsDeleted = await db.delete(documents).where(eq(documents.vehicleId, id));
      console.log(`Deleted ${documentsDeleted.rowCount || 0} documents`);
      
      // Finally delete the vehicle  
      const result = await db.delete(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.userId, userId)));
      console.log(`Deleted ${result.rowCount || 0} vehicles`);
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
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

  async getNotifications(userId: number): Promise<Notification[]> {
    // Get notifications for vehicles owned by this user
    const userVehicles = await this.getVehicles(userId);
    const vehicleIds = userVehicles.map(v => v.id);
    
    if (vehicleIds.length === 0) {
      return [];
    }
    
    return await db.select().from(notifications)
      .where(inArray(notifications.vehicleId, vehicleIds))
      .orderBy(notifications.createdAt);
  }

  async getNotificationsByVehicle(vehicleId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.vehicleId, vehicleId)).orderBy(notifications.createdAt);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async generateRenewalNotifications(userId: number): Promise<void> {
    // Get vehicles for specific user only
    const allVehicles = await this.getVehicles(userId);
    
    const today = new Date();
    
    for (const vehicle of allVehicles) {
      // Check insurance renewal (when 10 months or more have passed since issuance)
      if (vehicle.insuranceExpiry) {
        const insuranceIssuanceDate = new Date(vehicle.insuranceExpiry);
        const tenMonthsFromIssuance = new Date(insuranceIssuanceDate);
        tenMonthsFromIssuance.setMonth(tenMonthsFromIssuance.getMonth() + 10);
        
        if (today >= tenMonthsFromIssuance) {
          // Check if notification already exists
          const existingNotifications = await db.select()
            .from(notifications)
            .where(and(
              eq(notifications.vehicleId, vehicle.id),
              eq(notifications.type, 'insurance'),
              eq(notifications.dueDate, vehicle.insuranceExpiry)
            ));
            
          if (existingNotifications.length === 0) {
            await this.createNotification({
              vehicleId: vehicle.id,
              type: 'insurance',
              title: 'Insurance Renewal Due',
              message: `Insurance for your ${vehicle.make} ${vehicle.model} was issued on ${insuranceIssuanceDate.toLocaleDateString()}. Time to renew!`,
              dueDate: vehicle.insuranceExpiry,
              isRead: false
            });
          }
        }
      }
      
      // Check emission renewal (when 5 months or more have passed since emission date)
      if (vehicle.emissionExpiry) {
        const emissionDate = new Date(vehicle.emissionExpiry);
        const fiveMonthsFromEmission = new Date(emissionDate);
        fiveMonthsFromEmission.setMonth(fiveMonthsFromEmission.getMonth() + 5);
        
        if (today >= fiveMonthsFromEmission) {
          // Check if notification already exists
          const existingNotifications = await db.select()
            .from(notifications)
            .where(and(
              eq(notifications.vehicleId, vehicle.id),
              eq(notifications.type, 'emission'),
              eq(notifications.dueDate, vehicle.emissionExpiry)
            ));
            
          if (existingNotifications.length === 0) {
            await this.createNotification({
              vehicleId: vehicle.id,
              type: 'emission',
              title: 'Emission Certificate Renewal Due',
              message: `Latest emission certificate for your ${vehicle.make} ${vehicle.model} was from ${emissionDate.toLocaleDateString()}. Time to renew!`,
              dueDate: vehicle.emissionExpiry,
              isRead: false
            });
          }
        }
      }

      // Check RC expiry (when current date is 4 months and less than RC expiry date)
      if (vehicle.rcExpiry) {
        const rcExpiryDate = new Date(vehicle.rcExpiry);
        const fourMonthsBeforeExpiry = new Date(rcExpiryDate);
        fourMonthsBeforeExpiry.setMonth(fourMonthsBeforeExpiry.getMonth() - 4);
        
        if (today >= fourMonthsBeforeExpiry && today < rcExpiryDate) {
          // Check if notification already exists
          const existingNotifications = await db.select()
            .from(notifications)
            .where(and(
              eq(notifications.vehicleId, vehicle.id),
              eq(notifications.type, 'rc'),
              eq(notifications.dueDate, vehicle.rcExpiry)
            ));
            
          if (existingNotifications.length === 0) {
            await this.createNotification({
              vehicleId: vehicle.id,
              type: 'rc',
              title: 'RC Renewal Due',
              message: `Your RC expires on ${rcExpiryDate.toLocaleDateString()}. Renew it before expiry to avoid penalties.`,
              dueDate: vehicle.rcExpiry,
              isRead: false
            });
          }
        }
      }
    }
  }

  async getEmergencyContact(userId: number): Promise<EmergencyContact | undefined> {
    const [contact] = await db.select().from(emergencyContacts).where(eq(emergencyContacts.userId, userId));
    return contact || undefined;
  }

  async createEmergencyContact(insertContact: InsertEmergencyContact & { userId: number }): Promise<EmergencyContact> {
    const [contact] = await db
      .insert(emergencyContacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async updateEmergencyContact(userId: number, contactUpdate: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined> {
    const [contact] = await db
      .update(emergencyContacts)
      .set({ ...contactUpdate, updatedAt: new Date() })
      .where(eq(emergencyContacts.userId, userId))
      .returning();
    return contact || undefined;
  }

  // Traffic Violation methods
  async getTrafficViolations(vehicleId: number): Promise<TrafficViolation[]> {
    return await db
      .select()
      .from(trafficViolations)
      .where(eq(trafficViolations.vehicleId, vehicleId))
      .orderBy(trafficViolations.violationDate);
  }

  async createTrafficViolation(violation: InsertTrafficViolation): Promise<TrafficViolation> {
    const [newViolation] = await db
      .insert(trafficViolations)
      .values(violation)
      .returning();
    return newViolation;
  }

  async updateTrafficViolationStatus(violationId: number, status: string, paymentDate?: string): Promise<TrafficViolation | undefined> {
    const [updated] = await db
      .update(trafficViolations)
      .set({ 
        status, 
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        lastChecked: new Date()
      })
      .where(eq(trafficViolations.id, violationId))
      .returning();
    return updated;
  }

  async deleteTrafficViolation(violationId: number): Promise<boolean> {
    const result = await db
      .delete(trafficViolations)
      .where(eq(trafficViolations.id, violationId));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async clearVehicleViolations(vehicleId: number): Promise<void> {
    await db.delete(trafficViolations).where(eq(trafficViolations.vehicleId, vehicleId));
  }

  // Maintenance Schedule methods
  async getMaintenanceSchedule(make: string, model: string, year: number, drivingCondition: string): Promise<MaintenanceSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(maintenanceSchedules)
      .where(
        and(
          eq(maintenanceSchedules.make, make),
          eq(maintenanceSchedules.model, model),
          eq(maintenanceSchedules.year, year),
          eq(maintenanceSchedules.drivingCondition, drivingCondition)
        )
      )
      .orderBy(maintenanceSchedules.lastUpdated)
      .limit(1);
    return schedule;
  }

  async createMaintenanceSchedule(schedule: InsertMaintenanceSchedule): Promise<MaintenanceSchedule> {
    const [newSchedule] = await db
      .insert(maintenanceSchedules)
      .values(schedule)
      .returning();
    return newSchedule;
  }

  async updateMaintenanceSchedule(id: number, scheduleUpdate: Partial<InsertMaintenanceSchedule>): Promise<MaintenanceSchedule | undefined> {
    const [updated] = await db
      .update(maintenanceSchedules)
      .set({ ...scheduleUpdate, lastUpdated: new Date() })
      .where(eq(maintenanceSchedules.id, id))
      .returning();
    return updated;
  }

  // Maintenance Record methods
  async getMaintenanceRecords(vehicleId: number): Promise<MaintenanceRecord[]> {
    return await db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.vehicleId, vehicleId))
      .orderBy(desc(maintenanceRecords.completedDate));
  }

  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    const [record] = await db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.id, id));
    return record;
  }

  async createMaintenanceRecord(record: InsertMaintenanceRecord & { warrantyCardPath?: string | null; invoicePath?: string | null }): Promise<MaintenanceRecord> {
    const [newRecord] = await db
      .insert(maintenanceRecords)
      .values({
        vehicleId: record.vehicleId,
        maintenanceType: record.maintenanceType,
        completedDate: record.completedDate,
        warrantyCardPath: record.warrantyCardPath,
        invoicePath: record.invoicePath,
        notes: record.notes,
      })
      .returning();
    return newRecord;
  }

  async updateMaintenanceRecord(id: number, recordUpdate: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const [updated] = await db
      .update(maintenanceRecords)
      .set({ ...recordUpdate, updatedAt: new Date() })
      .where(eq(maintenanceRecords.id, id))
      .returning();
    return updated;
  }

  async deleteMaintenanceRecord(id: number): Promise<boolean> {
    const result = await db
      .delete(maintenanceRecords)
      .where(eq(maintenanceRecords.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Service Log methods
  async getServiceLogs(vehicleId: number): Promise<ServiceLog[]> {
    return await db
      .select()
      .from(serviceLogs)
      .where(eq(serviceLogs.vehicleId, vehicleId))
      .orderBy(desc(serviceLogs.serviceDate));
  }

  async getServiceLog(id: number): Promise<ServiceLog | undefined> {
    const [serviceLog] = await db
      .select()
      .from(serviceLogs)
      .where(eq(serviceLogs.id, id));
    return serviceLog;
  }

  async createServiceLog(serviceLog: InsertServiceLog): Promise<ServiceLog> {
    const [newLog] = await db
      .insert(serviceLogs)
      .values(serviceLog)
      .returning();
    return newLog;
  }

  async updateServiceLog(id: number, serviceLogUpdate: Partial<InsertServiceLog>): Promise<ServiceLog | undefined> {
    const [updated] = await db
      .update(serviceLogs)
      .set({ ...serviceLogUpdate, updatedAt: new Date() })
      .where(eq(serviceLogs.id, id))
      .returning();
    return updated;
  }

  async deleteServiceLog(id: number): Promise<boolean> {
    const result = await db
      .delete(serviceLogs)
      .where(eq(serviceLogs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // News methods
  async getNewsItems(): Promise<NewsItem[]> {
    const items = await db.select().from(newsItems).orderBy(desc(newsItems.createdAt));
    return items;
  }

  async createNewsItem(newsItem: InsertNewsItem): Promise<NewsItem> {
    const [item] = await db.insert(newsItems).values(newsItem).returning();
    return item;
  }

  async updateNewsItem(id: number, newsItemUpdate: Partial<InsertNewsItem>): Promise<NewsItem | undefined> {
    const [updated] = await db
      .update(newsItems)
      .set({ ...newsItemUpdate, lastUpdated: new Date() })
      .where(eq(newsItems.id, id))
      .returning();
    return updated;
  }

  async deleteNewsItem(id: number): Promise<boolean> {
    const result = await db.delete(newsItems).where(eq(newsItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async clearAllNews(): Promise<void> {
    await db.delete(newsItems);
  }

  async createNewsUpdateLog(log: InsertNewsUpdateLog): Promise<NewsUpdateLog> {
    const [logEntry] = await db.insert(newsUpdateLog).values(log).returning();
    return logEntry;
  }

  async getLastNewsUpdate(): Promise<NewsUpdateLog | undefined> {
    const [lastUpdate] = await db
      .select()
      .from(newsUpdateLog)
      .orderBy(desc(newsUpdateLog.lastUpdated))
      .limit(1);
    return lastUpdate;
  }

  // Dashboard Widget methods
  async getDashboardWidgets(userId: number): Promise<DashboardWidget[]> {
    return await db.select().from(dashboardWidgets)
      .where(eq(dashboardWidgets.userId, userId))
      .orderBy(dashboardWidgets.position);
  }

  async createDashboardWidget(widget: InsertDashboardWidget): Promise<DashboardWidget> {
    const [newWidget] = await db.insert(dashboardWidgets).values(widget).returning();
    return newWidget;
  }

  async updateDashboardWidget(id: number, updates: Partial<InsertDashboardWidget>): Promise<DashboardWidget> {
    const [updatedWidget] = await db
      .update(dashboardWidgets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dashboardWidgets.id, id))
      .returning();
    return updatedWidget;
  }

  async deleteDashboardWidget(id: number): Promise<void> {
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.id, id));
  }

  async initializeDefaultWidgets(userId: number): Promise<DashboardWidget[]> {
    const defaultWidgets: InsertDashboardWidget[] = [
      { userId, widgetType: "stats", position: 0, isVisible: true, size: "medium" },
      { userId, widgetType: "quick_actions", position: 1, isVisible: true, size: "medium" },
      { userId, widgetType: "recent_vehicles", position: 2, isVisible: true, size: "large" },
      { userId, widgetType: "news", position: 3, isVisible: true, size: "medium" },
      { userId, widgetType: "reminders", position: 4, isVisible: true, size: "small" },
    ];

    const createdWidgets = await db.insert(dashboardWidgets).values(defaultWidgets).returning();
    return createdWidgets;
  }

  // Rating methods
  async createRating(rating: InsertRating & { userId: number }): Promise<Rating> {
    const [newRating] = await db
      .insert(ratings)
      .values(rating)
      .returning();
    return newRating;
  }

  async getRatings(): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .orderBy(desc(ratings.createdAt));
  }

  async getUserRatings(userId: number): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.userId, userId))
      .orderBy(desc(ratings.createdAt));
  }

  // Service Alert methods
  async getServiceAlerts(vehicleId: number): Promise<ServiceAlert[]> {
    const alerts = await db.select().from(serviceAlerts)
      .where(eq(serviceAlerts.vehicleId, vehicleId))
      .orderBy(desc(serviceAlerts.scheduledDate));
    return alerts;
  }

  async getServiceAlert(id: number): Promise<ServiceAlert | undefined> {
    const [alert] = await db.select().from(serviceAlerts).where(eq(serviceAlerts.id, id));
    return alert || undefined;
  }

  async createServiceAlert(serviceAlert: InsertServiceAlert): Promise<ServiceAlert> {
    const [alert] = await db.insert(serviceAlerts).values(serviceAlert).returning();
    return alert;
  }

  async updateServiceAlert(id: number, serviceAlert: Partial<InsertServiceAlert>): Promise<ServiceAlert | undefined> {
    const [alert] = await db.update(serviceAlerts)
      .set({ ...serviceAlert, updatedAt: new Date() })
      .where(eq(serviceAlerts.id, id))
      .returning();
    return alert || undefined;
  }

  async deleteServiceAlert(id: number): Promise<boolean> {
    const [result] = await db.delete(serviceAlerts).where(eq(serviceAlerts.id, id)).returning({ id: serviceAlerts.id });
    return !!result;
  }

  async getActiveServiceAlerts(): Promise<ServiceAlert[]> {
    const alerts = await db.select().from(serviceAlerts)
      .where(and(eq(serviceAlerts.isActive, true), eq(serviceAlerts.isCompleted, false)))
      .orderBy(serviceAlerts.scheduledDate);
    return alerts;
  }

  // Broadcast methods
  async getBroadcasts(): Promise<Broadcast[]> {
    const broadcastList = await db
      .select()
      .from(broadcasts)
      .leftJoin(vehicles, eq(broadcasts.vehicleId, vehicles.id))
      .where(eq(broadcasts.isActive, true))
      .orderBy(desc(broadcasts.createdAt));

    return broadcastList.map(row => ({
      ...row.broadcasts,
      vehicle: row.vehicles || undefined
    })) as any[];
  }

  async getBroadcast(id: number): Promise<Broadcast | undefined> {
    const [broadcast] = await db.select().from(broadcasts).where(eq(broadcasts.id, id));
    return broadcast;
  }

  async createBroadcast(broadcastData: any): Promise<Broadcast> {
    const [broadcast] = await db.insert(broadcasts).values(broadcastData).returning();
    return broadcast;
  }

  async updateBroadcast(id: number, broadcastUpdate: Partial<InsertBroadcast>): Promise<Broadcast | undefined> {
    // Convert expiresAt string to Date if present
    const updateData = { ...broadcastUpdate };
    if (updateData.expiresAt && typeof updateData.expiresAt === 'string') {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }
    
    const [updated] = await db
      .update(broadcasts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(broadcasts.id, id))
      .returning();
    return updated;
  }

  async deleteBroadcast(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(broadcasts).where(and(eq(broadcasts.id, id), eq(broadcasts.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Admin method to delete any post
  async adminDeleteBroadcast(id: number): Promise<boolean> {
    const result = await db.delete(broadcasts).where(eq(broadcasts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async cleanupExpiredBroadcasts(): Promise<number> {
    const now = new Date();
    const result = await db
      .delete(broadcasts)
      .where(lt(broadcasts.expiresAt, now));
    
    const deletedCount = result.rowCount ?? 0;
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired broadcasts`);
    }
    return deletedCount;
  }

  async getBroadcastsByType(type: string): Promise<Broadcast[]> {
    return await db
      .select()
      .from(broadcasts)
      .where(and(eq(broadcasts.type, type), eq(broadcasts.isActive, true)))
      .orderBy(desc(broadcasts.createdAt));
  }

  async getUserActiveBroadcastCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(broadcasts)
      .where(and(
        eq(broadcasts.userId, userId),
        eq(broadcasts.isActive, true),
        eq(broadcasts.status, 'active')
      ));
    return result[0]?.count || 0;
  }

  async incrementBroadcastViews(id: number): Promise<void> {
    const [broadcast] = await db.select({ viewCount: broadcasts.viewCount }).from(broadcasts).where(eq(broadcasts.id, id));
    if (broadcast) {
      await db
        .update(broadcasts)
        .set({ viewCount: (broadcast.viewCount || 0) + 1 })
        .where(eq(broadcasts.id, id));
    }
  }

  // Broadcast Response methods
  async getBroadcastResponses(broadcastId: number): Promise<BroadcastResponse[]> {
    return await db
      .select()
      .from(broadcastResponses)
      .where(eq(broadcastResponses.broadcastId, broadcastId))
      .orderBy(desc(broadcastResponses.createdAt));
  }

  async createBroadcastResponse(responseData: InsertBroadcastResponse & { userId: number }): Promise<BroadcastResponse> {
    const [response] = await db.insert(broadcastResponses).values(responseData).returning();
    return response;
  }

  async markResponseAsRead(id: number): Promise<void> {
    await db
      .update(broadcastResponses)
      .set({ isRead: true })
      .where(eq(broadcastResponses.id, id));
  }

  // Admin methods implementation
  async getAdminStats(): Promise<any> {
    const [
      totalUsersResult,
      totalVehiclesResult,
      totalBroadcastsResult,
      totalRatingsResult,
      subscriptionRevenueResult,
      newUsersThisMonthResult,
      newVehiclesThisMonthResult,
      userProfilesResult
    ] = await Promise.all([
      db.select().from(users),
      db.select().from(vehicles),
      db.select().from(broadcasts),
      db.select().from(ratings),
      db.select().from(users).where(eq(users.subscriptionStatus, "paid")),
      db.select().from(users).where(gte(users.createdAt, new Date(new Date().setDate(1)))),
      db.select().from(vehicles).where(gte(vehicles.createdAt, new Date(new Date().setDate(1)))),
      db.select().from(userProfiles)
    ]);

    // Calculate demographics
    const maleUsers = userProfilesResult.filter(p => p.gender === 'male').length;
    const femaleUsers = userProfilesResult.filter(p => p.gender === 'female').length;
    
    // Calculate vehicle types
    const twoWheelers = totalVehiclesResult.filter(v => v.vehicleType === '2-wheeler').length;
    const threeWheelers = totalVehiclesResult.filter(v => v.vehicleType === '3-wheeler').length;
    const fourWheelers = totalVehiclesResult.filter(v => v.vehicleType === '4-wheeler').length;
    
    // Calculate activity metrics (mock for now - would need login tracking in real app)
    const dailyActiveUsers = Math.floor(totalUsersResult.filter(u => u.isVerified).length * 0.3);
    const monthlyActiveUsers = Math.floor(totalUsersResult.filter(u => u.isVerified).length * 0.8);
    
    // Calculate users by state
    const usersByState: { [key: string]: number } = {};
    userProfilesResult.forEach(profile => {
      if (profile.state) {
        usersByState[profile.state] = (usersByState[profile.state] || 0) + 1;
      }
    });

    return {
      totalUsers: totalUsersResult.length,
      activeUsers: totalUsersResult.filter(u => u.isVerified).length,
      dailyActiveUsers,
      monthlyActiveUsers,
      maleUsers,
      femaleUsers,
      usersByState,
      totalVehicles: totalVehiclesResult.length,
      twoWheelers,
      threeWheelers,
      fourWheelers,
      totalBroadcasts: totalBroadcastsResult.length,
      totalRatings: totalRatingsResult.length,
      subscriptionRevenue: subscriptionRevenueResult.length * 100, // ₹100 per subscription
      newUsersThisMonth: newUsersThisMonthResult.length,
      newVehiclesThisMonth: newVehiclesThisMonthResult.length
    };
  }

  async getRecentUsers(limit: number = 10): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt)).limit(limit);
  }

  async getRecentVehicles(limit: number = 10): Promise<Vehicle[]> {
    return await db.select().from(vehicles).orderBy(desc(vehicles.createdAt)).limit(limit);
  }

  async getRecentBroadcasts(limit: number = 10): Promise<Broadcast[]> {
    return await db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt)).limit(limit);
  }

  async getRecentRatings(limit: number = 10): Promise<Rating[]> {
    return await db.select().from(ratings).orderBy(desc(ratings.createdAt)).limit(limit);
  }

  async getAllUsersData(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Admin User Management Methods
  async blockUser(userId: number, reason: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        isBlocked: true, 
        blockedAt: new Date(), 
        blockedReason: reason 
      })
      .where(eq(users.id, userId));
  }

  async unblockUser(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        isBlocked: false, 
        blockedAt: null, 
        blockedReason: null 
      })
      .where(eq(users.id, userId));
  }

  async getAllVehiclesData(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  }

  async getAllBroadcastsData(): Promise<Broadcast[]> {
    return await db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt));
  }

  async getAllRatingsData(): Promise<Rating[]> {
    return await db.select().from(ratings).orderBy(desc(ratings.createdAt));
  }

  // Subscription Management methods
  async getCurrentSubscription(userId: string): Promise<any> {
    // For demo purposes, create a mock subscription for user 1
    if (userId === "1") {
      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      return {
        id: 1,
        userId: userId,
        subscriptionType: "premium",
        subscriptionDate: new Date('2024-01-01').toISOString(),
        expiryDate: expiryDate.toISOString(),
        isActive: true,
        amount: 10000,
        currency: "INR"
      };
    }
    return null;
  }

  async getPaymentHistory(userId: string): Promise<any[]> {
    // Mock payment history for demo
    if (userId === "1") {
      return [
        {
          id: 1,
          userId: userId,
          subscriptionId: 1,
          amount: 10000,
          currency: "INR",
          paymentDate: "2024-01-01T00:00:00.000Z",
          transactionId: "TXN_1704067200000_abc123def",
          paymentStatus: "success",
          paymentMethod: "upi",
          invoiceGenerated: true,
          invoicePath: "/invoices/invoice_TXN_1704067200000_abc123def.pdf"
        }
      ];
    }
    return [];
  }

  async createSubscription(subscription: any): Promise<any> {
    // Mock subscription creation
    return {
      id: Date.now(),
      ...subscription
    };
  }

  async createPaymentRecord(payment: any): Promise<any> {
    // Mock payment record creation
    return {
      id: Date.now(),
      ...payment
    };
  }

  async getPaymentById(paymentId: number): Promise<any> {
    // Mock payment retrieval
    return {
      id: paymentId,
      userId: "1",
      subscriptionId: 1,
      amount: 10000,
      currency: "INR",
      paymentDate: new Date().toISOString(),
      transactionId: `TXN_${paymentId}_mock`,
      paymentStatus: "success",
      paymentMethod: "upi",
      invoiceGenerated: true,
      invoicePath: `/invoices/invoice_${paymentId}.pdf`
    };
  }

  async getActiveSubscriptions(): Promise<any[]> {
    // Mock active subscriptions for notification processing
    return [
      {
        id: 1,
        userId: "1",
        subscriptionType: "premium",
        subscriptionDate: "2024-01-01T00:00:00.000Z",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        isActive: true,
        amount: 10000,
        currency: "INR"
      }
    ];
  }

  async getRecentSubscriptionNotification(userId: string, type: string): Promise<any> {
    // Check if notification was sent in last 7 days (for demo, return null to allow notifications)
    return null;
  }

  async createSubscriptionNotification(notification: any): Promise<any> {
    // Mock notification creation
    console.log('Subscription notification created:', notification);
    return {
      id: Date.now(),
      ...notification
    };
  }

  async deactivateSubscription(subscriptionId: number): Promise<void> {
    // Mock subscription deactivation
    console.log('Subscription deactivated:', subscriptionId);
  }

  // Push notification methods
  async registerPushToken(userId: string, token: string, platform: string): Promise<void> {
    // In production, store push tokens in database
    // For demo, store in memory map
    if (!this.pushTokens) {
      this.pushTokens = new Map();
    }
    
    if (!this.pushTokens.has(userId)) {
      this.pushTokens.set(userId, []);
    }
    
    const userTokens = this.pushTokens.get(userId) || [];
    if (!userTokens.includes(token)) {
      userTokens.push(token);
      this.pushTokens.set(userId, userTokens);
    }
    
    console.log(`Registered push token for user ${userId} on ${platform}:`, token);
  }

  async getUserPushTokens(userId: string): Promise<string[]> {
    if (!this.pushTokens) {
      this.pushTokens = new Map();
    }
    
    return this.pushTokens.get(userId) || [];
  }

  // Add push tokens storage for demo
  private pushTokens?: Map<string, string[]>;
  
  // Admin message methods
  async createAdminMessage(message: InsertAdminMessage): Promise<AdminMessage> {
    const [adminMessage] = await db
      .insert(adminMessages)
      .values(message)
      .returning();
    return adminMessage;
  }

  async getTodaysAdminMessage(): Promise<AdminMessage | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [message] = await db
      .select()
      .from(adminMessages)
      .where(eq(adminMessages.messageDate, today))
      .orderBy(desc(adminMessages.createdAt))
      .limit(1);
    return message;
  }

  async updateAdminMessage(id: number, messageData: Partial<InsertAdminMessage>): Promise<AdminMessage | undefined> {
    const [updated] = await db
      .update(adminMessages)
      .set({ ...messageData, updatedAt: new Date() })
      .where(eq(adminMessages.id, id))
      .returning();
    return updated;
  }

  async deleteAdminMessage(id: number): Promise<boolean> {
    const result = await db
      .delete(adminMessages)
      .where(eq(adminMessages.id, id));
    return result.rowCount > 0;
  }

  // Account Information methods
  async getAccountInformation(userId: number): Promise<AccountInformation | undefined> {
    const [account] = await db
      .select()
      .from(accountInformation)
      .where(eq(accountInformation.userId, userId));
    return account;
  }

  async createAccountInformation(account: InsertAccountInformation): Promise<AccountInformation> {
    const [newAccount] = await db
      .insert(accountInformation)
      .values(account)
      .returning();
    return newAccount;
  }

  async updateAccountInformation(userId: number, account: Partial<InsertAccountInformation>): Promise<AccountInformation | undefined> {
    const [updated] = await db
      .update(accountInformation)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(accountInformation.userId, userId))
      .returning();
    return updated;
  }

  async getAllAccountInformation(): Promise<AccountInformation[]> {
    return await db
      .select()
      .from(accountInformation)
      .orderBy(desc(accountInformation.createdAt));
  }

  // Invoice Management methods
  async getInvoices(userId: number): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values(invoice)
      .returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updated] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Get count of invoices this month
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59);
    
    const monthlyInvoices = await db
      .select()
      .from(invoices)
      .where(
        and(
          gte(invoices.createdAt, startOfMonth),
          lte(invoices.createdAt, endOfMonth)
        )
      );
    
    const sequence = String(monthlyInvoices.length + 1).padStart(3, '0');
    return `INV-${year}-${month}-${sequence}`;
  }

  async markInvoiceAsPaid(id: number, paymentDate: Date): Promise<Invoice | undefined> {
    const [updated] = await db
      .update(invoices)
      .set({ 
        invoiceStatus: 'paid',
        updatedAt: new Date()
      })
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  async getInvoicesByDateRange(startDate: Date, endDate: Date): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(
        and(
          gte(invoices.invoiceDate, startDate),
          lte(invoices.invoiceDate, endDate)
        )
      )
      .orderBy(desc(invoices.invoiceDate));
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date();
    return await db
      .select()
      .from(invoices)
      .where(
        and(
          lt(invoices.dueDate, today),
          eq(invoices.invoiceStatus, 'generated')
        )
      )
      .orderBy(invoices.dueDate);
  }
}

export const storage = new DatabaseStorage();
