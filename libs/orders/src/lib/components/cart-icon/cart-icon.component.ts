import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@manjeet-ecommerce/users';

import { Subscription, take, Subject, takeUntil } from 'rxjs';
import { Cart, CartItem } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'orders-cart-icon',
  templateUrl: './cart-icon.component.html',
  styles: [],
})
export class CartIconComponent implements OnInit, OnDestroy {

  cartCount = 0;
  subs$: Subscription;
  serversubs$: Subscription;
  serverErrMsg: string;
  authSubs$: Subject<any> = new Subject();

  constructor(private cartService: CartService, private authService: AuthService) { }

  ngOnInit(): void {
    this._getCart();
  }

  private _getCart() {
    this.authService.isUserLoggedIn$.pipe(takeUntil(this.authSubs$)).subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.subs$ = this.cartService.cart$.subscribe((cart: Cart) => {
          this.cartCount = 0;
          if (cart) {
            cart.items.map((item: CartItem) => {
              this.cartCount += item.quantity;
            });
            if(this.cartCount < 0) {
              this.cartCount = 0
            }
          }
        })
        // if (this.cartService.getCartItemsFromLocalStorage()) {
        //   this.cartCount = 0;
        //   this.cartService.getCartItemsFromLocalStorage().items.map((item: CartItem) => {
        //     this.cartCount += item.quantity;
        //   });
        // }
      }
      else {
        this.serversubs$ = this.cartService.serverCart$.pipe(take(1)).subscribe((cart: { totalPrice: number, quantity: number }) => {
          this.cartCount = cart.quantity;
          if(this.cartCount < 0) {
            this.cartCount = 0
          }
        });
      }
    });
  }

  // private _errorHandler(err: HttpErrorResponse) {
  //   if (err.error['message']) {
  //     this.serverErrMsg = err.error['message'];
  //   } else {
  //     this.serverErrMsg = 'An error occured. Please try again!';
  //   }
  // }

  ngOnDestroy(): void {
    this.authSubs$.next(null);
    this.authSubs$.complete();
    if (this.subs$) {
      this.subs$.unsubscribe();
    }
    if (this.serversubs$) {
      this.serversubs$.unsubscribe();
    }
  }
}
