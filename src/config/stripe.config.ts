import Stripe from "stripe";
import ConfigModel from "../models/config.model";

const zeroDecimalCurrencies = [
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
];

interface Transaction {
  price: number;
  type: string;
}

interface PaymentTransaction {
  priceForPayment: number;
  description: string;
  _id: string;
}

export const charge = async (
  transaction: Transaction,
  token: string
): Promise<Stripe.Charge> => {
  try {
    const configs = await ConfigModel.find({
      key: {
        $in: ["currency", "stripeKey"],
      },
    }).exec();

    const dataConfig: Record<string, string> = {};
    configs.forEach((item) => {
      dataConfig[item.key] = item.value;
    });

    const currency = dataConfig.currency ? dataConfig.currency : "usd";
    const stripeKey = dataConfig.stripeKey
      ? dataConfig.stripeKey
      : process.env.STRIPE_SECRET_KEY!;
    const stripe = new Stripe(stripeKey);

    const data = await stripe.charges.create({
      amount: Math.round(transaction.price * 100),
      currency: currency.toLowerCase(),
      source: token,
      metadata: {
        type: transaction.type,
      },
    });

    if (data.status !== "succeeded" || !data.paid) {
      throw data;
    }

    return data;
  } catch (e) {
    throw e;
  }
};

export const createPaymentIntent = async (
  transaction: PaymentTransaction
): Promise<Stripe.PaymentIntent> => {
  try {
    const configs = await ConfigModel.find({
      key: {
        $in: ["currency", "stripeKey"],
      },
    }).exec();

    const dataConfig: Record<string, string> = {};
    configs.forEach((item) => {
      dataConfig[item.key] = item.value;
    });

    const currency = dataConfig.currency ? dataConfig.currency || "" : "usd";
    const stripeKey = dataConfig.stripeKey
      ? dataConfig.stripeKey
      : process.env.STRIPE_SECRET_KEY!;
    const stripe = new Stripe(stripeKey);

    const isZeroDecimalCurrency =
      zeroDecimalCurrencies.indexOf(currency.toUpperCase()) > -1;
    const amount = isZeroDecimalCurrency
      ? Math.round(transaction.priceForPayment)
      : Math.round(transaction.priceForPayment * 100);

    const data = await stripe.paymentIntents.create({
      description: transaction.description,
      amount,
      currency: currency.toLowerCase(),
      metadata: {
        transactionId: transaction._id.toString(),
      },
    });

    return data;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
