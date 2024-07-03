import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import blogController from "../controllers/blog.controller";


const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes: string[] = ["image/jpeg", "image/png", "image/gif"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and GIF files are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
});

const router: Router = Router();

router.post("/", adminMiddleware, (req, res, next) => {
  upload.fields([{ name: "thumbnail", maxCount: 1 }])(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'An unknown error occurred during file upload.' });
    }
    // If you need to access the file, it's now available in req.files
    // For example: const thumbnailFile = req.files['thumbnail'][0];
    next();
  });
}, blogController.create);
// editBlog
router.put("/:id", adminMiddleware, (req, res, next) => {
  upload.fields([{ name: "thumbnail", maxCount: 1 }])(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'An unknown error occurred during file upload.' });
    }
    // If you need to access the file, it's now available in req.files
    // For example: const thumbnailFile = req.files['thumbnail'][0];
    next();
  });
}, blogController.updateById);

// deleteBlog
router.delete("/:id", adminMiddleware, blogController.deleteById);


router.get("/getAll/:source", authMiddleware, blogController.getAll);
router.get("/:slug", blogController.getBySlug);

// getBlogList
router.post("/getBlogList",adminMiddleware, blogController.getBlogList);




// router.get("/:id", authMiddleware, blogController.getById);

export default router;
