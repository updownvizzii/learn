/**
 * Test script for Groq Whisper transcription
 * 
 * Usage:
 * 1. Make sure backend server is running
 * 2. Update the variables below with your actual IDs
 * 3. Run: node testTranscription.js
 */

const axios = require('axios');

// ========== CONFIGURATION ==========
const BASE_URL = 'http://localhost:5000/api';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'; // Get from localStorage after login
const COURSE_ID = 'YOUR_COURSE_ID_HERE';       // Get from database
const LECTURE_ID = 'YOUR_LECTURE_ID_HERE';     // Get from database
// ===================================

async function testTranscription() {
    console.log('🎬 Starting Transcription Test...\n');

    try {
        // Test 1: Transcribe a lecture
        console.log('📝 Test 1: Transcribing lecture...');
        const transcribeResponse = await axios.post(
            `${BASE_URL}/courses/${COURSE_ID}/lectures/${LECTURE_ID}/transcribe`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
            }
        );

        console.log('✅ Transcription successful!');
        console.log('📄 Transcript preview:', transcribeResponse.data.transcript.substring(0, 200) + '...');
        console.log('⏱️  Duration:', transcribeResponse.data.duration, 'seconds');
        console.log('🌍 Language:', transcribeResponse.data.language);
        console.log('📊 Segments:', transcribeResponse.data.segments?.length || 0);
        console.log('');

        // Test 2: Get the transcript
        console.log('📖 Test 2: Fetching transcript...');
        const getResponse = await axios.get(
            `${BASE_URL}/courses/${COURSE_ID}/lectures/${LECTURE_ID}/transcript`,
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
            }
        );

        console.log('✅ Transcript retrieved!');
        console.log('📝 Status:', getResponse.data.status);
        console.log('📄 Has transcript:', getResponse.data.hasTranscript);
        console.log('');

        console.log('🎉 All tests passed!');

    } catch (error) {
        console.error('❌ Test failed!');

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Message:', error.response.data.message || error.response.data);
        } else {
            console.error('Error:', error.message);
        }

        console.log('\n💡 Troubleshooting:');
        console.log('1. Make sure backend server is running');
        console.log('2. Check that GROQ_API_KEY is set in .env');
        console.log('3. Verify ACCESS_TOKEN, COURSE_ID, and LECTURE_ID are correct');
        console.log('4. Ensure the lecture has a video uploaded');
    }
}

// Run the test
if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
    console.log('⚠️  Please update the configuration variables at the top of this file first!');
    console.log('You need to set:');
    console.log('- ACCESS_TOKEN (get from browser localStorage after login)');
    console.log('- COURSE_ID (get from database)');
    console.log('- LECTURE_ID (get from database)');
} else {
    testTranscription();
}
