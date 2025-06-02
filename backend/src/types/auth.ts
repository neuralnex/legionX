export interface UserPayload {
  sub: string;
  email: string;
  wallet?: string;
  iat?: number;
  exp?: number;
}

export interface RegisterRequest {
  email: string;
  wallet?: string;
}

export interface LinkWalletRequest {
  email: string;
  wallet: string;
}

export interface AuthError {
  code: string;
  message: string;
}

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
    }
  }
} 