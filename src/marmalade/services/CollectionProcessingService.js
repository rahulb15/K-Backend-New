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
    this.Collection = mongoose.model("Collection");
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
      await this.Collection.findOneAndUpdate(filter, update, options);
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate key error
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
}

module.exports = new CollectionProcessingService();