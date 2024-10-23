// routes/stage-application.routes.ts
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { StageApplicationController } from "../controllers/stage-application.controller";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();
const controller = StageApplicationController.getInstance();



router.post("/admin/applications",adminMiddleware, controller.getApplications);
router.post("/admin/applications/:id/approve", adminMiddleware, controller.approveApplication);
router.post("/admin/applications/:id/reject", adminMiddleware, controller.rejectApplication);


router.post("/apply", authMiddleware, StageApplicationController.getInstance().apply);
router.post("/status", authMiddleware, StageApplicationController.getInstance().getStatus);

export default router;