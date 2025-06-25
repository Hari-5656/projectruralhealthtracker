import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { insertUserSchema, insertPatientSchema, insertVaccinationSchema, insertAppointmentSchema } from "@shared/schema";
import "./types";

// Simple auth middleware
const requireAuth = async (req: any, res: any, next: any) => {
  console.log('Session check:', { 
    sessionId: req.sessionID, 
    userId: req.session?.userId,
    hasSession: !!req.session 
  });
  
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Verify user still exists and is active
  const user = await storage.getUser(req.session.userId);
  if (!user || !user.isActive) {
    req.session.destroy(() => {});
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  req.user = user;
  next();
};

const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  const sessionStore = MemoryStore(session);
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    store: new sessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password, name, email, phone, isFirstUser } = req.body;
      
      if (!username || !password || !name) {
        return res.status(400).json({ message: "Username, password, and name are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if this is the first user (make them admin)
      const allUsers = await storage.getAllUsers();
      const role = allUsers.length === 0 || isFirstUser ? 'admin' : 'health_worker';

      const newUser = await storage.createUser({
        username,
        password,
        name,
        email: email || null,
        phone: phone || null,
        role,
        isActive: true,
      });

      req.session.userId = newUser.id;
      console.log('Setting session userId:', newUser.id);
      
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        } else {
          console.log('Session saved successfully with userId:', req.session.userId);
        }
      });
      
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) console.error('Session save error:', err);
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.get("/api/auth/setup", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json({ needsSetup: allUsers.length === 0 });
    } catch (error) {
      console.error("Setup check error:", error);
      res.status(500).json({ message: "Failed to check setup status" });
    }
  });

  // User management routes (Admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Patient routes
  app.get("/api/patients", requireAuth, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const patients = await storage.getAllPatients(
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(patients);
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({ message: "Failed to get patients" });
    }
  });

  app.get("/api/patients/search", requireAuth, async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      const patients = await storage.searchPatients(q);
      res.json(patients);
    } catch (error) {
      console.error("Search patients error:", error);
      res.status(500).json({ message: "Failed to search patients" });
    }
  });

  app.get("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      console.error("Get patient error:", error);
      res.status(500).json({ message: "Failed to get patient" });
    }
  });

  app.get("/api/patients/qr/:qrCode", requireAuth, async (req, res) => {
    try {
      const { qrCode } = req.params;
      const patient = await storage.getPatientByQRCode(qrCode);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      console.error("Get patient by QR error:", error);
      res.status(500).json({ message: "Failed to get patient by QR code" });
    }
  });

  app.post("/api/patients", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertPatientSchema.parse({
        ...req.body,
        createdBy: req.session.userId,
      });
      const patient = await storage.createPatient(validatedData);
      res.json(patient);
    } catch (error) {
      console.error("Create patient error:", error);
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.put("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const patient = await storage.updatePatient(id, updates);
      res.json(patient);
    } catch (error) {
      console.error("Update patient error:", error);
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  // Vaccine routes
  app.get("/api/vaccines", requireAuth, async (req, res) => {
    try {
      const vaccines = await storage.getAllVaccines();
      res.json(vaccines);
    } catch (error) {
      console.error("Get vaccines error:", error);
      res.status(500).json({ message: "Failed to get vaccines" });
    }
  });

  // Vaccination routes
  app.get("/api/patients/:id/vaccinations", requireAuth, async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const vaccinations = await storage.getVaccinationsByPatient(patientId);
      res.json(vaccinations);
    } catch (error) {
      console.error("Get vaccinations error:", error);
      res.status(500).json({ message: "Failed to get vaccinations" });
    }
  });

  app.post("/api/vaccinations", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertVaccinationSchema.parse({
        ...req.body,
        administeredBy: req.session.userId,
      });
      const vaccination = await storage.createVaccination(validatedData);
      res.json(vaccination);
    } catch (error) {
      console.error("Create vaccination error:", error);
      res.status(500).json({ message: "Failed to create vaccination" });
    }
  });

  app.put("/api/vaccinations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const vaccination = await storage.updateVaccination(id, updates);
      res.json(vaccination);
    } catch (error) {
      console.error("Update vaccination error:", error);
      res.status(500).json({ message: "Failed to update vaccination" });
    }
  });

  app.get("/api/vaccinations/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getVaccinationStats();
      res.json(stats);
    } catch (error) {
      console.error("Get vaccination stats error:", error);
      res.status(500).json({ message: "Failed to get vaccination stats" });
    }
  });

  // Appointment routes
  app.get("/api/appointments/today", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getTodayAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Get today appointments error:", error);
      res.status(500).json({ message: "Failed to get today's appointments" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse({
        ...req.body,
        createdBy: req.session.userId,
      });
      const appointment = await storage.createAppointment(validatedData);
      res.json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const appointment = await storage.updateAppointment(id, updates);
      res.json(appointment);
    } catch (error) {
      console.error("Update appointment error:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const [patients, vaccinationStats] = await Promise.all([
        storage.getAllPatients(1000, 0), // Get total count
        storage.getVaccinationStats(),
      ]);

      res.json({
        totalPatients: patients.length,
        ...vaccinationStats,
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
