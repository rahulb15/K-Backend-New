// managers/stage-application.manager.ts
import mongoose from "mongoose";
import { IStageApplication } from "../interfaces/stage-application/stage-application.interface";
import StageApplication from "../models/stage-application.model";

export class StageApplicationManager {
    private static instance: StageApplicationManager;

    public static getInstance(): StageApplicationManager {
        if (!StageApplicationManager.instance) {
            StageApplicationManager.instance = new StageApplicationManager();
        }
        return StageApplicationManager.instance;
    }

    public async create(application: IStageApplication): Promise<IStageApplication> {
        const newApplication = new StageApplication(application);
        return newApplication.save();
    }

    public async getApplicationStatus(collectionName: string, walletAddress: string, stage: string): Promise<IStageApplication | null> {
        return StageApplication.findOne({ collectionName, walletAddress, stage });
    }

    public async getApplicationsByCollection(collectionName: string): Promise<IStageApplication[]> {
        return StageApplication.find({ collectionName });
    }

    public async getApplicationsByWallet(walletAddress: string): Promise<IStageApplication[]> {
        return StageApplication.find({ walletAddress });
    }

    public async updateStatus(id: mongoose.Types.ObjectId, status: string): Promise<IStageApplication> {
        const updatedApplication = await StageApplication.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        );
        if (!updatedApplication) {
            throw new Error("Application not found");
        }
        return updatedApplication;
    }


    async getApplications(
        page: number = 1,
        limit: number = 10,
        search: string = "",
        stage: string = "all",
        status: string = "all"
      ) {
        try {
          const query: any = {};
    
          // Add search filter
          if (search) {
            query.collectionName = { $regex: search, $options: "i" };
          }
    
          // Add stage filter
          if (stage !== "all") {
            query.stage = stage;
          }
    
          // Add status filter
          if (status !== "all") {
            query.status = status;
          }
    
          // Calculate total count for pagination
          const total = await StageApplication.countDocuments(query);
    
          // Get paginated results
          const applications = await StageApplication.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
    
          return {
            data: applications,
            total,
            page,
            totalPages: Math.ceil(total / limit)
          };
        } catch (error) {
          throw error;
        }
      }

      async updateApplicationStatus(id: string, status: string) {
        try {
          const application = await StageApplication.findByIdAndUpdate(
            id,
            {
              status,
              updatedAt: new Date()
            },
            { new: true }
          );
    
          if (!application) {
            throw new Error("Application not found");
          }
    
          return application;
        } catch (error) {
          throw error;
        }
      }
}

export default StageApplicationManager.getInstance();