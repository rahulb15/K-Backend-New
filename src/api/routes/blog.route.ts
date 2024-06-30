import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import blogController from "../controllers/blog.controller";

const multer = require("multer");

const storage = multer.diskStorage({
  filename: (req: any, file: any, cb: any) => {
    console.log(file, "file");

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Filtering based on file extension
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type, only JPEG, PNG, and GIF files are allowed!"
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 50, // 5 MB file size limit
  },
}).fields([{ name: "thumbnail", maxCount: 1 }]);

const router = Router();

router.post("/", adminMiddleware, upload, blogController.create);
router.get("/getAll/:source", authMiddleware, blogController.getAll);
router.get("/:slug", blogController.getBySlug);

// router.get("/:id", authMiddleware, blogController.getById);

export default router;
