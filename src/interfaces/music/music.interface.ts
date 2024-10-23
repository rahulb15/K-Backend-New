// interfaces/music/music.interface.ts

import { Document } from 'mongoose';

export interface ICoverImage {
    fileUrl: string;
    filebaseUrl: string;
    ipfsUrl: string;
    cid: string;
    fileKey: string;
  }

export interface IMusic extends Document {
  user: string;
  title: string;
  artist?: string;
  album?: string;
  genre?: string;
  duration?: number;
  fileUrl: string;
  filebaseUrl: string;
  ipfsUrl: string;
  cid: string;
  fileKey: string;
  mimeType: string;
  size: number;
  coverImage?: ICoverImage;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMusic {
  user: string;
  title: string;
  artist?: string;
  album?: string;
  genre?: string;
  duration?: number;
  fileUrl: string;
  filebaseUrl: string;
  ipfsUrl: string;
  cid: string;
  fileKey: string;
  mimeType: string;
  size: number;
  coverImage?: ICoverImage;
}

export interface IMusicUpdate {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  isActive?: boolean;
}

export interface IMusicQueryFilters {
  user?: string;
  isActive?: boolean;
  genre?: string;
  artist?: string;
  album?: string;
}