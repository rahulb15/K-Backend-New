// services/music.manager.ts

import Music from "../models/music.model";
import { IMusic, ICreateMusic, IMusicUpdate, IMusicQueryFilters } from "../interfaces/music/music.interface";

export class MusicManager {
  private static instance: MusicManager;

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  public async create(music: ICreateMusic): Promise<IMusic> {
    const newMusic = new Music(music);
    return await newMusic.save();
  }

  public async update(id: string, update: IMusicUpdate): Promise<IMusic | null> {
    return await Music.findByIdAndUpdate(
      id,
      { ...update, updatedAt: new Date() },
      { new: true }
    );
  }

  public async delete(id: string): Promise<boolean> {
    const result = await Music.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    return !!result;
  }

  public async getById(id: string): Promise<IMusic | null> {
    return await Music.findById(id);
  }

  public async getByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters: IMusicQueryFilters = {}
  ): Promise<{ data: IMusic[]; total: number; page: number; pages: number }> {
    const query = {
      user: userId,
      isActive: true,
      ...filters
    };

    const total = await Music.countDocuments(query);
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const data = await Music.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
      page,
      pages
    };
  }

public async getAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: IMusic[]; total: number; page: number; pages: number }> {
    const query = {
      isActive: true
    };

    const total = await Music.countDocuments(query);
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const data = await Music.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
      page,
      pages
    };
    }




  public async search(
    userId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: IMusic[]; total: number; page: number; pages: number }> {
    const query = {
      user: userId,
      isActive: true,
      $text: { $search: searchTerm }
    };

    const total = await Music.countDocuments(query);
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const data = await Music.find(query)
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
      page,
      pages
    };
  }
}

export default MusicManager.getInstance();