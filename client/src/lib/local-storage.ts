// Local document storage using IndexedDB for secure client-side storage
export interface LocalDocument {
  id: string;
  vehicleId: number;
  type: string;
  fileName: string;
  fileData: ArrayBuffer | null;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  metadata?: {
    billDate?: string;
    documentName?: string;
    expiryDate?: string;
    billAmount?: number;
    taxAmount?: number;
    permitFee?: number;
    rechargeAmount?: number;
    insuranceExpiryDate?: string;
    insuranceIssuedDate?: string;
    sumInsured?: number;
    insurancePremium?: number;
    insuranceProvider?: string;
  };
}

class LocalDocumentStorage {
  private dbName = 'MyymottoDocuments';
  private dbVersion = 1;
  private storeName = 'documents';

  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('vehicleId', 'vehicleId', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  async storeDocument(
    vehicleId: number,
    type: string,
    file: File | null,
    metadata?: { billDate?: string; documentName?: string; expiryDate?: string; billAmount?: number; taxAmount?: number; permitFee?: number; rechargeAmount?: number; insuranceExpiryDate?: string; insuranceIssuedDate?: string; sumInsured?: number; insurancePremium?: number; insuranceProvider?: string },
    customFileName?: string
  ): Promise<LocalDocument> {
    const db = await this.openDB();
    
    let arrayBuffer: ArrayBuffer | null = null;
    let mimeType = '';
    let fileSize = 0;
    let fileName = customFileName || 'No File';
    
    if (file) {
      arrayBuffer = await file.arrayBuffer();
      mimeType = file.type;
      fileSize = file.size;
      fileName = customFileName || file.name;
    }
    
    const document: LocalDocument = {
      id: `${vehicleId}-${type}-${Date.now()}`,
      vehicleId,
      type,
      fileName,
      fileData: arrayBuffer,
      mimeType,
      fileSize,
      uploadedAt: new Date().toISOString(),
      metadata,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(document);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(document);
    });
  }

  async getDocumentsByVehicle(vehicleId: number): Promise<LocalDocument[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('vehicleId');
      const request = index.getAll(vehicleId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getDocument(id: string): Promise<LocalDocument | undefined> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteDocument(id: string): Promise<boolean> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  async getAllDocuments(): Promise<LocalDocument[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  createObjectURL(document: LocalDocument): string {
    if (!document.fileData) {
      throw new Error('Cannot create object URL for document without file data');
    }
    const blob = new Blob([document.fileData], { type: document.mimeType });
    return URL.createObjectURL(blob);
  }

  downloadDocument(document: LocalDocument) {
    if (!document.fileData) {
      throw new Error('Cannot download document without file data');
    }
    const blob = new Blob([document.fileData], { type: document.mimeType });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = document.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async getStorageInfo(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
      };
    }
    return { used: 0, available: 0 };
  }

  // Unique document types that can only have one entry per vehicle
  private uniqueDocumentTypes = ['emission', 'rc', 'road_tax', 'fitness_certificate'];

  async getExistingDocumentByType(vehicleId: number, type: string): Promise<LocalDocument | undefined> {
    const documents = await this.getDocumentsByVehicle(vehicleId);
    return documents.find(doc => doc.type === type);
  }

  async storeOrReplaceDocument(
    vehicleId: number,
    type: string,
    file: File | null,
    metadata?: { billDate?: string; documentName?: string; expiryDate?: string; billAmount?: number; taxAmount?: number; permitFee?: number; rechargeAmount?: number; insuranceExpiryDate?: string; sumInsured?: number; insurancePremium?: number; insuranceProvider?: string },
    customFileName?: string
  ): Promise<LocalDocument> {
    // For unique document types, delete existing document first
    if (this.uniqueDocumentTypes.includes(type)) {
      const existingDoc = await this.getExistingDocumentByType(vehicleId, type);
      if (existingDoc) {
        await this.deleteDocument(existingDoc.id);
      }
    }

    // Store the new document
    return await this.storeDocument(vehicleId, type, file, metadata, customFileName);
  }

  async updateDocument(
    documentId: string,
    file: File | null,
    metadata?: { billDate?: string; documentName?: string; expiryDate?: string; billAmount?: number; taxAmount?: number; permitFee?: number; rechargeAmount?: number; insuranceExpiryDate?: string; insuranceIssuedDate?: string; sumInsured?: number; insurancePremium?: number; insuranceProvider?: string },
    customFileName?: string
  ): Promise<LocalDocument | undefined> {
    const existingDoc = await this.getDocument(documentId);
    if (!existingDoc) return undefined;

    const db = await this.openDB();
    
    let arrayBuffer: ArrayBuffer | null = existingDoc.fileData;
    let mimeType = existingDoc.mimeType;
    let fileSize = existingDoc.fileSize;
    let fileName = existingDoc.fileName;
    
    // Update file data if new file provided
    if (file) {
      arrayBuffer = await file.arrayBuffer();
      mimeType = file.type;
      fileSize = file.size;
      fileName = customFileName || file.name;
    } else if (customFileName) {
      fileName = customFileName;
    }
    
    const updatedDocument: LocalDocument = {
      ...existingDoc,
      fileName,
      fileData: arrayBuffer,
      mimeType,
      fileSize,
      metadata: { ...existingDoc.metadata, ...metadata },
      uploadedAt: new Date().toISOString(), // Update timestamp
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(updatedDocument);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(updatedDocument);
    });
  }

  isUniqueDocumentType(type: string): boolean {
    return this.uniqueDocumentTypes.includes(type);
  }
}

export const localDocumentStorage = new LocalDocumentStorage();