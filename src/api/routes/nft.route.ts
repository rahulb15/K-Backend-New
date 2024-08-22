import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

import nftController from "../controllers/nft.controller";

const router = Router();

router.post("/create", adminMiddleware, nftController.create);
router.post("/", authMiddleware, nftController.create);
router.get("/", authMiddleware, nftController.getAll);
router.get("/:id", authMiddleware, nftController.getById);
// updateByTokenId
// router.put("/updateToken/:tokenId", adminMiddleware, nftController.updateByTokenId);
// onSale
router.put("/onSale", authMiddleware, nftController.onSale);
//get all marketPlaceNfts
router.post("/marketPlaceNfts", nftController.getMarketPlaceNfts);

// updateNFT
router.put("/update", adminMiddleware, nftController.update);
// updateRevealedNFTs
router.post("/owned", authMiddleware, nftController.updateRevealedNFTs);

router.get("ipfs", nftController.getIpfsJson);

// const response = await axios.post(`${url}nft/collectionNfts?pageNo=${pageNo}&limit=${limit}`, data, {
router.post("/collectionNfts", nftController.getCollectionNfts);




export default router;
