import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { createPool, joinPool, listMyPools, getPool } from "../controllers/poolController";

const router = Router();

router.get("/", requireAuth, listMyPools);
router.post("/", requireAuth, createPool);
router.post("/join", requireAuth, joinPool);
router.get("/:poolId", requireAuth, getPool);

export default router;
