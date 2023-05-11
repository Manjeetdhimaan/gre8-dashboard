import { Product } from "@manjeet-ecommerce/products";

export class OrderItem {
  constructor(
    public quantity: number,
    public product: Product,
    public _id?: string
  ) {}
}
