import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import collectionController from "../controllers/collection.controller";

const router = Router();

router.post("/", authMiddleware, collectionController.create);
router.get("/", authMiddleware, collectionController.getAll);
router.get("/:id", authMiddleware, collectionController.getById);

export default router;
