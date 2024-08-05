import { IDeposit } from "../../interfaces/deposit/deposit.interface";

export const depositResponseData = (deposit: IDeposit) => {
  return {
    // _id: deposit._id,
    // user: deposit.user,
    // transactionId: deposit.transactionId,
    amount: deposit.amount,
    // price: deposit.price,
    // cryptoCurrency: deposit.cryptoCurrency,
    // status: deposit.status,
    // address: deposit.address,
    // txHash: deposit.txHash,
    // priorityFee: deposit.priorityFee,
    // percentage: deposit.percentage,
    // totalAmount: deposit.totalAmount,
    createdAt: deposit.createdAt,
  };
};


