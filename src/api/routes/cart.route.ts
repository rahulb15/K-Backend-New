import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import cartController from "../controllers/cart.controller";

const router = Router();

router.post("/", authMiddleware, cartController.create);
router.get("/", authMiddleware, cartController.getAll);
router.get("/:id", authMiddleware, cartController.getById);

export default router;
