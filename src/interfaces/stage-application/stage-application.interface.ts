// interfaces/stage-application.interface.ts
export interface IStageApplication {
    _id?: string;
    collectionName: string;
    walletAddress: string;
    stage: 'presale' | 'whitelist';
    status: 'pending' | 'approved' | 'rejected';
    createdAt?: Date;
    updatedAt?: Date;
}