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

  // getBlogList page limit search
  public async getBlogList(
    limit: number,
    page: number,
    search: string
  ): Promise<IBlog[]> {
    const blogs = await Blog.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { source: { $regex: search, $options: "i" } },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          title: 1,
          description: 1,
          source: 1,
          slug: 1,
          thumbnail: 1,
          createdAt: 1,
          category: 1,
          url: 1,
          content: 1,
          date: 1,
          user: {
            _id: 1,
            name: 1,
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    return blogs;
  }

  //deleteById
  public async deleteById(id: string): Promise<IBlog> {
    return (await Blog.findByIdAndDelete(id)) as IBlog;
  }
}

export default BlogManager.getInstance();
