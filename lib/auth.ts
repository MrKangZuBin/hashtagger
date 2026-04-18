import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  plan: string;
  subscriptionStatus: string | null;
  subscriptionEndDate: Date | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function generateVerificationToken(): string {
  return crypto.randomUUID() + '-' + crypto.randomUUID();
}

export function getUserFromToken(token: string): AuthUser | null {
  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    email: payload.email,
    isVerified: true, // Will be refreshed from DB
    isAdmin: payload.isAdmin,
    plan: 'FREE',
    subscriptionStatus: null,
    subscriptionEndDate: null,
  };
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    isAdmin: user.isAdmin,
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionEndDate: user.subscriptionEndDate,
  };
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export { prisma };
