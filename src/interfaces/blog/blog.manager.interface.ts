import { IBlog } from "./blog.interface";

export interface IBlogManager {
  create(blog: IBlog): Promise<IBlog>;
  getAll(): Promise<IBlog[]>;
  getById(id: string): Promise<IBlog>;
}
