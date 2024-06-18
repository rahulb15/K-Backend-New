export interface ITransaction {
  _id?: string;
  user: string;
  paymentId?: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentCurrency: string;
  paymentDate: Date;
  paymentMethod?: string;
  paymentDescription?: string;
  paymentUserRole?: string;
  order_id?: string;
  order_type?: string;
  refund_amount?: string;
  isRefunded?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  launchCollection?: any;
}
