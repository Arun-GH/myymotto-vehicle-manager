import { storage } from "./storage";
import type { InsertDocumentExpiry, InsertNotification } from "@shared/schema";

export class DocumentExpiryService {
  // Document types that require expiry tracking
  private expiryDocumentTypes = [
    'road_tax',
    'fitness_certificate', 
    'travel_permits',
    'emission'
  ];

  // Main entry point - run comprehensive expiry check process
  async runExpiryCheckProcess(userId: number): Promise<void> {
    try {
      console.log(`Running document expiry check for user ${userId}`);
      
      // Get user's vehicles
      const userVehicles = await storage.getVehicles(userId);
      if (userVehicles.length === 0) {
        console.log(`No vehicles found for user ${userId}`);
        return;
      }

      // Check expiries for each vehicle and process notifications
      for (const vehicle of userVehicles) {
        await this.processVehicleExpiries(vehicle.id, userId);
      }
      
      console.log(`Completed document expiry check for user ${userId}`);
    } catch (error) {
      console.error('Error in document expiry check process:', error);
    }
  }

  // Process all document expiries for a specific vehicle
  private async processVehicleExpiries(vehicleId: number, userId: number): Promise<void> {
    try {
      console.log(`Processing expiries for vehicle ${vehicleId}`);
      
      // Get vehicle information
      const vehicle = await storage.getVehicle(vehicleId, userId);
      if (!vehicle) {
        console.log(`Vehicle ${vehicleId} not found for user ${userId}`);
        return;
      }

      // Check all document types that require expiry tracking
      const documentTypes = [
        { type: 'road_tax', expiryField: null }, // Will be checked from uploaded documents
        { type: 'fitness_certificate', expiryField: null },
        { type: 'travel_permits', expiryField: null },
        { type: 'emission', expiryField: 'emissionExpiry' }
      ];

      for (const docType of documentTypes) {
        await this.checkDocumentType(vehicleId, userId, vehicle, docType);
      }
    } catch (error) {
      console.error(`Error processing vehicle ${vehicleId} expiries:`, error);
    }
  }

  // Check specific document type for expiry and create notifications
  private async checkDocumentType(vehicleId: number, userId: number, vehicle: any, docType: any): Promise<void> {
    try {
      let expiryDate: string | null = null;
      
      if (docType.expiryField && vehicle[docType.expiryField]) {
        // Get expiry date from vehicle record (like emission expiry)
        expiryDate = vehicle[docType.expiryField];
      } else {
        // Check if document exists in uploaded documents
        const documents = await storage.getDocumentsByVehicle(vehicleId);
        const docMatch = documents.find(doc => 
          doc.documentType?.toLowerCase().includes(docType.type.replace('_', '')) ||
          doc.documentType === docType.type
        );
        
        if (docMatch && docMatch.expiryDate) {
          expiryDate = docMatch.expiryDate;
        }
      }
      
      if (expiryDate) {
        await this.processExpiryNotifications(vehicleId, userId, docType.type, expiryDate);
      }
    } catch (error) {
      console.error(`Error checking ${docType.type} for vehicle ${vehicleId}:`, error);
    }
  }

  // Process expiry notifications with weekly reminders
  private async processExpiryNotifications(vehicleId: number, userId: number, documentType: string, expiryDate: string): Promise<void> {
    try {
      const today = new Date();
      const expiry = new Date(expiryDate);
      const timeDiff = expiry.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      console.log(`Document ${documentType} for vehicle ${vehicleId} expires in ${daysDiff} days`);
      
      // Create notifications for documents expiring within 30 days
      if (daysDiff <= 30 && daysDiff > 0) {
        // Check if we should send a notification (weekly intervals)
        const shouldNotify = this.shouldSendWeeklyNotification(daysDiff);
        
        if (shouldNotify) {
          await this.createExpiryNotification(vehicleId, userId, documentType, expiryDate, daysDiff);
        }
      }
    } catch (error) {
      console.error(`Error processing notifications for ${documentType}:`, error);
    }
  }

  // Determine if we should send a weekly notification based on days until expiry
  private shouldSendWeeklyNotification(daysUntilExpiry: number): boolean {
    // Send notifications at specific intervals: 30, 23, 16, 9, 2 days before expiry
    const notificationDays = [30, 23, 16, 9, 2];
    return notificationDays.includes(daysUntilExpiry);
  }

  // Create expiry notification
  private async createExpiryNotification(vehicleId: number, userId: number, documentType: string, expiryDate: string, daysUntilExpiry: number): Promise<void> {
    try {
      const titleMap: Record<string, string> = {
        'road_tax': 'Road Tax Renewal Reminder',
        'fitness_certificate': 'Fitness Certificate Renewal Reminder', 
        'travel_permits': 'Travel Permit Renewal Reminder',
        'emission': 'Emission Certificate Renewal Reminder'
      };

      const descriptionMap: Record<string, string> = {
        'road_tax': `Your vehicle's Road Tax expires in ${daysUntilExpiry} days (${expiryDate}). Please renew to avoid penalties.`,
        'fitness_certificate': `Your vehicle's Fitness Certificate expires in ${daysUntilExpiry} days (${expiryDate}). Renewal is required for legal compliance.`,
        'travel_permits': `Your vehicle's Travel Permit expires in ${daysUntilExpiry} days (${expiryDate}). Please renew before traveling.`,
        'emission': `Your vehicle's Emission Certificate expires in ${daysUntilExpiry} days (${expiryDate}). Get it renewed to avoid violations.`
      };

      // Check if notification for this specific day already exists
      const existingNotifications = await storage.getNotificationsByVehicle(vehicleId, userId);
      const existingNotification = existingNotifications.find(n => 
        n.type === documentType && 
        n.title === titleMap[documentType] &&
        n.description?.includes(`${daysUntilExpiry} days`)
      );

      if (!existingNotification) {
        const notificationData = {
          vehicleId,
          type: documentType,
          title: titleMap[documentType] || 'Document Renewal Reminder',
          message: descriptionMap[documentType] || `Your document expires in ${daysUntilExpiry} days. Please renew.`,
          dueDate: expiryDate,
          isRead: false,
        };

        await storage.createNotification(notificationData);
        console.log(`Created ${documentType} expiry notification for vehicle ${vehicleId}, expires in ${daysUntilExpiry} days`);
      }
    } catch (error) {
      console.error(`Error creating notification for ${documentType}:`, error);
    }
  }

  // Process document upload and track expiry
  async processDocumentUpload(vehicleId: number, userId: number, documentType: string, expiryDate?: string, amount?: number): Promise<void> {
    try {
      if (!this.expiryDocumentTypes.includes(documentType) || !expiryDate) {
        return;
      }

      // Store document expiry information
      const expiryData = {
        vehicleId,
        userId,
        documentType: documentType as 'road_tax' | 'fitness_certificate' | 'travel_permits' | 'emission',
        expiryDate,
        amount: amount || null,
        issueDate: new Date().toISOString().split('T')[0],
        reminderSent: false,
        isActive: true,
      };

      await storage.createDocumentExpiry(expiryData);
      console.log(`Processed document upload: ${documentType} for vehicle ${vehicleId}`);
      
      // Immediately check if notification is needed
      await this.processExpiryNotifications(vehicleId, userId, documentType, expiryDate);
    } catch (error) {
      console.error(`Error processing document upload:`, error);
    }
  }
}

// Export singleton instance
export const documentExpiryService = new DocumentExpiryService();