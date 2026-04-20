import { AsyncLocalStorage } from "node:async_hooks";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authConfig } from "@/config/env.config";
import type { User } from "@/database/entities/User.entity";

const JWT_SECRET = authConfig.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
const SALT_ROUNDS = 10;

export interface AuthUser {
  user_id: string;
  email: string;
  name: string;
}

export const authContext = new AsyncLocalStorage<AuthUser | null>();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User | AuthUser): string {
  const payload: AuthUser = {
    user_id: user.user_id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  return authContext.getStore() ?? null;
}

export function getCurrentUserEmail(): string | null {
  const user = getCurrentUser();
  return user?.email ?? null;
}

export function requireAuth(): AuthUser {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
