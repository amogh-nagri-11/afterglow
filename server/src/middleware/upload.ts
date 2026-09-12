import multer from "multer"; 
import crytpo from "crypto"; 
import path from "path"; 

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, "../../uploads")); 
    }, 
    filename: (_req, file, cb) => {
        const uniqueName = crytpo.randomBytes(16).toString("hex") + path.extname(file.originalname); 
        cb(null, uniqueName); 
    }, 
});

export const upload = multer({ 
    storage, 
    limits: { fileSize: 15*1024*1024 }, 
    fileFilter: ( _req, file, cb ) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("only image files are allowed")); 
        }
        cb(null, true); 
    },
});
