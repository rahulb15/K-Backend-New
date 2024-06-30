import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import { ConfigController } from "../controllers/config.controller";

const router = Router();

router.post("/", ConfigController.getInstance().create);
router.get("/", adminMiddleware, ConfigController.getInstance().getAll);
router.get("/:id", adminMiddleware, ConfigController.getInstance().getById);
router.get("/key/:key", ConfigController.getInstance().getByKey);
router.put("/:id", adminMiddleware, ConfigController.getInstance().update);

export default router;
