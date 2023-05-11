import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { CartItem, Cart } from '../models/cart.model';
import { ServerResponse } from '@manjeet-ecommerce/products';
import { AuthService } from '@manjeet-ecommerce/users';

export const CART_KEY = 'cart';

export interface CartResponse {
  success: boolean,
  message: string,
  products: any[]
}

export interface PostCartResponse {
  success: boolean,
  message: string,
  totalPrice: number,
  quantity: number
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  userBaseUrl = `${environment.apiBaseUrl}/users`;
  cart$: BehaviorSubject<Cart> = new BehaviorSubject(this.getCartItemsFromLocalStorage());
  serverCart$: BehaviorSubject<{totalPrice: number, quantity: number}> = new BehaviorSubject({totalPrice: 0, quantity: 0});

  constructor(private http: HttpClient, private authService: AuthService) {
     this.getInitialCart();
   }

  // localstorage cart handling if user is not logged in
  initCartLocalStorage() {
    const itemCart = {
      items: []
    }
    const initialCartJson = JSON.stringify(itemCart);
    localStorage.setItem(CART_KEY, initialCartJson);
  }

  setItemToLocalStorageCart(fetchedCart: string, cartItem: CartItem, updateQuantity?: boolean) {
    const cart: Cart = JSON.parse(fetchedCart);
    let catrItemExitsIndex;
    if(cart && cart.items) {
       catrItemExitsIndex = cart.items.findIndex(item => item.productId === cartItem.productId);
    }
    if (catrItemExitsIndex && catrItemExitsIndex >= 0) {
      if(updateQuantity) {
        cart.items[catrItemExitsIndex].quantity = cartItem.quantity;
      }
      else {
        let newQuantity = cartItem.quantity;
        newQuantity = cart.items[catrItemExitsIndex].quantity + newQuantity;
        cart.items[catrItemExitsIndex].quantity = newQuantity;
      }
    }
    else if(cart && cart.items) {
      cart.items.push(cartItem);
    }
    const cartJson = JSON.stringify(cart);
    this.cart$.next(cart);
    localStorage.setItem(CART_KEY, cartJson);
  }

  getCartItemsFromLocalStorage() {
    const fetchedCart = localStorage.getItem(CART_KEY);
    if(fetchedCart) {
      // this.cart$.next(JSON.parse(fetchedCart));
      return JSON.parse(fetchedCart);
    }
  }

  setCartToLocalStorage(cartItem: CartItem, updateQuantity?: boolean) {
    const fetchedCart = localStorage.getItem(CART_KEY);
    if (fetchedCart) {
      this.setItemToLocalStorageCart(fetchedCart, cartItem, updateQuantity);
    }
    else {
      this.initCartLocalStorage();

      const fetchedCart2 = localStorage.getItem(CART_KEY);
      if (fetchedCart2) {
        this.setItemToLocalStorageCart(fetchedCart2, cartItem, updateQuantity);
      }
    }
  }

  emptyCart() {
    const intialCart = {
      items: []
    };
    const intialCartJson = JSON.stringify(intialCart);
    localStorage.setItem(CART_KEY, intialCartJson);
    this.cart$.next(intialCart);
  }

  deleteItemFromCart(productId: string) {
    const fetchedCart = localStorage.getItem(CART_KEY);
    if (fetchedCart) {
      const cartJson = JSON.parse(fetchedCart).items;
      const filteredItems = cartJson.filter((item: CartItem) => item.productId !== productId);
      const cart = {
        items: filteredItems
      }
      // update data in localstorage
      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      // update data in UI
      const fetchedCartAfterUpdate = localStorage.getItem(CART_KEY);
      if (fetchedCartAfterUpdate) {
        this.cart$.next(JSON.parse(fetchedCartAfterUpdate))
      }
    }
  }

  // server cart handling methods if user is logged in
  postCart(cartObject: CartItem, increaseQuantity?:boolean): Observable<PostCartResponse> {
    if(increaseQuantity) {
      return this.http.post<PostCartResponse>(`${this.userBaseUrl}/post-user-cart`, { productId: cartObject.productId, quantity: cartObject.quantity, increaseQuantity: true });
    }
    return this.http.post<PostCartResponse>(`${this.userBaseUrl}/post-user-cart`, { productId: cartObject.productId, quantity: cartObject.quantity });
  }

  postMultipleCart(cartObject: CartItem[]): Observable<PostCartResponse> {
    return this.http.post<PostCartResponse>(`${this.userBaseUrl}/post-many-to-cart`, cartObject);
  }

  postDeleteProductCart(productId: string): Observable<ServerResponse> {
    return this.http.post<ServerResponse>(`${this.userBaseUrl}/delete-cart-product`, {productId: productId});
  }

  getCartFromServer():Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.userBaseUrl}/get-user-cart`);
  }

  getInitialCart() {
    if (this.authService.isUserLoggedIn()) {
      this.getCartFromServer().subscribe(res => {
        let cartCount = 0
        res.products.map(product => {
          cartCount += +product.quantity;
        });
        this.serverCart$.next({totalPrice: 0, quantity: +cartCount})
      }, err => {
        console.log(err);
      });
    }
  }


}
