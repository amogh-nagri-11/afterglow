import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { createPool, joinPool } from "../controllers/poolController";

const router = Router(); 

router.post("/", requireAuth, createPool); 
router.post("/join", requireAuth, joinPool);

export default router; 

