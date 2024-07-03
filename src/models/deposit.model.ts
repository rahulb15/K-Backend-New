import mongoose from "mongoose";
import { IDeposit } from "../interfaces/deposit/deposit.interface";

const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be positive"],
    },
    cryptoCurrency: {
      type: String,
      enum: ["KDA", "BTC", "ETH", "LTC", "USDT"], // Example list, add more as needed
      default: "KDA",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
      required: true,
    },
    address: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^k:[A-Fa-f0-9]{64}$/.test(v); // Validate format: k: followed by 64 hexadecimal characters
        },
        message: (props: any) => `${props.value} is not a valid address!`,
      },
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
    },
    priorityFee: {
      type: Number,
      required: true,
      min: [0, "Priority fee must be positive"],
    },
    percentage: {
      type: Number,
      required: true,
      min: [0, "Percentage must be positive"],
      default: 3.5,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount must be positive"],
    },
  },
  { timestamps: true }
);

// depositSchema.pre('save', function (next) {
//   if (this.isModified('amount') || this.isModified('priorityFee') || this.isModified('percentage')) {
//     this.totalAmount = this.amount + this.priorityFee + (this.amount * (this.percentage / 100));
//   }
//   next();
// });

const Deposit = mongoose.model<IDeposit>("Deposit", depositSchema);

export default Deposit;
