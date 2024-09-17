import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import ActivityController from "../controllers/activity.controller";

const router = Router();

router.post("/", authMiddleware, ActivityController.getInstance().create);
router.get("/", authMiddleware, ActivityController.getInstance().getAll);
router.get("/:id", authMiddleware, ActivityController.getInstance().getById);
router.put("/:id", authMiddleware, ActivityController.getInstance().update);
router.post("/candle", ActivityController.getInstance().getCandleData);

export default router;


