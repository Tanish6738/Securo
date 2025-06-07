// API configuration for MailService
const API_BASE = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_MAIL_SERVICE_URL || 'https://securo-mail-service.onrender.com'
  : 'http://localhost:3001';

export { API_BASE };
