import mongoose from "mongoose";
import { IVerificationManager } from "../interfaces/verification/verification.manager.interface";
import { IVerification } from "../interfaces/verification/verification.interface";
import Verification from "../models/verification.model";

export class VerificationManager implements IVerificationManager {
  private static instance: VerificationManager;

  // private constructor() {}

  public static getInstance(): VerificationManager {
    if (!VerificationManager.instance) {
      VerificationManager.instance = new VerificationManager();
    }

    return VerificationManager.instance;
  }

  public async create(verification: IVerification): Promise<IVerification> {
    const newVerification = new Verification(verification);
    return newVerification.save();
  }

  public async getAll(): Promise<IVerification[]> {
    return Verification.find();
  }

  public async getByUserId(userId: string): Promise<IVerification> {
    const verification = await Verification.findOne({ user: userId });
    return verification as IVerification;
  }

  // updateById
  public async updateById(
    id: string,
    verification: IVerification
  ): Promise<IVerification> {
    const newVerification = await Verification.findByIdAndUpdate(
      id,
      verification,
      {
        new: true,
      }
    );
    return newVerification as IVerification;
  }
  
}
