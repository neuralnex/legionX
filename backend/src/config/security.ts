// Validate required environment variables
const requiredEnvVars = {
  SSL_CA: process.env.SSL_CA,
  SSL_CERT: process.env.SSL_CERT,
  SSL_KEY: process.env.SSL_KEY,
};

// Check for missing environment variables in production
if (process.env.NODE_ENV === 'production') {
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required SSL environment variables in production: ${missingVars.join(', ')}`);
  }
}

export const sslConfig = process.env.NODE_ENV === 'production' ? {
  rejectUnauthorized: true,
  ca: requiredEnvVars.SSL_CA!,
  cert: requiredEnvVars.SSL_CERT!,
  key: requiredEnvVars.SSL_KEY!
} : false;