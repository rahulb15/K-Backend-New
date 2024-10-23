// models/stage-application.model.ts
import mongoose from "mongoose";
import { IStageApplication } from "../interfaces/stage-application/stage-application.interface";

const stageApplicationSchema = new mongoose.Schema({
    collectionName: { type: String, required: true, index: true },
    walletAddress: { type: String, required: true, index: true },
    stage: { type: String, required: true, enum: ['presale', 'whitelist'] },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Compound index for unique applications per collection, wallet and stage
stageApplicationSchema.index({ collectionName: 1, walletAddress: 1, stage: 1 }, { unique: true });

const StageApplication = mongoose.model<IStageApplication & mongoose.Document>(
    "StageApplication",
    stageApplicationSchema
);

export default StageApplication;