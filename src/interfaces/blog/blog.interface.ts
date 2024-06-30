import { Types } from "mongoose";

export interface IBlog {
  _id?: string; // Make _id optional
  user: Types.ObjectId; // Store user's ObjectId
  url?: string;
  title: string;
  slug: string;
  date?: Date;
  category: {
    title: string;
    slug: string;
  };
  description: string;
  thumbnail?: string;
  content: string;
  createdAt?: Date;
  source: string;
  updatedAt?: Date;
}
