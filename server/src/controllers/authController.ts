import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 
import { prisma } from "../db";

const signup = async (req: Request, res: Response) => {
    const { email, password, name } = req.body; 

    if (!email || !password || !name ) {
        res.status(400).json({ error: "email, password or name missing" });
    }

    try {
        const existing = await prisma.user.findUnique({ where: { email }});
        if (existing) {
            return res.status(409).json({ error: "email already in use" });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, passwordHash, name }, 
            select: { id: true, email: true, name: true } 
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" }); 
        res.status(201).json({ user, token });
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

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: "invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

        res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: "login failed" });
    }
};

export { signup, login };