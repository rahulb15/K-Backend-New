import mongoose, { Schema, Document } from "mongoose";
import { IVerification } from "../interfaces/verification/verification.interface";

const verificationSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applicantData: { type: Object, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Verification = mongoose.model<IVerification>(
  "Verification",
  verificationSchema
);

export default Verification;
