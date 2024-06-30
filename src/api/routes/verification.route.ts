import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import verificationController from "../controllers/verification.controller";

const router = Router();

//create a verification
router.post(
  "/create",
  authMiddleware,
  verificationController.createVerification
);
//get all verifications
router.get(
  "/get-all",
  authMiddleware,
  verificationController.getAllVerifications
);
//get verification by user id
router.get(
  "/get-verification-by-user-id",
  authMiddleware,
  verificationController.getVerificationByUserId
);
router.get(
  "/get-access-token",
  authMiddleware,
  verificationController.getAccessToken
);

export default router;
