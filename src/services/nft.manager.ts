import { INft } from "../interfaces/nft/nft.interface";
import { INftManager } from "../interfaces/nft/nft.manager.interface";
import Nft from "../models/nft.model";
import mongoose from "mongoose";
import User from "../models/user.model";
import { IUser } from "../interfaces/user/user.interface";
const SalesService = require("../marmalade/services/salesService");
import { ICollection } from "../interfaces/collection/collection.interface";
import Collection from "../models/collection.model";
import LaunchCollection from "../models/launch-collection.model";
// Instantiate SalesService once
const salesService = new SalesService();

const PREFERED_GATEWAY = "ipfs.io";

function ipfsResolution(cid: any) {
  return `https://${PREFERED_GATEWAY}/ipfs/${cid}`;
}

// // Helper function to convert any URL to IPFS gateway URL
// function convertToIPFSUrl(url: string): string {
//   if (url.startsWith('ipfs://')) {
//     return `https://ipfs.io/ipfs/${url.split('ipfs://')[1]}`;
//   } else if (url.startsWith('https://ipfs.io/ipfs/')) {
//     return url; // Already in the correct format
//   } else if (url.startsWith('http://') || url.startsWith('https://')) {
//     // For other HTTP(S) URLs, assume the last part is the CID
//     const parts = url.split('/');
//     return `https://ipfs.io/ipfs/${parts[parts.length - 1]}`;
//   } else {
//     // For anything else (including blob URLs), treat the entire string as a CID
//     return `https://ipfs.io/ipfs/${url.replace('blob:', '')}`;
//   }
// }

async function fetchIPFSData(uri: any) {
  const [protocol, cid] = uri.split("//");
  console.log(
    "🚀 ~ file: index.jsx ~ line 38 ~ fetchIPFSData ~ protocol",
    protocol
  );
  console.log("🚀 ~ file: index.jsx ~ line 38 ~ fetchIPFSData ~ cid", cid);

  if (protocol !== "ipfs:") {
    throw new Error("Invalid protocol. Expected IPFS URI.");
  }

  const url = ipfsResolution(cid);
  console.log("🚀 ~ file: index.jsx ~ line 38 ~ fetchIPFSData ~ url", url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType: any = response.headers.get("content-type");

    if (contentType.startsWith("application/json")) {
      const data = await response.json();
      console.log("Metadata:", data);
      return data;
    } else if (contentType.startsWith("image")) {
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      console.log("Image URL:", imageUrl);
      return { image: imageUrl };
    } else {
      throw new Error("Unknown content type");
    }
  } catch (error) {
    console.error("Error fetching IPFS data:", error);
    throw error;
  }
}

// async function fetchMetadata(uri: string): Promise<any> {
//   try {
//     let response;
//     if (uri.startsWith('ipfs://')) {
//       response = await fetch(convertToIPFSUrl(uri));
//     } else {
//       response = await fetch(uri);
//     }

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching metadata:', error);
//     throw error;
//   }
// }

// function convertToIPFSUrl(ipfsUri: string): string {
//   if (ipfsUri.startsWith('ipfs://')) {
//     return `https://ipfs.io/ipfs/${ipfsUri.slice(7)}`;
//   }
//   return ipfsUri;
// }

// async function fetchMetadata(uri: string): Promise<any> {
//   try {
//     let response;
//     if (uri.startsWith("ipfs://")) {
//       response = await fetch(convertToIPFSUrl(uri));
//     } else {
//       response = await fetch(uri);
//     }

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching metadata:", error);
//     throw error;
//   }
// }

async function fetchMetadata(uri: string): Promise<any> {
  try {
    let response;
    if (uri.startsWith("ipfs://")) {
      response = await fetch(convertToIPFSUrl(uri));
    } else {
      response = await fetch(uri);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      // If it's JSON, parse it
      const data = await response.json();
      return data;
    } else if (contentType && contentType.includes("image/")) {
      // If it's an image, return an object with the image URL
      return {
        image: uri,
      };
    } else {
      // For other types, return the raw text
      const text = await response.text();
      return { rawData: text };
    }
  } catch (error: any) {
    console.error("Error fetching metadata:", error);
    // Instead of throwing, return an object indicating the error
    return { error: error.message };
  }
}

