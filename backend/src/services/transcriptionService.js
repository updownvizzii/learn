const Groq = require('groq-sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Transcribe video/audio using Groq Whisper API
 * @param {string} videoUrl - URL of the video to transcribe
 * @returns {Promise<Object>} - Transcription result with text and metadata
 */
const transcribeVideo = async (videoUrl) => {
    let tempFilePath = null;

    try {
        console.log('Starting transcription for:', videoUrl);
        console.log('Video URL type:', typeof videoUrl);
        console.log('Attempting to download video...');

        // Download the video file with size check
        const response = await axios.get(videoUrl, {
            responseType: 'arraybuffer',
            timeout: 120000, // 2 minute timeout
            maxContentLength: 25 * 1024 * 1024, // 25MB limit
            maxBodyLength: 25 * 1024 * 1024
        });

        console.log('Download successful! Status:', response.status);
        console.log('Content-Type:', response.headers['content-type']);
        console.log('Data byte length:', response.data.byteLength);

        const fileSizeInMB = response.data.byteLength / (1024 * 1024);
        console.log(`Video file size: ${fileSizeInMB.toFixed(2)} MB`);

        // Check if file is empty
        if (response.data.byteLength === 0) {
            throw new Error('Downloaded file is empty. The video URL might be invalid or inaccessible.');
        }

        // Check file size (Groq Whisper has a 25MB limit)
        if (fileSizeInMB > 25) {
            throw new Error(`Video file is too large (${fileSizeInMB.toFixed(2)} MB). Maximum size is 25 MB. Please compress your video or use a shorter clip.`);
        }

        // Save to temporary file (Groq SDK needs actual file in Node.js)
        const fileBuffer = Buffer.from(response.data);
        const tempDir = os.tmpdir();
        tempFilePath = path.join(tempDir, `video_${Date.now()}.mp4`);

        fs.writeFileSync(tempFilePath, fileBuffer);
        console.log('Saved to temp file:', tempFilePath);
        console.log('Temp file exists:', fs.existsSync(tempFilePath));
        console.log('Temp file size:', fs.statSync(tempFilePath).size, 'bytes');
        console.log('Sending to Groq Whisper API...');

        // Use Groq's toFile helper for proper file upload
        const { toFile } = await import('groq-sdk/uploads');
        const file = await toFile(fs.createReadStream(tempFilePath), 'video.mp4');

        console.log('File object created, sending to Groq...');

        // Call Groq Whisper API
        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: 'whisper-large-v3',
            response_format: 'verbose_json'
            // Language auto-detection enabled
        });

        console.log('Transcription completed successfully');

        // Clean up temp file
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        return {
            success: true,
            text: transcription.text,
            segments: transcription.segments || [],
            duration: transcription.duration || 0,
            language: transcription.language || 'en'
        };

    } catch (error) {
        console.error('Transcription error:', error.message);
        console.error('Error details:', error.response?.data || error);

        // Clean up temp file on error
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        // Handle specific errors
        if (error.response?.status === 401) {
            throw new Error('Invalid Groq API key. Please check your GROQ_API_KEY in .env');
        }

        if (error.response?.status === 413 || error.code === 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED') {
            throw new Error('Video file is too large (max 25 MB). Please use a shorter video or compress it.');
        }

        if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('file must be one of')) {
            throw new Error('Unsupported file format. The video format is not compatible. Please try a different video or contact support.');
        }

        if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('no audio track')) {
            throw new Error('This video has no audio track. Transcription requires audio. Please upload a video with audio or use a different file.');
        }

        if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('file is empty')) {
            throw new Error('The video file appears to be empty or corrupted. Please try re-uploading the video.');
        }

        if (error.message.includes('too large')) {
            throw error; // Re-throw our custom size error
        }

        if (error.code === 'ECONNABORTED') {
            throw new Error('Video download timed out. The video might be too large or the connection is slow.');
        }

        throw new Error(`Transcription failed: ${error.message}`);
    }
};

/**
 * Generate transcript with timestamps
 * @param {Array} segments - Whisper segments from transcription
 * @returns {string} - Formatted transcript with timestamps
 */
const formatTranscriptWithTimestamps = (segments) => {
    if (!segments || segments.length === 0) return '';

    return segments.map(segment => {
        const start = formatTimestamp(segment.start);
        const end = formatTimestamp(segment.end);
        return `[${start} --> ${end}] ${segment.text}`;
    }).join('\n');
};

/**
 * Format seconds to HH:MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted timestamp
 */
const formatTimestamp = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

module.exports = {
    transcribeVideo,
    formatTranscriptWithTimestamps,
    formatTimestamp
};
