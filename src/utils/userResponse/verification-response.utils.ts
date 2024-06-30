import { IVerification } from "../../interfaces/verification/verification.interface";

export const verificationResponseData = (verification: IVerification) => {
  return {
    user: verification.user,
    applicantData: verification.applicantData,
    status: verification.status,
    createdAt: verification.createdAt,
    updatedAt: verification.updatedAt,
  };
};
