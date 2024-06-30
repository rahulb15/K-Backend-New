import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import nftController from "../controllers/nft.controller";

const router = Router();

router.post("/", authMiddleware, nftController.create);
router.get("/", authMiddleware, nftController.getAll);
router.get("/:id", authMiddleware, nftController.getById);

export default router;
