import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import launchCollectionController from "../controllers/launch-collection.controller";
import upload from "../../middlewares/multer.middleware";
import fileUpload from 'express-fileupload';

const router = Router();

router.post("/create", authMiddleware, launchCollectionController.create);
router.post("/create-pass", adminMiddleware, launchCollectionController.create);
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

router.post(
  "/upload-image-data",
  authMiddleware,
  upload,
  launchCollectionController.uploadImageOnCloudById
);

// upload-image
router.post(
  "/upload-image-data",
  authMiddleware,
  upload,
  launchCollectionController.uploadImageOnCloud
);

// upload-image
// router.post(
//   "/upload-image-data-ipfs",
//   authMiddleware,
//   upload,
//   launchCollectionController.uploadImageOnIpfs
// );
router.post(
  "/upload-image-data-ipfs",
  authMiddleware,
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    debug: true,
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
  }),
  launchCollectionController.uploadImageOnIpfs
);

// upload-image
router.post(
  "/upload-image-data-admin",
  adminMiddleware,
  upload,
  launchCollectionController.uploadImageOnCloud
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

router.post("/getLiveCollections", launchCollectionController.getLiveCollections);
router.post("/getUpcomingCollections", launchCollectionController.getUpcomingCollections);
router.post("/getEndedCollections", launchCollectionController.getEndedCollections);



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

router.post(
  "/getCreatedCollections",
  authMiddleware,
  launchCollectionController.getCreatedCollections
);

router.post(
  "/getCreatedCollectionsMarketPlace",
  launchCollectionController.getCreatedCollectionsMarketPlace
);


router.post("/category-wise", launchCollectionController.getCategoryWiseCollections);

router.post("/prioritized", launchCollectionController.getPrioritizedCollections);




export default router;
