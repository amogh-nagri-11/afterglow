import { Response } from "express"; 
import { prisma } from "../db";
import crypto from "crypto";
import { AuthRequest } from "../middleware/authMiddleware";

const createPool = async (req: AuthRequest, res: Response) => {
    const { name } = req.body; 

    if (!name) {
        return res.status(401).json({ error: "pool name required" });
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
        res.status(401).json({ error: "invite code required" });
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
            return res.status(409).json({ error: "already member of pool" }); 
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

export { createPool, joinPool };