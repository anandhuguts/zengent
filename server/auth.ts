import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import bcrypt from 'bcrypt';
import type { User } from '@shared/schema';

// Hardcoded credentials (encrypted with bcrypt)
// Username: amex, Password: zensar
const HARDCODED_USER = {
  id: '1',
  username: 'amex',
  // This is the bcrypt hash of 'zensar'
  passwordHash: '$2b$10$XLQ6uE/BxSix3/g9WiwYr.otCambinmo40O1yGTbUKzmAwD5.Jyom',
  email: 'amex@example.com',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Validate user credentials
export async function validateHardcodedUser(username: string, password: string): Promise<User | undefined> {
  if (username.toLowerCase() !== HARDCODED_USER.username.toLowerCase()) {
    return undefined;
  }
  
  // Compare password with hash
  const isValid = await bcrypt.compare(password, HARDCODED_USER.passwordHash);
  if (!isValid) {
    return undefined;
  }
  
  return {
    id: HARDCODED_USER.id,
    username: HARDCODED_USER.username,
    password: HARDCODED_USER.passwordHash,
    email: HARDCODED_USER.email,
    firstName: null,
    lastName: null,
    position: null,
    profileImageUrl: null,
    isActive: true,
    createdAt: HARDCODED_USER.createdAt,
    updatedAt: HARDCODED_USER.updatedAt
  };
}

// Session configuration
export function setupSession(app: express.Application) {
  const MemStore = MemoryStore(session);
  
  app.use(session({
    store: new MemStore({
      checkPeriod: 86400000 // 24 hours cleanup
    }),
    // Hardcoded session secret (no external dependencies per user requirement)
    // Note: In production, this should be stored securely or loaded from environment
    secret: 'code-lens-session-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
    name: 'connect.sid',
  }));
}

// Auth middleware
export function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Optional auth middleware (doesn't require auth but adds user if available)
export function optionalAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  // User info is available in req.session.user if logged in
  next();
}

// Extend session type
declare module 'express-session' {
  interface SessionData {
    user?: User;
  }
}