import mongoose from 'mongoose';
import { Client } from '@elastic/elasticsearch';
import Nft from '../models/nft.model';
import CollectionMarketPlace from '../models/collection.model';
import { ICollection } from '../interfaces/collection/collection.interface';
import { INft } from '../interfaces/nft/nft.interface';

// It's better to use environment variables for sensitive information
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME || 'elastic';
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD || 'hAolp41_VQfgZ5L2vj6j';

const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE || 'https://172.18.0.2:9200/';

const esClient = new Client({
  node: ELASTICSEARCH_NODE,
  auth: {
    username: ELASTICSEARCH_USERNAME,
    password: ELASTICSEARCH_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function syncNftsToElasticsearch(): Promise<void> {
  try {
    const nfts = await Nft.find({});
    for (const nft of nfts) {
      await indexNft(nft);
    }
    console.log('NFTs synced to Elasticsearch');
  } catch (error) {
    console.error('Error syncing NFTs:', error);
  }
}

async function syncCollectionsToElasticsearch(): Promise<void> {
  try {
    const collections = await CollectionMarketPlace.find({});
    for (const collection of collections) {
      await indexCollection(collection);
    }
    console.log('Collections synced to Elasticsearch');
  } catch (error) {
    console.error('Error syncing Collections:', error);
  }
}

async function indexNft(nft: INft & mongoose.Document): Promise<void> {
  if (!nft._id) {
    console.error('Attempted to index NFT without _id');
    return;
  }
  try {
    await esClient.index({
      index: 'nfts',
      id: nft._id.toString(),
      document: {
        tokenId: nft.tokenId,
        collectionName: nft.collectionName,
        creator: nft.creator,
        tokenImage: nft.tokenImage,
        nftPrice: nft.nftPrice,
        attributes: nft.attributes,
      }
    });
  } catch (error) {
    console.error('Error indexing NFT:', error);
  }
}

async function indexCollection(collection: ICollection & mongoose.Document): Promise<void> {
  if (!collection._id) {
    console.error('Attempted to index Collection without _id');
    return;
  }
  try {
    await esClient.index({
      index: 'collections',
      id: collection._id.toString(),
      document: {
        collectionName: collection.collectionName,
        category: collection.category,
        creator: collection.creator,
        collectionBannerImage: collection.collectionBannerImage,
      }
    });
  } catch (error) {
    console.error('Error indexing Collection:', error);
  }
}

// Set up Mongoose middleware for real-time sync
function setupRealTimeSync(): void {
  Nft.schema.post('save', async function(doc: INft & mongoose.Document) {
    await indexNft(doc);
  });

  Nft.schema.post('findOneAndUpdate', async function(doc: INft & mongoose.Document | null) {
    if (doc) {
      await indexNft(doc);
    }
  });

  Nft.schema.post('findOneAndDelete', async function(doc: INft & mongoose.Document | null) {
    if (doc && doc._id) {
      try {
        await esClient.delete({
          index: 'nfts',
          id: doc._id.toString()
        });
      } catch (error) {
        console.error('Error deleting NFT from Elasticsearch:', error);
      }
    }
  });

  // Similar setup for Collection model
  CollectionMarketPlace.schema.post('save', async function(doc: ICollection & mongoose.Document) {
    await indexCollection(doc);
  });

  CollectionMarketPlace.schema.post('findOneAndUpdate', async function(doc: ICollection & mongoose.Document | null) {
    if (doc) {
      await indexCollection(doc);
    }
  });

  CollectionMarketPlace.schema.post('findOneAndDelete', async function(doc: ICollection & mongoose.Document | null) {
    if (doc && doc._id) {
      try {
        await esClient.delete({
          index: 'collections',
          id: doc._id.toString()
        });
      } catch (error) {
        console.error('Error deleting Collection from Elasticsearch:', error);
      }
    }
  });
}

async function searchNftsAndCollections(query: string): Promise<any> {
  try {
    const result = await esClient.search({
      index: ['nfts', 'collections'],
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ['tokenId', 'collectionName', 'creator', 'category', 'collectionInfo']
          }
        }
      }
    });
    
    return result.hits.hits;
  } catch (error) {
    console.error('Error searching NFTs and Collections:', error);
    throw error;
  }
}


async function flexibleSearchNftsAndCollections(query: string): Promise<any> {
  try {
    const result = await esClient.search({
      index: ['nfts', 'collections'],
      body: {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: query,
                  fields: ['tokenId', 'collectionName', 'creator', 'category', 'collectionInfo'],
                  fuzziness: 'AUTO',
                  prefix_length: 2
                }
              },
              {
                wildcard: {
                  collectionName: {
                    value: `*${query.toLowerCase()}*`
                  }
                }
              }
            ]
          }
        }
      }
    });
    
    return result.hits.hits;
  } catch (error) {
    console.error('Error in flexible search for NFTs and Collections:', error);
    throw error;
  }
}

// flexibleSearchCollections('collection');
async function flexibleSearchCollections(query: string): Promise<any> {
  try {
    const result = await esClient.search({
      index: 'collections',
      body: {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: query,
                  fields: ['collectionName', 'creator', 'category'],
                  fuzziness: 'AUTO',
                  prefix_length: 2
                }
              },
              {
                wildcard: {
                  collectionName: {
                    value: `*${query.toLowerCase()}*`
                  }
                }
              }
            ]
          }
        }
      }
    });
    
    return result.hits.hits;
  } catch (error) {
    console.error('Error in flexible search for Collections:', error);
    throw error;
  }
}



// Initial sync
syncNftsToElasticsearch();
syncCollectionsToElasticsearch();

// Set up real-time sync
setupRealTimeSync();

export { syncNftsToElasticsearch, syncCollectionsToElasticsearch, setupRealTimeSync, searchNftsAndCollections, flexibleSearchNftsAndCollections, flexibleSearchCollections };