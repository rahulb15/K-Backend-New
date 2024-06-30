import { ILaunchCollection } from "./launch-collection.interface";

export interface ILaunchCollectionManager {
  create(collection: ILaunchCollection): Promise<ILaunchCollection>;
  update(
    collectionName: string,
    collection: ILaunchCollection
  ): Promise<ILaunchCollection>;
  getByUserId(userId: string): Promise<ILaunchCollection>;
  getAll(
    page: number,
    limit: number,
    search: string
  ): Promise<ILaunchCollection[]>;
  getByName(collectionName: string): Promise<ILaunchCollection>;
}
