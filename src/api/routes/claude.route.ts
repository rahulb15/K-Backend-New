import claudeController from "../controllers/claude.controller";
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", claudeController.create);
router.post("/chat", claudeController.chat);
export default router;
