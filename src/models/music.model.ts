// models/music.model.ts

import mongoose, { Schema } from "mongoose";
import { IMusic } from "../interfaces/music/music.interface";


const coverImageSchema = new Schema({
    fileUrl: { type: String, required: true },
    filebaseUrl: { type: String, required: true },
    ipfsUrl: { type: String, required: true },
    cid: { type: String, required: true },
    fileKey: { type: String, required: true },
  });

const musicSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, index: true },
  artist: { type: String, index: true },
  album: { type: String, index: true },
  genre: { type: String, index: true },
  duration: { type: Number },
  fileUrl: { type: String, required: true },
  filebaseUrl: { type: String, required: true },
  ipfsUrl: { type: String, required: true },
  cid: { type: String, required: true },
  fileKey: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  coverImage: { type: coverImageSchema },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound indexes for common queries
musicSchema.index({ user: 1, createdAt: -1 });
musicSchema.index({ user: 1, genre: 1 });
musicSchema.index({ user: 1, artist: 1 });
musicSchema.index({ title: 'text', artist: 'text', album: 'text' });

const Music = mongoose.model<IMusic>("Music", musicSchema);

export default Music;