import mongoose from "mongoose";
import { ITransaction } from "../interfaces/transactions/transactions.interface";

// data: {
//   id: 'cs_test_a1j3t7QI3LK4BKOzh928WJMYzAQU61NGwPGnQcPtvzmkmHka0L5u9vlCRz',
//   object: 'checkout.session',
//   after_expiration: null,
//   allow_promotion_codes: null,
//   amount_subtotal: 100,
//   amount_total: 100,
//   automatic_tax: { enabled: false, liability: null, status: null },
//   billing_address_collection: null,
//   cancel_url: 'http://localhost:3000//cancel',
//   client_reference_id: null,
//   client_secret: null,
//   consent: null,
//   consent_collection: null,
//   created: 1718533475,
//   currency: 'usd',
//   currency_conversion: null,
//   custom_fields: [],
//   custom_text: {
//     after_submit: null,
//     shipping_address: null,
//     submit: null,
//     terms_of_service_acceptance: null
//   },
//   customer: null,
//   customer_creation: 'if_required',
//   customer_details: null,
//   customer_email: null,
//   expires_at: 1718619874,
//   invoice: null,
//   invoice_creation: {
//     enabled: false,
//     invoice_data: {
//       account_tax_ids: null,
//       custom_fields: null,
//       description: null,
//       footer: null,
//       issuer: null,
//       metadata: {},
//       rendering_options: null
//     }
//   },
//   livemode: false,
//   locale: null,
//   metadata: {},
//   mode: 'payment',
//   payment_intent: null,
//   payment_link: null,
//   payment_method_collection: 'if_required',
//   payment_method_configuration_details: null,
//   payment_method_options: { card: { request_three_d_secure: 'automatic' } },
//   payment_method_types: [ 'card' ],
//   payment_status: 'unpaid',
//   phone_number_collection: { enabled: false },
//   recovered_from: null,
//   saved_payment_method_options: null,
//   setup_intent: null,
//   shipping_address_collection: null,
//   shipping_cost: null,
//   shipping_details: null,
//   shipping_options: [],
//   status: 'open',
//   submit_type: null,
//   subscription: null,
//   success_url: 'http://localhost:3000//success',
//   total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
//   ui_mode: 'hosted',
//   url:
//     'https://checkout.stripe.com/c/pay/cs_test_a1j3t7QI3LK4BKOzh928WJMYzAQU61NGwPGnQcPtvzmkmHka0L5u9vlCRz#fidkdWxOYHwnPyd1blpxYHZxWjA0SmBET1NNTzBjMWpXTV9UQnxyXURfdVNIT3ZGdWJodkxjXENjN11gf21dazVScX0wdXdNXE9vQW1RXVx9YUNzNHVCXDI3cEI9cmJHZnYwfFM0NzI1PW5JNTVCMzxuckxRfycpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl'
// }

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentId: { type: String },
    paymentStatus: { type: String },
    paymentAmount: { type: Number },
    paymentCurrency: { type: String },
    paymentDate: { type: Date },
    paymentMethod: { type: String },
    paymentDescription: { type: String },
    paymentUserRole: { type: String },
    order_id: { type: mongoose.Schema.Types.ObjectId },
    order_type: { type: String },
    refund_amount: { type: String },
    isRefunded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;
