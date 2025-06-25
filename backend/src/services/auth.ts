import { User } from '../entities/User.js';
import { AppDataSource } from '../config/database.js';
import * as jose from 'jose';
import type { UserPayload, RegisterRequest } from '../types/auth.js';
import { Logger } from '../utils/logger.js';

interface JWTPayload extends jose.JWTPayload {
  sub: string;
  email: string;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<User> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      
      // Check if user already exists
      const existingUser = await userRepo.findOne({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Create new user
      const user = userRepo.create({
        email: data.email,
        isVerified: false
      });

      return await userRepo.save(user);
    } catch (error) {
      Logger.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      return await userRepo.findOne({ where: { email } });
    } catch (error) {
      Logger.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Check if user exists
   */
  static async userExists(email?: string): Promise<{ emailExists: boolean }> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      
      if (!email) {
        return { emailExists: false };
      }

      const user = await userRepo.findOne({ where: { email } });
      
      return {
        emailExists: !!user
      };
    } catch (error) {
      Logger.error('Error checking user existence:', error);
      return { emailExists: false };
    }
  }

  async generateToken(user: User): Promise<string> {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email || ''
    };

    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    return token;
  }

  async verifyToken(token: string): Promise<UserPayload> {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const jwtPayload = payload as JWTPayload;
      
      return {
        sub: jwtPayload.sub,
        email: jwtPayload.email
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }
} 