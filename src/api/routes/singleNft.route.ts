import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import singleNftController from "../controllers/singleNft.controller";

const router = Router();

router.post("/create", adminMiddleware, singleNftController.create);
router.post("/", authMiddleware, singleNftController.create);
router.post("/getAll", authMiddleware, singleNftController.getAll);
router.get("/:id", authMiddleware, singleNftController.getById);
router.put("/", authMiddleware, singleNftController.update);


export default router;
