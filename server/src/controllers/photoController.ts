import { Response } from "express";
import crypto from "crypto";
import path from "path";
import sharp from "sharp";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../db";
import { photoUrls, storage } from "../storage";

const safeExtension = (filename: string) => {
    const ext = path.extname(filename).toLowerCase();
    return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "";
};

const uploadPhoto = async (req: AuthRequest, res: Response) => {
    const poolId = Number(req.params.poolId);
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "no file uploaded" });
    }

    if (!Number.isInteger(poolId)) {
        return res.status(404).json({ error: "pool not found" });
    }

    try {
        const membership = await prisma.poolMember.findUnique({
            where: { poolId_userId: { poolId, userId: req.userId! } },
        });

        if (!membership) {
            return res.status(403).json({ error: "not a member of this pool" });
        }

        let thumbnail: Buffer;
        try {
            // rotate() applies EXIF orientation so phone photos aren't sideways
            thumbnail = await sharp(file.buffer)
                .rotate()
                .resize(400, 400, { fit: "cover" })
                .jpeg({ quality: 80 })
                .toBuffer();
        } catch {
            return res.status(400).json({ error: "file is not a supported image" });
        }

        const id = crypto.randomBytes(16).toString("hex");
        const storageKey = `pools/${poolId}/${id}${safeExtension(file.originalname)}`;
        const thumbnailKey = `pools/${poolId}/thumb-${id}.jpg`;

        // Don't leave orphaned objects behind if an upload or the insert fails
        const cleanUp = async (err: unknown) => {
            await storage.remove([storageKey, thumbnailKey]).catch(() => {});
            throw err;
        };

        await Promise.all([
            storage.put(storageKey, file.buffer, file.mimetype),
            storage.put(thumbnailKey, thumbnail, "image/jpeg"),
        ]).catch(cleanUp);

        const photo = await prisma.photo
            .create({
                data: { poolId, uploaderId: req.userId!, storageKey, thumbnailKey, sizeBytes: file.size },
            })
            .catch(cleanUp);

        res.status(201).json(await photoUrls(photo));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "upload failed" });
    }
};

const getPoolPhotos = async (req: AuthRequest, res: Response) => {
    const poolId = Number(req.params.poolId);

    if (!Number.isInteger(poolId)) {
        return res.status(404).json({ error: "pool not found" });
    }

    try {
        const membership = await prisma.poolMember.findUnique({
            where: { poolId_userId: { poolId, userId: req.userId! } },
        });

        if (!membership) {
            return res.status(403).json({ error: "not a member of this pool" });
        }

        const photos = await prisma.photo.findMany({
            where: { poolId },
            orderBy: { uploadedAt: "desc" },
            include: { uploader: { select: { id: true, name: true, avatarUrl: true } } },
        });

        res.json({ photos: await Promise.all(photos.map(photoUrls)) });
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

        // The row is already gone; a storage hiccup shouldn't fail the request
        await storage
            .remove([photo.storageKey, photo.thumbnailKey])
            .catch((err) => console.error("failed to remove photo files", err));

        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to delete photo" });
    }
};

export { uploadPhoto, getPoolPhotos, deletePhoto };
