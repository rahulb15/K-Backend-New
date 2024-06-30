import { ITransaction } from "../interfaces/transactions/transactions.interface";
import { ITransactionManager } from "../interfaces/transactions/transactions.manager.interface";
import LaunchCollection from "../models/launch-collection.model";
import Transaction from "../models/transaction.model";

export class TransactionManager implements ITransactionManager {
  private static instance: TransactionManager;

  // private constructor() {}

  public static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }

    return TransactionManager.instance;
  }

  public async create(transaction: ITransaction): Promise<ITransaction> {
    const newTransaction = new Transaction(transaction);
    return newTransaction.save();
  }

  public async getAll(): Promise<ITransaction[]> {
    return Transaction.find();
  }

  public async getById(id: string): Promise<ITransaction> {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return transaction;
  }

  public async update(
    id: string,
    transaction: ITransaction
  ): Promise<ITransaction> {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      transaction,
      { new: true }
    );
    if (!updatedTransaction) {
      throw new Error("Transaction not found");
    }
    return updatedTransaction;
  }

  //upate by paymentId
  public async updateByPaymentId(
    paymentId: string,
    transaction: ITransaction
  ): Promise<any> {
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { paymentId },
      transaction,
      { new: true }
    );
    if (!updatedTransaction) {
      throw new Error("Transaction not found");
    }

    const updatedTransaction1 = await Transaction.aggregate([
      {
        $match: {
          paymentId: paymentId,
        },
      },
      {
        $lookup: {
          from: "launchcollections",
          localField: "order_id",
          foreignField: "_id",
          as: "launchCollection",
        },
      },
      {
        $unwind: "$launchCollection",
      },
      {
        $set: {
          "launchCollection.isPaid": true,
        },
      },

      {
        $project: {
          user: 1,
          paymentId: 1,
          paymentStatus: 1,
          paymentAmount: 1,
          paymentCurrency: 1,
          paymentDate: 1,
          paymentMethod: 1,
          paymentDescription: 1,
          paymentUserRole: 1,
          order_id: 1,
          order_type: 1,
          refund_amount: 1,
          isRefunded: 1,
          createdAt: 1,
          updatedAt: 1,
          launchCollection: 1,
        },
      },
    ]);

    if (!updatedTransaction1) {
      throw new Error("Transaction not found");
    }

    if (!updatedTransaction1 || updatedTransaction1.length === 0) {
      throw new Error("Transaction not found");
    }

    const launchCollectionIds = updatedTransaction1.map(
      (transaction) => transaction.launchCollection._id
    );

    await LaunchCollection.updateOne(
      { _id: { $in: launchCollectionIds } },
      { $set: { isPaid: true } }
    );

    return updatedTransaction1;

    // if (!updatedTransaction) {
    //   throw new Error('Transaction not found');
    // }
    // return updatedTransaction1;
  }

  // getByOrderId
  public async getByOrderId(order_id: string): Promise<ITransaction> {
    const transaction = await Transaction.findOne({
      order_id,
    });
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return transaction;
  }
}

export default TransactionManager.getInstance();
