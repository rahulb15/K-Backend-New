import userPointsController  from "../controllers/userpoints.controller";
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, userPointsController.create);
router.get("/", authMiddleware, userPointsController.getAll);
router.get("/:id", authMiddleware, userPointsController.getByUserId);

export default router;
