import transactionsManager from "../../services/transactions.manager";
import { ITransaction } from "../../interfaces/transactions/transactions.interface";
import { Request, Response } from "express";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { transactionResponseData } from "../../utils/userResponse/transaction-response.utils";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import LaunchCollection from "../../models/launch-collection.model";
import { ILaunchCollection } from "../../interfaces/launch-collection/launch-collection.interface";
import { LaunchCollectionManager } from "../../services/launch-collection.manager";

export class TransactionsController {
  private static instance: TransactionsController;

  private constructor() {}

  public static getInstance(): TransactionsController {
    if (!TransactionsController.instance) {
      TransactionsController.instance = new TransactionsController();
    }

    return TransactionsController.instance;
  }

  public async create(req: any, res: Response) {
    try {
      console.log(req.body.collectionName, "req.body");

      if (req.body.type === "apply-launchpad") {
        //get collection by name
        const collection: ILaunchCollection = (await LaunchCollection.findOne({
          collectionName: req.body.collectionName,
        })) as unknown as ILaunchCollection;
        console.log(collection, "collection");

        if (!collection) {
          const responseData: IResponseHandler = {
            status: ResponseStatus.FAILED,
            message: ResponseMessage.NOT_FOUND,
            description: ResponseDescription.NOT_FOUND,
            data: null,
          };
          return res.status(ResponseCode.NOT_FOUND).json(responseData);
        }

        // {
        //   data: {
        //     status: 'success',
        //     message: 'Created',
        //     description:
        //       'The request has succeeded and a new resource has been created as a result.',
        //     data: {
        //       id: 'cs_test_a1j3t7QI3LK4BKOzh928WJMYzAQU61NGwPGnQcPtvzmkmHka0L5u9vlCRz',
        //       object: 'checkout.session',
        //       after_expiration: null,
        //       allow_promotion_codes: null,
        //       amount_subtotal: 100,
        //       amount_total: 100,
        //       automatic_tax: { enabled: false, liability: null, status: null },
        //       billing_address_collection: null,
        //       cancel_url: 'http://localhost:3000//cancel',
        //       client_reference_id: null,
        //       client_secret: null,
        //       consent: null,
        //       consent_collection: null,
        //       created: 1718533475,
        //       currency: 'usd',
        //       currency_conversion: null,
        //       custom_fields: [],
        //       custom_text: {
        //         after_submit: null,
        //         shipping_address: null,
        //         submit: null,
        //         terms_of_service_acceptance: null
        //       },
        //       customer: null,
        //       customer_creation: 'if_required',
        //       customer_details: null,
        //       customer_email: null,
        //       expires_at: 1718619874,
        //       invoice: null,
        //       invoice_creation: {
        //         enabled: false,
        //         invoice_data: {
        //           account_tax_ids: null,
        //           custom_fields: null,
        //           description: null,
        //           footer: null,
        //           issuer: null,
        //           metadata: {},
        //           rendering_options: null
        //         }
        //       },
        //       livemode: false,
        //       locale: null,
        //       metadata: {},
        //       mode: 'payment',
        //       payment_intent: null,
        //       payment_link: null,
        //       payment_method_collection: 'if_required',
        //       payment_method_configuration_details: null,
        //       payment_method_options: { card: { request_three_d_secure: 'automatic' } },
        //       payment_method_types: [ 'card' ],
        //       payment_status: 'unpaid',
        //       phone_number_collection: { enabled: false },
        //       recovered_from: null,
        //       saved_payment_method_options: null,
        //       setup_intent: null,
        //       shipping_address_collection: null,
        //       shipping_cost: null,
        //       shipping_details: null,
        //       shipping_options: [],
        //       status: 'open',
        //       submit_type: null,
        //       subscription: null,
        //       success_url: 'http://localhost:3000//success',
        //       total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
        //       ui_mode: 'hosted',
        //       url:
        //         'https://checkout.stripe.com/c/pay/cs_test_a1j3t7QI3LK4BKOzh928WJMYzAQU61NGwPGnQcPtvzmkmHka0L5u9vlCRz#fidkdWxOYHwnPyd1blpxYHZxWjA0SmBET1NNTzBjMWpXTV9UQnxyXURfdVNIT3ZGdWJodkxjXENjN11gf21dazVScX0wdXdNXE9vQW1RXVx9YUNzNHVCXDI3cEI9cmJHZnYwfFM0NzI1PW5JNTVCMzxuckxRfycpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl'
        //     }
        //   },
        //   status: 201,
        //   statusText: 'Created',
        //   headers: {
        //     'content-length': '2188',
        //     'content-type': 'application/json; charset=utf-8'
        //   },

        // const transactionSchema = new mongoose.Schema(
        //   {
        //     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        //     paymentId: { type: String },
        //     paymentStatus: { type: String },
        //     paymentAmount: { type: Number },
        //     paymentCurrency: { type: String },
        //     paymentDate: { type: Date },
        //     paymentMethod: { type: String },
        //     paymentDescription: { type: String },
        //     paymentUserRole: { type: String },
        //     order_id: { type: String },
        //     refund_amount: { type: String },
        //     isRefunded: { type: Boolean, default: false },
        //   },
        //   { timestamps: true },
        // );
        const userId = req.user._id;

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card", "alipay", "amazon_pay"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: req.body.collectionName,
                },
                unit_amount: 100,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.CLIENT_URL}/reject?session_id={CHECKOUT_SESSION_ID}`,
        });

        //create transaction
        const transaction: ITransaction = {
          user: userId,
          paymentId: session.id,
          paymentStatus: session.payment_status,
          paymentAmount: session.amount_total,
          paymentCurrency: session.currency,
          paymentDate: new Date(session.created * 1000),
          paymentMethod: session.payment_method_types[0],
          paymentDescription: session.description,
          paymentUserRole: req.user.role,
          order_id: collection._id,
          order_type: req.body.type,
        };

        console.log(
          "🚀 ~ TransactionsController ~ create ~ transaction",
          transaction
        );
        //save transaction
        const newTransaction: ITransaction = await transactionsManager.create(
          transaction
        );

        if (!newTransaction) {
          const responseData: IResponseHandler = {
            status: ResponseStatus.FAILED,
            message: ResponseMessage.FAILED,
            description: ResponseDescription.FAILED,
            data: null,
          };
          return res
            .status(ResponseCode.INTERNAL_SERVER_ERROR)
            .json(responseData);
        }

        return res.status(ResponseCode.CREATED).json({
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.CREATED,
          description: ResponseDescription.CREATED,
          data: session,
        });

        // const newTransaction: ITransaction = await transactionsManager.create(
        //   transaction,
        // );
        // const responseData: IResponseHandler = {
        //   status: ResponseStatus.SUCCESS,
        //   message: ResponseMessage.CREATED,
        //   description: ResponseDescription.CREATED,
        //   data: transactionResponseData(newTransaction),
        // };
        // return res.status(ResponseCode.CREATED).json(responseData);
      } else {
      }
    } catch (error) {
      console.log("🚀 ~ TransactionsController ~ create ~ error:", error);
      const responseData: IResponseHandler = {
        status: ResponseStatus.FAILED,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.FAILED,
        data: null,
      };
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }

  //check if the transaction is successful or not by stripe session id
  public async checkTransaction(req: any, res: Response) {
    try {
      //   "data": {
      //     "id": "cs_test_a1GjN1TwMqN3nqwnwo0ysbLaar2XIqkwUbx8xSYcRV6MXGmfkgmDvCDy8u",
      //     "object": "checkout.session",
      //     "after_expiration": null,
      //     "allow_promotion_codes": null,
      //     "amount_subtotal": 100,
      //     "amount_total": 100,
      //     "automatic_tax": {
      //         "enabled": false,
      //         "liability": null,
      //         "status": null
      //     },
      //     "billing_address_collection": null,
      //     "cancel_url": "http://localhost:3000//cancel",
      //     "client_reference_id": null,
      //     "client_secret": null,
      //     "consent": null,
      //     "consent_collection": null,
      //     "created": 1718540576,
      //     "currency": "usd",
      //     "currency_conversion": null,
      //     "custom_fields": [],
      //     "custom_text": {
      //         "after_submit": null,
      //         "shipping_address": null,
      //         "submit": null,
      //         "terms_of_service_acceptance": null
      //     },
      //     "customer": null,
      //     "customer_creation": "if_required",
      //     "customer_details": {
      //         "address": {
      //             "city": null,
      //             "country": "IN",
      //             "line1": null,
      //             "line2": null,
      //             "postal_code": null,
      //             "state": null
      //         },
      //         "email": "rahul.baghel1508@gmail.com",
      //         "name": "rahul",
      //         "phone": null,
      //         "tax_exempt": "none",
      //         "tax_ids": []
      //     },
      //     "customer_email": null,
      //     "expires_at": 1718626976,
      //     "invoice": null,
      //     "invoice_creation": {
      //         "enabled": false,
      //         "invoice_data": {
      //             "account_tax_ids": null,
      //             "custom_fields": null,
      //             "description": null,
      //             "footer": null,
      //             "issuer": null,
      //             "metadata": {},
      //             "rendering_options": null
      //         }
      //     },
      //     "livemode": false,
      //     "locale": null,
      //     "metadata": {},
      //     "mode": "payment",
      //     "payment_intent": "pi_3PSI7AHJ5f4oRHZQ1OATfbeF",
      //     "payment_link": null,
      //     "payment_method_collection": "if_required",
      //     "payment_method_configuration_details": null,
      //     "payment_method_options": {
      //         "card": {
      //             "request_three_d_secure": "automatic"
      //         }
      //     },
      //     "payment_method_types": [
      //         "card",
      //         "alipay",
      //         "amazon_pay"
      //     ],
      //     "payment_status": "paid",
      //     "phone_number_collection": {
      //         "enabled": false
      //     },
      //     "recovered_from": null,
      //     "saved_payment_method_options": null,
      //     "setup_intent": null,
      //     "shipping_address_collection": null,
      //     "shipping_cost": null,
      //     "shipping_details": null,
      //     "shipping_options": [],
      //     "status": "complete",
      //     "submit_type": null,
      //     "subscription": null,
      //     "success_url": "http://localhost:3000//success?session_id={CHECKOUT_SESSION_ID}",
      //     "total_details": {
      //         "amount_discount": 0,
      //         "amount_shipping": 0,
      //         "amount_tax": 0
      //     },
      //     "ui_mode": "hosted",
      //     "url": null
      // }

      const userId = req.user._id;

      console.log(req.params.sessionId, "req.params.sessionId");
      const session = await stripe.checkout.sessions.retrieve(
        req.params.sessionId
      );
      console.log(session, "session");

      if (session.payment_status === "paid") {
        //update transaction
        const updatedTransaction: ITransaction =
          await transactionsManager.updateByPaymentId(session.id, {
            user: userId,
            paymentStatus: session.payment_status,
            paymentAmount: session.amount_total,
            paymentCurrency: session.currency,
            paymentDate: new Date(session.created * 1000),
            paymentMethod: session.payment_method_types[0],
            paymentDescription: session.description,
          });

        if (!updatedTransaction) {
          const responseData: IResponseHandler = {
            status: ResponseStatus.FAILED,
            message: ResponseMessage.FAILED,
            description: ResponseDescription.FAILED,
            data: null,
          };
          return res.status(ResponseCode.SUCCESS).json(responseData);
        }

        return res.status(ResponseCode.SUCCESS).json({
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: updatedTransaction,
        });
      } else if (session.payment_status === "unpaid") {
        console.log("Unpaid transaction");
        const updatedTransaction: any =
          await transactionsManager.updateByPaymentId(session.id, {
            user: userId,
            paymentStatus: session.payment_status,
            paymentAmount: session.amount_total,
            paymentCurrency: session.currency,
            paymentDate: new Date(session.created * 1000),
            paymentMethod: session.payment_method_types[0],
            paymentDescription: session.description,
          });

        console.log(
          "🚀 ~ TransactionsController ~ checkTransaction ~ updatedTransaction",
          updatedTransaction
        );

        if (!updatedTransaction) {
          const responseData: IResponseHandler = {
            status: ResponseStatus.FAILED,
            message: ResponseMessage.FAILED,
            description: ResponseDescription.FAILED,
            data: null,
          };
          return res.status(ResponseCode.SUCCESS).json(responseData);
        }

        console.log(updatedTransaction["order_id"], "updatedTransaction");

        //      // update by id
        // public async updateById(
        //   id: string,
        //   collection: ILaunchCollection
        // ): Promise<ILaunchCollection> {
        //   const updatedCollection = await LaunchCollection.findOneAndUpdate(
        //     { _id: id },
        //     collection,
        //     { new: true }
        //   );
        //   console.log(
        //     "🚀 ~ LaunchCollectionManager ~ updatedCollection:",
        //     updatedCollection
        //   );
        //   if (!updatedCollection) {
        //     throw new Error("Collection not found");
        //   }
        //   return updatedCollection;
        // }

     
        console.log(updatedTransaction[0]["order_id"], "updatedTransaction");
        const updatedCollection: ILaunchCollection =
          await LaunchCollectionManager.getInstance().updateById(
            updatedTransaction[0]["order_id"],
            {
              isPaid: false,
            }
          );
        console.log(updatedCollection, "updatedCollection");

        if (!updatedCollection) {
          const responseData: IResponseHandler = {
            status: ResponseStatus.FAILED,
            message: ResponseMessage.FAILED,
            description: ResponseDescription.FAILED,
            data: null,
          };
          return res.status(ResponseCode.SUCCESS).json(responseData);
        }

        return res.status(ResponseCode.SUCCESS).json({
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: updatedTransaction,
        });
      }
      // } else {
      //   return res.status(ResponseCode.SUCCESS).json({
      //     status: ResponseStatus.SUCCESS,
      //     message: ResponseMessage.SUCCESS,
      //     description: ResponseDescription.SUCCESS,
      //     data: session,
      //   });
      // }
    } catch (error) {
      console.log(
        "🚀 ~ TransactionsController ~ checkTransaction ~ error:",
        error
      );
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
          transactionResponseData(transaction)
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
      console.log(transactionId, "transactionId");
      const transaction: ITransaction = await transactionsManager.getById(
        transactionId
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
        transaction
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

  // getByorder_id
  public async getByOrderId(req: Request, res: Response) {
    try {
      const orderId: string = req.params.id;
      console.log(orderId, "orderId");
      const transaction: ITransaction = await transactionsManager.getByOrderId(
        orderId
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
}
export default TransactionsController.getInstance();
