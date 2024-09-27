const mongoose = require('mongoose');
const SalesService = require('./salesService');
const { createLogger, format, transports } = require('winston');
const { chunk } = require('lodash');

class SalesProcessingService {
  constructor() {
    this.salesService = new SalesService();
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
      ],
    });
    this.Nft = mongoose.model('Nft');
    this.User = mongoose.model('User');
    this.CollectionMarketPlace = mongoose.model('CollectionMarketPlace');
  }

  async processSales() {
    try {
      const allSales = await this.salesService.getAllSales();
      
      // First, update all NFTs to set onMarketplace, onSale, and onAuction to false
      await this.updateAllNftsToFalse();

      let processedCount = 0;
      const batchSize = 100; // Adjust based on your system's capacity
      const batches = chunk(allSales, batchSize);

      for (const batch of batches) {
        await this.processBatch(batch);
        processedCount += batch.length;
        this.logger.info(`Processed ${processedCount} out of ${allSales.length} sales`);
      }

      this.logger.info(`Completed processing ${processedCount} sales`);
    } catch (error) {
      this.logger.error('Error processing sales:', error);
    }
  }

  async deleteNonSaleNfts(allSales) {
    try {
      const saleTokenIds = allSales.map(sale => sale['token-id']);
      const result = await this.Nft.deleteMany({
        tokenId: { $in: saleTokenIds }, // Use $in to match tokenIds in saleTokenIds
        onSale: false,
        onMarketplace: false
      });
      this.logger.info(`Deleted ${result.deletedCount} NFTs that are not on sale or marketplace`);
    } catch (error) {
      this.logger.error('Error deleting non-sale NFTs:', error);
    }
  }

  async updateAllNftsToFalse() {
    try {
      const result = await this.Nft.updateMany(
        {},
        { $set: { onMarketplace: false, onSale: false, onAuction: false,onDutchAuction: false } }
      );
      this.logger.info(`Updated ${result.modifiedCount} NFTs to set marketplace flags to false`);
    } catch (error) {
      this.logger.error('Error updating all NFTs to false:', error);
    }
  }

  async processBatch(batch) {
    const operations = await Promise.all(batch.map(async sale => {
      const nftData = await this.mapSaleToNftData(sale);
      return {
        updateOne: {
          filter: { tokenId: sale['token-id'] },
          update: { $set: nftData },
          upsert: true
        }
      };
    }));

    try {
      const result = await this.Nft.bulkWrite(operations);
      this.logger.info(`Batch processed: ${result.upsertedCount} inserted, ${result.modifiedCount} updated`);
    } catch (error) {
      this.logger.error('Error processing batch:', error);
      // Implement retry logic here if needed
    }
  }

  // async mapSaleToNftData(sale) {
  //   console.log('Mapping sale to NFT data:', sale);
  //   // Find the user based on the creator field
  //   const user = await this.User.findOne({ walletAddress: sale.collection.c.creator });

  //   // Find the collection based on the collectionName
  //   const collection = await this.CollectionMarketPlace.findOne({ collectionName: sale.collection.c.name });

  //   return {
  //     tokenId: sale['token-id'],
  //     saleType: sale.type,
  //     saleId: sale['sale-id'],
  //     price: sale.price,
  //     amount: sale.amount,
  //     timeout: new Date(sale.timeout),
  //     currency: sale.currency,
  //     enabled: sale.enabled,
  //     seller: sale.seller,
  //     recipient: sale.recipient,
  //     escrowAccount: sale['escrow-account'],
  //     uri: sale.uri,
  //     supply: sale.supply,
  //     policies: sale.policies,
  //     collection: sale.collection,
  //     nftData: sale.nftData,
  //     tokenImage: sale.image,
  //     lastUpdated: new Date(),
  //     isPlatform: false,
  //     onMarketplace: sale.type === 'f' || sale.type === 'a',
  //     onSale: sale.type === 'f',
  //     onAuction: sale.type === 'a',
  //     attributes: sale.nftData.attributes,
  //     collectionName: sale.collection.c.name,
  //     nftPrice: sale.price,
  //     creator: sale.collection.c.creator,
  //     isRevealed: true,
  //     user: user ? user._id : null, // Add the user's ObjectId if found
  //     collectionId: collection ? collection._id : null, // Add the collection's ObjectId if found
  //     owner: sale.collection.c.creator,
  //   };
  // }
  async mapSaleToNftData(sale) {
    console.log('Mapping sale to NFT data:', sale);
    
    // Find the user based on the creator field
    const user = await this.User.findOne({ walletAddress: sale.seller});
  
    // Find the collection based on the collectionName
    const collection = await this.CollectionMarketPlace.findOne({ collectionName: sale.collection?.c?.name });
  
    // Create a base object with only the fields that are always required
    const baseNftData = {
      lastUpdated: new Date(),
      isPlatform: false,
      isRevealed: true,
    };
  
    // Add optional fields only if they exist in the sale object
    if (sale['token-id']) baseNftData.tokenId = sale['token-id'];
    if (sale.type) {
      baseNftData.saleType = sale.type;
      baseNftData.onMarketplace = sale.type === 'f' || sale.type === 'a' || sale.type === 'd';
      baseNftData.onSale = sale.type === 'f';
      baseNftData.onAuction = sale.type === 'a';
      baseNftData.onDutchAuction = sale.type === 'd';
    }
    if (sale['sale-id']) baseNftData.saleId = sale['sale-id'];
    if (sale.price) {
      baseNftData.price = sale.price;
      baseNftData.nftPrice = sale.price;
    }
    if (sale.amount) baseNftData.amount = sale.amount;
    if (sale.timeout) baseNftData.timeout = new Date(sale.timeout);
    if (sale.currency) baseNftData.currency = sale.currency;
    if (sale.enabled !== undefined) baseNftData.enabled = sale.enabled;
    if (sale.seller) baseNftData.seller = sale.seller;
    if (sale.recipient) baseNftData.recipient = sale.recipient;
    if (sale['escrow-account']) baseNftData.escrowAccount = sale['escrow-account'];
    if (sale.uri) baseNftData.uri = sale.uri;
    if (sale.supply) baseNftData.supply = sale.supply;
    if (sale.policies) baseNftData.policies = sale.policies;
    if (sale.collection) baseNftData.collection = sale.collection;
    if (sale.nftData) baseNftData.nftData = sale.nftData;
    if (sale.image && sale.image.length > 0) baseNftData.tokenImage = sale.image;
    if (sale.nftData?.attributes) baseNftData.attributes = sale.nftData.attributes;
    if (sale.collection?.c?.name) baseNftData.collectionName = sale.collection.c.name;
    if (sale.collection?.c?.creator) {
      baseNftData.creator = sale.collection.c.creator;
      baseNftData.owner = sale.seller;
    }
    if (user) baseNftData.user = user._id;
    if (collection) baseNftData.collectionId = collection._id;
  
    return baseNftData;
  }
}

module.exports = new SalesProcessingService();