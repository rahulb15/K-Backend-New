import { ICollection } from "./collection.interface";
export interface ICollectionManager {
  create(collection: ICollection): Promise<ICollection>;
  getAll(): Promise<ICollection[]>;
  getById(id: string): Promise<ICollection>;
}
