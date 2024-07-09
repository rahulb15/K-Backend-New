import { Router } from "express";
import claudeController from "../controllers/claude.controller";

const router = Router();

router.post("/", claudeController.create);
router.post("/chat", claudeController.chat);
export default router;
