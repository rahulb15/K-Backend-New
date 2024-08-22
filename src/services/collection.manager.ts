import { ICollection } from "../interfaces/collection/collection.interface";
import { ICollectionManager } from "../interfaces/collection/collection.manager.interface";
import Collection from "../models/collection.model";

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
  public async getAllPaginationData(
    page: number,
    limit: number,
    search: string
  ): Promise<{ data: ICollection[]; totalCount: number }> {
    const query = search
    ? { collectionName: { $regex: search, $options: 'i' } }
    : {};

  const result = await Collection.aggregate([
    { $match: query },
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
  
    return { data, totalCount };
  }



}

export default CollectionManager.getInstance();
