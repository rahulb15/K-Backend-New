import mongoose, { Document, Schema } from "mongoose";

interface IUserPoints extends Document {
  userId: string;
  totalPoints: number;
  activityLog: {
    type: {
      type: String;
      required: true;
      enum: ["App Login"];
    };
    details: object;
    pointsEarned: number;
    createdAt: Date;
  }[];
  ranking: number;
  priorityPass: boolean;
}

const userPointsSchema = new Schema({
  userId: { type: String, required: true },
  totalPoints: { type: Number, default: 0 },
  activityLog: [
    {
      type: { type: String, required: true },
      details: { type: Object },
      pointsEarned: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  ranking: { type: Number },
  priorityPass: { type: Boolean, default: false },
});

userPointsSchema.pre("save", async function (next) {
  // Before saving, update totalPoints based on activity log
  const totalPoints = this.activityLog.reduce(
    (acc, activity) => acc + activity.pointsEarned,
    0
  );
  this.totalPoints = totalPoints;
  next();
});

const UserPoints = mongoose.model<IUserPoints>("UserPoints", userPointsSchema);

export default UserPoints;
