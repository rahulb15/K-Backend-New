import { ITransaction } from '../interfaces/transactions/transactions.interface';
import { ITransactionManager } from '../interfaces/transactions/transactions.manager.interface';
import Transaction from '../models/transaction.model';

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
      throw new Error('Transaction not found');
    }
    return transaction;
  }

  public async update(
    id: string,
    transaction: ITransaction,
  ): Promise<ITransaction> {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      transaction,
      { new: true },
    );
    if (!updatedTransaction) {
      throw new Error('Transaction not found');
    }
    return updatedTransaction;
  }
}

export default TransactionManager.getInstance();
