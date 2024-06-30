import mongoose from "mongoose";
import { IBlog } from "../interfaces/blog/blog.interface";
import { IBlogManager } from "../interfaces/blog/blog.manager.interface";
import Blog from "../models/blog.model";

export class BlogManager implements IBlogManager {
  private static instance: BlogManager;

  private constructor() {}

  public static getInstance(): BlogManager {
    if (!BlogManager.instance) {
      BlogManager.instance = new BlogManager();
    }

    return BlogManager.instance;
  }

  public async create(blog: IBlog): Promise<IBlog> {
    return await Blog.create(blog);
  }

  public async getAll(): Promise<IBlog[]> {
    return await Blog.find().exec();
  }

  public async getById(id: string): Promise<IBlog> {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new Error("Cart not found");
    }
    return blog;
  }

  //getby user id
  public async getByUserId(id: string): Promise<IBlog> {
    return (await Blog.findOne({
      user: new mongoose.Types.ObjectId(id),
    })) as IBlog;
  }

  //updateById
  public async updateById(id: string, blog: any): Promise<IBlog> {
    return (await Blog.findByIdAndUpdate(id, blog, { new: true })) as IBlog;
  }

  //getBySlug
  public async getBySlug(slug: string): Promise<IBlog> {
    return (await Blog.findOne({ slug: slug })) as IBlog;
  }

  //getBySource
  public async getBySource(source: string): Promise<IBlog[]> {
    console.log("source", source);
    return await Blog.find({ source: source }).exec();
  }
}

export default BlogManager.getInstance();
