const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class CloudflareStreamService {
    constructor() {
        this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        this.apiToken = process.env.CLOUDFLARE_API_TOKEN;
        this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`;
    }

    /**
     * Upload video to Cloudflare Stream
     * @param {string} filePath - Path to the video file
     * @param {string} fileName - Original filename
     * @returns {Promise<Object>} - Video UID and details
     */
    async uploadVideo(filePath, fileName) {
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            // Optional metadata
            const metadata = {
                name: fileName,
                requireSignedURLs: false // Set to true for extra security
            };
            formData.append('meta', JSON.stringify(metadata));

            const response = await axios.post(this.baseUrl, formData, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    ...formData.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            if (response.data.success) {
                return {
                    uid: response.data.result.uid,
                    status: response.data.result.status.state,
                    thumbnail: response.data.result.thumbnail,
                    playback: response.data.result.playback,
                    preview: response.data.result.preview
                };
            } else {
                throw new Error('Upload failed: ' + JSON.stringify(response.data.errors));
            }
        } catch (error) {
            console.error('Cloudflare Stream upload error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get video details from Cloudflare Stream
     * @param {string} videoUid - Video UID
     * @returns {Promise<Object>} - Video details
     */
    async getVideoDetails(videoUid) {
        try {
            const response = await axios.get(`${this.baseUrl}/${videoUid}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                }
            });

            if (response.data.success) {
                return response.data.result;
            } else {
                throw new Error('Failed to get video details');
            }
        } catch (error) {
            console.error('Cloudflare Stream get video error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get playback URL for a video
     * @param {string} videoUid - Video UID
     * @returns {string} - Playback URL
     */
    getPlaybackUrl(videoUid) {
        // Standard playback URL format
        return `https://customer-${this.accountId.substring(0, 32)}.cloudflarestream.com/${videoUid}/manifest/video.m3u8`;
    }

    /**
     * Get iframe embed URL
     * @param {string} videoUid - Video UID
     * @returns {string} - Iframe embed URL
     */
    getIframeUrl(videoUid) {
        return `https://customer-${this.accountId.substring(0, 32)}.cloudflarestream.com/${videoUid}/iframe`;
    }

    /**
     * Get Stream player URL (recommended)
     * @param {string} videoUid - Video UID
     * @returns {string} - Stream player URL
     */
    getStreamPlayerUrl(videoUid) {
        return `https://customer-${this.accountId.substring(0, 32)}.cloudflarestream.com/${videoUid}/watch`;
    }

    /**
     * Delete video from Cloudflare Stream
     * @param {string} videoUid - Video UID
     * @returns {Promise<boolean>} - Success status
     */
    async deleteVideo(videoUid) {
        try {
            const response = await axios.delete(`${this.baseUrl}/${videoUid}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                }
            });

            return response.data.success;
        } catch (error) {
            console.error('Cloudflare Stream delete error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generate signed URL with expiration (if requireSignedURLs is enabled)
     * @param {string} videoUid - Video UID
     * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
     * @returns {Promise<string>} - Signed URL
     */
    async generateSignedUrl(videoUid, expiresIn = 3600) {
        try {
            const exp = Math.floor(Date.now() / 1000) + expiresIn;

            const response = await axios.post(
                `${this.baseUrl}/${videoUid}/token`,
                { exp },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                return response.data.result.token;
            } else {
                throw new Error('Failed to generate signed URL');
            }
        } catch (error) {
            console.error('Cloudflare Stream signed URL error:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new CloudflareStreamService();
