import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import * as jose from 'jose';
import { UserPayload } from '../types/auth';

interface JWTPayload extends jose.JWTPayload {
  sub: string;
  email: string;
  wallet?: string;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async createUser(email: string, wallet?: string): Promise<User> {
    const user = this.userRepository.create({
      email,
      wallet
    });
    return await this.userRepository.save(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async getUserByWallet(wallet: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { wallet } });
  }

  async linkWallet(email: string, wallet: string): Promise<User> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    user.wallet = wallet;
    return await this.userRepository.save(user);
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