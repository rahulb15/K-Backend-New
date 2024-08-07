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
    console.log("update");
    console.log("transaction", transaction);
    console.log("id", id);
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
    console.log(
      "updatedTransaction-----------------------------------",
      updatedTransaction
    );
    if (!updatedTransaction) {
      throw new Error("Transaction not found");
    }

    if (updatedTransaction.order_id !== null) {
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
    } else {
      return [updatedTransaction];
    }
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

  // getAllTransactions page limit search
  public async getAllTransactions(
    limit: number,
    page: number,
    search: string
  ): Promise<ITransaction[]> {

    console.log("search", search);
    console.log("limit", limit);
    console.log("page", page);

    limit = Math.max(1, limit);
    page = Math.max(1, page);
    console.log("search", search);
    console.log("limit", limit);
    console.log("page", page);
    const transactions = await Transaction.aggregate([
      {
        $match: {
          $or: [
            { paymentId: { $regex: search, $options: "i" } },
            { paymentStatus: { $regex: search, $options: "i" } },
            { paymentAmount: { $regex: search, $options: "i" } },
            { paymentCurrency: { $regex: search, $options: "i" } },
            { paymentDate: { $regex: search, $options: "i" } },
            { paymentMethod: { $regex: search, $options: "i" } },
            { paymentDescription: { $regex: search, $options: "i" } },
            { paymentUserRole: { $regex: search, $options: "i" } },
            { order_id: { $regex: search, $options: "i" } },
            { order_type: { $regex: search, $options: "i" } },
            { refund_amount: { $regex: search, $options: "i" } },
            { isRefunded: { $regex: search, $options: "i" } },
          ],
        },
      },
      {
        $facet: {
          transactions: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
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
              },
            },
          ],
          total: [
            { $count: "total" }
          ],
        },
      },
    ]);

    return transactions;
  }
}

export default TransactionManager.getInstance();
