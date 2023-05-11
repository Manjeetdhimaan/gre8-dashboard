import { User } from "@manjeet-ecommerce/users"
import { OrderItem } from "./order-item.model"

export class Order {
  constructor(
    public orderItems: OrderItem[],
    public address: {
      shippingAddress1: string,
      shippingAddress2: string,
      city: string,
      name?: string,
      email?: string,
      orderNotes?: string,
      zip: string,
      country: string,
      phone: string | number
    },
    public status: string,
    public dateOrdered: string,
    public userId: string,
    public _id: string,
    public paymentStatus: string,
    public user?: User,
    public currency?: string,
    public totalPrice?: number,
    public id?: string,
    public sessionId?: string,
  ) { }
}
