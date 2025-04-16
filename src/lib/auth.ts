import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { JwtOptions, JwtPayload,  } from "@/types/auth";


const SALT_ROUNDS = 12; // più alto è meglio, ma diventa più lento
const JWT_SECRET = process.env.JWT_SECRET as string;

export async function verifyPassword(password: string, hashedPassword: string) {
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
}

export async function hashPassword(password: string) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
}



/**
 * Creates a JWT token
 * @param payload The data to be encoded in the token
 * @param options JWT sign options
 * @returns The generated JWT token
 */
export function createToken(
  payload: JwtPayload, 
  options: JwtOptions = {}
): string {
  // Default expiration is 24 hours if not specified
  const defaultOptions: JwtOptions = { 
    expiresIn: '24h'
  };
  
  // Merge default options with provided options
  const tokenOptions: JwtOptions = { ...defaultOptions, ...options };
  
  // Generate the token
  return jwt.sign(payload, JWT_SECRET, tokenOptions);
}

/**
 * Verifies a JWT token
 * @param token The token to verify
 * @returns The decoded payload or null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null; // Invalid token
  }
}