// Quick test to verify Groq API key works
require('dotenv').config();
const Groq = require('groq-sdk');

console.log('Testing Groq API Key...\n');

// Check if key exists
if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in environment variables!');
    console.log('Make sure you have GROQ_API_KEY in your .env file');
    process.exit(1);
}

const apiKey = process.env.GROQ_API_KEY;
console.log(`✅ GROQ_API_KEY found`);
console.log(`   Length: ${apiKey.length}`);
console.log(`   Starts with: ${apiKey.substring(0, 10)}...`);
console.log(`   Format check: ${apiKey.startsWith('gsk_') ? '✅ Valid format' : '❌ Invalid format'}\n`);

// Try to initialize Groq client
try {
    const groq = new Groq({ apiKey });
    console.log('✅ Groq client initialized successfully\n');

    // Try a simple API call to test the key
    console.log('Testing API key with a simple request...');

    // Note: We can't actually test transcription without a file,
    // but we can try to list models to verify the key works
    groq.models.list()
        .then(models => {
            console.log('✅ API KEY IS VALID! Successfully connected to Groq API');
            console.log(`   Available models: ${models.data.length}`);
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ API KEY IS INVALID!');
            console.error(`   Error: ${error.message}`);
            if (error.status === 401) {
                console.error('\n💡 Solution:');
                console.error('   1. Go to https://console.groq.com/');
                console.error('   2. Create a NEW API key');
                console.error('   3. Replace the GROQ_API_KEY in your .env file');
                console.error('   4. Restart the backend server');
            }
            process.exit(1);
        });

} catch (error) {
    console.error('❌ Failed to initialize Groq client');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
}
