import transactionsManager from '../../services/transactions.manager';
import { ITransaction } from '../../interfaces/transactions/transactions.interface';
import { Request, Response } from 'express';
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from '../../enum/response-message.enum';
import { transactionResponseData } from '../../utils/userResponse/transaction-response.utils';
import { IResponseHandler } from '../../interfaces/response-handler.interface';

export class TransactionsController {
  private static instance: TransactionsController;

  private constructor() {}

  public static getInstance(): TransactionsController {
    if (!TransactionsController.instance) {
      TransactionsController.instance = new TransactionsController();
    }

    return TransactionsController.instance;
  }

  public async create(req: Request, res: Response) {
    try {
      console.log(req.body, 'req.body');
      const transaction: ITransaction = req.body;
      console.log(transaction, 'transaction');
      const newTransaction: ITransaction = await transactionsManager.create(
        transaction,
      );
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: transactionResponseData(newTransaction),
      };
      return res.status(ResponseCode.CREATED).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async getAll(req: Request, res: Response) {
    try {
      const transactions: ITransaction[] = await transactionsManager.getAll();
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: transactions.map((transaction) =>
          transactionResponseData(transaction),
        ),
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  public async getById(req: Request, res: Response) {
    try {
      const transactionId: string = req.params.id;
      const transaction: ITransaction = await transactionsManager.getById(
        transactionId,
      );
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: transactionResponseData(transaction),
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.NOT_FOUND,
        description: ResponseDescription.NOT_FOUND,
        data: null,
      };
      return res.status(ResponseCode.NOT_FOUND).json(responseData);
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const transactionId: string = req.params.id;
      const transaction: ITransaction = req.body;
      const updatedTransaction: ITransaction = await transactionsManager.update(
        transactionId,
        transaction,
      );
      const responseData: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.UPDATED,
        description: ResponseDescription.UPDATED,
        data: transactionResponseData(updatedTransaction),
      };
      return res.status(ResponseCode.SUCCESS).json(responseData);
    } catch (error) {
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }
}
export default TransactionsController.getInstance();
