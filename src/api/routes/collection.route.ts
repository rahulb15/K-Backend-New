import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import collectionController from "../controllers/collection.controller";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();

router.post("/", adminMiddleware, collectionController.create);
router.post("/getAll", collectionController.getAllPaginationData);
router.post("/getAllCollection", collectionController.getAllCollectionPaginationData);

router.get("/", collectionController.getAll);
// router.get("/:id", authMiddleware, collectionController.getById);
router.get("/:name", collectionController.getByName);


export default router;
