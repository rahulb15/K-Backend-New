// services/collectionService.js
const { get_client } = require('../chainweb_marmalade_ng');
const { enabled_collection } = require('../excluide');
const axios = require('axios');
const url = require('url');

const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 10000; // 10 seconds
const MAX_TIMEOUT = 30000; // 30 seconds

const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://dweb.link/ipfs/'
];

function serializeBigInt(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)])
    );
  }
  return obj;
}

class CollectionService {
  constructor() {
    console.log('CollectionService initialized');
  }

  async getAllCollections() {
    try {
      const m_client = get_client();
      if (!m_client) {
        throw new Error('Client not initialized');
      }

      const collections = await m_client.batch(['/allCollections', undefined]);
      return serializeBigInt(collections.filter(enabled_collection));
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  }

  async getCollection(collectionId) {
    try {
      const m_client = get_client();
      if (!m_client) {
        throw new Error('Client not initialized');
      }

      const collection = await m_client.batch(['/collection', collectionId]);
    //   console.log('Collection:', collection);
      return serializeBigInt(collection);
    } catch (error) {
      console.error('Error fetching collection:', error);
      throw error;
    }
  }

  async getTokensFromCollection(collectionId) {
    try {
      const m_client = get_client();
      if (!m_client) {
        throw new Error('Client not initialized');
      }

      const tokens = await m_client.batch(['/listTokensCollection', collectionId]);
      return serializeBigInt(tokens);
    } catch (error) {
      console.error('Error fetching tokens from collection:', error);
      throw error;
    }
  }

  async getNFTData(uri) {
    let retries = 0;
    let timeout = INITIAL_TIMEOUT;

    while (retries < MAX_RETRIES) {
      for (const gateway of IPFS_GATEWAYS) {
        try {
          const accessibleUrl = this.convertToAccessibleUrl(uri, gateway);
          
          const response = await axios.get(accessibleUrl, { 
            timeout: timeout,
            validateStatus: function (status) {
              return status >= 200 && status < 300;
            },
          });

          const data = response.data;
          const validatedMeta = this.validateAndFormatMetadata(data);
          
          if (validatedMeta) {
            const result = {
              img_link: validatedMeta.image || '',
              meta: validatedMeta,
              thumbnail: this.generateThumbnailUrl(validatedMeta.image || '')
            };

            // console.log('NFT data successfully fetched and validated:', result);
            return result;
          } else {
            // console.warn(`Invalid metadata structure for URI ${uri}`);
          }
        } catch (error) {
          // console.warn(`Attempt ${retries + 1} failed for URI ${uri} with gateway ${gateway}:`, error.message);
        }
      }

      retries++;
      timeout = Math.min(timeout * 2, MAX_TIMEOUT);

      if (retries >= MAX_RETRIES) {
        // console.error(`Failed to fetch valid NFT data for URI ${uri} after ${MAX_RETRIES} attempts with all gateways`);
        return null;
      }
    }
  }

  validateAndFormatMetadata(data) {
    if (typeof data === 'object' && data !== null) {
      // If 'image' exists, convert it to an accessible URL
      if (data.image) {
        data.image = this.convertToAccessibleUrl(data.image);
      }
      return data;
    }
    return null;
  }

  convertToAccessibleUrl(uri, gateway) {
    if (!uri) return '';
    
    
    if (uri.startsWith('ipfs://')) {
      const ipfsHash = uri.slice(7);
      return `${gateway || IPFS_GATEWAYS[0]}${ipfsHash}`;
    }

    if (uri.includes('/ipfs/')) {
      const ipfsHash = uri.split('/ipfs/')[1];
      return `${gateway || IPFS_GATEWAYS[0]}${ipfsHash}`;
    }

    if (uri.startsWith('/')) {
      return `https://your-base-url.com${uri}`;
    }

    if (uri.startsWith('data:')) {
      return uri;
    }

    const parsedUrl = url.parse(uri);
    if (parsedUrl.protocol === 'http:') {
      parsedUrl.protocol = 'https:';
      return url.format(parsedUrl);
    }

    return uri;
  }

  generateThumbnailUrl(imageUrl) {
    // Placeholder for thumbnail generation
    return imageUrl || '';
  }

  async getAllCollectionsDetailed() {
    try {
      console.log('getAllCollectionsDetailed');
      const m_client = get_client();
      if (!m_client) {
        throw new Error('Client not initialized');
      }

      const collections = await m_client.batch(['/allCollections', undefined]);
      const filteredCollections = collections.filter(enabled_collection);

      const detailedCollections = await Promise.all(filteredCollections.map(async (collectionId) => {
        const collectionData = await this.getCollection(collectionId);
        const tokens = await this.getTokensFromCollection(collectionId);
        let nftData = null;

        if (tokens.length > 0) {
          const firstTokenUri = await m_client.batch(['/uri', tokens[0]]);
          nftData = await this.getNFTData(firstTokenUri);
        }

        return {
          collection_id: collectionId,
          collection_data: collectionData,
          tokens: tokens,
          first_token_data: nftData,
        };
      }));

      return serializeBigInt(detailedCollections);
    } catch (error) {
      console.error('Error fetching detailed collections:', error);
      throw error;
    }
  }
  async getAllCollectionsWithNFTDetails(limit = 5) {
    console.log('getAllCollectionsWithNFTDetails, limit:', limit);
    try {
      const m_client = get_client();
      if (!m_client) {
        throw new Error('Client not initialized');
      }

      // Get all collections
      const collections = await this.getAllCollections();
      const filteredCollections = collections.filter(enabled_collection);

      const detailedCollections = await Promise.all(filteredCollections.map(async (collectionId) => {
        // Get collection data
        const collectionData = await this.getCollection(collectionId);
        
        // Get tokens for the collection
        const tokens = await this.getTokensFromCollection(collectionId);
        
        // Fetch NFT data for tokens (up to the specified limit)
        const nftDataPromises = tokens.slice(0, limit).map(async (tokenId) => {
          const uri = await m_client.batch(['/uri', tokenId]);
          const nftData = await this.getNFTData(uri);
          return {
            tokenId,
            uri,
            ...nftData
          };
        });

        const nftsData = await Promise.all(nftDataPromises);

        return {
          collection_id: collectionId,
          collection_data: collectionData,
          tokens: tokens,
          nfts_data: nftsData.filter(nft => nft !== null) // Filter out any null results
        };
      }));

      return serializeBigInt(detailedCollections);
    } catch (error) {
      console.error('Error fetching all collections with NFT details:', error);
      throw error;
    }
  }
 

  convertToIPFSUrl(uri) {
    if (uri.startsWith('ipfs://')) {
      // Try multiple IPFS gateways
      const gateways = [
        'https://ipfs.io/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
        'https://gateway.pinata.cloud/ipfs/'
      ];
      return `${gateways[Math.floor(Math.random() * gateways.length)]}${uri.slice(7)}`;
    }
    return uri;
  }




}

module.exports = CollectionService;