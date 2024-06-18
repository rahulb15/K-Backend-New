import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import launchCollectionController from "../controllers/launch-collection.controller";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();

router.post("/create", authMiddleware, launchCollectionController.create);
router.put("/update/:collectionName", authMiddleware, launchCollectionController.update);
router.get(
  "/getByUserId/:userId",
  authMiddleware,
  launchCollectionController.getByUserId
);
router.get(
  "/getAll",
  launchCollectionController.getAll
);

// approve
router.put(
  "/approve/:id",
  adminMiddleware,
  launchCollectionController.approve
);

// reject
router.put(
  "/reject/:id",
  adminMiddleware,
  launchCollectionController.reject
);



export default router;
