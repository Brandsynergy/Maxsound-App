import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 Testing VAPID Keys Configuration...\n');

const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:admin@example.com';

console.log('Public Key:', publicKey ? `${publicKey.substring(0, 20)}...` : '❌ NOT SET');
console.log('Private Key:', privateKey ? `${privateKey.substring(0, 20)}...` : '❌ NOT SET');
console.log('Subject:', subject);
console.log();

if (!publicKey || !privateKey) {
  console.error('❌ VAPID keys are not set in environment variables');
  process.exit(1);
}

try {
  webpush.setVapidDetails(subject, publicKey, privateKey);
  console.log('✅ VAPID keys are valid and configured successfully!');
  console.log('\n✨ Push notifications will work in production.\n');
} catch (error) {
  console.error('❌ VAPID key validation failed:', error.message);
  console.log('\n💡 Tips:');
  console.log('  - Make sure keys have no extra spaces or line breaks');
  console.log('  - Private key should be URL-safe Base64 (no "=" padding)');
  console.log('  - Generate new keys with: node generate-vapid-keys.js\n');
  process.exit(1);
}
