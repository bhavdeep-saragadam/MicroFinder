export const CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  
  // App settings
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png'],
  MIN_CONFIDENCE_SCORE: 0.7,
  
  // Cache settings
  MAX_OFFLINE_DISCOVERIES: 50,
  CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  
  // Quiz settings
  QUESTIONS_PER_QUIZ: 10,
  QUIZ_TIME_LIMIT: 15 * 60, // 15 minutes in seconds
  
  // API endpoints
  API_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export type Config = typeof CONFIG; 