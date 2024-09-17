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
    this.NftActivity = mongoose.model('NftActivity');
  }

  async processSales() {
    try {
      const allSales = await this.salesService.getAllSales();
      
      await this.updateAllNftsToFalse();

      let processedCount = 0;
      const batchSize = 100;
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
      const existingNft = await this.Nft.findOne({ tokenId: sale['token-id'] });
      const nftData = await this.mapSaleToNftData(sale, existingNft);
      
      let nft;
      if (existingNft) {
        nft = await this.Nft.findByIdAndUpdate(existingNft._id, nftData, { new: true });
        await this.checkAndRecordActivity(existingNft, nft, sale);
      } else {
        nft = new this.Nft(nftData);
        await nft.save();
        await this.recordNewListing(nft, sale);
      }

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
    }
  }

  async mapSaleToNftData(sale, existingNft) {
    const creator = await this.User.findOne({ walletAddress: sale.collection.c.creator });
    const seller = await this.User.findOne({ walletAddress: sale.seller });
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
      user: seller ? seller._id : null,
      collectionId: collection ? collection._id : null,
      creatorUser: creator ? creator._id : null,
      walletAddress: sale.seller,
    };
  }

  async checkAndRecordActivity(existingNft, newNft, sale) {
    const fromUser = await this.User.findOne({ walletAddress: sale.seller }) || await this.createPlaceholderUser(sale.seller);
    const toUser = await this.User.findOne({ walletAddress: sale.recipient }) || await this.createPlaceholderUser(sale.recipient);

    if (existingNft.user?.toString() !== newNft.user?.toString()) {
      await this.recordActivity(newNft, 'transfer', fromUser._id, toUser._id, sale.seller, sale.recipient);
    }

    if (!existingNft.onMarketplace && newNft.onMarketplace) {
      const activityType = newNft.onSale ? 'list' : 'auction_start';
      await this.recordActivity(newNft, activityType, fromUser._id, null, sale.seller);
    }

    if (existingNft.onSale && !newNft.onSale) {
      await this.recordActivity(newNft, 'sale', fromUser._id, toUser._id, sale.seller, sale.recipient);
    }

    if (existingNft.onAuction && !newNft.onAuction) {
      await this.recordActivity(newNft, 'auction_end', fromUser._id, toUser._id, sale.seller, sale.recipient);
    }
  }

  async recordNewListing(nft, sale) {
    const fromUser = await this.User.findOne({ walletAddress: sale.seller }) || await this.createPlaceholderUser(sale.seller);
    const activityType = nft.onSale ? 'list' : 'auction_start';
    await this.recordActivity(nft, activityType, fromUser._id, null, sale.seller);
  }

  async recordActivity(nft, activityType, fromUserId, toUserId, fromWalletAddress, toWalletAddress = null) {
    try {
      const activity = new this.NftActivity({
        nft: nft._id,
        collectionId: nft.collectionId,
        activityType: activityType,
        fromUser: fromUserId,
        toUser: toUserId,
        fromWalletAddress: fromWalletAddress,
        toWalletAddress: toWalletAddress,
        price: nft.nftPrice,
        currency: nft.currency,
        quantity: nft.amount,
        transactionHash: null,
        timestamp: new Date(),
        additionalInfo: {
          saleType: nft.saleType,
          saleId: nft.saleId
        }
      });

      await activity.save();
      this.logger.info(`Recorded ${activityType} activity for NFT ${nft.tokenId}`);
    } catch (error) {
      this.logger.error(`Error recording ${activityType} activity for NFT ${nft.tokenId}:`, error);
    }
  }

  async createPlaceholderUser(walletAddress) {
    const placeholderUser = new this.User({
      name: `Placeholder for ${walletAddress}`,
      walletAddress: walletAddress,
      email: `placeholder_${walletAddress}@example.com`,
      isPlaceholder: true
    });
    await placeholderUser.save();
    return placeholderUser;
  }
}

module.exports = new SalesProcessingService();