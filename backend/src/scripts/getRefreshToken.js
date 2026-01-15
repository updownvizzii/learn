const { google } = require('googleapis');
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const port = 5000;

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `http://localhost:${port}/oauth2callback`
);

const scopes = [
    'https://www.googleapis.com/auth/drive.file'
];

app.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent' // Force to get refresh token
    });
    res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('\n--- SUCCESS! ---');
        console.log('Refresh Token:', tokens.refresh_token);
        console.log('----------------\n');
        res.send('<h1>Success!</h1><p>Check your terminal for the Refresh Token. You can close this tab now.</p>');
    } catch (error) {
        console.error('Error getting token:', error);
        res.status(500).send('Authentication failed');
    }
});

app.listen(port, () => {
    console.log(`\n1. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are in your .env`);
    console.log(`2. Go to: http://localhost:${port}/auth`);
});
