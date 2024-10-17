import multer from "multer";

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
    fileSize: 1024 * 1024 * 1024, // 1 GB limit
  },
}).fields([
  { name: "profileImage", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);

export default upload;
