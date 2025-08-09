import { Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export async function loginUser(username: string, password: string, req: Request): Promise<boolean> {
  const user = await storage.validateUser(username, password);
  if (user) {
    req.session.userId = user.id;
    return true;
  }
  return false;
}

export function logoutUser(req: Request): Promise<void> {
  return new Promise((resolve) => {
    req.session.destroy(() => {
      resolve();
    });
  });
}