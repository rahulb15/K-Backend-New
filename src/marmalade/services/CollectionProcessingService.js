// const mongoose = require("mongoose");
// const CollectionService = require("./collectionService");
// const { createLogger, format, transports } = require("winston");
// const { chunk } = require("lodash");

// class CollectionProcessingService {
//   constructor() {
//     this.collectionService = new CollectionService();
//     this.logger = createLogger({
//       level: "info",
//       format: format.combine(format.timestamp(), format.json()),
//       transports: [
//         new transports.File({
//           filename: "collection-error.log",
//           level: "error",
//         }),
//         new transports.File({ filename: "collection-combined.log" }),
//       ],
//     });
//     this.Collection = mongoose.model("CollectionMarketPlace");
//   }

//   async processCollections() {
//     try {
//       const allCollections = await this.collectionService.getAllCollectionsDetailed();

//       let processedCount = 0;
//       const batchSize = 50;
//       const batches = chunk(allCollections, batchSize);

//       for (const batch of batches) {
//         await this.processBatch(batch);
//         processedCount += batch.length;
//         this.logger.info(
//           `Processed ${processedCount} out of ${allCollections.length} collections`
//         );
//       }

//       this.logger.info(`Completed processing ${processedCount} collections`);
//     } catch (error) {
//       this.logger.error("Error processing collections:", error);
//     }
//   }

//   async processBatch(batch) {
//     for (const collection of batch) {
//       try {
//         await this.upsertCollection(collection);
//       } catch (error) {
//         this.logger.error(`Error processing collection ${collection.collection_id}:`, error);
//       }
//     }
//   }

//   async upsertCollection(collection) {
//     const collectionData = this.mapCollectionData(collection);
//     const filter = { collectionId: collectionData.collectionId };
//     const update = {
//       $set: collectionData,
//       $setOnInsert: { createdAt: new Date() }
//     };
//     const options = { upsert: true, new: true };

//     try {
//       await this.Collection.findOneAndUpdate(filter, update, options);
//     } catch (error) {
//       if (error.code === 11000) {
//         // Handle duplicate key error
//         this.logger.warn(`Duplicate collection found for ${collectionData.collectionId}. Updating existing record.`);
//         await this.Collection.updateOne(
//           { collectionName: collectionData.collectionName, creator: collectionData.creator },
//           { $set: collectionData }
//         );
//       } else {
//         throw error;
//       }
//     }
//   }

//   mapCollectionData(collection) {
//     return {
//       collectionId: collection.collection_id,
//       collectionName: collection.collection_data.name,
//       size: collection.collection_data.size,
//       maxSize: collection.collection_data["max-size"],
//       creator: collection.collection_data.creator,
//       creatorGuard: collection.collection_data["creator-guard"],
//       tokens: collection.tokens,
//       totalSupply: collection.tokens.length,
//       tokenList: collection.tokens,
//       firstTokenData: collection.first_token_data,
//       lastUpdated: new Date(),
//       collectionCoverImage: collection?.first_token_data?.thumbnail || "",
//       collectionBannerImage: collection?.first_token_data?.thumbnail || "",
//       reservePrice: collection?.collection_data?.size ? parseInt(collection.collection_data.size) : 0,
//       totalItems: collection.tokens.length,
//       isActive: true,
//       updatedAt: new Date(),
//     };
//   }
// }

// module.exports = new CollectionProcessingService();




const mongoose = require("mongoose");
const CollectionService = require("./collectionService");
const { createLogger, format, transports } = require("winston");
const { chunk } = require("lodash");

