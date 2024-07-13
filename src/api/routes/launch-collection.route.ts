import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import launchCollectionController from "../controllers/launch-collection.controller";
import upload from "../../middlewares/multer.middleware";

const router = Router();

router.post("/create", authMiddleware, launchCollectionController.create);
router.put(
  "/update/:collectionName",
  authMiddleware,
  launchCollectionController.update
);

// upload-image
router.post(
  "/upload-image/:collectionName",
  authMiddleware,
  upload,
  launchCollectionController.uploadImage
);




router.get(
  "/getByUserId/:userId",
  authMiddleware,
  launchCollectionController.getByUserId
);
router.get("/getAll", launchCollectionController.getAll);

// approve
router.put("/approve/:id", adminMiddleware, launchCollectionController.approve);

// reject
router.put("/reject/:id", adminMiddleware, launchCollectionController.reject);

export default router;
