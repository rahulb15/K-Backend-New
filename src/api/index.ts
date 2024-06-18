import express from "express";
import userRouter from "./routes/user.route";
import transactionRouter from "./routes/transactions.route";
import cartRouter from "./routes/cart.route";
import collectionRouter from "./routes/collection.route";
import nftRouter from "./routes/nft.route";
import configRouter from "./routes/config.route";
import userPointsRouter from "./routes/userpoints.route";
import claudeRouter from "./routes/claude.route";
import verificationRouter from "./routes/verification.route";
import launchCollectionRouter from "./routes/launch-collection.route";
import adminRouter from "./routes/admin.route";

const router = express.Router();

router.use("/admin", adminRouter);
router.use("/user", userRouter);
router.use("/cart", cartRouter);
router.use("/transaction", transactionRouter);
router.use("/collection", collectionRouter);
router.use("/nft", nftRouter);
router.use("/config", configRouter);
router.use("/userpoints", userPointsRouter);
router.use("/claude", claudeRouter);
router.use("/verification", verificationRouter);
router.use("/launch-collection", launchCollectionRouter);

export default router;
