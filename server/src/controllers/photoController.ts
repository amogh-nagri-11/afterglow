import { Response } from "express"; 
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../db";
import sharp from "sharp";
import path from "path";

const uploadPhoto = async (req: AuthRequest, res: Response) => {
    const { poolId } = req.params; 

    if (!req.file) {
        return res.status(400).json({ error: "no file uploaded" });
    }

    try {
        const membership = await prisma.poolMember.findUnique({
            where: { poolId_userId: { poolId: Number(poolId), userId: req.userId! } }, 
        }); 

        if (!membership) {
            return res.status(403).json({ error: "not a member of this pool" }); 
        }

        const thumbnailFilename = `thumb-${req.file.filename}`; 
        const thumbnailPath = path.join(__dirname, "../../uploads", thumbnailFilename); 

        await sharp(req.file.path) 
            .resize(400, 400, { fit: "cover" })
            .toFile(thumbnailPath);  

        const photo = await prisma.photo.create({
            data: {
                poolId: Number(poolId), 
                uploaderId: req.userId!, 
                storageUrl: `/uploads/${req.file.filename}`, 
                thumbnailUrl: `/uploads/${thumbnailFilename}`
            }, 
        });

        res.status(201).json(photo);
    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: "upload file" });
    }
}; 

export { uploadPhoto };