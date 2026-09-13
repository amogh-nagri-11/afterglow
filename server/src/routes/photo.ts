import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { uploadLimiter } from "../middleware/rateLimit";
import { uploadSinglePhoto } from "../middleware/upload";
import { deletePhoto, getPoolPhotos, uploadPhoto } from "../controllers/photoController";

const router = Router();

router.post("/:poolId/upload", requireAuth, uploadLimiter, uploadSinglePhoto, uploadPhoto);
router.get("/:poolId", requireAuth, getPoolPhotos);
router.delete("/:poolId/:photoId", requireAuth, deletePhoto);

export default router;
