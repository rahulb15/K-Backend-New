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
router.put(
  "/update-admin/:collectionName",
  adminMiddleware,
  launchCollectionController.update
);
// upload-image
router.post(
  "/upload-image/:collectionName",
  authMiddleware,
  upload,
  launchCollectionController.uploadImage
);


router.get("/:name", launchCollectionController.getByName);




router.get(
  "/getByUserId/:userId",
  authMiddleware,
  launchCollectionController.getByUserId
);
router.post("/getAll",adminMiddleware, launchCollectionController.getAll);

// getAllLaunched
router.post("/getAllLaunched", launchCollectionController.getAllLaunched);

//getAllApproved
router.post("/getAllApproved",adminMiddleware, launchCollectionController.getAllApproved);

// approve
router.put("/approve/:id", adminMiddleware, launchCollectionController.approve);

// reject
router.put("/reject/:id", adminMiddleware, launchCollectionController.reject);

// launch
router.put("/launch/:id", adminMiddleware, launchCollectionController.launch);

//getbuId
router.get("/getById/:id",adminMiddleware, launchCollectionController.getById);


export default router;
