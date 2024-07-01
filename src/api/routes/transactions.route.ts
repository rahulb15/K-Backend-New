import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import transactionsController from "../controllers/transactions.controller";

const router = Router();
router.post("/", authMiddleware, transactionsController.create);
router.get("/", authMiddleware, transactionsController.getAll);
router.get("/:id", authMiddleware, transactionsController.getById);
router.put("/:id", authMiddleware, transactionsController.update);
router.get(
  "/checkTransaction/:sessionId",
  authMiddleware,
  transactionsController.checkTransaction
);

router.post("/getAll", adminMiddleware, transactionsController.getAllDeposit);
router.get(
  "/getById/:id",
  adminMiddleware,
  transactionsController.getByOrderId
);

export default router;
