// const mongoose = require('mongoose');
// const SalesService = require('./salesService');
// const { createLogger, format, transports } = require('winston');
// const { chunk } = require('lodash');

// class SalesProcessingService {
//   constructor() {
//     this.salesService = new SalesService();
//     this.logger = createLogger({
//       level: 'info',
//       format: format.combine(
//         format.timestamp(),
//         format.json()
//       ),
//       transports: [
//         new transports.File({ filename: 'error.log', level: 'error' }),
//         new transports.File({ filename: 'combined.log' }),
//       ],
//     });
//     this.Nft = mongoose.model('Nft');
//   }

//   async processSales() {
//     try {
//       const allSales = await this.salesService.getAllSales();
      
//       // First, update all NFTs to set onMarketplace, onSale, and onAuction to false
//       await this.updateAllNftsToFalse();

//       let processedCount = 0;
//       const batchSize = 100; // Adjust based on your system's capacity
//       const batches = chunk(allSales, batchSize);

//       for (const batch of batches) {
//         await this.processBatch(batch);
//         processedCount += batch.length;
//         this.logger.info(`Processed ${processedCount} out of ${allSales.length} sales`);
//       }

//       this.logger.info(`Completed processing ${processedCount} sales`);
//     } catch (error) {
//       this.logger.error('Error processing sales:', error);
//     }
//   }

//   async updateAllNftsToFalse() {
//     try {
//       const result = await this.Nft.updateMany(
//         {},
//         { $set: { onMarketplace: false, onSale: false, onAuction: false } }
//       );
//       this.logger.info(`Updated ${result.modifiedCount} NFTs to set marketplace flags to false`);
//     } catch (error) {
//       this.logger.error('Error updating all NFTs to false:', error);
//     }
//   }

//   async processBatch(batch) {
//     const operations = batch.map(sale => ({
//       updateOne: {
//         filter: { tokenId: sale['token-id'] },
//         update: { $set: this.mapSaleToNftData(sale) },
//         upsert: true
//       }
//     }));

//     try {
//       const result = await this.Nft.bulkWrite(operations);
//       this.logger.info(`Batch processed: ${result.upsertedCount} inserted, ${result.modifiedCount} updated`);
//     } catch (error) {
//       this.logger.error('Error processing batch:', error);
//       // Implement retry logic here if needed
//     }
//   }

//   mapSaleToNftData(sale) {
//     return {
//       tokenId: sale['token-id'],
//       saleType: sale.type,
//       saleId: sale['sale-id'],
//       price: sale.price,
//       amount: sale.amount,
//       timeout: new Date(sale.timeout),
//       currency: sale.currency,
//       enabled: sale.enabled,
//       seller: sale.seller,
//       recipient: sale.recipient,
//       escrowAccount: sale['escrow-account'],
//       uri: sale.uri,
//       supply: sale.supply,
//       policies: sale.policies,
//       collection: sale.collection,
//       nftData: sale.nftData,
//       tokenImage: sale.image,
//       lastUpdated: new Date(),
//       isPlatform: false,
//       onMarketplace: sale.type === 'f' || sale.type === 'a',
//       onSale: sale.type === 'f',
//       onAuction: sale.type === 'a',
//       attributes: sale.nftData.attributes,
//       collectionName: sale.collection.c.name,
//       nftPrice: sale.price,
//       creator: sale.collection.c.creator,
//       isRevealed: true,
//       // Map other fields as needed
//     };
//   }
// }

// module.exports = new SalesProcessingService();


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

  async updateAllNftsToFalse() {
    try {
      const result = await this.Nft.updateMany(
        {},
        { $set: { onMarketplace: false, onSale: false, onAuction: false } }
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

  async mapSaleToNftData(sale) {
    // Find the user based on the creator field
    const user = await this.User.findOne({ walletAddress: sale.collection.c.creator });

    // Find the collection based on the collectionName
    const collection = await this.CollectionMarketPlace.findOne({ collectionName: sale.collection.c.name });

    return {
      tokenId: sale['token-id'],
      saleType: sale.type,
      saleId: sale['sale-id'],
      price: sale.price,
      amount: sale.amount,
      timeout: new Date(sale.timeout),
      currency: sale.currency,
      enabled: sale.enabled,
      seller: sale.seller,
      recipient: sale.recipient,
      escrowAccount: sale['escrow-account'],
      startPrice:sale['start-price'],
      incrementRatio:sale['current-price'],
      currentPrice:sale['increment-ratio'],
      currentBuyer: sale['current-buyer'],
      uri: sale.uri,
      supply: sale.supply,
      policies: sale.policies,
      collection: sale.collection,
      nftData: sale.nftData,
      tokenImage: sale.image,
      lastUpdated: new Date(),
      isPlatform: false,
      onMarketplace: sale.type === 'f' || sale.type === 'a',
      onSale: sale.type === 'f',
      onAuction: sale.type === 'a',
      attributes: sale.nftData.attributes,
      collectionName: sale.collection.c.name,
      nftPrice: sale.price,
      creator: sale.collection.c.creator,
      isRevealed: true,
      user: user ? user._id : null, // Add the user's ObjectId if found
      collectionId: collection ? collection._id : null, // Add the collection's ObjectId if found
      // Map other fields as needed
    };
  }
}

module.exports = new SalesProcessingService();