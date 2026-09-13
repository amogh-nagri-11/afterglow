import { Router } from 'express';
import { signup, login, googleLogin, me } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', requireAuth, me);

export default router;
