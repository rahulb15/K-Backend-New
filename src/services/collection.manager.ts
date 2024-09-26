import { ICollection } from "../interfaces/collection/collection.interface";
import { ICollectionManager } from "../interfaces/collection/collection.manager.interface";
import Collection from "../models/collection.model";
import Nft from "../models/nft.model";

export class CollectionManager implements ICollectionManager {
  private static instance: CollectionManager;

  // private constructor() {}

  public static getInstance(): CollectionManager {
    if (!CollectionManager.instance) {
      CollectionManager.instance = new CollectionManager();
    }

    return CollectionManager.instance;
  }

  public async create(collection: ICollection): Promise<ICollection> {
    const newCollection = new Collection(collection);
    return newCollection.save();
  }

  public async getAll(): Promise<ICollection[]> {
    return Collection.find();
  }

  public async getById(id: string): Promise<ICollection> {
    const collection: ICollection = (await Collection.findById(
      id
    )) as ICollection;
    return collection;
  }

  // getByName
  public async getByName(collectionName: string): Promise<ICollection> {
    const collection: ICollection = (await Collection.findOne({
      collectionName,
    })) as ICollection;
    return collection;
  }

  // getAllPaginationData
  // public async getAllPaginationData(
  //   page: number,
  //   limit: number
  // ): Promise<ICollection[]> {
  //   return Collection.find()
  //     .skip((page - 1) * limit)
  //     .limit(limit);

  //   // return data with pagination and total count using aggregation


  // }
  // public async getAllPaginationData(
  //   page: number,
  //   limit: number,
  //   search: string
  // ): Promise<{ data: ICollection[]; totalCount: number }> {
  //   const query = search
  //   ? { collectionName: { $regex: search, $options: 'i' } }
  //   : {};

  // const result = await Collection.aggregate([
  //   { $match: query },
  //   {
  //     $facet: {
  //       data: [
  //         { $skip: (page - 1) * limit },
  //         { $limit: limit }
  //       ],
  //       totalCount: [
  //         { $count: 'count' }
  //       ]
  //     }
  //   }
  // ]);

  // const data = result[0].data;
  // const totalCount = result[0].totalCount[0]?.count || 0;
  
  //   return { data, totalCount };
  // }

  // public async getAllPaginationData(
  //   page: number,
  //   limit: number,
  //   search: string,
  //   timeRange: { value: string; text: string }
  // ): Promise<{ data: any[]; totalCount: number }> {
  //   const timeRangeDate = this.getTimeRangeFilter(timeRange.value);
  //   console.log('timeRangeDate:', timeRangeDate, timeRange);
  //   const query = search
  //     ? { collectionName: { $regex: search, $options: 'i' } }
  //     : {};
  
  //   const result = await Collection.aggregate([
  //     { $match: query },
  //     {
  //       $lookup: {
  //         from: 'nfts',
  //         let: { collectionId: '$collectionId', tokens: '$tokens' },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $or: [
  //                   { $eq: ['$collectionId', '$$collectionId'] },
  //                   { $in: ['$tokenId', '$$tokens'] }
  //                 ]
  //               },
  //               lastUpdated: { $gte: timeRangeDate }
  //             }
  //           }
  //         ],
  //         as: 'nftData'
  //       }
  //     },
  //     {
  //       $addFields: {
  //         statistics: {
  //           volume: {
  //             $sum: {
  //               $map: {
  //                 input: '$nftData',
  //                 as: 'nft',
  //                 in: { $toDouble: { $ifNull: ['$$nft.price', 0] } }
  //               }
  //             }
  //           },
  //           floorPrice: {
  //             $min: {
  //               $map: {
  //                 input: {
  //                   $filter: {
  //                     input: '$nftData',
  //                     as: 'nft',
  //                     cond: { $eq: ['$$nft.onSale', true] }
  //                   }
  //                 },
  //                 as: 'nft',
  //                 in: { $toDouble: { $ifNull: ['$$nft.price', 0] } }
  //               }
  //             }
  //           },
  //           items: { $size: '$nftData' },
  //           owners: {
  //             $size: {
  //               $setUnion: '$nftData.owner'
  //             }
  //           }
  //         }
  //       }
  //     },
  //     {
  //       $addFields: {
  //         '24hVolume': {
  //           $sum: {
  //             $map: {
  //               input: {
  //                 $filter: {
  //                   input: '$nftData',
  //                   as: 'nft',
  //                   cond: {
  //                     $gte: ['$$nft.lastUpdated', new Date(new Date().getTime() - 24 * 60 * 60 * 1000)]
  //                   }
  //                 }
  //               },
  //               as: 'nft',
  //               in: { $toDouble: { $ifNull: ['$$nft.price', 0] } }
  //             }
  //           }
  //         },
  //         '7dVolume': {
  //           $sum: {
  //             $map: {
  //               input: {
  //                 $filter: {
  //                   input: '$nftData',
  //                   as: 'nft',
  //                   cond: {
  //                     $gte: ['$$nft.lastUpdated', new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)]
  //                   }
  //                 }
  //               },
  //               as: 'nft',
  //               in: { $toDouble: { $ifNull: ['$$nft.price', 0] } }
  //             }
  //           }
  //         }
  //       }
  //     },
  //     {
  //       $addFields: {
  //         '24hChange': {
  //           $multiply: [
  //             {
  //               $divide: [
  //                 { $subtract: ['$statistics.volume', '$24hVolume'] },
  //                 { $cond: [{ $eq: ['$24hVolume', 0] }, 1, '$24hVolume'] }
  //               ]
  //             },
  //             100
  //           ]
  //         },
  //         '7dChange': {
  //           $multiply: [
  //             {
  //               $divide: [
  //                 { $subtract: ['$statistics.volume', '$7dVolume'] },
  //                 { $cond: [{ $eq: ['$7dVolume', 0] }, 1, '$7dVolume'] }
  //               ]
  //             },
  //             100
  //           ]
  //         }
  //       }
  //     },
  //     // Add sorting stage here
  //     { $sort: { 'statistics.volume': -1 } },
  //     {
  //       $facet: {
  //         data: [
  //           { $skip: (page - 1) * limit },
  //           { $limit: limit }
  //         ],
  //         totalCount: [
  //           { $count: 'count' }
  //         ]
  //       }
  //     }
  //   ]);
  
