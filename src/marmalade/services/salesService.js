const { get_client } = require('../chainweb_marmalade_ng');
const { enabled_token, enabled_image } = require('../excluide');
const axios = require('axios');

class SalesService {
  constructor() {
    console.log('SalesService initialized');
  }

  async getAllSales() {
    try {
      const m_client = get_client();
      // console.log('Client in getAllSales:', m_client);
      
      if (!m_client) {
        throw new Error('Client not initialized');
      }

      const [fixedSales, auctionSales, dutchAuctionSales] = await Promise.all([
        m_client.batch(['/allSalesFixed', undefined]),
        m_client.batch(['/allSalesAuction', undefined]),
        m_client.batch(['/allSalesDutchAuction', undefined])
      ]);

      const allSales = [...fixedSales, ...auctionSales, ...dutchAuctionSales]
        .filter(sale => enabled_token(sale['token-id']));

      return await Promise.all(allSales.map(sale => this.enrichSaleData(sale)));
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }

  async enrichSaleData(sale) {
    const tokenId = sale['token-id'];
    const [uri, supply, policies, collection] = await Promise.all([
      this.getTokenUri(tokenId),
      this.getTokenSupply(tokenId),
      this.getTokenPolicies(tokenId),
      this.getTokenCollection(tokenId)
    ]);

    // console.log('Enriching sale data:', sale, uri, supply, policies, collection);

    const nftData = await this.getNFTData(uri);
    const price = await this.getSalePrice(sale);
    console.log('Enriched sale data:', price);

 
    // Convert BigInt values to strings
    const enrichedSale = {
      ...sale,
      uri,
      supply: this.convertBigIntToString(supply),
      policies,
      collection: this.convertBigIntToString(collection),
      nftData,
      price,
      image: enabled_image(tokenId) ? this.convertToIPFSUrl(nftData?.image) : 'path/to/removed.png'
    };

    return enrichedSale;
  }

  convertBigIntToString(obj) {
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertBigIntToString(item));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, this.convertBigIntToString(value)])
      );
    }
    return obj;
  }



  async getTokenUri(tokenId) {
    const m_client = get_client();
    return m_client.batch(['/uri', tokenId]);
  }

  async getTokenSupply(tokenId) {
    const m_client = get_client();
    return m_client.batch(['/supply', tokenId]);
  }

  async getTokenPolicies(tokenId) {
    const m_client = get_client();
    return m_client.batch(['/policies', tokenId]);
  }

  async getTokenCollection(tokenId) {
    const m_client = get_client();
    const policies = await this.getTokenPolicies(tokenId);
    if (policies.includes('COLLECTION')) {
      return m_client.batch(['/tokenCollection', tokenId]);
    }
    return null;
  }

  async getNFTData(uri) {
    try {
      const fetchUrl = this.convertToIPFSUrl(uri);
      const response = await axios.get(fetchUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching NFT data:', error);
      return null;
    }
  }

  convertToIPFSUrl(uri) {
    if (!uri) return '';
    if (uri?.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${uri.slice(7)}`;
    }
    return uri;
  }

  async getSalePrice(sale) {
    console.log('Getting sale price:', sale);
    const m_client = get_client();
    switch (sale.type) {
      case 'f':
        return sale.price;
      case 'd':
        return m_client.batch(['/dutch_price', sale['sale-id']]);
      case 'a':
        // Implement auction_next_price logic here
        return null; // Placeholder
      default:
        return null;
    }
  }

  async getSalesByType(type) {
    const allSales = await this.getAllSales();
    return allSales.filter(sale => type === 'all' || sale.type === type);
  }

  async getSalesForAccount(account) {
    const allSales = await this.getAllSales();
    return allSales.filter(sale => sale.recipient === account);
  }

  async getSalesForToken(token) {
    const allSales = await this.getAllSales();
    return allSales.filter(sale => sale['token-id'] === token);
  }
}

module.exports = SalesService;