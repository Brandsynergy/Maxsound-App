import webpush from 'web-push';

console.log('\n🔑 Generating VAPID Keys for Push Notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Copy these values to your Render Environment Variables:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\nVAPID_PUBLIC_KEY:');
console.log(vapidKeys.publicKey);
console.log('\nVAPID_PRIVATE_KEY:');
console.log(vapidKeys.privateKey);
console.log('\nVAPID_SUBJECT:');
console.log('mailto:your-email@example.com  (replace with your email)');
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
