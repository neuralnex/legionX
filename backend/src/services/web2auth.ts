import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload as JoseJWTPayload } from 'jose';
import { AppDataSource } from '../config/database.js';
import { User } from '../entities/User.js';
import { Logger } from '../utils/logger.js';

export interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CustomJWTPayload extends JoseJWTPayload {
  userId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'creator' | 'admin';
}

export class Web2AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private logger = new Logger('Web2AuthService');

  /**
   * Register a new user with email/password
   */
  async register(data: RegisterData): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: data.email },
          { username: data.username }
        ]
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw new Error('Email already registered');
        }
        if (existingUser.username === data.username) {
          throw new Error('Username already taken');
        }
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Create new user
      const user = this.userRepository.create({
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        isVerified: false
      });

      const savedUser = await this.userRepository.save(user);
      this.logger.info(`User registered: ${data.email}`);
      
      return savedUser;
    } catch (error) {
      this.logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user with email/password
   */
  async login(data: LoginData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    try {
      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email: data.email }
      });

      if (!user || !user.passwordHash) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);

      // Update user
      user.refreshToken = refreshToken;
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      this.logger.info(`User logged in: ${data.email}`);
      
      return { user, accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Generate access token
   */
  async generateAccessToken(user: User): Promise<string> {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    
    const payload: CustomJWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: 'user', // Default role, can be enhanced later
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    };

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secret);
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken(user: User): Promise<string> {
    const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');
    
    const payload = {
      userId: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token: string): Promise<CustomJWTPayload> {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
      const { payload } = await jwtVerify(token, secret);
      return payload as unknown as CustomJWTPayload;
    } catch (error) {
      this.logger.error('Token verification error:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');
      const { payload } = await jwtVerify(refreshToken, secret);
      
      const user = await this.userRepository.findOne({
        where: { id: payload.userId as string }
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const newAccessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);

      // Update refresh token in database
      user.refreshToken = newRefreshToken;
      await this.userRepository.save(user);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      this.logger.error('Token refresh error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId }
    });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email }
    });
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (user) {
        user.refreshToken = undefined;
        await this.userRepository.save(user);
        this.logger.info(`User logged out: ${userId}`);
      }
    } catch (error) {
      this.logger.error('Logout error:', error);
      throw error;
    }
  }
} 