/**
 * Environment variables schema and validation
 * Used by validate-env.js script
 */

const envSchema = {
  // Firebase - Required
  required: [
    {
      key: 'NEXT_PUBLIC_FIREBASE_API_KEY',
      description: 'Firebase API Key',
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      description: 'Firebase Auth Domain (e.g., project-id.firebaseapp.com)',
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      description: 'Firebase Project ID',
    },
  ],

  // Firebase - Optional (có default hoặc không bắt buộc cho dev)
  optional: [
    {
      key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      description: 'Firebase Storage Bucket',
      default: '',
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      description: 'Firebase Messaging Sender ID',
      default: '',
    },
    {
      key: 'NEXT_PUBLIC_FIREBASE_APP_ID',
      description: 'Firebase App ID',
      default: '',
    },
  ],

  // App URLs - Optional với defaults
  urls: [
    {
      key: 'NEXT_PUBLIC_AUTH_URL',
      description: 'Auth app URL',
      default: 'http://localhost:3000',
    },
    {
      key: 'NEXT_PUBLIC_ADMIN_URL',
      description: 'Admin app URL',
      default: 'http://localhost:3001',
    },
    {
      key: 'NEXT_PUBLIC_STUDENT_URL',
      description: 'Student app URL',
      default: 'http://localhost:3002',
    },
  ],
};

module.exports = { envSchema };
