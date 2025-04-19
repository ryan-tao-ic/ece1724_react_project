import crypto from 'crypto';

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function getVerificationTokenExpiry() {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // Token expires in 24 hours
  return expiry;
}

export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function getPasswordResetTokenExpiry() {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // Token expires in 1 hour
  return expiry;
} 