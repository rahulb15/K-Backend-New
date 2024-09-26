import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

import nftController from "../controllers/nft.controller";

const router = Router();

router.post("/create", adminMiddleware, nftController.create);
// createOne
router.post("/createOne", authMiddleware, nftController.createOne);
router.post("/", authMiddleware, nftController.create);
router.get("/", authMiddleware, nftController.getAll);
router.get("/:id", authMiddleware, nftController.getById);
// getByTokenId
router.get("/token/:tokenId", nftController.getByTokenId);
// updateByTokenId
// router.put("/updateToken/:tokenId", adminMiddleware, nftController.updateByTokenId);
// onSale
router.put("/onSale", authMiddleware, nftController.onSale);
//get all marketPlaceNfts
router.post("/marketPlaceNfts", nftController.getMarketPlaceNfts);

// updateNFT
router.put("/update", adminMiddleware, nftController.updateByAdmin);
router.put("/updatemynft", authMiddleware, nftController.update);

// updateRevealedNFTs
router.post("/owned", authMiddleware, nftController.updateRevealedNFTs);

router.post("/ownedNfts", authMiddleware, nftController.getOwnedNfts);

// getOwnedPriorityPassNfts
router.post("/ownedPriorityPassNfts", authMiddleware, nftController.getOwnedPriorityPassNfts);


// getOwnSaleNfts
router.post("/ownSaleNfts", authMiddleware, nftController.getOwnSaleNfts);
// `${url}nft/ownAuctionNfts?pageNo=${pageNo}&limit=${limit}&search=${search}`,
router.post("/ownAuctionNfts", authMiddleware, nftController.getOwnAuctionNfts);
// `${url}nft/ownDutchAuctionNfts?pageNo=${pageNo}&limit=${limit}&search=${search}`,

router.post("/ownDutchAuctionNfts", authMiddleware, nftController.getOwnDutchAuctionNfts);



router.get("ipfs", nftController.getIpfsJson);

// const response = await axios.post(`${url}nft/collectionNfts?pageNo=${pageNo}&limit=${limit}`, data, {
router.post("/collectionNfts", nftController.getCollectionNfts);
router.post("/collectionNftsMarket", nftController.getCollectionNftsMarket);

router.post("/place-bid", authMiddleware, nftController.placeBid); // New route for placing a bid
router.post("/buy", authMiddleware, nftController.buyNft); // New route for buying an NFT





export default router;
