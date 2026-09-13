import rateLimit from "express-rate-limit";
import { AuthRequest } from "./authMiddleware";

// Per user, not per IP: generous enough to bulk-upload an event, tight enough to stop scripted spam.
// Must run after requireAuth.
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    keyGenerator: (req) => `user:${(req as AuthRequest).userId}`,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "too many uploads, please wait a few minutes and try again" },
});
