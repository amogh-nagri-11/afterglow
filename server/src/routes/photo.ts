import { Router } from "express"; 
import { requireAuth } from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";
import { getPoolPhotos, uploadPhoto } from "../controllers/photoController";

const router = Router();

router.post("/:poolId/upload", requireAuth, upload.single("photo"), uploadPhoto); 
router.get("/:poolId", requireAuth, getPoolPhotos);

export default router;