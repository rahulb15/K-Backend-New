import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import userPointsController from "../controllers/userpoints.controller";

const router = Router();

router.post("/", authMiddleware, userPointsController.create);
router.get("/", authMiddleware, userPointsController.getAll);
router.get("/:id", authMiddleware, userPointsController.getByUserId);

export default router;
