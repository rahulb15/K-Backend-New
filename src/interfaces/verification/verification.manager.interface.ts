import { IVerification } from "./verification.interface";

export interface IVerificationManager {
    create(verification: IVerification): Promise<IVerification>;
    getAll(): Promise<IVerification[]>;
    getByUserId(userId: string): Promise<IVerification>;
    updateById(id: string, verification: IVerification): Promise<IVerification>;
}
