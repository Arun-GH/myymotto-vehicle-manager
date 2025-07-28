import { localDocumentStorage, type LocalDocument } from './local-storage';
import { useQuery } from '@tanstack/react-query';

export interface BackupData {
  version: string;
  schemaVersion: string;
  timestamp: string;
  userInfo: {
    userId: string;
    deviceInfo: string;
  };
  documents: LocalDocument[];
  vehicles: any[];
  profile: any;
  serviceLogs: any[];
  notifications: any[];
  localStorage: Record<string, string>;
  metadata: {
    totalDocuments: number;
    totalSize: number;
    exportedOn: string;
    backupType: 'full' | 'documents_only';
    fieldCount: {
      documents: number;
      vehicles: number;
      serviceLogs: number;
      notifications: number;
      localStorageKeys: number;
    };
  };
}

export class BackupManager {
  private static version = '2.0.0';
  private static schemaVersion = '2025.01.28';
  
  // Create complete backup of user data with future-proofing
  static async createBackup(userId: string, backupType: 'full' | 'documents_only' = 'full'): Promise<BackupData> {
    try {
      // Get all documents from IndexedDB
      const documents = await localDocumentStorage.getAllDocuments();
      
      // Get comprehensive user data from various sources
      const vehicles = await this.getVehiclesData(userId);
      const serviceLogs = await this.getServiceLogsData(vehicles);
      const notifications = await this.getNotificationsData();
      const profile = await this.getProfileData();
      const localStorageData = this.getRelevantLocalStorageData();
      
      // Calculate backup metadata
      const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
      
      const backupData: BackupData = {
        version: this.version,
        schemaVersion: this.schemaVersion,
        timestamp: new Date().toISOString(),
        userInfo: {
          userId,
          deviceInfo: navigator.userAgent,
        },
        documents,
        vehicles,
        profile,
        serviceLogs: backupType === 'full' ? serviceLogs : [],
        notifications: backupType === 'full' ? notifications : [],
        localStorage: backupType === 'full' ? localStorageData : {},
        metadata: {
          totalDocuments: documents.length,
          totalSize,
          exportedOn: new Date().toLocaleDateString('en-IN'),
          backupType,
          fieldCount: {
            documents: documents.length,
            vehicles: vehicles.length,
            serviceLogs: serviceLogs.length,
            notifications: notifications.length,
            localStorageKeys: Object.keys(localStorageData).length,
          },
        },
      };
      
      return backupData;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Helper methods for data collection
  private static async getVehiclesData(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/vehicles?userId=${userId}`);
      if (response.ok) {
        const vehicles = await response.json();
        // Clean and serialize to avoid circular references
        return this.cleanObjectForSerialization(vehicles);
      }
    } catch (error) {
      console.warn('Could not fetch vehicles from API, using localStorage');
    }
    
    // Fallback to localStorage
    const userVehicles = localStorage.getItem('userVehicles');
    return userVehicles ? JSON.parse(userVehicles) : [];
  }
  
  private static async getServiceLogsData(vehicles: any[]): Promise<any[]> {
    const allServiceLogs = [];
    for (const vehicle of vehicles) {
      try {
        const response = await fetch(`/api/service-logs/${vehicle.id}`);
        if (response.ok) {
          const logs = await response.json();
          // Clean and serialize to avoid circular references
          const cleanLogs = this.cleanObjectForSerialization(logs);
          allServiceLogs.push(...cleanLogs);
        }
      } catch (error) {
        console.warn(`Could not fetch service logs for vehicle ${vehicle.id}`);
      }
    }
    return allServiceLogs;
  }
  
  private static async getNotificationsData(): Promise<any[]> {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const notifications = await response.json();
        return this.cleanObjectForSerialization(notifications);
      }
    } catch (error) {
      console.warn('Could not fetch notifications');
    }
    return [];
  }
  
  private static async getProfileData(): Promise<any> {
    try {
      const userId = localStorage.getItem('currentUserId') || '1';
      const response = await fetch(`/api/profile/${userId}`);
      if (response.ok) {
        const profile = await response.json();
        return this.cleanObjectForSerialization(profile);
      }
    } catch (error) {
      console.warn('Could not fetch profile from API, using localStorage');
    }
    
    // Fallback to localStorage
    const userProfile = localStorage.getItem('userProfile');
    return userProfile ? JSON.parse(userProfile) : null;
  }
  
  // Utility method to clean objects and remove circular references
  private static cleanObjectForSerialization(obj: any): any {
    const seen = new WeakSet();
    
    const cleanObject = (item: any): any => {
      if (item === null || typeof item !== 'object') {
        return item;
      }
      
      if (seen.has(item)) {
        return '[Circular Reference]';
      }
      
      seen.add(item);
      
      if (Array.isArray(item)) {
        return item.map(cleanObject);
      }
      
      const result: any = {};
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          try {
            result[key] = cleanObject(item[key]);
          } catch (error) {
            result[key] = '[Unable to serialize]';
          }
        }
      }
      
      return result;
    };
    
    return cleanObject(obj);
  }

  private static getRelevantLocalStorageData(): Record<string, string> {
    const relevantKeys = [
      'currentUserId',
      'lastBackupDate',
      'permissionsCompleted_',
      'appPermissions',
      'backupReminderDismissed',
      'notifications_last_fetched',
      'admin_message_dismissed_',
      'userSubscription',
      'userSettings',
      'dashboardLayout',
    ];
    
    const localStorageData: Record<string, string> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && relevantKeys.some(relevantKey => key.startsWith(relevantKey))) {
        const value = localStorage.getItem(key);
        if (value) {
          localStorageData[key] = value;
        }
      }
    }
    
    return localStorageData;
  }
  
  // Export backup as downloadable JSON file
  static async exportToFile(userId: string, backupType: 'full' | 'documents_only' = 'full'): Promise<void> {
    const backupData = await this.createBackup(userId, backupType);
    
    // Clean the entire backup data to prevent circular references
    const cleanBackupData = this.cleanObjectForSerialization(backupData);
    
    // Convert backup to JSON blob
    const jsonBlob = new Blob([JSON.stringify(cleanBackupData, null, 2)], {
      type: 'application/json',
    });
    
    // Create download link
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `myymotto-${backupType}-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  // Share backup via email
  static async shareViaEmail(userId: string, backupType: 'full' | 'documents_only' = 'full'): Promise<void> {
    const backupData = await this.createBackup(userId, backupType);
    
    // Clean the entire backup data to prevent circular references
    const cleanBackupData = this.cleanObjectForSerialization(backupData);
    
    // Create a downloadable JSON file
    const fileName = `myymotto-${backupType}-backup-${new Date().toISOString().split('T')[0]}.json`;
    const jsonBlob = new Blob([JSON.stringify(cleanBackupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(jsonBlob);
    
    // Trigger download first
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Create simplified email content with clear attachment instructions
    const subject = encodeURIComponent(`Myymotto ${backupType === 'full' ? 'Complete' : 'Documents'} Data Backup - ${cleanBackupData.metadata.exportedOn}`);
    const body = encodeURIComponent(`Dear User,

Your Myymotto ${backupType === 'full' ? 'complete' : 'documents-only'} data backup has been created successfully!

📁 BACKUP FILE DOWNLOADED: ${fileName}

📊 Backup Summary:
• Documents: ${cleanBackupData.metadata.fieldCount.documents} files
• Vehicles: ${cleanBackupData.metadata.fieldCount.vehicles} entries
${backupType === 'full' ? `• Service Logs: ${cleanBackupData.metadata.fieldCount.serviceLogs} records\n• Notifications: ${cleanBackupData.metadata.fieldCount.notifications} alerts\n` : ''}• Total Size: ${this.formatFileSize(cleanBackupData.metadata.totalSize)}
• Created: ${cleanBackupData.metadata.exportedOn}
• Schema: v${cleanBackupData.schemaVersion}

📎 NEXT STEPS:
1. Find the downloaded file "${fileName}" in your Downloads folder
2. Attach this file to this email before sending
3. Send this email to yourself or save the file in cloud storage

🔄 TO RESTORE ON NEW DEVICE:
1. Install Myymotto app
2. Go to Settings → Data Management → Restore Backup  
3. Upload the ${fileName} file
4. All your vehicles, documents, and data will be restored

⚠️ IMPORTANT: Keep this backup file secure - it contains your personal vehicle documents and information.

Best regards,
Myymotto Team`);
    
    // Show user notification about the process
    if (typeof window !== 'undefined' && 'navigator' in window && 'share' in navigator) {
      // Use Web Share API if available (mobile browsers)
      try {
        await navigator.share({
          title: `Myymotto Data Backup - ${cleanBackupData.metadata.exportedOn}`,
          text: `Your Myymotto backup file "${fileName}" has been downloaded. Please attach this file when sharing.`,
        });
        return;
      } catch (error) {
        // Fall back to mailto if sharing fails
      }
    }
    
    // Open email client with instructions
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
    
    // Show additional notification to user
    setTimeout(() => {
      alert(`✅ Backup Downloaded!\n\nFile: ${fileName}\n\nNext Steps:\n1. Check your Downloads folder\n2. Attach the downloaded file to your email\n3. Send the email to yourself or save to cloud storage`);
    }, 1000);
  }
  
  // Enhanced restore with schema migration support
  static async restoreFromFile(file: File): Promise<void> {
    try {
      const jsonText = await file.text();
      const backupData: BackupData = JSON.parse(jsonText);
      
      // Validate backup format and migrate if needed
      const migratedData = await this.validateAndMigrateBackup(backupData);
      
      // Show detailed restore confirmation
      const restoreInfo = this.getRestoreInfo(migratedData);
      const confirmRestore = confirm(
        `Restore backup from ${migratedData.metadata.exportedOn}?\n\n` +
        `${restoreInfo}\n\n` +
        `Current data will be replaced. Continue?`
      );
      
      if (!confirmRestore) return;
      
      // Clear existing data first
      await this.clearExistingData();
      
      // Restore all data types
      await this.restoreDocuments(migratedData.documents);
      await this.restoreVehicles(migratedData.vehicles);
      await this.restoreProfile(migratedData.profile);
      await this.restoreServiceLogs(migratedData.serviceLogs);
      await this.restoreNotifications(migratedData.notifications);
      await this.restoreLocalStorage(migratedData.localStorage);
      
      alert(
        `Backup restored successfully!\n\n` +
        `✓ ${migratedData.metadata.fieldCount.documents} documents\n` +
        `✓ ${migratedData.metadata.fieldCount.vehicles} vehicles\n` +
        `✓ ${migratedData.metadata.fieldCount.serviceLogs} service logs\n` +
        `✓ Profile data and settings`
      );
      
      // Reload page to refresh all data
      window.location.reload();
      
    } catch (error) {
      throw new Error(`Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Schema validation and migration
  private static async validateAndMigrateBackup(backupData: any): Promise<BackupData> {
    // Handle legacy backup format (v1.0.0)
    if (!backupData.schemaVersion || backupData.version === '1.0.0') {
      console.log('Migrating legacy backup format to current schema');
      return this.migrateLegacyBackup(backupData);
    }
    
    // Validate current format
    if (!backupData.version || !backupData.documents) {
      throw new Error('Invalid backup file format');
    }
    
    // Future migrations can be added here
    if (backupData.schemaVersion !== this.schemaVersion) {
      console.log(`Migrating backup from schema ${backupData.schemaVersion} to ${this.schemaVersion}`);
      // Add future migration logic here
    }
    
    return backupData as BackupData;
  }
  
  // Migrate legacy backup to current format
  private static migrateLegacyBackup(legacyData: any): BackupData {
    return {
      version: this.version,
      schemaVersion: this.schemaVersion,
      timestamp: legacyData.timestamp || new Date().toISOString(),
      userInfo: legacyData.userInfo || { userId: '1', deviceInfo: 'Unknown' },
      documents: legacyData.documents || [],
      vehicles: legacyData.vehicles || [],
      profile: legacyData.profile || null,
      serviceLogs: [], // New field, empty for legacy backups
      notifications: [], // New field, empty for legacy backups
      localStorage: {}, // New field, empty for legacy backups
      metadata: {
        totalDocuments: legacyData.metadata?.totalDocuments || 0,
        totalSize: legacyData.metadata?.totalSize || 0,
        exportedOn: legacyData.metadata?.exportedOn || 'Unknown',
        backupType: 'documents_only', // Legacy backups were documents only
        fieldCount: {
          documents: legacyData.documents?.length || 0,
          vehicles: legacyData.vehicles?.length || 0,
          serviceLogs: 0,
          notifications: 0,
          localStorageKeys: 0,
        },
      },
    };
  }
  
  // Helper methods for restore process
  private static getRestoreInfo(backupData: BackupData): string {
    const info = [];
    info.push(`Documents: ${backupData.metadata.fieldCount.documents}`);
    info.push(`Vehicles: ${backupData.metadata.fieldCount.vehicles}`);
    if (backupData.metadata.fieldCount.serviceLogs > 0) {
      info.push(`Service logs: ${backupData.metadata.fieldCount.serviceLogs}`);
    }
    if (backupData.metadata.fieldCount.notifications > 0) {
      info.push(`Notifications: ${backupData.metadata.fieldCount.notifications}`);
    }
    info.push(`Total size: ${this.formatFileSize(backupData.metadata.totalSize)}`);
    return info.join('\n');
  }
  
  private static async clearExistingData(): Promise<void> {
    // Clear documents
    const existingDocs = await localDocumentStorage.getAllDocuments();
    for (const doc of existingDocs) {
      await localDocumentStorage.deleteDocument(doc.id);
    }
    
    // Clear relevant localStorage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && this.isRestorableLocalStorageKey(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
  
  private static async restoreDocuments(documents: LocalDocument[]): Promise<void> {
    for (const document of documents) {
      try {
        let file = null;
        if (document.fileData && document.mimeType) {
          const blob = new Blob([document.fileData], { type: document.mimeType });
          file = new File([blob], document.fileName, { type: document.mimeType });
        }
        
        await localDocumentStorage.storeDocument(
          document.vehicleId,
          document.type,
          file,
          document.metadata,
          document.fileName
        );
      } catch (error) {
        console.warn(`Failed to restore document ${document.id}:`, error);
      }
    }
  }
  
  private static async restoreVehicles(vehicles: any[]): Promise<void> {
    if (vehicles && vehicles.length > 0) {
      // Store in localStorage as fallback
      localStorage.setItem('userVehicles', JSON.stringify(vehicles));
      
      // Try to restore to database via API
      try {
        for (const vehicle of vehicles) {
          const response = await fetch('/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vehicle),
          });
          if (!response.ok) {
            console.warn(`Failed to restore vehicle ${vehicle.id} to database`);
          }
        }
      } catch (error) {
        console.warn('Failed to restore vehicles to database, using localStorage only');
      }
    }
  }
  
  private static async restoreProfile(profile: any): Promise<void> {
    if (profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      
      // Try to restore to database via API
      try {
        const response = await fetch(`/api/profile/${profile.userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
        if (!response.ok) {
          console.warn('Failed to restore profile to database');
        }
      } catch (error) {
        console.warn('Failed to restore profile to database, using localStorage only');
      }
    }
  }
  
  private static async restoreServiceLogs(serviceLogs: any[]): Promise<void> {
    if (serviceLogs && serviceLogs.length > 0) {
      try {
        for (const log of serviceLogs) {
          const response = await fetch('/api/service-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log),
          });
          if (!response.ok) {
            console.warn(`Failed to restore service log ${log.id}`);
          }
        }
      } catch (error) {
        console.warn('Failed to restore service logs');
      }
    }
  }
  
  private static async restoreNotifications(notifications: any[]): Promise<void> {
    if (notifications && notifications.length > 0) {
      try {
        for (const notification of notifications) {
          const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notification),
          });
          if (!response.ok) {
            console.warn(`Failed to restore notification ${notification.id}`);
          }
        }
      } catch (error) {
        console.warn('Failed to restore notifications');
      }
    }
  }
  
  private static async restoreLocalStorage(localStorageData: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(localStorageData)) {
      if (this.isRestorableLocalStorageKey(key)) {
        localStorage.setItem(key, value);
      }
    }
  }
  
  private static isRestorableLocalStorageKey(key: string): boolean {
    const restorableKeys = [
      'currentUserId',
      'lastBackupDate',
      'permissionsCompleted_',
      'appPermissions',
      'userSubscription',
      'userSettings',
      'dashboardLayout',
    ];
    return restorableKeys.some(restorableKey => key.startsWith(restorableKey));
  }
  
  // Upload to Google Drive (basic implementation)
  static async uploadToGoogleDrive(userId: string, backupType: 'full' | 'documents_only' = 'full'): Promise<void> {
    try {
      const backupData = await this.createBackup(userId, backupType);
      
      // Create backup file blob
      const jsonBlob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      
      const fileName = `myymotto-${backupType}-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      // For web app, we'll use the file picker API to save to Google Drive
      // This requires user interaction but works without API keys
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'JSON files',
            accept: { 'application/json': ['.json'] },
          }],
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(jsonBlob);
        await writable.close();
        
        alert(`${backupType === 'full' ? 'Complete' : 'Documents-only'} backup saved successfully! You can upload this file to Google Drive manually.`);
      } else {
        // Fallback: download file and show instructions
        await this.exportToFile(userId, backupType);
        alert(`${backupType === 'full' ? 'Complete' : 'Documents-only'} backup file downloaded! Please upload it to your Google Drive manually for safe keeping.`);
      }
      
    } catch (error) {
      // Fallback to regular download if file picker fails
      await this.exportToFile(userId, backupType);
      alert(`${backupType === 'full' ? 'Complete' : 'Documents-only'} backup file downloaded! Please save it to Google Drive or email it to yourself for safekeeping.`);
    }
  }
  
  // Auto-backup reminder system
  static shouldShowBackupReminder(): boolean {
    const lastBackup = localStorage.getItem('lastBackupDate');
    const reminderInterval = 7; // days
    
    if (!lastBackup) return true;
    
    const lastBackupDate = new Date(lastBackup);
    const daysSinceBackup = Math.floor((Date.now() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceBackup >= reminderInterval;
  }
  
  static markBackupCompleted(): void {
    localStorage.setItem('lastBackupDate', new Date().toISOString());
  }
  
  // Utility function to format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Get backup statistics
  static async getBackupStats(): Promise<{
    totalDocuments: number;
    totalSize: string;
    lastBackup: string | null;
    needsBackup: boolean;
  }> {
    const documents = await localDocumentStorage.getAllDocuments();
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    const lastBackup = localStorage.getItem('lastBackupDate');
    
    return {
      totalDocuments: documents.length,
      totalSize: this.formatFileSize(totalSize),
      lastBackup: lastBackup ? new Date(lastBackup).toLocaleDateString('en-IN') : null,
      needsBackup: this.shouldShowBackupReminder(),
    };
  }
}