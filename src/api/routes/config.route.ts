import { ConfigController } from "../controllers/config.controller";
import { Router } from "express";
import { authMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();

router.post("/", ConfigController.getInstance().create);
router.get("/", authMiddleware, ConfigController.getInstance().getAll);
router.get("/:id", authMiddleware, ConfigController.getInstance().getById);
router.get(
  "/key/:key",
  ConfigController.getInstance().getByKey
);
router.put("/:id", authMiddleware, ConfigController.getInstance().update);


export default router;