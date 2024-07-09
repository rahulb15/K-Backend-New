export interface IUserPoints {
  userId: string;
  totalPoints: number;
  activityLog: {
    type: any;
    details?: object;
    pointsEarned: number;
    createdAt: Date;
  }[];
  ranking: number;
  priorityPass: boolean;
}
