import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import * as jose from 'jose';
import { UserPayload } from '../types/auth';
import { RegisterRequest, LinkWalletRequest } from '../types/auth';
import { Logger } from '../utils/logger';

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
      
      // Create new user
      const user = userRepo.create({
        email: data.email,
        wallet: data.wallet,
        username: data.email.split('@')[0], // Generate username from email
        password: '', // Password will be set later
      });

      // Save user
      return await userRepo.save(user);
    } catch (error) {
      Logger.error('Error registering user:', error);
      throw new Error('Failed to register user');
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
      sub: user.id.toString(),
      email: user.email,
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
        sub: parseInt(jwtPayload.sub),
        email: jwtPayload.email,
        wallet: jwtPayload.wallet
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 