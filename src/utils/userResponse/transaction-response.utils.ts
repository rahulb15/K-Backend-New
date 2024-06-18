import { ITransaction } from '../../interfaces/transactions/transactions.interface';
export const transactionResponseData = (transaction: ITransaction) => {
  return {
    _id: transaction._id,
    user: transaction.user,
    paymentId: transaction.paymentId,
    paymentStatus: transaction.paymentStatus,
    paymentAmount: transaction.paymentAmount,
    paymentCurrency: transaction.paymentCurrency,
    paymentDate: transaction.paymentDate,
    paymentMethod: transaction.paymentMethod,
    paymentDescription: transaction.paymentDescription,
    paymentUserRole: transaction.paymentUserRole,
    order_id: transaction.order_id,
    refund_amount: transaction.refund_amount,
    isRefunded: transaction.isRefunded,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
};
