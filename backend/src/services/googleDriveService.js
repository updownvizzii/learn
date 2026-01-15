const { google } = require('googleapis');
const fs = require('fs');

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN
} = process.env;

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * Uploads a file to Google Drive.
 * @param {string} filePath Local path to the file.
 * @param {string} fileName Original name of the file.
 * @param {string} folderId Google Drive Folder ID.
 * @returns {Promise<Object>} File ID and View Link.
 */
const uploadToDrive = async (filePath, fileName, folderId) => {
    try {
        const fileMetadata = {
            name: fileName,
            parents: folderId ? [folderId] : [],
        };
        const media = {
            mimeType: 'video/mp4',
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
        });

        // Set permissions to public viewable
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return {
            fileId: response.data.id,
            webViewLink: response.data.webViewLink,
        };
    } catch (error) {
        console.error('Google Drive Upload Error:', error);
        throw error;
    }
};

module.exports = { uploadToDrive };
