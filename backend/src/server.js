const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config(); // Load env vars first

if (!process.env.UPLOADTHING_TOKEN) {
    console.warn("⚠️  WARNING: UPLOADTHING_TOKEN is missing in .env file! File uploads will not work.");
} else {
    const token = process.env.UPLOADTHING_TOKEN;
    console.log(`✅ UPLOADTHING_TOKEN found. Length: ${token.length}`);
    if (token.startsWith("eyJ")) {
        console.log("ℹ️  Token format looks correct (starts with eyJ...)");
    } else {
        console.error(`❌ Token format looks WRONG. Starts with: '${token.substring(0, 5)}...'. It should start with 'eyJ'.`);
    }
}

// Check Groq API Key
if (!process.env.GROQ_API_KEY) {
    console.warn("⚠️  WARNING: GROQ_API_KEY is missing in .env file! Transcription will not work.");
} else {
    const groqKey = process.env.GROQ_API_KEY;
    console.log(`✅ GROQ_API_KEY found. Length: ${groqKey.length}`);
    if (groqKey.startsWith("gsk_")) {
        console.log("ℹ️  Groq API key format looks correct (starts with gsk_...)");
    } else {
        console.error(`❌ Groq API key format looks WRONG. Starts with: '${groqKey.substring(0, 5)}...'. It should start with 'gsk_'.`);
    }
}

const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
require('./config/passport'); // Passport config

connectDB();

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true, // Allow cookies
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const { updateLastActive } = require('./middleware/activityTracker');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', updateLastActive, require('./routes/adminRoutes'));
app.use('/api/courses', updateLastActive, require('./routes/courseRoutes'));
app.use('/api/gamification', updateLastActive, require('./routes/gamificationRoutes'));

const { createRouteHandler } = require("uploadthing/express");
const { uploadRouter } = require("./services/uploadthing");

app.use(
    "/api/uploadthing",
    createRouteHandler({
        router: uploadRouter,
    }),
);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// 404 JSON Handler
app.use((req, res) => {
    res.status(404).json({ message: `Protocol Error: Tactical path '${req.originalUrl}' not found in Command Core.` });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
