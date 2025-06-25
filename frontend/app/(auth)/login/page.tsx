'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { loginWeb2, registerWeb2 } = useAuthStore();
  
  // Form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateUsername = (username: string): boolean => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  const getErrorMessage = (error: any): string => {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error?.message) {
        return error.response.data.error.message;
      }
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
      if (error.message) {
        return error.message;
      }
    }
    return 'An unexpected error occurred.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setUsernameError(null);

    // Validate email
    if (!email.trim() || !validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    // Validate password
    if (!password.trim() || !validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    // Validate confirm password for registration
    if (authMode === 'register' && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }

    // Validate username for registration
    if (authMode === 'register' && (!username.trim() || !validateUsername(username))) {
      setUsernameError('Username must be at least 3 characters and contain only letters, numbers, and underscores.');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'login') {
        await loginWeb2({ email, password });
        setSuccess('Successfully logged in! Redirecting...');
        setTimeout(() => router.push('/marketplace'), 1000);
      } else {
        // For registration, we need to provide additional fields
        await registerWeb2({ 
          email, 
          password,
          username: username.trim(),
          firstName: firstName.trim() || '',
          lastName: lastName.trim() || ''
        });
        setSuccess('Account created! Logging you in...');
        
        // After successful registration, log in
        await loginWeb2({ email, password });
        setSuccess('Successfully logged in! Redirecting...');
        setTimeout(() => router.push('/marketplace'), 1000);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setError('This email is already registered. Please try logging in.');
      } else {
        setError(getErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setFirstName('');
    setLastName('');
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setUsernameError(null);
    setSuccess(null);
  };

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Simple',
      description:
        'Traditional email and password authentication with enterprise-grade security.',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Instant Access',
      description:
        'Sign in and start trading AI agents immediately with fiat payments.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Community Driven',
      description:
        'Join thousands of creators and collectors in the world\'s premier AI agent marketplace.',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="text-purple-500">LegionX</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Sign in to access the AI agent marketplace
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold mb-6">
              Why Choose Email Authentication?
            </h2>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-gray-900/30 rounded-xl border border-gray-800"
              >
                <div className="bg-purple-900/30 text-purple-400 p-3 rounded-full flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right side - Authentication Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-900/50 p-8 rounded-xl border border-gray-800"
          >
            <div className="text-center mb-6">
              <div className="bg-purple-900/30 text-purple-400 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {authMode === 'login'
                  ? 'Sign In to Your Account'
                  : 'Create Your Account'}
              </h2>
              <p className="text-gray-400">
                {authMode === 'login'
                  ? 'Enter your email and password to access the marketplace'
                  : 'Create a new account to start trading AI agents'}
              </p>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex border border-gray-700 rounded-lg p-1 mb-6">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                  authMode === 'login'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => {
                  setAuthMode('login');
                  resetForm();
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                  authMode === 'register'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => {
                  setAuthMode('register');
                  resetForm();
                }}
              >
                Register
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md text-sm mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="mb-3">{error}</p>
                    <button
                      onClick={resetForm}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded-md text-sm flex items-center mb-4">
                <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {passwordError}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long.
                </p>
              </div>

              {/* Confirm Password Input (Registration only) */}
              {authMode === 'register' && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError) setConfirmPasswordError(null);
                      }}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  {confirmPasswordError && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              )}

              {/* Username Input (Registration only) */}
              {authMode === 'register' && (
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (usernameError) setUsernameError(null);
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your username"
                    required
                  />
                  {usernameError && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {usernameError}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Username must be at least 3 characters and contain only letters, numbers, and underscores.
                  </p>
                </div>
              )}

              {/* Name Fields (Registration only) */}
              {authMode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="First name (optional)"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Last name (optional)"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {authMode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Terms */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>By creating an account, you agree to our</p>
              <p className="mt-1">
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </a>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">
            Want to explore without an account?
          </p>
          <a
            href="/marketplace"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium"
          >
            Browse Marketplace
            <ArrowRight className="h-4 w-4 ml-1" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