  //   const data = result[0].data;
  //   const totalCount = result[0].totalCount[0]?.count || 0;
  
  //   data.forEach((collection: any, index: number) => {
  //     console.log(`Collection ${index + 1}:`);
  //     console.log('collectionId:', collection.collectionId);
  //     console.log('nftData length:', collection.nftData?.length);
  //     console.log('statistics:', collection.statistics);
  //     console.log('24hVolume:', collection['24hVolume']);
  //     console.log('7dVolume:', collection['7dVolume']);
  //     console.log('24hChange:', collection['24hChange']);
  //     console.log('7dChange:', collection['7dChange']);
  //     console.log('---');
  //   });
  
  //   return { data, totalCount };
  // }

  public async getAllPaginationData(
    page: number,
    limit: number,
    search: string,
    timeRange: { value: string; text: string }
  ): Promise<{ data: any[]; totalCount: number }> {
    const timeRangeDate = this.getTimeRangeFilter(timeRange.value);
    console.log('timeRangeDate:', timeRangeDate, timeRange);
    const query = search
      ? { collectionName: { $regex: search, $options: 'i' } }
      : {};
  
    const result = await Collection.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'nfts',
          let: { collectionId: '$collectionId', tokens: '$tokens' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$collectionId', '$$collectionId'] },
                    { $in: ['$tokenId', '$$tokens'] }
                  ]
                },
                lastUpdated: { $gte: timeRangeDate }
              }
            }
          ],
          as: 'nftData'
        }
      },
      {
        $addFields: {
          statistics: {
            volume: {
              $sum: {
                $map: {
                  input: '$nftData',
                  as: 'nft',
                  in: { $toDouble: { $ifNull: ['$$nft.price', 0] } }
                }
              }
            },
            floorPrice: {
              $min: {
                $map: {
                  input: {
                    $filter: {
                      input: '$nftData',
                      as: 'nft',
                      cond: { $eq: ['$$nft.onSale', true] }
                    }
                  },
                  as: 'nft',
                  in: { $toDouble: { $ifNull: ['$$nft.price', 0] } }
                }
              }
            },
            items: { $size: '$nftData' },
            owners: {
              $size: {
                $setUnion: '$nftData.owner'
              }
            }
          }
        }
      },
      {
        $addFields: {
          '24hVolume': {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$nftData',
                    as: 'nft',
                    cond: {
                      $gte: ['$$nft.lastUpdated', new Date(new Date().getTime() - 24 * 60 * 60 * 1000)]
                    }
                  }
                },
                as: 'nft',
                in: { $toDouble: { $ifNull: ['$$nft.price', 0] } }
              }
            }
          },
          '7dVolume': {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$nftData',
                    as: 'nft',
                    cond: {
                      $gte: ['$$nft.lastUpdated', new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)]
                    }
                  }
                },
                as: 'nft',
                in: { $toDouble: { $ifNull: ['$$nft.price', 0] } }
              }
            }
          }
        }
      },
      {
        $addFields: {
          '24hChange': {
            $multiply: [
              {
                $divide: [
                  { $subtract: ['$statistics.volume', '$24hVolume'] },
                  { $cond: [{ $eq: ['$24hVolume', 0] }, 1, '$24hVolume'] }
                ]
              },
              100
            ]
          },
          '7dChange': {
            $multiply: [
              {
                $divide: [
                  { $subtract: ['$statistics.volume', '$7dVolume'] },
                  { $cond: [{ $eq: ['$7dVolume', 0] }, 1, '$7dVolume'] }
                ]
              },
              100
            ]
          }
        }
      },
      // Sort by the volume calculated for the selected time range
      { $sort: { 'statistics.volume': -1 } },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]);
  
    const data = result[0].data;
    const totalCount = result[0].totalCount[0]?.count || 0;
  
    // data.forEach((collection: any, index: number) => {
    //   console.log(`Collection ${index + 1}:`);
    //   console.log('collectionId:', collection.collectionId);
    //   console.log('nftData length:', collection.nftData?.length);
    //   console.log('statistics:', collection.statistics);
    //   console.log('24hVolume:', collection['24hVolume']);
    //   console.log('7dVolume:', collection['7dVolume']);
    //   console.log('24hChange:', collection['24hChange']);
    //   console.log('7dChange:', collection['7dChange']);
    //   console.log('---');
    // });
  
    return { data, totalCount };
  }
  private getTimeRangeFilter(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '1 day':
        return new Date(now.setDate(now.getDate() - 1));
      case '7 days':
        return new Date(now.setDate(now.getDate() - 7));
      case '30 days':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'All time':
      default:
        return new Date(0);
    }
  }




}

export default CollectionManager.getInstance();
