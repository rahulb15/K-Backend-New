import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import fileUpload from "express-fileupload";
import musicController from "../controllers/music.controller";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();

const musicUploadMiddleware = fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
  debug: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true,
  responseOnLimit: "File size limit has been reached",
});

// Routes will now work correctly with the bound methods
router.post(
  "/upload",
  adminMiddleware,
  musicUploadMiddleware,
  musicController.uploadMusic
);

router.delete(
  "/delete/:id",
  adminMiddleware,
  musicController.deleteMusic
);

router.get(
  "/list",
  adminMiddleware,
  musicController.getUserMusic
);

router.get(
    "/getMusics",
    musicController.getMusics
);


router.get(
  "/search",
  adminMiddleware,
  musicController.searchMusic
);

export default router;