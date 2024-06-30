import { IBlog } from "../../interfaces/blog/blog.interface";

export const blogResponseData = (blog: IBlog) => {
  return {
    _id: blog._id,
    user: blog.user,
    url: blog.url,
    title: blog.title,
    slug: blog.slug,
    date: blog.date,
    category: blog.category,
    description: blog.description,
    thumbnail: blog.thumbnail,
    content: blog.content,
    createdAt: blog.createdAt,
    source: blog.source,
    updatedAt: blog.updatedAt,
  };
};
