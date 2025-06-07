// Utility functions for email and password generation

export function generateRandomPassword(length = 12) {
  return Math.random().toString(36).substring(2, 2 + length);
}

export function generateRandomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

export function generateTimestamp() {
  return Date.now().toString().slice(-6);
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeCustomName(name) {
  if (!name) return '';
  
  // Remove special characters and spaces, keep only alphanumeric
  return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 20);
}