class CollectionProcessingService {
  constructor() {
    this.collectionService = new CollectionService();
    this.logger = createLogger({
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new transports.File({
          filename: "collection-error.log",
          level: "error",
        }),
        new transports.File({ filename: "collection-combined.log" }),
      ],
    });
    this.Collection = mongoose.model("CollectionMarketPlace");
    this.LaunchCollection = mongoose.model("LaunchCollection");
    this.User = mongoose.model("User");
  }

  async processCollections() {
    try {
      const allCollections = await this.collectionService.getAllCollectionsDetailed();

      let processedCount = 0;
      const batchSize = 50;
      const batches = chunk(allCollections, batchSize);

      for (const batch of batches) {
        await this.processBatch(batch);
        processedCount += batch.length;
        this.logger.info(
          `Processed ${processedCount} out of ${allCollections.length} collections`
        );
      }

      this.logger.info(`Completed processing ${processedCount} collections`);
    } catch (error) {
      this.logger.error("Error processing collections:", error);
    }
  }

  async processBatch(batch) {
    for (const collection of batch) {
      try {
        await this.upsertCollection(collection);
        // Use this line for the second scenario (update only):
        await this.updateExistingLaunchCollection(collection);
        // Use this line for the first scenario (always create or update):
        // await this.upsertLaunchCollection(collection);
      } catch (error) {
        this.logger.error(`Error processing collection ${collection.collection_id}:`, error);
      }
    }
  }

  async upsertCollection(collection) {
    const collectionData = this.mapCollectionData(collection);
    const filter = { collectionId: collectionData.collectionId };
    const update = {
      $set: collectionData,
      $setOnInsert: { createdAt: new Date() }
    };
    const options = { upsert: true, new: true };

    try {
      const user = await this.findUser(collectionData.creator);
      if (!user) {
        this.logger.info(`User not found for wallet address: ${collectionData.creator}. Skipping collection update.`);
        return;
      }

      collectionData.user = user._id;
      const updatedCollection = await this.Collection.findOneAndUpdate(filter, update, options);
      
      await this.User.findByIdAndUpdate(user._id, {
        $addToSet: { collections: updatedCollection._id }
      });
    } catch (error) {
      if (error.code === 11000) {
        this.logger.warn(`Duplicate collection found for ${collectionData.collectionId}. Updating existing record.`);
        await this.Collection.updateOne(
          { collectionName: collectionData.collectionName, creator: collectionData.creator },
          { $set: collectionData }
        );
      } else {
        throw error;
      }
    }
  }

  // Scenario 1: Always create or update LaunchCollection
  async upsertLaunchCollection(collection) {
    const launchCollectionData = this.mapLaunchCollectionData(collection);
    const filter = { collectionId: launchCollectionData.collectionId };
    const update = {
      $set: launchCollectionData,
      $setOnInsert: { createdAt: new Date() }
    };
    const options = { upsert: true, new: true };

    try {
      const user = await this.findUser(launchCollectionData.creator);
      if (!user) {
        this.logger.info(`User not found for wallet address: ${launchCollectionData.creator}. Skipping collection update.`);
        return;
      }
      launchCollectionData.user = user._id;

      const updatedLaunchCollection = await this.LaunchCollection.findOneAndUpdate(filter, update, options);
      
      if (user) {
        await this.User.findByIdAndUpdate(user._id, {
          $addToSet: { launchCollections: updatedLaunchCollection._id }
        });
      }
    } catch (error) {
      if (error.code === 11000) {
        this.logger.warn(`Duplicate launch collection found for ${launchCollectionData.collectionId}. Updating existing record.`);
        await this.LaunchCollection.updateOne(
          { collectionName: launchCollectionData.collectionName, creatorWallet: launchCollectionData.creatorWallet },
          { $set: launchCollectionData }
        );
      } else {
        throw error;
      }
    }
  }

  async updateExistingLaunchCollection(collection) {
    const launchCollectionData = this.mapLaunchCollectionData(collection);
    this.logger.info(`Updating launch collection: ${launchCollectionData.collectionName}`);
    const filter = { collectionName: launchCollectionData.collectionName };
    this.logger.info(`filter==============================: ${filter}`);

    try {
      const existingLaunchCollection = await this.LaunchCollection.findOne(filter);
      this.logger.info(`existingLaunchCollection==============================: ${existingLaunchCollection}`);

      if (existingLaunchCollection) {
        // const user = await this.findUser(launchCollectionData.creatorWallet);
        // if (!user) {
        //   this.logger.info(`User not found for wallet address: ${launchCollectionData.creatorWallet}. Skipping launch collection update.`);
        //   return;
        // }

        // launchCollectionData.user = user._id;
        const updatedLaunchCollection = await this.LaunchCollection.findOneAndUpdate(
          filter,
          { $set: launchCollectionData },
          { new: true }
        );

        this.logger.info(`Updated launch collection: ${launchCollectionData.collectionName}`);

        // await this.User.findByIdAndUpdate(user._id, {
        //   $addToSet: { launchCollections: updatedLaunchCollection._id }
        // });

        this.logger.info(`Updated launch collection: ${launchCollectionData.collectionName}`);
      } else {
        this.logger.info(`Launch collection not found, skipping: ${launchCollectionData.collectionName}`);
      }
    } catch (error) {
      this.logger.error(`Error updating launch collection ${launchCollectionData.collectionName}:`, error);
    }
  }

  async findUser(walletAddress) {
    return await this.User.findOne({ walletAddress });
  }


    mapCollectionData(collection) {
    return {
      collectionId: collection.collection_id,
      collectionName: collection.collection_data.name,
      size: collection.collection_data.size,
      maxSize: collection.collection_data["max-size"],
      creator: collection.collection_data.creator,
      creatorGuard: collection.collection_data["creator-guard"],
      tokens: collection.tokens,
      totalSupply: collection.tokens.length,
      tokenList: collection.tokens,
      firstTokenData: collection.first_token_data,
      lastUpdated: new Date(),
      collectionCoverImage: collection?.first_token_data?.thumbnail || "",
      collectionBannerImage: collection?.first_token_data?.thumbnail || "",
      reservePrice: collection?.collection_data?.size ? parseInt(collection.collection_data.size) : 0,
      totalItems: collection.tokens.length,
      isActive: true,
      updatedAt: new Date(),
    };
  }

  mapLaunchCollectionData(collection) {
    return {
      collectionId: collection.collection_id,
      collectionName: collection.collection_data.name,
      // creatorName: `Creator_${collection.collection_data.creator.substr(0, 8)}`,
      // creatorWallet: collection.collection_data.creator,
      // projectDescription: "Project description placeholder",
      // projectCategory: "Other",
      // totalSupply: collection.collection_data.size,
      // tokenList: collection.tokens,
      // collectionCoverImage: collection?.first_token_data?.thumbnail || "",
      // collectionBannerImage: collection?.first_token_data?.thumbnail || "",
      reservePrice: collection?.collection_data?.size ? parseInt(collection.collection_data.size) : 0,
      // mintPrice: "0", // Set a default value or fetch from somewhere
      mintPriceCurrency: "KDA", // Set a default value
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

module.exports = new CollectionProcessingService();