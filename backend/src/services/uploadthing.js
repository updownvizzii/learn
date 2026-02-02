const { createUploadthing } = require("uploadthing/express");
const jwt = require('jsonwebtoken');

const f = createUploadthing();

const auth = async (req) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return { id: decoded.id };
        } catch (error) {
            console.error("UploadThing Auth Error:", error);
            return null;
        }
    }
    return null;
};

const uploadRouter = {
    courseThumbnail: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const user = await auth(req);
            if (!user) throw new Error("Unauthorized");
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Thumbnail uploaded by:", metadata.userId, "URL:", file.url);
        }),
    courseVideo: f({ video: { maxFileSize: "512MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const user = await auth(req);
            if (!user) throw new Error("Unauthorized");
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Video uploaded by:", metadata.userId, "URL:", file.url);
        }),
};

module.exports = { uploadRouter };
