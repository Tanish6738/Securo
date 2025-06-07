// API configuration for MailService
const getApiBase = () => {
  // In production, always use the Render service
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://securo-mail-service.onrender.com';
  }
  
  // In development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  
  // Default to production service
  return 'https://securo-mail-service.onrender.com';
};

const API_BASE = getApiBase();

// Validation to ensure API_BASE is never empty or malformed
if (!API_BASE || API_BASE === '""' || API_BASE === "''" || API_BASE.includes('""')) {
  console.error('❌ API_BASE is malformed:', API_BASE);
  throw new Error('API_BASE configuration is invalid');
}

console.log('✅ API_BASE configured as:', API_BASE);

export { API_BASE };
