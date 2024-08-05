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
//get all deposits
router.post(
  "/getAllDeposits",
  authMiddleware,
  transactionsController.getAllDeposits
);

router.post("/getAll", adminMiddleware, transactionsController.getAllDeposit);
router.get("/getPaymentDetail/:id", adminMiddleware, transactionsController.getById);

// getAllTransactions
router.post("/getAllTransactions", adminMiddleware, transactionsController.getAllTransactions);

router.get(
  "/getById/:id",
  adminMiddleware,
  transactionsController.getByOrderId
);

router.post(
  "/approveDeposit",
  adminMiddleware,
  transactionsController.approveDeposit
);





export default router;
