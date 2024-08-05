import { IDeposit } from "../interfaces/deposit/deposit.interface";
import { IDepositManager } from "../interfaces/deposit/deposit.manager.interface";
import Deposit from "../models/deposit.model";

export class DepositManager implements IDepositManager {
  private static instance: DepositManager;

  // private constructor() {}

  public static getInstance(): DepositManager {
    if (!DepositManager.instance) {
      DepositManager.instance = new DepositManager();
    }

    return DepositManager.instance;
  }

  public async create(deposit: IDeposit): Promise<IDeposit> {
    const newDeposit = new Deposit(deposit);
    return newDeposit.save();
  }

  public async getAll(): Promise<IDeposit[]> {
    console.log("getAll");
    return Deposit.find();
  }

  public async getById(id: string): Promise<IDeposit> {
    const deposit = await Deposit.findById(id);
    if (!deposit) {
      throw new Error("Deposit not found");
    }
    return deposit;
  }


  // getAllDeposit
  // const limit = parseInt(req.body.limit as string);
  // const page = parseInt(req.body.page as string);
  // const search = req.body.search as string;
  // const transactions: ITransaction[] = await depositManager.getAllDeposit(
  //   limit,
  //   page,
  //   search
  // );

  public async getAllDeposit(
    limit: number,
    page: number,
    search: string
  ): Promise<IDeposit[]> {

    //using aggregation and also give the total count of the documents
    const deposits = await Deposit.aggregate([
      {
        $match: {
          $or: [
            { transactionId: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
          ],
        },
      },
      //lookup to get the user details
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "transactions",
          localField: "transactionId",
          foreignField: "_id",
          as: "transaction",
        },
      },
      {
        $unwind: "$transaction",
      },



      {
        $project: {
          user: {
            _id: 1,
            name: 1,
            email: 1,
          },
          transaction:
          {
            _id: 1,
            paymentStatus: 1,
          },
          address: 1,
          amount: 1,
          price: 1,
          cryptoCurrency: 1,
          status: 1,
          createdAt: 1,
          txHash: 1,
          priorityFee : 1,
          percentage : 1,
          totalAmount : 1,
        },
      },
      {
        $facet: {
          deposits: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          total: [{ $count: "total" }],
        },
      },
    ]);

    if (deposits.length === 0) {
      throw new Error("Deposits not found");
    }

    return deposits;
    


   
  }








  public async update(id: string, deposit: any): Promise<IDeposit> {
    const updatedDeposit = await Deposit.findByIdAndUpdate(id, deposit, {
      new: true,
    });
    if (!updatedDeposit) {
      throw new Error("Deposit not found");
    }
    return updatedDeposit;
  }

  public async updateByTransactionId(
    transactionId: string,
    deposit: IDeposit
  ): Promise<any> {
    const updatedDeposit = await Deposit.findOneAndUpdate(
      { transactionId },
      deposit,
      { new: true }
    );
    if (!updatedDeposit) {
      throw new Error("Deposit not found");
    }
    return updatedDeposit;
  }
}

export default DepositManager.getInstance();
