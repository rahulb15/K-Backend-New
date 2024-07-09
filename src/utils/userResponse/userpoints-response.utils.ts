import { IUserPoints } from "../../interfaces/userpoints/userpoints.interface";

export const userPointsResponseData = (userPoints: IUserPoints) => {
  return {
    userId: userPoints.userId,
    totalPoints: userPoints.totalPoints,
    activityLog: userPoints.activityLog,
    ranking: userPoints.ranking,
    priorityPass: userPoints.priorityPass,
  };
};
