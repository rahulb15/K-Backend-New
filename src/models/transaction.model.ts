import mongoose from "mongoose";
import { ITransaction } from "../interfaces/transactions/transactions.interface";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentId: { type: String },
    paymentStatus: { type: String },
    paymentAmount: { type: Number },
    paymentCurrency: { type: String },
    paymentDate: { type: Date },
    paymentMethod: { type: String },
    paymentDescription: { type: String },
    paymentUserRole: { type: String },
    order_id: { type: mongoose.Schema.Types.ObjectId },
    order_type: { type: String },
    refund_amount: { type: String },
    isRefunded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;
