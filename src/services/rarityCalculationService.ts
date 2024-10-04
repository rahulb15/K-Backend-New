// import mongoose, { PipelineStage } from 'mongoose';
// import cron from 'node-cron';
// import Nft from '../models/nft.model';
// import CollectionMarketPlace from '../models/collection.model';

// class RarityCalculationService {
//   private static instance: RarityCalculationService;

//   private constructor() {}

//   public static getInstance(): RarityCalculationService {
//     if (!RarityCalculationService.instance) {
//       RarityCalculationService.instance = new RarityCalculationService();
//     }
//     return RarityCalculationService.instance;
//   }

//   public async calculateRarityScores(): Promise<void> {
//     const pipeline: PipelineStage[] = [
//       { $unwind: '$attributes' },
//       {
//         $group: {
//           _id: {
//             trait_type: '$attributes.trait_type',
//             value: '$attributes.value'
//           },
//           count: { $sum: 1 },
//           tokenIds: { $addToSet: '$tokenId' }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           trait_type: '$_id.trait_type',
//           value: '$_id.value',
//           count: 1,
//           rarityScore: {
//             $divide: [1, { $divide: ['$count', { $size: '$tokenIds' }] }]
//           },
//           tokenIds: 1
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalNFTs: { $addToSet: '$tokenIds' },
//           traitScores: {
//             $push: {
//               trait_type: '$trait_type',
//               value: '$value',
//               rarityScore: '$rarityScore',
//               tokenIds: '$tokenIds'
//             }
//           }
//         }
//       },
//       { $unwind: '$traitScores' },
//       { $unwind: '$traitScores.tokenIds' },
//       {
//         $group: {
//           _id: '$traitScores.tokenIds',
//           totalRarityScore: { $sum: '$traitScores.rarityScore' },
//           traitCount: { $sum: 1 }
//         }
//       },
//       { $sort: { totalRarityScore: -1 } },
//       {
//         $group: {
//           _id: null,
//           nfts: {
//             $push: {
//               tokenId: '$_id',
//               rarityScore: '$totalRarityScore',
//               traitCount: '$traitCount'
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           nfts: {
//             $map: {
//               input: { $range: [0, { $size: '$nfts' }] },
//               as: 'index',
//               in: {
//                 $mergeObjects: [
//                   { $arrayElemAt: ['$nfts', '$$index'] },
//                   { rank: { $add: ['$$index', 1] } }
//                 ]
//               }
//             }
//           }
//         }
//       },
//       { $unwind: '$nfts' }
//     ];

//     const results = await Nft.aggregate(pipeline);

//     for (const result of results) {
//       await Nft.updateOne(
//         { tokenId: result.nfts.tokenId },
//         {
//           $set: {
//             rarityScore: result.nfts.rarityScore,
//             rarityRank: result.nfts.rank,
//             traitCount: result.nfts.traitCount
//           }
//         }
//       );
//     }

//     console.log('Rarity calculation completed and NFTs updated.');
//   }

//   // public scheduleRarityCalculation(): void {
//   //   cron.schedule('0 */2 * * *', async () => { // Run every 2 hours
//   //     console.log('Starting scheduled rarity calculation...');
//   //     try {
//   //       await this.calculateRarityScores();
//   //       console.log('Scheduled rarity calculation completed successfully.');
//   //     } catch (error) {
//   //       console.error('Error in scheduled rarity calculation:', error);
//   //     }
//   //   });
//   // }

//   public scheduleRarityCalculation(): void {
//     cron.schedule('*/2 * * * *', async () => { // Run every 2 minutes
//       console.log('Starting scheduled rarity calculation...');
//       try {
//         await this.calculateRarityScores();
//         console.log('Scheduled rarity calculation completed successfully.');
//       } catch (error) {
//         console.error('Error in scheduled rarity calculation:', error);
//       }
//     });
//   }
// }

// export default RarityCalculationService;

// import mongoose, { PipelineStage } from "mongoose";
// import cron from "node-cron";
// import Nft from "../models/nft.model";
// import CollectionMarketPlace from "../models/collection.model";

// class RarityCalculationService {
//   private static instance: RarityCalculationService;

//   private constructor() {}

//   public static getInstance(): RarityCalculationService {
//     if (!RarityCalculationService.instance) {
//       RarityCalculationService.instance = new RarityCalculationService();
//     }
//     return RarityCalculationService.instance;
//   }

//   public async calculateRarityScores(): Promise<void> {
//     const collections = await CollectionMarketPlace.find({});

//     for (const collection of collections) {
//       console.log(
//         `Calculating rarity for collection: ${collection.collectionName}`
//       );

//       const pipeline: PipelineStage[] = [
//         { $match: { collectionId: collection.collectionId } },
//         { $unwind: "$attributes" },
//         {
//           $group: {
//             _id: {
//               trait_type: "$attributes.trait_type",
//               value: "$attributes.value",
//             },
//             count: { $sum: 1 },
//             tokenIds: { $addToSet: "$tokenId" },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             trait_type: "$_id.trait_type",
//             value: "$_id.value",
//             count: 1,
//             rarityScore: {
//               $divide: [1, { $divide: ["$count", { $size: "$tokenIds" }] }],
//             },
//             tokenIds: 1,
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalNFTs: { $addToSet: "$tokenIds" },
//             traitScores: {
//               $push: {
//                 trait_type: "$trait_type",
//                 value: "$value",
//                 rarityScore: "$rarityScore",
//                 tokenIds: "$tokenIds",
//               },
//             },
//           },
//         },
//         { $unwind: "$traitScores" },
//         { $unwind: "$traitScores.tokenIds" },
//         {
//           $group: {
//             _id: "$traitScores.tokenIds",
//             totalRarityScore: { $sum: "$traitScores.rarityScore" },
//             traitCount: { $sum: 1 },
//           },
//         },
//         { $sort: { totalRarityScore: -1 } },
//         {
//           $group: {
//             _id: null,
//             nfts: {
//               $push: {
//                 tokenId: "$_id",
//                 rarityScore: "$totalRarityScore",
//                 traitCount: "$traitCount",
//               },
//             },
//           },
//         },
//         {
//           $project: {
//             nfts: {
//               $map: {
//                 input: { $range: [0, { $size: "$nfts" }] },
//                 as: "index",
//                 in: {
//                   $mergeObjects: [
//                     { $arrayElemAt: ["$nfts", "$$index"] },
//                     { rank: { $add: ["$$index", 1] } },
//                   ],
//                 },
//               },
//             },
//           },
//         },
//         { $unwind: "$nfts" },
//       ];

//       const results = await Nft.aggregate(pipeline);

//       const bulkOps = results.map((result) => {
//         console.log(result, "result");
//         return {
//           updateOne: {
//             filter: {
//               tokenId: result.nfts.tokenId,
//               collectionId: collection.collectionId,
//             },
//             update: {
//               $set: {
//                 rarityScore: result.nfts.rarityScore,
//                 rarityRank: result.nfts.rank,
//                 traitCount: result.nfts.traitCount,
//               },
//             },
//           },
//         };
//       });

//       if (bulkOps.length > 0) {
//         await Nft.bulkWrite(bulkOps);
//       }

//       console.log(
//         `Rarity calculation completed for collection: ${collection.collectionName}`
//       );
//     }

//     console.log("Rarity calculation completed for all collections.");
//   }

//   public scheduleRarityCalculation(): void {
//     cron.schedule("*/2 * * * *", async () => {
//       // Run every 2 hours
//       console.log("Starting scheduled rarity calculation...");
//       try {
//         await this.calculateRarityScores();
//         console.log("Scheduled rarity calculation completed successfully.");
//       } catch (error) {
//         console.error("Error in scheduled rarity calculation:", error);
//       }
//     });
//   }
// }

// export default RarityCalculationService;

import mongoose, { PipelineStage } from "mongoose";
import cron from "node-cron";
import Nft from "../models/nft.model";
import CollectionMarketPlace from "../models/collection.model";

class RarityCalculationService {
  private static instance: RarityCalculationService;

  private constructor() {}

  public static getInstance(): RarityCalculationService {
    if (!RarityCalculationService.instance) {
      RarityCalculationService.instance = new RarityCalculationService();
    }
    return RarityCalculationService.instance;
  }

  public async calculateRarityScores(): Promise<void> {
    const collections = await CollectionMarketPlace.find({});

    for (const collection of collections) {
      console.log(
        `Calculating rarity for collection: ${collection.collectionName}`
      );

      const pipeline: PipelineStage[] = [
        { $match: { collectionId: collection._id } }, // Use the ObjectId from the collection document
        { $unwind: "$attributes" },
        {
          $group: {
            _id: {
              trait_type: "$attributes.trait_type",
              value: "$attributes.value",
            },
            count: { $sum: 1 },
            tokenIds: { $addToSet: "$tokenId" },
          },
        },
        {
          $project: {
            _id: 0,
            trait_type: "$_id.trait_type",
            value: "$_id.value",
            count: 1,
            rarityScore: {
              $divide: [1, { $divide: ["$count", { $size: "$tokenIds" }] }],
            },
            tokenIds: 1,
          },
        },
        {
          $group: {
            _id: null,
            totalNFTs: { $addToSet: "$tokenIds" },
            traitScores: {
              $push: {
                trait_type: "$trait_type",
                value: "$value",
                rarityScore: "$rarityScore",
                tokenIds: "$tokenIds",
              },
            },
          },
        },
        { $unwind: "$traitScores" },
        { $unwind: "$traitScores.tokenIds" },
        {
          $group: {
            _id: "$traitScores.tokenIds",
            totalRarityScore: { $sum: "$traitScores.rarityScore" },
            traitCount: { $sum: 1 },
          },
        },
        { $sort: { totalRarityScore: -1 } },
        {
          $group: {
            _id: null,
            nfts: {
              $push: {
                tokenId: "$_id",
                rarityScore: "$totalRarityScore",
                traitCount: "$traitCount",
              },
            },
          },
        },
        {
          $project: {
            nfts: {
              $map: {
                input: { $range: [0, { $size: "$nfts" }] },
                as: "index",
                in: {
                  $mergeObjects: [
                    { $arrayElemAt: ["$nfts", "$$index"] },
                    { rank: { $add: ["$$index", 1] } },
                  ],
                },
              },
            },
          },
        },
        { $unwind: "$nfts" },
      ];

      const results = await Nft.aggregate(pipeline);

      const bulkOps = results.map((result) => {
        console.log(result, "result");
        return {
          updateOne: {
            filter: {
              tokenId: result.nfts.tokenId,
              collectionId: collection._id, // Use the ObjectId from the collection document
            },
            update: {
              $set: {
                rarityScore: result.nfts.rarityScore,
                rarityRank: result.nfts.rank,
                traitCount: result.nfts.traitCount,
              },
            },
          },
        };
      });

      if (bulkOps.length > 0) {
        await Nft.bulkWrite(bulkOps);
      }

      console.log(
        `Rarity calculation completed for collection: ${collection.collectionName}`
      );
    }

    console.log("Rarity calculation completed for all collections.");
  }

  public scheduleRarityCalculation(): void {
    cron.schedule("*/2 * * * *", async () => {
      console.log("Starting scheduled rarity calculation...");
      try {
        await this.calculateRarityScores();
        console.log("Scheduled rarity calculation completed successfully.");
      } catch (error) {
        console.error("Error in scheduled rarity calculation:", error);
      }
    });
  }
}

export default RarityCalculationService;
