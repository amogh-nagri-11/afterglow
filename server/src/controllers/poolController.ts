import { Response } from "express";
import { prisma } from "../db";
import crypto from "crypto";
import { AuthRequest } from "../middleware/authMiddleware";
import { storage } from "../storage";

const createPool = async (req: AuthRequest, res: Response) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "pool name required" });
    }

    try {
        const inviteCode = crypto.randomBytes(6).toString('hex');

        const pool = await prisma.pool.create({
            data: {
                name,
                ownerId: req.userId!,
                inviteCode,
                members: {
                    create: { userId: req.userId!, role: "owner" },
                },
            },
        });

        res.status(201).json({ pool });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create pool" });
    }
};

const joinPool = async (req: AuthRequest, res: Response) => {
    const { inviteCode } = req.body;

    if (!inviteCode) {
        return res.status(400).json({ error: "invite code required" });
    }

    try {
        const pool = await prisma.pool.findUnique({ where: { inviteCode }});

        if (!pool) {
            return res.status(404).json({ error: "invalid invite code" });
        }

        const existing = await prisma.poolMember.findUnique({
            where: { poolId_userId: { poolId: pool.id, userId: req.userId! } },
        });

        if (existing) {
            return res.status(409).json({ error: "already member of pool", pool });
        }

        await prisma.poolMember.create({
            data: { poolId: pool.id, userId: req.userId! },
        });

        res.status(200).json({ pool });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to join pool" });
    }
};

const listMyPools = async (req: AuthRequest, res: Response) => {
    try {
        const pools = await prisma.pool.findMany({
            where: { members: { some: { userId: req.userId! } } },
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { members: true, photos: true } },
                photos: { orderBy: { uploadedAt: "desc" }, take: 4, select: { id: true, thumbnailKey: true } },
            },
        });

        const withCovers = await Promise.all(
            pools.map(async ({ photos, ...pool }) => ({
                ...pool,
                photos: await Promise.all(
                    photos.map(async ({ id, thumbnailKey }) => ({
                        id,
                        thumbnailUrl: thumbnailKey ? await storage.url(thumbnailKey) : null,
                    })),
                ),
            })),
        );

        res.json({ pools: withCovers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch pools" });
    }
};

const getPool = async (req: AuthRequest, res: Response) => {
    const poolId = Number(req.params.poolId);

    try {
        const membership = await prisma.poolMember.findUnique({
            where: { poolId_userId: { poolId, userId: req.userId! } },
        });

        if (!membership) {
            return res.status(403).json({ error: "not a member of this pool" });
        }

        const pool = await prisma.pool.findUnique({
            where: { id: poolId },
            include: {
                _count: { select: { photos: true } },
                members: {
                    orderBy: { joinedAt: "asc" },
                    select: { role: true, user: { select: { id: true, name: true, avatarUrl: true } } },
                },
            },
        });

        res.json({ pool, role: membership.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch pool" });
    }
};

export { createPool, joinPool, listMyPools, getPool };
