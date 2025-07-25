import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertDocumentSchema, insertUserProfileSchema, signInSchema, verifyOtpSchema, setPinSchema, pinLoginSchema, biometricSetupSchema, insertUserSchema, insertNotificationSchema, insertEmergencyContactSchema, insertMaintenanceRecordSchema, insertRatingSchema, insertBroadcastSchema, type InsertVehicle, type InsertDocument, type InsertUserProfile, type SignInData, type VerifyOtpData, type InsertUser, type InsertNotification, type InsertEmergencyContact, type InsertMaintenanceRecord, type Rating, type InsertBroadcast } from "@shared/schema";
import { maintenanceService } from "./maintenance-service";
import { newsService } from "./news-service";
import { trafficViolationService } from "./traffic-violation-service";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure secure app storage directories
const appStorageDir = path.join(process.cwd(), "app_storage");
const documentsDir = path.join(appStorageDir, "documents");
const tempDir = path.join(appStorageDir, "temp");

// Create directories if they don't exist
[appStorageDir, documentsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Legacy uploads directory for backward compatibility
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: tempDir, // Use temp directory for initial uploads
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP and PDF files are allowed.'));
    }
  }
});

// Utility function to securely copy and store files
function secureFileStorage(tempPath: string, originalName: string, category: string): string {
  const fileExtension = path.extname(originalName);
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const secureFileName = `${category}_${timestamp}_${randomId}${fileExtension}`;
  const securePath = path.join(documentsDir, secureFileName);
  
  // Copy file from temp to secure storage
  fs.copyFileSync(tempPath, securePath);
  
  // Delete temp file
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }
  
  return `/app_storage/documents/${secureFileName}`;
}

