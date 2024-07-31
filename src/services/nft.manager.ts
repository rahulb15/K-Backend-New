import { INft } from "../interfaces/nft/nft.interface";
import { INftManager } from "../interfaces/nft/nft.manager.interface";
import Nft from "../models/nft.model";
import mongoose from "mongoose";

const PREFERED_GATEWAY = "ipfs.io";

function ipfsResolution(cid:any) {
  return `https://${PREFERED_GATEWAY}/ipfs/${cid}`;
}

// Helper function to convert any URL to IPFS gateway URL
function convertToIPFSUrl(url: string): string {
  if (url.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${url.split('ipfs://')[1]}`;
  } else if (url.startsWith('https://ipfs.io/ipfs/')) {
    return url; // Already in the correct format
  } else if (url.startsWith('http://') || url.startsWith('https://')) {
    // For other HTTP(S) URLs, assume the last part is the CID
    const parts = url.split('/');
    return `https://ipfs.io/ipfs/${parts[parts.length - 1]}`;
  } else {
    // For anything else (including blob URLs), treat the entire string as a CID
    return `https://ipfs.io/ipfs/${url.replace('blob:', '')}`;
  }
}


async function fetchIPFSData(uri:any) {
  const [protocol, cid] = uri.split("//");
  console.log("🚀 ~ file: index.jsx ~ line 38 ~ fetchIPFSData ~ protocol", protocol);
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
    
    const contentType:any = response.headers.get("content-type");
    
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
  ): Promise<{ nfts: INft[], total: number, currentPage: number }> {

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
          sellingType: 1,
          creatorName: 1,
          duration: 1,
          royalties: 1,
          properties: 1,
          likes: 1,
          createdAt: 1 // Add createdAt here
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
      currentPage: pageNo
    };
  }

 
  

  public async getById(id: string): Promise<INft> {
    const nft: INft = (await Nft.findById(id)) as INft;
    return nft;
  }

  public async update(nft: any): Promise<any> {
    console.log(nft, "nftaaa");
    console.log(nft.tokenId.length, "nft.tokenId.length");

    // Fetch NFTs with the specified collection name and empty token ID
    const nftData = await Nft.find({ collectionName: nft.collectionName, tokenId: "" });
    console.log(nftData, "nftData");
    console.log(nftData.length, "nftData.length");

    // Check if there are NFTs to update
    if (nftData.length === 0) {
        return { message: "No NFTs found to update" };
    }

    // Ensure the number of token IDs matches the number of NFTs found
    if (nftData.length < nft.tokenId.length) {
        return { message: "Too many token IDs provided" };
    }

    // Update each NFT with the corresponding token ID
    const updatePromises = nftData.map((item, index) => {
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


// // updateRevealedNFTs
// public async updateRevealedNFTs(nft: any): Promise<any> {
//   console.log(nft, "nftaaazzzzz");
//   // {
//   //   reveledData: [
//   //     {
//   //       'token-id': 't:6wb9Iw3tS7LDFXq1aOqMJ7L5kBSa58EdnfQG0Dps8Wk',
//   //       uri: 'ipfs://bafkreicm7uen4kb3y7nwoexrsx7sre6ckfmtbfufslidbesfsbzfi2lguy',
//   //       collection: [Object]
//   //     },
//   //     {
//   //       'token-id': 't:VjGG8oUD4t_Z73IrS8dAKGeuxV_A-4T0IzYBaDNiP3Q',
//   //       uri: 'ipfs://QmRPqajKGNCtKyA7oE5Lx3H8YijyfopS8oaVcdZCSUDyEP',
//   //       collection: [Object]
//   //     },
//   //     {
//   //       'token-id': 't:rrh0qZKVH23Vh3iWPINRo8Jcgp_7ChWgGK1mdhMgbVk',
//   //       uri: 'ipfs://bafkreifabzsykcr23o2xyzovys6olid63oaxrb3i3byzz32caklymlvm5u',
//   //       collection: [Object]
//   //     }
//   //   ]
//   // } nftaaa

//   // collectiondata
//   console.log(nft.reveledData[0].collection, "nft.reveledData[0].collection");

//   // {
//   //   'max-size': { int: 4 },
//   //   creator: 'k:d1d47937b0ec42efa859048d0fb5f51707639ddad991e58ae9efcff5f4ff9dbe',
//   //   size: { int: 2 },
//   //   'creator-guard': {
//   //     pred: 'keys-all',
//   //     keys: [
//   //       'd1d47937b0ec42efa859048d0fb5f51707639ddad991e58ae9efcff5f4ff9dbe'
//   //     ]
//   //   },
//   //   name: 'monkeyaz9',
//   //   id: 'c_monkeyaz9_jFJXachO_oLhg80VTD-yVTU749uITjIjJZkKIlD-Wbg'
//   // } nft.reveledData[0].collection










//   console.log(nft.tokenId.length, "nft.tokenId.length");

//   return;


// }

public async updateRevealedNFTs(nft: any): Promise<any> {
  console.log(nft, "nftaaazzzzz");

  const collectionName = nft.reveledData[0].collection.name;
  const updatePromises = nft.reveledData.map(async (item: any, index: number) => {
    const tokenId = item['token-id'];
    console.log(tokenId, "tokenId " + index);
    const uri = item.uri;
    console.log(uri, "uri");

    try {
      // Fetch IPFS data
      const ipfsData = await fetchIPFSData(uri);
      console.log(ipfsData, "ipfsData" + index);

      let imageUrl = '';
      let metadata = {};

      if (typeof ipfsData === 'object' && ipfsData !== null) {
        metadata = ipfsData;
        if (ipfsData.image) {
          imageUrl = convertToIPFSUrl(ipfsData.image);
        }
      }

      // Find the NFT in the database and update it
      const updatedNft = await Nft.findOneAndUpdate(
        { tokenId: tokenId, collectionName: collectionName },
        {
          $set: {
            isRevealed: true,
            tokenImage: imageUrl,
            ...metadata, // Spread the metadata to update other fields
          }
        },
        { new: true }
      );

      return updatedNft;
    } catch (error) {
      console.error(`Error updating NFT with tokenId ${tokenId}:`, error);
      return null;
    }
  });

  const results = await Promise.all(updatePromises);
  
  // Filter out null results (failed updates)
  const updatedNfts = results.filter(result => result !== null);

  console.log(`Updated ${updatedNfts.length} NFTs`);

  return updatedNfts;
}




}

export default NftManager.getInstance();
