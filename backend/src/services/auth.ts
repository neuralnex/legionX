import { User } from '../entities/User.js';
import { AppDataSource } from '../config/database.js';
import * as jose from 'jose';
import type { UserPayload, RegisterRequest, LinkWalletRequest } from '../types/auth.js';
import { Logger } from '../utils/logger.js';

interface JWTPayload extends jose.JWTPayload {
  sub: string;
  email: string;
  wallet?: string;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<User> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      
      // Check if user with this email already exists
      const existingUserByEmail = await userRepo.findOne({ where: { email: data.email } });
      if (existingUserByEmail) {
        throw new Error('User with this email already exists');
      }

      // Check if user with this wallet already exists
      if (data.wallet) {
        const existingUserByWallet = await userRepo.findOne({ where: { wallet: data.wallet } });
        if (existingUserByWallet) {
          throw new Error('User with this wallet address already exists');
        }
      }
      
      // Create new user
      const user = userRepo.create({
        email: data.email,
        wallet: data.wallet,
        address: data.wallet || '',
        name: data.email.split('@')[0], // Generate name from email
      });

      // Save user
      return await userRepo.save(user);
    } catch (error) {
      Logger.error('Error registering user:', error);
      throw error; // Re-throw the specific error message
    }
  }

  /**
   * Check if user exists by email or wallet
   */
  static async userExists(email?: string, wallet?: string): Promise<{ emailExists: boolean; walletExists: boolean }> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      
      let emailExists = false;
      let walletExists = false;

      if (email) {
        const existingUserByEmail = await userRepo.findOne({ where: { email } });
        emailExists = !!existingUserByEmail;
      }

      if (wallet) {
        const existingUserByWallet = await userRepo.findOne({ where: { wallet } });
        walletExists = !!existingUserByWallet;
      }

      return { emailExists, walletExists };
    } catch (error) {
      Logger.error('Error checking if user exists:', error);
      throw new Error('Failed to check user existence');
    }
  }

  /**
   * Find user by wallet address
   */
  static async findByWallet(wallet: string): Promise<User | null> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      return await userRepo.findOne({ where: { wallet } });
    } catch (error) {
      Logger.error('Error finding user by wallet:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Link wallet to user
   */
  static async linkWallet(data: LinkWalletRequest): Promise<User> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { email: data.email } });

      if (!user) {
        throw new Error('User not found');
      }

      user.wallet = data.wallet;
      user.address = data.wallet;
      return await userRepo.save(user);
    } catch (error) {
      Logger.error('Error linking wallet:', error);
      throw new Error('Failed to link wallet');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async getUserByWallet(wallet: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { wallet } });
  }

  async generateToken(user: User): Promise<string> {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email || '',
      wallet: user.wallet
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
        email: jwtPayload.email,
        wallet: jwtPayload.wallet
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 