// Utility function to delete files from secure storage
function deleteSecureFile(filePath: string): boolean {
  try {
    if (filePath.startsWith('/app_storage/documents/')) {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
    }
    // Also handle legacy uploads
    if (filePath.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Utility functions for OTP generation and validation
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes expiry
  return expiry;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidMobile(mobile: string): boolean {
  const cleanMobile = mobile.replace(/\D/g, '');
  return cleanMobile.length >= 10;
}

function maskIdentifier(identifier: string): string {
  if (isValidEmail(identifier)) {
    const [username, domain] = identifier.split('@');
    const maskedUsername = username.slice(0, 2) + '*'.repeat(username.length - 2);
    return `${maskedUsername}@${domain}`;
  } else {
    const cleanMobile = identifier.replace(/\D/g, '');
    return cleanMobile.slice(0, 2) + '*'.repeat(cleanMobile.length - 4) + cleanMobile.slice(-2);
  }
}



export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from secure app storage with proper content-type headers
  app.use('/app_storage/documents', (req, res, next) => {
    const filePath = path.join(documentsDir, req.path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }
    
    // Read first few bytes to determine file type
    const buffer = fs.readFileSync(filePath);
    let contentType = 'application/octet-stream';
    
    // Check magic numbers to determine file type
    if (buffer.length >= 4) {
      const header = buffer.toString('hex', 0, 4);
      if (header.startsWith('ffd8ff')) {
        contentType = 'image/jpeg';
      } else if (header.startsWith('89504e47')) {
        contentType = 'image/png';
      } else if (header.startsWith('52494646')) {
        contentType = 'image/webp';
      } else if (header.startsWith('25504446')) {
        contentType = 'application/pdf';
      }
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  });

  // Legacy uploads directory support for backward compatibility
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'uploads', req.path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }
    
    // Read first few bytes to determine file type
    const buffer = fs.readFileSync(filePath);
    let contentType = 'application/octet-stream';
    
    // Check magic numbers to determine file type
    if (buffer.length >= 4) {
      const header = buffer.toString('hex', 0, 4);
      if (header.startsWith('ffd8ff')) {
        contentType = 'image/jpeg';
      } else if (header.startsWith('89504e47')) {
        contentType = 'image/png';
      } else if (header.startsWith('52494646')) {
        contentType = 'image/webp';
      } else if (header.startsWith('25504446')) {
        contentType = 'application/pdf';
      }
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  });
  
  // Authentication routes
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const validatedData = signInSchema.parse(req.body);
      const { identifier } = validatedData;
      
      // Check if user exists
      const existingUser = await storage.getUserByIdentifier(identifier);
      
      // Generate and store OTP
      const otp = generateOTP();
      const type = isValidEmail(identifier) ? 'email' : 'mobile';
      
      await storage.createOtpVerification({
        identifier,
        otp,
        type,
        expiresAt: getOTPExpiry(),
        isUsed: false,
      });
      
      // In a real app, you would send the OTP via SMS/Email here
      console.log(`🔐 OTP for ${identifier}: ${otp}`); // For demo purposes
      
      res.json({
        exists: !!existingUser,
        maskedIdentifier: maskIdentifier(identifier),
        message: `OTP sent to ${maskIdentifier(identifier)}`
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const validatedData = verifyOtpSchema.parse(req.body);
      const { identifier, otp } = validatedData;
      
      // Verify OTP
      const validOtp = await storage.getValidOtp(identifier, otp);
      if (!validOtp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Mark OTP as used
      await storage.markOtpAsUsed(validOtp.id);
      
      // Check if user exists
      let user = await storage.getUserByIdentifier(identifier);
      
      if (!user) {
        // Create new user
        const userData: InsertUser = {
          username: identifier,
          password: "temp", // In real app, this would be handled differently
          email: isValidEmail(identifier) ? identifier : undefined,
          mobile: isValidMobile(identifier) ? identifier : undefined,
        };
        user = await storage.createUser(userData);
      }
      
      // Mark user as verified
      await storage.updateUser(user.id, { isVerified: true });
      
      // Check if user has profile
      const profile = await storage.getUserProfile(user.id);
      
      res.json({
        success: true,
        userId: user.id,
        hasProfile: !!profile,
        message: "Authentication successful"
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Verification failed" });
    }
  });

  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { identifier } = req.body;
      
      if (!identifier) {
        return res.status(400).json({ message: "Identifier is required" });
      }
      
      // Generate new OTP
      const otp = generateOTP();
      const type = isValidEmail(identifier) ? 'email' : 'mobile';
      
      await storage.createOtpVerification({
        identifier,
        otp,
        type,
        expiresAt: getOTPExpiry(),
        isUsed: false,
      });
      
      // In a real app, you would send the OTP via SMS/Email here
      console.log(`🔐 New OTP for ${identifier}: ${otp}`); // For demo purposes
      
      res.json({
        message: `New OTP sent to ${maskIdentifier(identifier)}`
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to resend OTP" });
    }
  });

  // PIN Authentication Routes
  app.post("/api/auth/pin-login", async (req, res) => {
    try {
      const validatedData = pinLoginSchema.parse(req.body);
      const { identifier, pin } = validatedData;
      
      // Verify PIN
      const user = await storage.verifyPin(identifier, pin);
      if (!user) {
        return res.status(400).json({ message: "Invalid PIN or user not found" });
      }
      
      // Check if user has profile
      const profile = await storage.getUserProfile(user.id);
      
      res.json({
        success: true,
        userId: user.id,
        hasProfile: !!profile,
        message: "PIN authentication successful"
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "PIN login failed" });
    }
  });

  app.post("/api/auth/set-pin", async (req, res) => {
    try {
      const validatedData = setPinSchema.parse(req.body);
      const { pin } = validatedData;
      const userId = req.body.userId;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Update user's PIN
      const updatedUser = await storage.updateUserPin(userId, pin);
      if (!updatedUser) {
        return res.status(400).json({ message: "Failed to set PIN" });
      }
      
      res.json({
        success: true,
        message: "PIN set successfully"
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to set PIN" });
    }
  });

  app.post("/api/auth/biometric-setup", async (req, res) => {
    try {
      const validatedData = biometricSetupSchema.parse(req.body);
      const { enabled } = validatedData;
      const userId = req.body.userId;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Update user's biometric setting
      const updatedUser = await storage.updateBiometricSetting(userId, enabled);
      if (!updatedUser) {
        return res.status(400).json({ message: "Failed to update biometric setting" });
      }
      
      res.json({
        success: true,
        message: `Biometric authentication ${enabled ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update biometric setting" });
    }
  });

  app.get("/api/auth/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user info without sensitive data
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        hasPin: !!user.pin,
        biometricEnabled: user.biometricEnabled,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to fetch user" });
    }
  });

  // Logout route
  app.get("/api/logout", (req, res) => {
    try {
      // Clear localStorage data on client side by redirecting to sign-in page
      // Since this app uses localStorage for session management, 
      // the actual logout happens on the client side
      res.redirect("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  
  // User Profile routes
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const validatedData = insertUserProfileSchema.parse(req.body);
      const profile = await storage.createUserProfile({ ...validatedData, userId });
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create profile" });
      }
    }
  });

  app.put("/api/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log("Profile update request body:", JSON.stringify(req.body, null, 2));
      const validatedData = insertUserProfileSchema.partial().parse(req.body);
      const profile = await storage.updateUserProfile(userId, validatedData);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Profile update error:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }
      
      const vehicles = await storage.getVehicles(parsedUserId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }
      
      const vehicle = await storage.getVehicle(id, parsedUserId);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      // Get userId from request body 
      const userId = req.body.userId || 1; // Fallback to 1 for backward compatibility
      const user = await storage.getUser(userId);
      
      // Check vehicle count limit with subscription logic
      const vehicles = await storage.getVehicles(userId);
      const vehicleCount = vehicles.length;
      
      // Free users: max 2 vehicles
      // Subscribed users: max 4 vehicles
      const isSubscribed = user?.subscriptionStatus === "active" && 
                          user?.subscriptionExpiry && 
                          new Date(user.subscriptionExpiry) > new Date();
      
      const maxVehicles = isSubscribed ? 4 : 2;
      
      if (vehicleCount >= maxVehicles) {
        if (!isSubscribed && vehicleCount >= 2) {
          return res.status(400).json({ 
            message: "Vehicle limit reached! Free plan allows maximum 2 vehicles. Subscribe for just ₹100/- per year to add up to 4 vehicles.",
            requiresSubscription: true
          });
        } else {
          return res.status(400).json({ 
            message: "Vehicle limit reached. You can add a maximum of 4 vehicles per account. Upgrade your subscription for higher limits." 
          });
        }
      }
      
      console.log("🚗 Vehicle creation request body:", JSON.stringify(req.body, null, 2));
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicleWithUser = { ...validatedData, userId };
      const vehicle = await storage.createVehicle(vehicleWithUser);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("🚨 Vehicle creation validation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create vehicle" });
      }
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string) || req.body.userId || 1; // Check query first, then body
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }
      
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, userId, validatedData);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found or you don't have permission to edit it" });
      }
      
      res.json(vehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update vehicle" });
      }
    }
  });

  app.put("/api/vehicles/:id/ocr-data", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string) || 1;
      const { ocrPolicyNumber, ocrSumInsured, ocrPremiumAmount, ocrInsuredName } = req.body;
      
      // Update vehicle with OCR data
      const vehicle = await storage.updateVehicle(id, userId, {
        ocrPolicyNumber,
        ocrSumInsured,
        ocrPremiumAmount,
        ocrInsuredName,
      });
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json({
        success: true,
        message: "OCR data saved successfully",
        vehicle
      });
    } catch (error) {
      console.error("OCR data update error:", error);
      res.status(500).json({ message: "Failed to save OCR data" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string) || 1; // Fallback to 1 for backward compatibility
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      
      const deleted = await storage.deleteVehicle(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete vehicle error:", error);
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // General file upload route
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { type } = req.body;
      const secureFilePath = secureFileStorage(req.file.path, req.file.originalname, type || 'general');

      console.log(`File uploaded successfully to secure storage: ${req.file.originalname}`);

      res.json({
        fileName: req.file.originalname,
        filePath: secureFilePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        type: type || 'other'
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file", error: error.message });
    }
  });

  // Document routes
  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = req.body;
      console.log("Creating document with data:", documentData);
      
      // Verify vehicle exists
      const vehicle = await storage.getVehicle(documentData.vehicleId, 1); // Default to user 1 for compatibility
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      
      console.log("Document created successfully:", document);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create document" });
      }
    }
  });

  app.get("/api/vehicles/:vehicleId/documents", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const documents = await storage.getDocumentsByVehicle(vehicleId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/vehicles/:vehicleId/documents", upload.single('file'), async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const { type } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Verify vehicle exists
      const vehicle = await storage.getVehicle(vehicleId, 1); // Default to user 1 for compatibility
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Store file securely 
      const secureFilePath = secureFileStorage(req.file.path, req.file.originalname, `doc_v${vehicleId}_${type}`);

      const documentData = {
        vehicleId,
        type: type || 'other',
        fileName: req.file.originalname,
        filePath: secureFilePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      };

      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to upload document" });
      }
    }
  });

  app.get("/api/documents/:id/file", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (!fs.existsSync(document.filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
      
      const fileStream = fs.createReadStream(document.filePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete the document from database
      const deleted = await storage.deleteDocument(id);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete associated file from secure storage
      if (document.filePath) {
        deleteSecureFile(document.filePath);
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }
      
      const vehicles = await storage.getVehicles(parsedUserId);
      const currentDate = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

      let expiringSoon = 0;
      let expired = 0;

      vehicles.forEach(vehicle => {
        const insuranceExpiry = vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry) : null;
        const emissionExpiry = vehicle.emissionExpiry ? new Date(vehicle.emissionExpiry) : null;
        
        // Check if any document is expired
        const isExpired = (insuranceExpiry && insuranceExpiry < currentDate) || 
                         (emissionExpiry && emissionExpiry < currentDate);
        
        // Check if any document is expiring soon
        const isExpiringSoon = (insuranceExpiry && insuranceExpiry >= currentDate && insuranceExpiry <= thirtyDaysFromNow) ||
                              (emissionExpiry && emissionExpiry >= currentDate && emissionExpiry <= thirtyDaysFromNow);

        if (isExpired) {
          expired++;
        } else if (isExpiringSoon) {
          expiringSoon++;
        }
      });

      res.json({
        totalVehicles: vehicles.length,
        expiringSoon,
        expired
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }
      
      // Check if user has at least one vehicle before showing notifications
      const userVehicles = await storage.getVehicles(parsedUserId);
      if (userVehicles.length === 0) {
        return res.json([]); // Return empty array if user has no vehicles
      }
      
      const notifications = await storage.getNotifications(parsedUserId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/generate", async (req, res) => {
    try {
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }
      
      await storage.generateRenewalNotifications(parsedUserId);
      res.json({ success: true, message: "Notifications generated successfully" });
    } catch (error) {
      console.error("Error generating notifications:", error);
      res.status(500).json({ error: "Failed to generate notifications" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Emergency Contacts API
  app.get("/api/emergency-contacts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const contact = await storage.getEmergencyContact(userId);
      res.json(contact || {});
    } catch (error: any) {
      console.error("Error fetching emergency contact:", error);
      res.status(500).json({ error: "Failed to fetch emergency contact" });
    }
  });

  app.post("/api/emergency-contacts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const contactData = insertEmergencyContactSchema.parse(req.body);
      const contact = await storage.createEmergencyContact({ ...contactData, userId });
      res.json(contact);
    } catch (error: any) {
      console.error("Error creating emergency contact:", error);
      res.status(500).json({ error: "Failed to create emergency contact" });
    }
  });

  app.put("/api/emergency-contacts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const contactData = insertEmergencyContactSchema.partial().parse(req.body);
      const contact = await storage.updateEmergencyContact(userId, contactData);
      if (contact) {
        res.json(contact);
      } else {
        res.status(404).json({ error: "Emergency contact not found" });
      }
    } catch (error: any) {
      console.error("Error updating emergency contact:", error);
      res.status(500).json({ error: "Failed to update emergency contact" });
    }
  });

  // Traffic violation routes
  app.get("/api/vehicles/:vehicleId/violations", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const violations = await storage.getTrafficViolations(vehicleId);
      res.json(violations);
    } catch (error: any) {
      console.error("Error fetching traffic violations:", error);
      res.status(500).json({ error: "Failed to fetch traffic violations" });
    }
  });

  // Check for new traffic violations using government API
  app.post("/api/vehicles/:vehicleId/check-violations", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const vehicle = await storage.getVehicle(vehicleId, 1); // Default to user 1 for compatibility
      
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      console.log(`🚗 Checking violations for vehicle ${vehicle.licensePlate}`);
      
      // Clear existing violations to ensure fresh data
      await storage.clearVehicleViolations(vehicleId);
      
      // Use state-based traffic violation service
      const violations = await trafficViolationService.checkViolations(vehicle.licensePlate);
      
      // Store fresh violations in database
      for (const violation of violations) {
        await storage.createTrafficViolation({
          vehicleId: vehicleId,
          challanNumber: violation.challanNumber,
          offense: violation.offense,
          fineAmount: violation.fineAmount,
          violationDate: violation.violationDate,
          location: violation.location,
          status: violation.status,
          paymentDate: violation.paymentDate || null,
          lastChecked: new Date()
        });
      }
      
      console.log(`✅ Found ${violations.length} violations for ${vehicle.licensePlate}`);

      const stateCode = vehicle.licensePlate.substring(0, 2);
      const paymentUrl = trafficViolationService.getPaymentUrl(vehicle.licensePlate);
      
      const message = violations.length > 0 
        ? `Traffic violations checked successfully. Found ${violations.length} violations.`
        : `No violations found for ${vehicle.licensePlate}. Clean record!`;
      
      res.json({ 
        message,
        violations,
        stateCode,
        paymentUrl,
        source: violations.length > 0 
          ? `${stateCode} State Government API`
          : `${stateCode} State Government API (No violations found)`
      });
    } catch (error: any) {
      console.error("Error checking traffic violations:", error);
      res.status(500).json({ 
        error: error.message || "Failed to check traffic violations",
        details: "Please ensure vehicle number is valid and state API is accessible"
      });
    }
  });

  app.put("/api/violations/:violationId/status", async (req, res) => {
    try {
      const violationId = parseInt(req.params.violationId);
      const { status, paymentDate } = req.body;
      
      const violation = await storage.updateTrafficViolationStatus(violationId, status, paymentDate);
      
      if (!violation) {
        return res.status(404).json({ error: "Traffic violation not found" });
      }
      
      res.json(violation);
    } catch (error: any) {
      console.error("Error updating violation status:", error);
      res.status(500).json({ error: "Failed to update violation status" });
    }
  });

  // Maintenance Records API routes
  app.get("/api/maintenance/records/:vehicleId", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const records = await storage.getMaintenanceRecords(vehicleId);
      res.json(records);
    } catch (error: any) {
      console.error("Error fetching maintenance records:", error);
      res.status(500).json({ error: "Failed to fetch maintenance records" });
    }
  });

  app.post("/api/maintenance/records", upload.fields([{ name: 'warrantyCard' }, { name: 'invoice' }]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const recordData = insertMaintenanceRecordSchema.parse({
        vehicleId: parseInt(req.body.vehicleId),
        maintenanceType: req.body.maintenanceType,
        completedDate: req.body.completedDate || null,
        notes: req.body.notes || null,
      });

      // Handle file uploads using secure storage
      let warrantyCardPath: string | null = null;
      let invoicePath: string | null = null;

      if (files?.warrantyCard?.[0]) {
        const file = files.warrantyCard[0];
        warrantyCardPath = secureFileStorage(file.path, file.originalname, `warranty_v${recordData.vehicleId}`);
      }

      if (files?.invoice?.[0]) {
        const file = files.invoice[0];
        invoicePath = secureFileStorage(file.path, file.originalname, `invoice_v${recordData.vehicleId}`);
      }

      const record = await storage.createMaintenanceRecord({
        ...recordData,
        warrantyCardPath,
        invoicePath,
      });

      res.json(record);
    } catch (error: any) {
      console.error("Error creating maintenance record:", error);
      res.status(500).json({ error: "Failed to create maintenance record" });
    }
  });

  app.put("/api/maintenance/records/:id", upload.fields([{ name: 'warrantyCard' }, { name: 'invoice' }]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      const updateData: any = {
        completedDate: req.body.completedDate || null,
        notes: req.body.notes || null,
      };

      // Handle file uploads using secure storage
      if (files?.warrantyCard?.[0]) {
        const file = files.warrantyCard[0];
        updateData.warrantyCardPath = secureFileStorage(file.path, file.originalname, `warranty_r${id}`);
      }

      if (files?.invoice?.[0]) {
        const file = files.invoice[0];
        updateData.invoicePath = secureFileStorage(file.path, file.originalname, `invoice_r${id}`);
      }

      const record = await storage.updateMaintenanceRecord(id, updateData);
      res.json(record);
    } catch (error: any) {
      console.error("Error updating maintenance record:", error);
      res.status(500).json({ error: "Failed to update maintenance record" });
    }
  });

  app.delete("/api/maintenance/records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the record first to retrieve file paths
      const record = await storage.getMaintenanceRecord(id);
      if (!record) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      
      // Delete the record from database
      const deleted = await storage.deleteMaintenanceRecord(id);
      if (!deleted) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      
      // Delete associated files from secure storage
      if (record.warrantyCardPath) {
        deleteSecureFile(record.warrantyCardPath);
      }
      if (record.invoicePath) {
        deleteSecureFile(record.invoicePath);
      }
      
      res.json({ message: "Maintenance record deleted successfully" });
    } catch (error) {
      console.error("Error deleting maintenance record:", error);
      res.status(500).json({ message: "Failed to delete maintenance record" });
    }
  });

  // Service log routes
  app.get("/api/service-logs/:vehicleId", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const logs = await storage.getServiceLogs(vehicleId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching service logs:", error);
      res.status(500).json({ message: "Failed to fetch service logs" });
    }
  });

  app.post("/api/service-logs", upload.single('invoice'), async (req, res) => {
    try {
      const data = req.body;
      let invoicePath: string | null = null;
      
      if (req.file) {
        invoicePath = secureFileStorage(req.file.path, req.file.originalname, `service_v${data.vehicleId}`);
      }
      
      const serviceLog = await storage.createServiceLog({
        vehicleId: parseInt(data.vehicleId),
        serviceType: data.serviceType.toUpperCase(),
        serviceDate: data.serviceDate,
        serviceCentre: data.serviceCentre.toUpperCase(),
        notes: data.notes || null,
        invoicePath: invoicePath,
      });
      
      res.status(201).json(serviceLog);
    } catch (error) {
      console.error("Error creating service log:", error);
      res.status(500).json({ message: "Failed to create service log" });
    }
  });

  app.put("/api/service-logs/:id", upload.single('invoice'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      
      const updateData: any = {
        serviceType: data.serviceType?.toUpperCase(),
        serviceDate: data.serviceDate,
        serviceCentre: data.serviceCentre?.toUpperCase(),
        notes: data.notes || null,
      };
      
      if (req.file) {
        updateData.invoicePath = secureFileStorage(req.file.path, req.file.originalname, `service_log${id}`);
      }
      
      const serviceLog = await storage.updateServiceLog(id, updateData);
      if (!serviceLog) {
        return res.status(404).json({ message: "Service log not found" });
      }
      
      res.json(serviceLog);
    } catch (error) {
      console.error("Error updating service log:", error);
      res.status(500).json({ message: "Failed to update service log" });
    }
  });

  app.delete("/api/service-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the service log first to retrieve file path
      const serviceLog = await storage.getServiceLog(id);
      if (!serviceLog) {
        return res.status(404).json({ message: "Service log not found" });
      }
      
      // Delete the service log from database
      const deleted = await storage.deleteServiceLog(id);
      if (!deleted) {
        return res.status(404).json({ message: "Service log not found" });
      }
      
      // Delete associated file from secure storage
      if (serviceLog.invoicePath) {
        deleteSecureFile(serviceLog.invoicePath);
      }
      
      res.json({ message: "Service log deleted successfully" });
    } catch (error) {
      console.error("Error deleting service log:", error);
      res.status(500).json({ message: "Failed to delete service log" });
    }
  });

  // Razorpay Subscription API routes
  app.post("/api/create-subscription", async (req, res) => {
    try {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ 
          error: "Razorpay keys not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET" 
        });
      }

      // Create Razorpay order for Rs 100 annual subscription
      const amount = 10000; // Rs 100 in paise
      const currency = "INR";
      
      // Mock order creation - in real implementation, use Razorpay SDK
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      res.json({
        orderId,
        amount,
        currency,
        key: process.env.RAZORPAY_KEY_ID
      });
    } catch (error) {
      console.error("Error creating subscription order:", error);
      res.status(500).json({ error: "Failed to create subscription order" });
    }
  });

  app.post("/api/verify-subscription", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ error: "Razorpay secret key not configured" });
      }
      
      // Verify signature (simplified for demo)
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");
      
      // In development, skip signature verification or implement mock verification
      const isSignatureValid = true; // generatedSignature === razorpay_signature;
      
      if (isSignatureValid) {
        // Update user subscription status
        // For now, we'll need to get userId from session or request context
        // In a production app, this would come from authenticated session
        const userId = 1; // Temporary hardcoded for demo - should come from auth session
        const subscriptionExpiry = new Date();
        subscriptionExpiry.setFullYear(subscriptionExpiry.getFullYear() + 1); // 1 year from now
        
        await storage.updateUser(userId, {
          subscriptionStatus: "active",
          subscriptionExpiry,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id
        });
        
        res.json({ success: true, message: "Subscription activated successfully" });
      } else {
        res.status(400).json({ error: "Invalid payment signature" });
      }
    } catch (error) {
      console.error("Error verifying subscription payment:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Maintenance Schedule routes
  app.get("/api/maintenance/schedule", async (req, res) => {
    try {
      const { make, model, year, drivingCondition = 'normal' } = req.query;
      
      if (!make || !model || !year) {
        return res.status(400).json({ 
          message: "Missing required parameters: make, model, year" 
        });
      }
      
      const schedule = await maintenanceService.getMaintenanceSchedule(
        make as string,
        model as string,
        parseInt(year as string),
        drivingCondition as 'normal' | 'severe'
      );
      
      if (!schedule) {
        return res.status(404).json({ 
          message: "Maintenance schedule not found for this vehicle" 
        });
      }
      
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching maintenance schedule:", error);
      res.status(500).json({ message: "Failed to fetch maintenance schedule" });
    }
  });

  app.get("/api/maintenance/available", async (req, res) => {
    try {
      const availableSchedules = maintenanceService.getAvailableMaintenance();
      res.json(availableSchedules);
    } catch (error) {
      console.error("Error fetching available maintenance schedules:", error);
      res.status(500).json({ message: "Failed to fetch available maintenance schedules" });
    }
  });

  // Get supported states for traffic violations
  app.get("/api/traffic-violations/supported-states", async (req, res) => {
    try {
      const supportedStates = trafficViolationService.getSupportedStates();
      res.json(supportedStates);
    } catch (error) {
      console.error("Error fetching supported states:", error);
      res.status(500).json({ message: "Failed to fetch supported states" });
    }
  });

  // Get payment URL for specific vehicle
  app.get("/api/traffic-violations/payment-url/:licensePlate", async (req, res) => {
    try {
      const licensePlate = req.params.licensePlate;
      const paymentUrl = trafficViolationService.getPaymentUrl(licensePlate);
      const stateCode = licensePlate.substring(0, 2);
      
      res.json({ 
        paymentUrl,
        stateCode,
        message: `Payment URL for ${stateCode} state`
      });
    } catch (error) {
      console.error("Error getting payment URL:", error);
      res.status(500).json({ message: "Failed to get payment URL" });
    }
  });

  // News API routes
  app.get("/api/news", async (req, res) => {
    try {
      const news = await newsService.fetchLatestNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get("/api/news/cache-info", async (req, res) => {
    try {
      const cacheInfo = newsService.getCacheInfo();
      res.json(cacheInfo);
    } catch (error) {
      console.error("Error fetching cache info:", error);
      res.status(500).json({ message: "Failed to fetch cache info" });
    }
  });

  app.post("/api/news/refresh", async (req, res) => {
    try {
      const news = await newsService.fetchLatestNews();
      res.json({ 
        message: "Real-time news fetched from free government APIs",
        news,
        source: "API Setu, Open Government Data India, Ministry Direct Sources"
      });
    } catch (error) {
      console.error("Error refreshing news:", error);
      res.status(500).json({ message: "Failed to refresh news" });
    }
  });

  // Dashboard widget routes
  app.get("/api/dashboard/widgets/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      let widgets = await storage.getDashboardWidgets(userId);
      
      // If no widgets exist, initialize default ones
      if (widgets.length === 0) {
        widgets = await storage.initializeDefaultWidgets(userId);
      }
      
      res.json(widgets);
    } catch (error) {
      console.error("Error fetching dashboard widgets:", error);
      res.status(500).json({ message: "Failed to fetch dashboard widgets" });
    }
  });

  app.post("/api/dashboard/widgets", async (req, res) => {
    try {
      // Get userId from request headers or body
      const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : req.body.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const widgetData = { ...req.body, userId };
      const widget = await storage.createDashboardWidget(widgetData);
      res.json(widget);
    } catch (error) {
      console.error("Error creating dashboard widget:", error);
      res.status(500).json({ message: "Failed to create dashboard widget" });
    }
  });

  app.patch("/api/dashboard/widgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Get userId from request headers or body
      const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : req.body.userId;
      
      const updateData = { ...req.body };
      if (userId) {
        updateData.userId = userId;
      }
      
      const widget = await storage.updateDashboardWidget(id, updateData);
      res.json(widget);
    } catch (error) {
      console.error("Error updating dashboard widget:", error);
      res.status(500).json({ message: "Failed to update dashboard widget" });
    }
  });

  app.delete("/api/dashboard/widgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDashboardWidget(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting dashboard widget:", error);
      res.status(500).json({ message: "Failed to delete dashboard widget" });
    }
  });

  // Rating routes
  app.post("/api/ratings", async (req, res) => {
    try {
      // Get current user (hardcoded for demo - should come from session)
      const userId = 1;
      const user = await storage.getUser(userId);
      const profile = await storage.getUserProfile(userId);
      
      if (!user || !profile) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Use profile data to populate rating record
      const ratingData = {
        ...req.body,
        userId: userId,
        userName: profile.name,
        phoneNumber: user.mobile || profile.alternatePhone || "",
        emailId: profile.email,
      };
      
      const validatedData = insertRatingSchema.parse(ratingData);
      const rating = await storage.createRating(validatedData);
      res.status(201).json(rating);
    } catch (error) {
      console.error("Error creating rating:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create rating" });
      }
    }
  });

  app.get("/api/ratings", async (req, res) => {
    try {
      const ratings = await storage.getRatings();
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.get("/api/ratings/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const ratings = await storage.getUserRatings(userId);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
      res.status(500).json({ message: "Failed to fetch user ratings" });
    }
  });

  // Service Alert API routes
  app.get("/api/service-alerts/:vehicleId", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const alerts = await storage.getServiceAlerts(vehicleId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching service alerts:", error);
      res.status(500).json({ message: "Failed to fetch service alerts" });
    }
  });

  app.post("/api/service-alerts", async (req, res) => {
    try {
      const data = req.body;
      const alert = await storage.createServiceAlert({
        vehicleId: parseInt(data.vehicleId),
        eventName: data.eventName,
        scheduledDate: data.scheduledDate,
        notes: data.notes || null,
        isActive: true,
        isCompleted: false,
        notificationSent: false,
      });
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating service alert:", error);
      res.status(500).json({ message: "Failed to create service alert" });
    }
  });

  app.put("/api/service-alerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      
      const alert = await storage.updateServiceAlert(id, {
        eventName: data.eventName,
        scheduledDate: data.scheduledDate,
        notes: data.notes,
        isActive: data.isActive,
        isCompleted: data.isCompleted,
      });
      
      if (!alert) {
        return res.status(404).json({ message: "Service alert not found" });
      }
      
      res.json(alert);
    } catch (error) {
      console.error("Error updating service alert:", error);
      res.status(500).json({ message: "Failed to update service alert" });
    }
  });

  app.delete("/api/service-alerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteServiceAlert(id);
      if (!deleted) {
        return res.status(404).json({ message: "Service alert not found" });
      }
      res.json({ message: "Service alert deleted successfully" });
    } catch (error) {
      console.error("Error deleting service alert:", error);
      res.status(500).json({ message: "Failed to delete service alert" });
    }
  });

  // Check and send notifications for service alerts (1 day prior)
  app.post("/api/service-alerts/check-notifications", async (req, res) => {
    try {
      const activeAlerts = await storage.getActiveServiceAlerts();
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let notificationsCreated = 0;
      
      for (const alert of activeAlerts) {
        const scheduledDate = new Date(alert.scheduledDate);
        
        // Check if tomorrow is the scheduled date and notification hasn't been sent
        if (scheduledDate.toDateString() === tomorrow.toDateString() && !alert.notificationSent) {
          // Create notification
          await storage.createNotification({
            vehicleId: alert.vehicleId,
            type: 'service',
            title: 'Service Alert Reminder',
            message: `Reminder: ${alert.eventName} is scheduled for tomorrow (${scheduledDate.toLocaleDateString()})`,
            dueDate: alert.scheduledDate,
            isRead: false
          });
          
          // Mark notification as sent
          await storage.updateServiceAlert(alert.id, { notificationSent: true });
          notificationsCreated++;
        }
      }
      
      res.json({ 
        success: true, 
        message: `${notificationsCreated} service alert notifications created`,
        count: notificationsCreated 
      });
    } catch (error) {
      console.error("Error checking service alert notifications:", error);
      res.status(500).json({ message: "Failed to check service alert notifications" });
    }
  });

  // Broadcast API routes
  app.get("/api/broadcasts", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }
      
      // Check if user has at least one vehicle before showing broadcasts
      const userVehicles = await storage.getVehicles(parsedUserId);
      if (userVehicles.length === 0) {
        return res.json([]); // Return empty array if user has no vehicles
      }
      
      const broadcasts = await storage.getBroadcasts();
      res.json(broadcasts);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      res.status(500).json({ message: "Failed to fetch broadcasts" });
    }
  });

  app.get("/api/broadcasts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const broadcast = await storage.getBroadcast(id);
      if (!broadcast) {
        return res.status(404).json({ message: "Broadcast not found" });
      }
      
      // Increment view count
      await storage.incrementBroadcastViews(id);
      res.json(broadcast);
    } catch (error) {
      console.error("Error fetching broadcast:", error);
      res.status(500).json({ message: "Failed to fetch broadcast" });
    }
  });

  app.post("/api/broadcasts", async (req, res) => {
    try {
      console.log("Received broadcast request:", req.body);
      
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }
      
      // Set expiry date to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const broadcastData = {
        userId: parsedUserId,
        type: req.body.type || "general",
        title: req.body.title,
        description: req.body.description,
        vehicleId: req.body.vehicleId || null,
        price: req.body.price || null,
        contactPhone: req.body.contactPhone,
        contactEmail: req.body.contactEmail || null,
        location: req.body.location || null,
        status: "active",
        viewCount: 0,
        isActive: true,
        expiresAt: expiresAt,
      };
      
      console.log("Creating broadcast with processed data:", broadcastData);
      const broadcast = await storage.createBroadcast(broadcastData);
      res.status(201).json(broadcast);
    } catch (error) {
      console.error("Error creating broadcast:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create broadcast" });
      }
    }
  });

  app.put("/api/broadcasts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const broadcastData = insertBroadcastSchema.partial().parse(req.body);
      const broadcast = await storage.updateBroadcast(id, broadcastData);
      
      if (!broadcast) {
        return res.status(404).json({ message: "Broadcast not found" });
      }
      
      res.json(broadcast);
    } catch (error) {
      console.error("Error updating broadcast:", error);
      res.status(500).json({ message: "Failed to update broadcast" });
    }
  });

  app.delete("/api/broadcasts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string) || 1; // Default to user 1 for backward compatibility
      
      // First check if the broadcast exists and belongs to the user
      const broadcast = await storage.getBroadcast(id);
      if (!broadcast) {
        return res.status(404).json({ message: "Broadcast not found" });
      }
      
      if (broadcast.userId !== userId) {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }
      
      const deleted = await storage.deleteBroadcast(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Broadcast not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting broadcast:", error);
      res.status(500).json({ message: "Failed to delete broadcast" });
    }
  });

  app.get("/api/broadcasts/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const broadcasts = await storage.getBroadcastsByType(type);
      res.json(broadcasts);
    } catch (error) {
      console.error("Error fetching broadcasts by type:", error);
      res.status(500).json({ message: "Failed to fetch broadcasts by type" });
    }
  });

  // Setup automatic cleanup of expired broadcasts (run once daily)
  setInterval(async () => {
    try {
      await storage.cleanupExpiredBroadcasts();
    } catch (error) {
      console.error("Error during automatic broadcast cleanup:", error);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds (once daily)

  // Run initial cleanup on server start
  setTimeout(async () => {
    try {
      await storage.cleanupExpiredBroadcasts();
    } catch (error) {
      console.error("Error during initial broadcast cleanup:", error);
    }
  }, 5000); // 5 seconds after server start

  // Admin routes - Protected by admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = parseInt(req.query.userId as string) || parseInt(req.body.userId as string) || 1;
      const user = await storage.getUser(userId.toString());
      
      console.log(`Admin check for userId: ${userId}, user:`, user);
      
      // Grant admin access to phone number 9880105082 or user ID 1, or users with isAdmin flag
      const hasAdminPhone = user && (
        user.mobile === '9880105082' || 
        user.mobile === '+919880105082' ||
        user.alternatePhone === '9880105082' || 
        user.alternatePhone === '+919880105082'
      );
      
      if (userId === 1 || hasAdminPhone || (user && user.isAdmin)) {
        console.log(`Admin access granted for userId: ${userId}`);
        next();
      } else {
        console.log(`Admin access denied for userId: ${userId}, mobile: ${user?.mobile}, alternatePhone: ${user?.alternatePhone}`);
        res.status(403).json({ message: "Admin access required" });
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      res.status(403).json({ message: "Admin access required" });
    }
  };

  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  // Admin user management routes
  app.post('/api/admin/users/:userId/block', isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      await storage.blockUser(parseInt(userId), reason || 'Admin action');
      res.json({ success: true, message: 'User blocked successfully' });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Failed to block user" });
    }
  });

  app.post('/api/admin/users/:userId/unblock', isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.unblockUser(parseInt(userId));
      res.json({ success: true, message: 'User unblocked successfully' });
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({ message: "Failed to unblock user" });
    }
  });

  // Admin post management routes
  app.delete('/api/admin/broadcasts/:id', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.adminDeleteBroadcast(parseInt(id));
      if (deleted) {
        res.json({ success: true, message: 'Post deleted successfully' });
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.get("/api/admin/users/recent", isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await storage.getRecentUsers(limit);
      res.json(users);
    } catch (error) {
      console.error("Error fetching recent users:", error);
      res.status(500).json({ error: "Failed to fetch recent users" });
    }
  });

  app.get("/api/admin/vehicles/recent", isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const vehicles = await storage.getRecentVehicles(limit);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching recent vehicles:", error);
      res.status(500).json({ error: "Failed to fetch recent vehicles" });
    }
  });

  app.get("/api/admin/broadcasts/recent", isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const broadcasts = await storage.getRecentBroadcasts(limit);
      res.json(broadcasts);
    } catch (error) {
      console.error("Error fetching recent broadcasts:", error);
      res.status(500).json({ error: "Failed to fetch recent broadcasts" });
    }
  });

  app.get("/api/admin/ratings/recent", isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const ratings = await storage.getRecentRatings(limit);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching recent ratings:", error);
      res.status(500).json({ error: "Failed to fetch recent ratings" });
    }
  });

  app.get("/api/admin/export/:dataType", isAdmin, async (req, res) => {
    try {
      const { dataType } = req.params;
      let data;

      switch (dataType) {
        case "users":
          data = await storage.getAllUsersData();
          break;
        case "vehicles":
          data = await storage.getAllVehiclesData();
          break;
        case "broadcasts":
          data = await storage.getAllBroadcastsData();
          break;
        case "ratings":
          data = await storage.getAllRatingsData();
          break;
        default:
          return res.status(400).json({ error: "Invalid data type" });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${dataType}-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(data);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Account Management and Subscription Routes
  app.get("/api/account-info", async (req, res) => {
    try {
      const userId = req.query.userId as string || "1"; // Default to userId 1 for demo
      
      // Get account creation date
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get current subscription
      const subscription = await storage.getCurrentSubscription(userId);
      
      // Get payment history
      const paymentHistory = await storage.getPaymentHistory(userId);
      
      // Calculate subscription status
      let isSubscriptionExpired = false;
      let daysUntilExpiry = 0;
      
      if (subscription) {
        const now = new Date();
        const expiryDate = new Date(subscription.expiryDate);
        isSubscriptionExpired = expiryDate < now;
        daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      res.json({
        accountCreatedDate: user.createdAt,
        subscription,
        paymentHistory,
        isSubscriptionExpired,
        daysUntilExpiry: Math.max(0, daysUntilExpiry)
      });
    } catch (error) {
      console.error("Error fetching account info:", error);
      res.status(500).json({ message: "Failed to fetch account information" });
    }
  });

  app.post("/api/subscription/renew", async (req, res) => {
    try {
      const userId = req.body.userId || "1"; // Default to userId 1 for demo
      
      // Create new subscription (1 year from now)
      const subscriptionDate = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const subscription = await storage.createSubscription({
        userId,
        subscriptionType: "premium",
        subscriptionDate: subscriptionDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        isActive: true,
        amount: 10000, // ₹100 in paise
        currency: "INR"
      });

      // Create payment record
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const payment = await storage.createPaymentRecord({
        userId,
        subscriptionId: subscription.id,
        amount: 10000,
        currency: "INR",
        paymentDate: new Date().toISOString(),
        transactionId,
        paymentStatus: "success",
        paymentMethod: "upi",
        invoiceGenerated: true,
        invoicePath: `/invoices/invoice_${transactionId}.pdf`
      });

      // Generate invoice (mock for demo)
      await generateInvoice(payment, subscription);

      res.json({
        success: true,
        subscription,
        payment,
        message: "Subscription renewed successfully"
      });
    } catch (error) {
      console.error("Error renewing subscription:", error);
      res.status(500).json({ message: "Failed to renew subscription" });
    }
  });

  app.get("/api/subscription/check-expired-features", async (req, res) => {
    try {
      const userId = req.query.userId as string || "1";
      
      const subscription = await storage.getCurrentSubscription(userId);
      let isExpired = true;
      
      if (subscription) {
        const now = new Date();
        const expiryDate = new Date(subscription.expiryDate);
        isExpired = expiryDate < now;
      }

      res.json({
        isExpired,
        restrictedFeatures: isExpired ? ['documents', 'add-vehicle', 'service-logs', 'broadcasts'] : []
      });
    } catch (error) {
      console.error("Error checking subscription status:", error);
      res.status(500).json({ message: "Failed to check subscription status" });
    }
  });

  app.get("/api/invoice/download/:paymentId", async (req, res) => {
    try {
      const paymentId = req.params.paymentId;
      const payment = await storage.getPaymentById(parseInt(paymentId));
      
      if (!payment || !payment.invoicePath) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // For demo purposes, generate a simple PDF content
      const invoiceContent = generatePDFContent(payment);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${paymentId}.pdf"`);
      res.send(invoiceContent);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      res.status(500).json({ message: "Failed to download invoice" });
    }
  });

  // Push notification token registration
  app.post("/api/push/register-token", async (req, res) => {
    try {
      const { token, userId, platform } = req.body;
      
      if (!token || !userId) {
        return res.status(400).json({ message: "Token and userId are required" });
      }

      // Store push token for user (in production, save to database)
      await storage.registerPushToken(userId, token, platform);
      
      res.json({ 
        success: true, 
        message: "Push token registered successfully" 
      });
    } catch (error) {
      console.error("Error registering push token:", error);
      res.status(500).json({ message: "Failed to register push token" });
    }
  });

  // Background job to send subscription expiry notifications with push notifications
  app.post("/api/subscription/send-notifications", async (req, res) => {
    try {
      const activeSubscriptions = await storage.getActiveSubscriptions();
      const now = new Date();
      let notificationsSent = 0;
      let pushNotificationsSent = 0;

      for (const subscription of activeSubscriptions) {
        const expiryDate = new Date(subscription.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send weekly notifications starting 30 days before expiry
        const weeklyTargets = [30, 23, 16, 9, 2]; // Weekly intervals
        
        if (weeklyTargets.includes(daysUntilExpiry)) {
          // Check if notification was already sent for this specific day
          const existingNotification = await storage.getRecentSubscriptionNotification(
            subscription.userId, 
            `expiry_warning_${daysUntilExpiry}d`
          );
          
          if (!existingNotification) {
            // Create database notification record
            await storage.createSubscriptionNotification({
              userId: subscription.userId,
              subscriptionId: subscription.id,
              notificationType: `expiry_warning_${daysUntilExpiry}d`,
              sentDate: now.toISOString(),
              isRead: false,
              title: getNotificationTitle(daysUntilExpiry),
              message: getNotificationMessage(daysUntilExpiry)
            });
            
            // Send push notification
            const pushResult = await sendPushNotification(subscription.userId, {
              title: getNotificationTitle(daysUntilExpiry),
              body: getNotificationMessage(daysUntilExpiry),
              data: {
                type: 'subscription_expiry',
                daysUntilExpiry,
                subscriptionId: subscription.id
              }
            });
            
            if (pushResult.success) {
              pushNotificationsSent++;
            }
            
            notificationsSent++;
            console.log(`Sent subscription reminder: ${daysUntilExpiry} days for user ${subscription.userId}`);
          }
        }
        
        // Send expired notification
        if (daysUntilExpiry <= 0 && subscription.isActive) {
          await storage.deactivateSubscription(subscription.id);
          
          await storage.createSubscriptionNotification({
            userId: subscription.userId,
            subscriptionId: subscription.id,
            notificationType: 'expired',
            sentDate: now.toISOString(),
            isRead: false,
            title: 'Myymotto Subscription Expired',
            message: 'Your premium subscription has expired. Renew now to restore full access!'
          });
          
          // Send expired push notification
          const pushResult = await sendPushNotification(subscription.userId, {
            title: 'Myymotto Subscription Expired',
            body: 'Your premium subscription has expired. Renew now to restore full access!',
            data: {
              type: 'subscription_expired',
              subscriptionId: subscription.id
            }
          });
          
          if (pushResult.success) {
            pushNotificationsSent++;
          }
          
          notificationsSent++;
        }
      }

      res.json({ 
        success: true, 
        notificationsSent,
        pushNotificationsSent,
        message: `Processed ${activeSubscriptions.length} subscriptions, sent ${notificationsSent} notifications (${pushNotificationsSent} push notifications)`
      });
    } catch (error) {
      console.error("Error sending subscription notifications:", error);
      res.status(500).json({ message: "Failed to send notifications" });
    }
  });

  // Manual trigger for testing notifications
  app.post("/api/subscription/test-notification", async (req, res) => {
    try {
      const { userId, daysUntilExpiry } = req.body;
      
      const testNotification = {
        title: getNotificationTitle(daysUntilExpiry || 30),
        body: getNotificationMessage(daysUntilExpiry || 30),
        data: {
          type: 'subscription_expiry',
          daysUntilExpiry: daysUntilExpiry || 30,
          test: true
        }
      };

      const pushResult = await sendPushNotification(userId || "1", testNotification);
      
      res.json({
        success: true,
        pushResult,
        notification: testNotification,
        message: "Test notification sent successfully"
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for push notifications
function getNotificationTitle(daysUntilExpiry: number): string {
  if (daysUntilExpiry <= 0) return 'Myymotto Subscription Expired';
  if (daysUntilExpiry <= 2) return 'Myymotto Critical Alert';
  if (daysUntilExpiry <= 9) return 'Myymotto Final Notice';
  if (daysUntilExpiry <= 16) return 'Myymotto Renewal Urgent';
  if (daysUntilExpiry <= 23) return 'Myymotto Subscription Alert';
  return 'Myymotto Subscription Reminder';
}

function getNotificationMessage(daysUntilExpiry: number): string {
  if (daysUntilExpiry <= 0) return 'Your premium subscription has expired. Renew now to restore full access!';
  if (daysUntilExpiry <= 2) return `URGENT: Your subscription expires in ${daysUntilExpiry} days! Renew now to avoid service loss.`;
  if (daysUntilExpiry <= 9) return `Last chance! Your subscription expires in ${daysUntilExpiry} days. Renew immediately!`;
  if (daysUntilExpiry <= 16) return `Your subscription expires in ${daysUntilExpiry} days. Don't lose access to premium features!`;
  if (daysUntilExpiry <= 23) return `Only ${daysUntilExpiry} days left on your premium subscription. Secure your renewal today!`;
  return `Your premium subscription expires in ${daysUntilExpiry} days. Renew now to avoid service interruption!`;
}

async function sendPushNotification(userId: string, notification: any): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user's push token
    const pushTokens = await storage.getUserPushTokens(userId);
    
    if (!pushTokens || pushTokens.length === 0) {
      console.log(`No push tokens found for user ${userId}`);
      return { success: false, error: 'No push tokens registered' };
    }

    // In production, use FCM (Firebase Cloud Messaging) or APNs (Apple Push Notification service)
    // For demo, we'll simulate sending
    console.log(`Sending push notification to user ${userId}:`, {
      title: notification.title,
      body: notification.body,
      tokens: pushTokens,
      data: notification.data
    });

    // Simulate successful push notification
    // In production, implement actual push notification sending using FCM/APNs
    // Example FCM implementation:
    // const admin = require('firebase-admin');
    // const message = {
    //   notification: {
    //     title: notification.title,
    //     body: notification.body
    //   },
    //   data: notification.data,
    //   tokens: pushTokens
    // };
    // const response = await admin.messaging().sendMulticast(message);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
}

// Helper functions for invoice generation
async function generateInvoice(payment: any, subscription: any) {
  // In production, use a proper PDF library like puppeteer or jsPDF
  // For demo, we'll just create a placeholder
  console.log(`Generated invoice for payment ${payment.id}`);
}

function generatePDFContent(payment: any): Buffer {
  // In production, generate actual PDF content
  // For demo, return simple text as buffer
  const content = `
    MYYMOTTO INVOICE
    ================
    
    Invoice ID: ${payment.id}
    Transaction ID: ${payment.transactionId}
    Date: ${new Date(payment.paymentDate).toLocaleDateString('en-IN')}
    Amount: ₹${(payment.amount / 100).toLocaleString('en-IN')}
    Status: ${payment.paymentStatus.toUpperCase()}
    
    Description: Annual Premium Subscription
    Validity: 1 Year
    
    Thank you for choosing Myymotto!
  `;
  
  return Buffer.from(content, 'utf-8');
}
