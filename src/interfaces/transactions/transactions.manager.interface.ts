import { ITransaction } from './transactions.interface';
export interface ITransactionManager {
  create(transaction: ITransaction): Promise<ITransaction>;
  getAll(): Promise<ITransaction[]>;
  getById(id: string): Promise<ITransaction>;
  update(id: string, transaction: ITransaction): Promise<ITransaction>;
}
