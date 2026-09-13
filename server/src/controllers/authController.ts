import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

const googleClient = new OAuth2Client();

const publicUser = { id: true, email: true, name: true, avatarUrl: true } as const;

const signToken = (userId: number) =>
    jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });

const signup = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name ) {
        return res.status(400).json({ error: "email, password or name missing" });
    }

    try {
        const existing = await prisma.user.findUnique({ where: { email }});
        if (existing) {
            return res.status(409).json({ error: "email already in use" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, passwordHash, name },
            select: publicUser,
        });

        res.status(201).json({ user, token: signToken(user.id) });
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "signup failed" });
    }
};

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email or password not found" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email }});
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Google-only accounts have no password set
        if (!user.passwordHash) {
            return res.status(401).json({ error: "this account uses Google sign-in" });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: "invalid credentials" });
        }

        res.json({
            user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
            token: signToken(user.id),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "login failed" });
    }
};

// Exchanges a Google Identity Services ID token (credential) for our own JWT.
const googleLogin = async (req: Request, res: Response) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ error: "google credential missing" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
        console.error("GOOGLE_CLIENT_ID is not set");
        return res.status(500).json({ error: "google login is not configured" });
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (err) {
        return res.status(401).json({ error: "invalid google credential" });
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
        return res.status(401).json({ error: "google account email not verified" });
    }

    try {
        const { sub: googleId, email, picture } = payload;
        const name = payload.name || email.split("@")[0];

        let user = await prisma.user.findUnique({ where: { googleId }, select: publicUser });

        if (!user) {
            // Link to an existing email/password account if one exists, otherwise create
            user = await prisma.user.upsert({
                where: { email },
                update: { googleId, avatarUrl: picture },
                create: { email, name, googleId, avatarUrl: picture },
                select: publicUser,
            });
        }

        res.json({ user, token: signToken(user.id) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "google login failed" });
    }
};

const me = async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: publicUser });
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch user" });
    }
};

export { signup, login, googleLogin, me };
