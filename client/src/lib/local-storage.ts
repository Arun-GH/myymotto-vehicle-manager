// Local document storage using IndexedDB for secure client-side storage
export interface LocalDocument {
  id: string;
  vehicleId: number;
  type: string;
  fileName: string;
  fileData: ArrayBuffer;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  metadata?: {
    billDate?: string;
    documentName?: string;
    expiryDate?: string;
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
    file: File,
    metadata?: { billDate?: string; documentName?: string; expiryDate?: string },
    customFileName?: string
  ): Promise<LocalDocument> {
    const db = await this.openDB();
    const arrayBuffer = await file.arrayBuffer();
    
    const document: LocalDocument = {
      id: `${vehicleId}-${type}-${Date.now()}`,
      vehicleId,
      type,
      fileName: customFileName || file.name,
      fileData: arrayBuffer,
      mimeType: file.type,
      fileSize: file.size,
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
    const blob = new Blob([document.fileData], { type: document.mimeType });
    return URL.createObjectURL(blob);
  }

  downloadDocument(document: LocalDocument) {
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
}

export const localDocumentStorage = new LocalDocumentStorage();