export interface IDeposit {
    _id?: string;
    user: string;
    transactionId: string;
    amount: number;
    price: number;
    cryptoCurrency: string;
    status: string;
    address: string;
    txHash: string;
    priorityFee: number;
    percentage: number;
    totalAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  