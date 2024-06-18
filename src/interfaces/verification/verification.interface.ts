export interface IVerification {
  _id?: string;
  user: string;
  applicantData: object;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
