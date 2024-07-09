import mongoose from "mongoose";
import { IBlog } from "../interfaces/blog/blog.interface";

const blogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    url: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      // required: true,
    },
    category: {
      title: {
        type: String,
        required: true,
      },
      slug: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      required: true,
      enum: ["creator", "kryptomerch"],
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model<IBlog>("Blog", blogSchema);

export default Blog;
