import { localDocumentStorage, type LocalDocument } from './local-storage';
import { useQuery } from '@tanstack/react-query';

export interface BackupData {
  version: string;
  timestamp: string;
  userInfo: {
    userId: string;
    deviceInfo: string;
  };
  documents: LocalDocument[];
  vehicles: any[];
  profile: any;
  metadata: {
    totalDocuments: number;
    totalSize: number;
    exportedOn: string;
  };
}

export class BackupManager {
  private static version = '1.0.0';
  
  // Create complete backup of user data
  static async createBackup(userId: string): Promise<BackupData> {
    try {
      // Get all documents from IndexedDB
      const documents = await localDocumentStorage.getAllDocuments();
      
      // Get user profile and vehicles from localStorage/API
      const userProfile = localStorage.getItem('userProfile');
      const userVehicles = localStorage.getItem('userVehicles');
      
      // Calculate backup metadata
      const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
      
      const backupData: BackupData = {
        version: this.version,
        timestamp: new Date().toISOString(),
        userInfo: {
          userId,
          deviceInfo: navigator.userAgent,
        },
        documents,
        vehicles: userVehicles ? JSON.parse(userVehicles) : [],
        profile: userProfile ? JSON.parse(userProfile) : null,
        metadata: {
          totalDocuments: documents.length,
          totalSize,
          exportedOn: new Date().toLocaleDateString('en-IN'),
        },
      };
      
      return backupData;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Export backup as downloadable JSON file
  static async exportToFile(userId: string): Promise<void> {
    const backupData = await this.createBackup(userId);
    
    // Convert backup to JSON blob
    const jsonBlob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    
    // Create download link
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `myymotto-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  // Share backup via email
  static async shareViaEmail(userId: string): Promise<void> {
    const backupData = await this.createBackup(userId);
    
    // Create email content
    const subject = encodeURIComponent('Myymotto Vehicle Data Backup');
    const body = encodeURIComponent(`
Dear User,

This email contains your Myymotto vehicle management data backup created on ${backupData.metadata.exportedOn}.

Backup Details:
- Total Documents: ${backupData.metadata.totalDocuments}
- Total Size: ${this.formatFileSize(backupData.metadata.totalSize)}
- Export Date: ${backupData.metadata.exportedOn}

To restore this data on a new device:
1. Install Myymotto app
2. Go to Settings → Data Management → Restore Backup
3. Upload this backup file

Important: Keep this backup file safe and secure. It contains your personal vehicle documents and information.

Best regards,
Myymotto Team

---
Backup Data (JSON):
${JSON.stringify(backupData, null, 2)}
    `);
    
    // Open email client
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
  }
  
  // Restore backup from file
  static async restoreFromFile(file: File): Promise<void> {
    try {
      const jsonText = await file.text();
      const backupData: BackupData = JSON.parse(jsonText);
      
      // Validate backup format
      if (!backupData.version || !backupData.documents) {
        throw new Error('Invalid backup file format');
      }
      
      // Clear existing data (with user confirmation)
      const confirmRestore = confirm(
        `This will replace all your current data with backup from ${backupData.metadata.exportedOn}.\n\nCurrent data will be lost. Continue?`
      );
      
      if (!confirmRestore) return;
      
      // Clear existing documents first
      const existingDocs = await localDocumentStorage.getAllDocuments();
      for (const doc of existingDocs) {
        await localDocumentStorage.deleteDocument(doc.id);
      }

      // Restore documents to IndexedDB
      for (const document of backupData.documents) {
        // Create a file from the stored data if available
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
      }
      
      // Restore profile and vehicles to localStorage
      if (backupData.profile) {
        localStorage.setItem('userProfile', JSON.stringify(backupData.profile));
      }
      
      if (backupData.vehicles) {
        localStorage.setItem('userVehicles', JSON.stringify(backupData.vehicles));
      }
      
      alert(`Backup restored successfully!\n\nRestored: ${backupData.metadata.totalDocuments} documents`);
      
      // Reload page to refresh all data
      window.location.reload();
      
    } catch (error) {
      throw new Error(`Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Upload to Google Drive (basic implementation)
  static async uploadToGoogleDrive(userId: string): Promise<void> {
    try {
      const backupData = await this.createBackup(userId);
      
      // Create backup file blob
      const jsonBlob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      
      // For web app, we'll use the file picker API to save to Google Drive
      // This requires user interaction but works without API keys
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `myymotto-backup-${new Date().toISOString().split('T')[0]}.json`,
          types: [{
            description: 'JSON files',
            accept: { 'application/json': ['.json'] },
          }],
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(jsonBlob);
        await writable.close();
        
        alert('Backup saved successfully! You can upload this file to Google Drive manually.');
      } else {
        // Fallback: download file and show instructions
        await this.exportToFile(userId);
        alert('File downloaded! Please upload the downloaded backup file to your Google Drive manually for safe keeping.');
      }
      
    } catch (error) {
      // Fallback to regular download if file picker fails
      await this.exportToFile(userId);
      alert('Backup file downloaded! Please save it to Google Drive or email it to yourself for safekeeping.');
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