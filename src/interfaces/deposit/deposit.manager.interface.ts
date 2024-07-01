import { IDeposit } from "./deposit.interface";
export interface IDepositManager {
  create(deposit: IDeposit): Promise<IDeposit>;
  getAll(): Promise<IDeposit[]>;
  getById(id: string): Promise<IDeposit>;
  update(id: string, deposit: IDeposit): Promise<IDeposit>;
  updateByTransactionId(transactionId: string, deposit: IDeposit): Promise<any>;
}

