import { Product } from "@manjeet-ecommerce/products";

export class Cart {
  constructor( public items: CartItem[] ) {}
}

export class CartItem {
  constructor( public productId: string, public quantity: number, public _id?: string ) {}
}

export class CartProduct {
  constructor( public product: Product, public quantity: number ) {}
}
