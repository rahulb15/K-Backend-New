import express from "express";
import userRouter from "./routes/user.route";
import transactionRouter from "./routes/transactions.route";
import cartRouter from "./routes/cart.route";
import collectionRouter from "./routes/collection.route";
import nftRouter from "./routes/nft.route";
import configRouter from "./routes/config.route";
import userPointsRouter from "./routes/userpoints.route";

const router = express.Router();

router.use("/user", userRouter);
router.use("/cart", cartRouter);
router.use("/transaction", transactionRouter);
router.use("/collection", collectionRouter);
router.use("/nft", nftRouter);
router.use("/config", configRouter);
router.use("/userpoints", userPointsRouter);

export default router;
