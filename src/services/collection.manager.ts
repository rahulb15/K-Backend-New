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
}

export default CollectionManager.getInstance();
