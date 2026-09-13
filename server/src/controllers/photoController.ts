import { Response } from "express"; 
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../db";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

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

const getPoolPhotos = async (req: AuthRequest, res: Response) => {
  const { poolId } = req.params;

  try {
    const membership = await prisma.poolMember.findUnique({
      where: { poolId_userId: { poolId: Number(poolId), userId: req.userId! } },
    });

    if (!membership) {
      return res.status(403).json({ error: "not a member of this pool" });
    }

    const photos = await prisma.photo.findMany({
      where: { poolId: Number(poolId) },
      orderBy: { uploadedAt: "desc" },
      include: { uploader: { select: { id: true, name: true, avatarUrl: true } } },
    });

    res.json({ photos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch photos" });
  }
};

// Only the uploader or the pool owner may delete a photo
const deletePhoto = async (req: AuthRequest, res: Response) => {
  const poolId = Number(req.params.poolId);
  const photoId = Number(req.params.photoId);

  if (!Number.isInteger(poolId) || !Number.isInteger(photoId)) {
    return res.status(404).json({ error: "photo not found" });
  }

  try {
    const photo = await prisma.photo.findFirst({
      where: { id: photoId, poolId },
      include: { pool: { select: { ownerId: true } } },
    });

    if (!photo) {
      return res.status(404).json({ error: "photo not found" });
    }

    if (photo.uploaderId !== req.userId && photo.pool.ownerId !== req.userId) {
      return res.status(403).json({ error: "only the uploader or pool owner can delete this photo" });
    }

    await prisma.photo.delete({ where: { id: photo.id } });

    // Remove files once the row is gone; a missing file shouldn't fail the request
    const files = [photo.storageUrl, photo.thumbnailUrl].filter((url): url is string => Boolean(url));
    await Promise.all(
      files.map((url) => fs.unlink(path.join(__dirname, "../../uploads", path.basename(url))).catch(() => {})),
    );

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to delete photo" });
  }
};

export { uploadPhoto, getPoolPhotos, deletePhoto };