function convertToIPFSUrl(ipfsUri: string): string {
  if (ipfsUri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${ipfsUri.slice(7)}`;
  }
  return ipfsUri;
}

export class NftManager implements INftManager {
  private static instance: NftManager;

  // private constructor() {}

  public static getInstance(): NftManager {
    if (!NftManager.instance) {
      NftManager.instance = new NftManager();
    }

    return NftManager.instance;
  }

  public async create(nft: INft): Promise<INft> {
    const newNft = new Nft(nft);
    return newNft.save();
  }

  // const nfts: INft[] = await nftManager.getAll(userId, pageNo, limit, search);

  public async getAll(
    userId: string,
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }> {
    // First, get the total count of matching documents
    const total = await Nft.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
      collectionName: { $regex: search, $options: "i" },
    });

    const nfts: INft[] = await Nft.aggregate([
      {
        $match: {
          user: userId,
          collectionName: { $regex: search, $options: "i" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: "$user.username",
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          onDutchAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          attributes: 1,
          owner: 1,
          likes: 1,
          createdAt: 1, // Add createdAt here
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      nfts,
      total,
      currentPage: pageNo,
    };
  }

  public async getMarketPlaceNfts(
    pageNo: number,
    limit: number,
    search: string,
    onSale: boolean,
    onAuction: boolean
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }> {
    const matchCondition: any = {
      onMarketplace: true,
    };

    // Handle cases where search is "undefined", null, or an empty string
    if (search && search.trim() !== "" && search !== "undefined") {
      matchCondition.collectionName = { $regex: search, $options: "i" };
    }

    // Add filter conditions
    if (onSale) {
      matchCondition.onSale = true;
    }
    if (onAuction) {
      matchCondition.onAuction = true;
    }

    console.log(matchCondition, "matchCondition");

    // Get total count of matching documents
    const total = await Nft.countDocuments(matchCondition);

    const nfts: INft[] = await Nft.aggregate([
      {
        $match: matchCondition,
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: 1,
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          onDutchAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          attributes: 1,
          rarityScore: 1,
          rarityRank: 1,
          likes: 1,
          createdAt: 1,
          // New fields
          isPlatform: 1,
          saleType: 1,
          saleId: 1,
          price: 1,
          amount: 1,
          timeout: 1,
          currency: 1,
          enabled: 1,
          seller: 1,
          recipient: 1,
          escrowAccount: 1,
          currentBuyer: 1,
          startPrice: 1,
          endPrice: 1,
          startTime: 1,
          endTime: 1,
          incrementRatio: 1,
          currentPrice: 1,
          uri: 1,
          supply: 1,
          policies: 1,
          collection: 1,
          nftData: 1,
          traitCount: 1,
          lastUpdated: 1,
          owner: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      nfts,
      total,
      currentPage: pageNo,
    };
  }

  public async getById(id: string): Promise<INft> {
    const nft: INft = (await Nft.findById(id)) as INft;
    return nft;
  }

  //get nft by tokenId
  public async getByTokenId(tokenId: string): Promise<INft> {
    const nft: INft = (await Nft.findOne({
      tokenId: tokenId,
      onMarketplace: true,
    })) as INft;
    return nft;
  }

  //updatebytokenid
  public async onSale(nft: any): Promise<any> {
    const tokenId = nft.tokenId;

    // Find and update the NFT by token ID
    const updatedNft = await Nft.findOneAndUpdate(
      { tokenId: tokenId },
      { $set: { onSale: true, onMarketplace: true } },
      { new: true, runValidators: true }
    );

    // Check if the NFT was found and updated
    if (!updatedNft) {
      return { message: "NFT not found" };
    }

    return updatedNft;
  }

  public async update(nft: any): Promise<any> {
    console.log(nft, "nftaaa");
    console.log(nft.tokenId.length, "nft.tokenId.length");

    // Fetch NFTs with the specified collection name and empty token ID
    const nftData = await Nft.find({
      collectionName: nft.collectionName,
      tokenId: "",
    });
    console.log(nftData, "nftData");
    console.log(nftData.length, "nftData.length");

    // Check if there are NFTs to update
    if (nftData.length === 0) {
      return { message: "No NFTs found to update" };
    }

    // Ensure the number of token IDs matches the number of NFTs found
    console.log(
      nftData.length < nft.tokenId.length,
      "nftData.length < nft.tokenId.length"
    );
    if (nftData.length < nft.tokenId.length) {
      return { message: "Too many token IDs provided" };
    }

    console.log("continue");

    // Update each NFT with the corresponding token ID
    const updatePromises = nftData.map((item, index) => {
      console.log(index, "index");
      console.log(nft.tokenId[index], "nft.tokenId[index]");
      return Nft.updateOne(
        { _id: item._id },
        { $set: { tokenId: nft.tokenId[index], isRevealed: true } }
      );
    });

    // Wait for all updates to complete
    const nftUpdateResults = await Promise.all(updatePromises);
    console.log(nftUpdateResults, "nftUpdateResults");

    return nftUpdateResults;
  }

  public async updateByAdmin(nft: any): Promise<any> {
    console.log(nft, "nftaaa");
    console.log(nft.tokenId.length, "nft.tokenId.length");

    // Fetch NFTs with the specified collection name and empty token ID
    const nftData = await Nft.find({
      collectionName: nft.collectionName,
      tokenId: "",
    });
    console.log(nftData, "nftData");
    console.log(nftData.length, "nftData.length");

    // Check if there are NFTs to update
    if (nftData.length === 0) {
      return { message: "No NFTs found to update" };
    }

    // Ensure the number of token IDs matches the number of NFTs found
    console.log(
      nftData.length < nft.tokenId.length,
      "nftData.length < nft.tokenId.length"
    );
    if (nftData.length < nft.tokenId.length) {
      return { message: "Too many token IDs provided" };
    }

    console.log("continue");

    // Update each NFT with the corresponding token ID
    const updatePromises = nftData.map((item, index) => {
      console.log(index, "index");
      console.log(nft.tokenId[index], "nft.tokenId[index]");
      return Nft.updateOne(
        { _id: item._id },
        { $set: { tokenId: nft.tokenId[index], isRevealed: true } }
      );
    });

    // Wait for all updates to complete
    const nftUpdateResults = await Promise.all(updatePromises);
    console.log(nftUpdateResults, "nftUpdateResults");

    return nftUpdateResults;
  }

  public async updateLaunchapadByAdmin(nft: any): Promise<any> {
    console.log(nft, "nftaaa");
    console.log(nft.tokenId.length, "nft.tokenId.length");

    // Fetch NFTs with the specified collection name and empty token ID
    const nftData = await Nft.find({
      collectionName: nft.collectionName,
      tokenId: "",
    });
    console.log(nftData, "nftData");
    console.log(nftData.length, "nftData.length");

    //find collection by collectionName
    const collection: ICollection = (await Collection.findOne({
      collectionName: nft.collectionName,
    })) as ICollection;

    // Check if there are NFTs to update
    if (nftData.length === 0) {
      return { message: "No NFTs found to update" };
    }

    // Ensure the number of token IDs matches the number of NFTs found
    console.log(
      nftData.length < nft.tokenId.length,
      "nftData.length < nft.tokenId.length"
    );
    if (nftData.length < nft.tokenId.length) {
      return { message: "Too many token IDs provided" };
    }

    console.log("continue");

    // Update each NFT with the corresponding token ID
    const updatePromises = nftData.map((item, index) => {
      console.log(index, "index");
      console.log(nft.tokenId[index], "nft.tokenId[index]");
      return Nft.updateOne(
        { _id: item._id },
        {
          $set: {
            tokenId: nft.tokenId[index],
            isRevealed: true,
            collectionId: collection._id,
          },
        }
      );
    });

    // Wait for all updates to complete
    const nftUpdateResults = await Promise.all(updatePromises);
    console.log(nftUpdateResults, "nftUpdateResults");

    return nftUpdateResults;
  }

  // public async updateRevealedNFTs(nft: any): Promise<any> {
  //   console.log(nft, "nftaaazzzzz");
  //   const updatePromises = nft.reveledData.map(async (item: any, index: number) => {
  //     console.log(item.collection, "item.collection");
  //     const tokenId = item['token-id'];
  //     console.log(tokenId, "tokenId " + index);
  //     const uri = item.uri;
  //     console.log(uri, "uri");

  //     try {
  //       // Fetch metadata (works for both IPFS and HTTP URLs)
  //       const metadata = await fetchMetadata(uri);
  //       console.log(metadata, "metadata" + index);

  //       let imageUrl = '';

  //       if (typeof metadata === 'object' && metadata !== null && metadata.image) {
  //         imageUrl = metadata.image.startsWith('ipfs://')
  //           ? convertToIPFSUrl(metadata.image)
  //           : metadata.image;
  //       }

  //       console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
  //       console.log(tokenId, "tokenId " + index);
  //       console.log(metadata, "metadata" + index);
  //       console.log(imageUrl, "imageUrl" + index);
  //       console.log(item.collection.name, "item.collection.name" + index);
  //       console.log("=========================================================================");

  //       // Find the NFT in the database and update it
  //       const updatedNft = await Nft.findOneAndUpdate(
  //         { tokenId: tokenId, collectionName: item.collection.name === "priority_pass_001" ? "Priority Pass" : item.collection.name },
  //         {
  //           $set: {
  //             isRevealed: true,
  //             tokenImage: imageUrl,
  //             ...metadata, // Spread the metadata to update other fields
  //           }
  //         },
  //         { new: true }
  //       );

  //       return updatedNft;
  //     } catch (error) {
  //       console.error(`Error updating NFT with tokenId ${tokenId}:`, error);
  //       return null;
  //     }
  //   });

  //   const results = await Promise.all(updatePromises);

  //   // Filter out null results (failed updates)
  //   const updatedNfts = results.filter(result => result !== null);

  //   console.log(`Updated ${updatedNfts.length} NFTs`);

  //   return updatedNfts;
  // }

  // public async  updateRevealedNFTs(nftData: any, userId: mongoose.Types.ObjectId): Promise<any> {
  //   console.log("Updating revealed NFTs for user:", userId);

  //   const updatePromises = nftData.reveledData.map(async (item: any) => {
  //     const tokenId = item['token-id'];
  //     const uri = item.uri;
  //     const collectionName = item.collection.name === "priority_pass_001" ? "Priority Pass" : item.collection.name;

  //     try {
  //       const metadata = await fetchMetadata(uri);
  //       console.log(metadata, "metadata",tokenId);

  //       let imageUrl = '';
  //       if (typeof metadata === 'object' && metadata !== null && metadata.image) {
  //         imageUrl = metadata.image.startsWith('ipfs://')
  //           ? convertToIPFSUrl(metadata.image)
  //           : metadata.image;
  //       }

  //       console.log(`Processing NFT: TokenID ${tokenId}, Collection ${collectionName}`);

  //       // Try to find an existing NFT for this user and token
  //       let existingNft = await Nft.findOne({
  //         user: userId,
  //         tokenId: tokenId,
  //         collectionName: collectionName
  //       });

  //       if (existingNft) {
  //         // Update existing NFT
  //         console.log(`Updating existing NFT: ${tokenId}`);
  //         existingNft.isRevealed = true;
  //         existingNft.tokenImage = imageUrl;
  //         Object.assign(existingNft, metadata);
  //         await existingNft.save();
  //         return existingNft;
  //       } else {
  //         // Create new NFT
  //         console.log(`Creating new NFT: ${tokenId}`);
  //         const newNft = new Nft({
  //           user: userId,
  //           tokenId: tokenId,
  //           collectionName: collectionName,
  //           isRevealed: true,
  //           tokenImage: imageUrl,
  //           ...metadata,
  //           // Add other necessary fields from item or nftData
  //           creator: item.collection.creator,
  //           uri: uri,
  //           collection: item.collection,
  //           // You might want to add more fields here based on your Nft model
  //         });
  //         await newNft.save();
  //         return newNft;
  //       }
  //     } catch (error) {
  //       console.error(`Error processing NFT with tokenId ${tokenId}:`, error);
  //       return null;
  //     }
  //   });

  //   const results = await Promise.all(updatePromises);

  //   // Filter out null results (failed updates/creations)
  //   const processedNfts = results.filter(result => result !== null);

  //   console.log(`Processed ${processedNfts.length} NFTs`);

  //   return processedNfts;
  // }

  // public async  updateRevealedNFTs(nftData: any, userId: mongoose.Types.ObjectId): Promise<any> {
  //   console.log("Updating revealed NFTs for user:", userId);
  //   console.log(nftData, "nftData+++++++++++++++++++++++++++++");

  //   //get use by id
  //   const user: IUser = await User.findById(userId) as IUser;
  //   console.log(user, "user+++++++++++++++++++++++++++++");

  //   const updatePromises = nftData.reveledData.map(async (item: any) => {
  //     const tokenId = item['token-id'];
  //     const collection = await salesService.getCollectionByTokenId(tokenId);
  //     console.log(collection, "collection+++++++++++++++++++++++++++++");
  //     const uri = item.uri;
  //     // const collectionName = item.collection.name === "priority_pass_001" ? "Priority Pass" : item.collection.name;

  //     try {
  //       const metadata = await fetchMetadata(uri);
  //       console.log(metadata, "metadata",tokenId);

  //       let imageUrl = '';
  //       if (typeof metadata === 'object' && metadata !== null && metadata.image) {
  //         imageUrl = metadata.image.startsWith('ipfs://')
  //           ? convertToIPFSUrl(metadata.image)
  //           : metadata.image;
  //       }

  //       console.log(`Processing NFT: TokenID ${tokenId}`);

  //       // Try to find an existing NFT for this user and token
  //       let existingNft = await Nft.findOne({
  //         user: userId,
  //         tokenId: tokenId,
  //         // collectionName: collectionName
  //       });

  //       if (existingNft) {
  //         // Update existing NFT
  //         console.log(`Updating existing NFT: ${tokenId}`);
  //         existingNft.isRevealed = true;
  //         existingNft.tokenImage = imageUrl;
  //         Object.assign(existingNft, metadata);
  //         await existingNft.save();
  //         return existingNft;
  //       } else {
  //         // Create new NFT
  //         console.log(`Creating new NFT: ${tokenId}`);
  //         const newNft = new Nft({
  //           user: userId,
  //           tokenId: tokenId,
  //           // collectionName: collectionName,
  //           isRevealed: true,
  //           tokenImage: imageUrl,
  //           ...metadata,
  //           // Add other necessary fields from item or nftData
  //           creator: user.walletAddress,
  //           uri: uri,
  //           collection: item.collection,
  //           // You might want to add more fields here based on your Nft model
  //         });
  //         await newNft.save();
  //         return newNft;
  //       }
  //     } catch (error) {
  //       console.error(`Error processing NFT with tokenId ${tokenId}:`, error);
  //       return null;
  //     }
  //   });

  //   const results = await Promise.all(updatePromises);

  //   // Filter out null results (failed updates/creations)
  //   const processedNfts = results.filter(result => result !== null);

  //   console.log(`Processed ${processedNfts.length} NFTs`);

  //   return processedNfts;
  // }

  public async updateRevealedNFTs(
    nftData: any,
    userId: mongoose.Types.ObjectId
  ): Promise<any> {
    console.log("Updating revealed NFTs for user:", userId);
    console.log(nftData, "nftData+++++++++++++++++++++++++++++");

    const user: IUser = (await User.findById(userId)) as IUser;
    console.log(user, "user+++++++++++++++++++++++++++++");

    const updatePromises = nftData.reveledData.map(async (item: any) => {
      const tokenId = item["token-id"];
      const collection = await salesService.getCollectionByTokenId(tokenId);
      console.log(
        collection,
        "collection+++++++++++++++++++++++++++++",
        tokenId
      );
      const uri = item.uri;

      let collectionName = "";
      if (collection && collection.c && collection.c.name) {
        // if (/^priority_pass_\d+$/.test(collection.c.name)) {
        if (collection.c.name === "priority_pass") {
          //   collectionName = "Priority Pass";
          // }
          collectionName = "Priority Pass";
        } else {
          collectionName = collection.c.name;
        }
      }

      try {
        const metadata = await fetchMetadata(uri);
        console.log(metadata, "metadata", tokenId);

        let imageUrl = "";
        if (
          // typeof metadata === "object" &&
          // metadata !== null &&
          metadata.image
        ) {
          imageUrl = metadata.image.startsWith("ipfs://")
            ? convertToIPFSUrl(metadata.image)
            : metadata.image;
        } else if (metadata.error) {
          console.error(
            `Error fetching metadata for token ${tokenId}: ${metadata.error}`
          );
          return null; // Return null for failed items
        }

        console.log(`Processing NFT: TokenID ${tokenId}`);

        // Try to find an existing NFT for this user and token
        let existingNft = await Nft.findOne({
          user: userId,
          tokenId: tokenId,
        });

        if (existingNft) {
          // Update existing NFT
          console.log(`Updating existing NFT: ${tokenId}`);
          existingNft.isRevealed = true;
          existingNft.tokenImage = imageUrl;
          if (collectionName) {
            existingNft.collectionName = collectionName;
          }
          existingNft.owner = user.walletAddress; // Add this line
          Object.assign(existingNft, metadata);
          await existingNft.save();
          return existingNft;
        } else {
          // Create new NFT
          console.log(`Creating new NFT: ${tokenId}`);
          const newNftData: any = {
            user: userId,
            tokenId: tokenId,
            isRevealed: true,
            tokenImage: imageUrl,
            ...metadata,
            creator: user.walletAddress,
            owner: user.walletAddress,
            uri: uri,
            collection: collection,
          };

          if (collectionName) {
            newNftData.collectionName = collectionName;
          }

          const newNft = new Nft(newNftData);
          await newNft.save();
          return newNft;
        }
      } catch (error) {
        console.error(`Error processing NFT with tokenId ${tokenId}:`, error);
        return null;
      }
    });

    const results = await Promise.all(updatePromises);

    // Filter out null results (failed updates/creations)
    const processedNfts = results.filter((result) => result !== null);

    console.log(`Processed ${processedNfts.length} NFTs`);

    return processedNfts;
  }

  public async getCollectionNfts(
    pageNo: number,
    limit: number,
    search: string,
    collectionName: string
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }> {
    const total = await Nft.countDocuments({
      collectionName: collectionName,
      isRevealed: true,
    });
    console.log(total, "total");

    const nfts: INft[] = await Nft.aggregate([
      {
        $match: {
          collectionName: collectionName,
          isRevealed: true,
        },
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: 1,
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          onDutchAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          attributes: 1,
          rarityScore: 1,
          rarityRank: 1,
          likes: 1,
          createdAt: 1,
          // New fields
          isPlatform: 1,
          saleType: 1,
          saleId: 1,
          price: 1,
          amount: 1,
          timeout: 1,
          currency: 1,
          enabled: 1,
          seller: 1,
          recipient: 1,
          escrowAccount: 1,
          currentBuyer: 1,
          startPrice: 1,
          endPrice: 1,
          startTime: 1,
          endTime: 1,
          incrementRatio: 1,
          currentPrice: 1,
          uri: 1,
          supply: 1,
          policies: 1,
          collection: 1,
          nftData: 1,
          traitCount: 1,
          owner: 1,
          lastUpdated: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      nfts,
      total,
      currentPage: pageNo,
    };
  }

  public async getCollectionNftsMarket(
    pageNo: number,
    limit: number,
    search: string,
    collectionName: string
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }> {
    const total = await Nft.countDocuments({
      collectionName: collectionName,
    });
    console.log(total, "total");

    const nfts: INft[] = await Nft.aggregate([
      {
        $match: {
          collectionName: collectionName,
          onMarketplace: true,
        },
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: 1,
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          onDutchAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          attributes: 1,
          rarityScore: 1,
          rarityRank: 1,
          likes: 1,
          createdAt: 1,
          // New fields
          isPlatform: 1,
          saleType: 1,
          saleId: 1,
          price: 1,
          amount: 1,
          timeout: 1,
          currency: 1,
          enabled: 1,
          seller: 1,
          recipient: 1,
          escrowAccount: 1,
          currentBuyer: 1,
          startPrice: 1,
          endPrice: 1,
          startTime: 1,
          endTime: 1,
          incrementRatio: 1,
          currentPrice: 1,
          uri: 1,
          supply: 1,
          policies: 1,
          collection: 1,
          owner: 1,
          nftData: 1,
          traitCount: 1,
          lastUpdated: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      nfts,
      total,
      currentPage: pageNo,
    };
  }

  public async getOwnedNfts(
    userId: string,
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }> {
    // First, get the total count of matching documents
    const total = await Nft.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
      // collectionName: { $regex: search, $options: "i" },
      collectionName: {
        $regex: search,
        $options: "i",
        $ne: "Priority Pass", // Exclude "Priority Pass"
      },
      onMarketplace: false,
    });

    const nfts: INft[] = await Nft.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          // collectionName: { $regex: search, $options: "i" },
          collectionName: {
            $regex: search,
            $options: "i",
            $ne: "Priority Pass", // Exclude "Priority Pass"
          },
          onMarketplace: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: 1,
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          onDutchAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          attributes: 1,
          rarityScore: 1,
          rarityRank: 1,
          likes: 1,
          createdAt: 1,
          // New fields
          isPlatform: 1,
          saleType: 1,
          saleId: 1,
          price: 1,
          amount: 1,
          timeout: 1,
          currency: 1,
          enabled: 1,
          seller: 1,
          recipient: 1,
          escrowAccount: 1,
          currentBuyer: 1,
          startPrice: 1,
          endPrice: 1,
          startTime: 1,
          endTime: 1,
          incrementRatio: 1,
          currentPrice: 1,
          uri: 1,
          supply: 1,
          policies: 1,
          collection: 1,
          owner: 1,
          nftData: 1,
          traitCount: 1,
          lastUpdated: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      nfts,
      total,
      currentPage: pageNo,
    };
  }

  public async getOwnedPriorityPassNfts(
    userId: string,
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }> {
    // First, get the total count of matching documents
    const total = await Nft.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
      collectionName: "Priority Pass",
      onMarketplace: false,
    });

    const nfts: INft[] = await Nft.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          collectionName: "Priority Pass",
          onMarketplace: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: 1,
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          onDutchAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          attributes: 1,
          rarityScore: 1,
          rarityRank: 1,
          likes: 1,
          createdAt: 1,
          // New fields
          isPlatform: 1,
          saleType: 1,
          saleId: 1,
          price: 1,
          amount: 1,
          timeout: 1,
          currency: 1,
          enabled: 1,
          seller: 1,
          recipient: 1,
          escrowAccount: 1,
          currentBuyer: 1,
          startPrice: 1,
          endPrice: 1,
          startTime: 1,
          endTime: 1,
          incrementRatio: 1,
          currentPrice: 1,
          uri: 1,
          supply: 1,
          policies: 1,
          collection: 1,
          nftData: 1,
          owner: 1,
          traitCount: 1,
          lastUpdated: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      nfts,
      total,
      currentPage: pageNo,
    };
  }

  // getOwnedNfts page limit search
  public async getOwnSaleNfts(
    userId: string,
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }> {
    // First, get the total count of matching documents
    const total = await Nft.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
      collectionName: { $regex: search, $options: "i" },
      onMarketplace: true,
      onSale: true,
    });

    const nfts: INft[] = await Nft.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          collectionName: { $regex: search, $options: "i" },
          onMarketplace: true,
          onSale: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: 1,
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          onDutchAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          attributes: 1,
          rarityScore: 1,
          rarityRank: 1,
          likes: 1,
          createdAt: 1,
          // New fields
          isPlatform: 1,
          saleType: 1,
          saleId: 1,
          price: 1,
          amount: 1,
          timeout: 1,
          currency: 1,
          enabled: 1,
          seller: 1,
          recipient: 1,
          escrowAccount: 1,
          currentBuyer: 1,
          startPrice: 1,
          endPrice: 1,
          startTime: 1,
          endTime: 1,
          incrementRatio: 1,
          currentPrice: 1,
          uri: 1,
          supply: 1,
          policies: 1,
          collection: 1,
          nftData: 1,
          owner: 1,
          traitCount: 1,
          lastUpdated: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      nfts,
      total,
      currentPage: pageNo,
    };
  }

  // getOwnAuctionNfts
  public async getOwnAuctionNfts(
    userId: string,
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }> {
    // First, get the total count of matching documents
    const total = await Nft.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
      collectionName: { $regex: search, $options: "i" },
      onMarketplace: true,
      onAuction: true,
    });

    const nfts: INft[] = await Nft.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          collectionName: { $regex: search, $options: "i" },
          onMarketplace: true,
          onAuction: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: 1,
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          onDutchAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          attributes: 1,
          rarityScore: 1,
          rarityRank: 1,
          likes: 1,
          createdAt: 1,
          // New fields
          isPlatform: 1,
          saleType: 1,
          saleId: 1,
          price: 1,
          amount: 1,
          timeout: 1,
          currency: 1,
          enabled: 1,
          seller: 1,
          recipient: 1,
          escrowAccount: 1,
          currentBuyer: 1,
          startPrice: 1,
          endPrice: 1,
          startTime: 1,
          endTime: 1,
          incrementRatio: 1,
          currentPrice: 1,
          uri: 1,
          supply: 1,
          policies: 1,
          collection: 1,
          nftData: 1,
          owner: 1,
          traitCount: 1,
          lastUpdated: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      nfts,
      total,
      currentPage: pageNo,
    };
  }

  // getOwnDutchAuctionNfts
  public async getOwnDutchAuctionNfts(
    userId: string,
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }> {
    // First, get the total count of matching documents
    const total = await Nft.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
      collectionName: { $regex: search, $options: "i" },
      onMarketplace: true,
      onDutchAuction: true,
    });

    const nfts: INft[] = await Nft.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          collectionName: { $regex: search, $options: "i" },
          onMarketplace: true,
          onDutchAuction: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: 1,
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          onDutchAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          attributes: 1,
          rarityScore: 1,
          rarityRank: 1,
          likes: 1,
          createdAt: 1,
          // New fields
          isPlatform: 1,
          saleType: 1,
          saleId: 1,
          price: 1,
          amount: 1,
          timeout: 1,
          currency: 1,
          enabled: 1,
          seller: 1,
          recipient: 1,
          escrowAccount: 1,
          currentBuyer: 1,
          startPrice: 1,
          endPrice: 1,
          startTime: 1,
          endTime: 1,
          incrementRatio: 1,
          currentPrice: 1,
          uri: 1,
          supply: 1,
          policies: 1,
          collection: 1,
          nftData: 1,
          owner: 1,
          traitCount: 1,
          lastUpdated: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      nfts,
      total,
      currentPage: pageNo,
    };
  }

  public async getNftById(id: string): Promise<INft | null> {
    return Nft.findById(id);
  }

  public async updateNft(nft: INft): Promise<INft | null> {
    return Nft.findByIdAndUpdate(nft._id, nft, { new: true });
  }

  // getPriorityPassNfts

  public async getPriorityPassNfts(
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }> {
    // First, get the total count of matching documents
    const total = await Nft.countDocuments({
      collectionName: "Priority Pass",
      onMarketplace: false,
    });

    const nfts: INft[] = await Nft.aggregate([
      {
        $match: {
          collectionName: "Priority Pass",
          onMarketplace: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: 1,
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          onDutchAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          attributes: 1,
          rarityScore: 1,
          rarityRank: 1,
          likes: 1,
          createdAt: 1,
          // New fields
          isPlatform: 1,
          saleType: 1,
          saleId: 1,
          price: 1,
          amount: 1,
          timeout: 1,
          currency: 1,
          enabled: 1,
          seller: 1,
          recipient: 1,
          escrowAccount: 1,
          currentBuyer: 1,
          startPrice: 1,
          endPrice: 1,
          startTime: 1,
          endTime: 1,
          incrementRatio: 1,
          currentPrice: 1,
          uri: 1,
          supply: 1,
          policies: 1,
          collection: 1,
          nftData: 1,
          owner: 1,
          traitCount: 1,
          lastUpdated: 1,
        },
      },

      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      nfts,
      total,
      currentPage: pageNo,
    };
  }

  //get all priority pass whose tokenId is empty

  public async getPriorityPassNftsTokenIdEmpty(
    pageNo: number,
    limit: number,
    search: string
  ): Promise<{ nfts: INft[]; total: number; currentPage: number }> {
    // First, get the total count of matching documents
    const total = await Nft.countDocuments({
      collectionName: "Priority Pass",
      onMarketplace: false,
      tokenId: "",
    });

    const nfts: INft[] = await Nft.aggregate([
      {
        $match: {
          collectionName: "Priority Pass",
          onMarketplace: false,
          tokenId: "",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: 1,
          collectionId: 1,
          collectionType: 1,
          collectionName: 1,
          creator: 1,
          tokenImage: 1,
          tokenId: 1,
          nftPrice: 1,
          unlockable: 1,
          isRevealed: 1,
          digitalCode: 1,
          onMarketplace: 1,
          onSale: 1,
          bidInfo: 1,
          onAuction: 1,
          onDutchAuction: 1,
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          attributes: 1,
          rarityScore: 1,
          rarityRank: 1,
          likes: 1,
          createdAt: 1,
          // New fields
          isPlatform: 1,
          saleType: 1,
          saleId: 1,
          price: 1,
          amount: 1,
          timeout: 1,
          currency: 1,
          enabled: 1,
          seller: 1,
          recipient: 1,
          escrowAccount: 1,
          currentBuyer: 1,
          startPrice: 1,
          endPrice: 1,
          startTime: 1,
          endTime: 1,
          incrementRatio: 1,
          currentPrice: 1,
          uri: 1,
          supply: 1,
          policies: 1,
          collection: 1,
          nftData: 1,
          owner: 1,
          traitCount: 1,
          lastUpdated: 1,
        },
      },

      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (pageNo - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      nfts,
      total,
      currentPage: pageNo,
    };
  }

  // const getRandomUris = async (data: any) => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       const response = await axios.post(`${url}/nft/randomUris`, data, {
  //         headers: {
  //           Authorization: `Bearer ${token}`
  //         }
  //       });
  //       return response.data;
  //     } catch (error) {
  //       return error.response.data;
  //     }
  //   }
  public async getRandomUris(data: { collectionName: string; count: number }): Promise<string[]> {
    console.log(data, "data+++++++++++++++++++++++++++++");

    const { collectionName, count } = data;

    try {
      // Fetch the LaunchCollection document
      const launchCollection = await LaunchCollection.findOne({ collectionName });

      if (!launchCollection) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      const { uriList, mintedUriList = [] } = launchCollection;

      // Filter out already minted URIs
      const availableUris = uriList.filter(uri => !mintedUriList.includes(uri));

      if (availableUris.length < count) {
        throw new Error(`Not enough available URIs. Requested: ${count}, Available: ${availableUris.length}`);
      }

      // Shuffle the available URIs
      const shuffled = availableUris.sort(() => 0.5 - Math.random());

      // Select the requested number of URIs
      const selectedUris = shuffled.slice(0, count);

      return selectedUris;
    } catch (error) {
      console.error("Error in getRandomUris:", error);
      throw error;
    }
  }

 

  public async updateNFTWithRandomUri(data: {
    collectionName: string;
    randomUris: string[];
  }): Promise<{ updatedCount: number }> {
    console.log(data, "data+++++++++++++++++++++++++++++");

    const { collectionName } = data;
    const mintedUris = data.randomUris;
    console.log(mintedUris, "mintedUris+++++++++++++++++++++++++++++");

    try {
      // return { updatedCount: mintedUris.length };
      // Update the LaunchCollection document
      const result = await LaunchCollection.updateOne(
        { collectionName },
        { 
          $addToSet: { 
            mintedUriList: { $each: mintedUris } 
          }
        }
      );

      if (result.matchedCount === 0) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      return { updatedCount: result.modifiedCount };
    } catch (error) {
      console.error("Error in updateNFTWithRandomUri:", error);
      throw error;
    }
  }


}

export default NftManager.getInstance();
