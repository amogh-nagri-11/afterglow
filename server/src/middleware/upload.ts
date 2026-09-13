import { NextFunction, Request, Response } from "express";
import multer from "multer";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

// Files are held in memory (capped at 15 MB) and streamed to storage by the controller
const multerUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("only image files are allowed"));
        }
        cb(null, true);
    },
});

// Wraps multer so its errors come back as JSON instead of Express's default HTML error page
export const uploadSinglePhoto = (req: Request, res: Response, next: NextFunction) => {
    multerUpload.single("photo")(req, res, (err: unknown) => {
        if (!err) return next();

        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ error: "photo is larger than 15 MB" });
        }

        const message = err instanceof Error ? err.message : "invalid upload";
        return res.status(400).json({ error: message });
    });
};
