'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { Search, Wallet, LogOut } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

const Navbar = () => {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const { isConnected, address } = useWallet();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0a14]/90 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">
                Legion<span className="text-purple-500">X</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:block mx-4 flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for AI agents..."
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/" active={pathname === '/'}>
              Home
            </NavLink>
            <NavLink href="/explore" active={pathname === '/explore'}>
              Explore
            </NavLink>
            <NavLink
              href="/marketplace"
              active={pathname.startsWith('/marketplace')}
            >
              Agents
            </NavLink>
            <NavLink
              href="/agents/create"
              active={pathname === '/agents/create'}
            >
              Creators
            </NavLink>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Wallet Status */}
                <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1 rounded-full">
                  <div
                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}
                  ></div>
                  <Wallet className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-300">
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : 'Not Connected'}
                  </span>
                </div>

                {/* User Menu */}
                <Link href="/profile">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.username
                        ? user.username.charAt(0).toUpperCase()
                        : 'U'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => logout()}
                  className="text-sm text-gray-300 hover:text-white flex items-center"
                  title="Disconnect Wallet"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </motion.button>
              </Link>
            )}
          </nav>

          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-[#0a0a14]/95 backdrop-blur-md border-t border-gray-800"
        >
          <div className="px-4 py-4 space-y-4">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for AI agents..."
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <nav className="space-y-2">
              <MobileNavLink
                href="/"
                active={pathname === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </MobileNavLink>
              <MobileNavLink
                href="/explore"
                active={pathname === '/explore'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore
              </MobileNavLink>
              <MobileNavLink
                href="/marketplace"
                active={pathname.startsWith('/marketplace')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Agents
              </MobileNavLink>
              <MobileNavLink
                href="/creators"
                active={pathname === '/creators'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Creators
              </MobileNavLink>
            </nav>

            {isAuthenticated ? (
              <div className="pt-4 border-t border-gray-800 space-y-4">
                <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-full">
                  <div
                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}
                  ></div>
                  <Wallet className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-300">
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : 'Not Connected'}
                  </span>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user?.username
                          ? user.username.charAt(0).toUpperCase()
                          : 'U'}
                      </span>
                    </div>
                    <span className="text-white">Profile</span>
                  </div>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-sm text-gray-300 hover:text-white flex items-center p-3 bg-gray-800/30 rounded-lg"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-800">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-full text-sm font-medium flex items-center justify-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink = ({ href, active, children }: NavLinkProps) => {
  return (
    <Link href={href} className="relative">
      <span
        className={`text-sm ${active ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
      >
        {children}
      </span>
      {active && (
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-500"
          layoutId="navbar-indicator"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
};

interface MobileNavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

const MobileNavLink = ({
  href,
  active,
  children,
  onClick,
}: MobileNavLinkProps) => {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={`block px-3 py-2 rounded-md text-base font-medium ${
          active
            ? 'text-white bg-purple-600'
            : 'text-gray-300 hover:text-white hover:bg-gray-800'
        }`}
      >
        {children}
      </div>
    </Link>
  );
};

export default Navbar;
