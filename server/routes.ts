import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertDocumentSchema, insertUserProfileSchema, signInSchema, verifyOtpSchema, insertUserSchema, type InsertVehicle, type InsertDocument, type InsertUserProfile, type SignInData, type VerifyOtpData, type InsertUser } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
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
      const validatedData = insertUserProfileSchema.partial().parse(req.body);
      const profile = await storage.updateUserProfile(userId, validatedData);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
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
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
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
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, validatedData);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update vehicle" });
      }
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteVehicle(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Document routes
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
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const documentData = {
        vehicleId,
        type: type || 'other',
        fileName: req.file.originalname,
        filePath: req.file.path,
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

      // Delete file from filesystem
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      const deleted = await storage.deleteDocument(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
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

  const httpServer = createServer(app);
  return httpServer;
}
