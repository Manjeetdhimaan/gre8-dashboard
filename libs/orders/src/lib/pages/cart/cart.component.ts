import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { animate, group, keyframes, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { take } from 'rxjs';
import { MessageService } from 'primeng/api';

import { ProductService } from '@manjeet-ecommerce/products';
import { AuthService } from '@manjeet-ecommerce/users';
import { CartProduct } from '../../models/cart.model';
import { CartService, CART_KEY, PostCartResponse } from '../../services/cart.service';

@Component({
  selector: 'orders-cart',
  templateUrl: './cart.component.html',
  styles: [],
  animations: [
    trigger('list1', [
      state('in', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateX(-100px)'
        }),
        animate(300)
      ]),
      transition('* => void', [
        animate(300, style({
          transform: 'translateX(100px)',
          opacity: 0
        }))
      ])
    ]),
    trigger('list2', [
      state('in', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('void => *', [
        animate(1000, keyframes([
          style({
            transform: 'translateY(-100px)',
            opacity: 0,
            offset: 0
          }),
          style({
            transform: 'translateY(-50px)',
            opacity: 0.5,
            offset: 0.3
          }),
          style({
            transform: 'translateY(-20px)',
            opacity: 1,
            offset: 0.8
          }),
          style({
            transform: 'translateY(0px)',
            opacity: 1,
            offset: 1
          })
        ]))
      ]),
      transition('* => void', [
        group([
          animate(300, style({
            color: 'red'
          })),
          animate(800, style({
            transform: 'translateX(100px)',
            opacity: 0
          }))
        ])
      ])
    ])
  ]
})
export class CartComponent implements OnInit {

  cartItems: CartProduct[] = [];
  serverErrMsg: string;
  isLoading: boolean = false;
  isLoadingDelete: boolean = false;
  isLoadingUpdateQuantity: boolean = false;
  totalPrice: number = 0;
  quantity: number = 0;

  constructor(private cartService: CartService, private productService: ProductService, private authService: AuthService, private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    if (!this.authService.isUserLoggedIn()) {
      this._getLocalStorageCart();
    }
    else {
      this._getCartFromServer();
    }
  }

  private _getLocalStorageCart() {
    this.cartService.cart$.pipe(take(1)).subscribe(respCart => {
      if (respCart.items && respCart.items.length > 0) {
        respCart.items.forEach(cartItem => {
          this.productService.getProduct(cartItem.productId).subscribe(res => {
            this.cartItems.push({
              product: res['product'],
              quantity: cartItem['quantity']
            });
            this.isLoading = false;
          }, err => {
            this._errorHandler(err);
            this.isLoading = false;
          });
        })
      }
      else {
        this.isLoading = false;
      }
    });
  }

  private _getCartFromServer() {
    const fetchedCart = localStorage.getItem(CART_KEY);
    // if cart is present in localstorage, store that in user account and clear localstorage cart
    if (fetchedCart && JSON.parse(fetchedCart).items && JSON.parse(fetchedCart).items.length > 0) {
      const cart = JSON.parse(fetchedCart);
      this.cartService.postMultipleCart(cart).subscribe(() => {
        this.cartService.emptyCart();
        this.cartService.getCartFromServer().subscribe(res => {
          res.products.forEach((product: any) => {
            this.totalPrice += +product.productId.price * +product.quantity;
            this.quantity += +product.quantity;
            this.cartItems.push({
              product: product.productId,
              quantity: product.quantity
            });
            this.cartService.serverCart$.next({ totalPrice: +this.totalPrice, quantity: this.quantity });
          })
          this.isLoading = false;
        }, err => {
          this.isLoading = false;
          this._errorHandler(err);
        });
      }, err => {
        this.isLoading = false;
        this._errorHandler(err);
      })
    }
    else {
      this.cartService.getCartFromServer().subscribe(res => {
        res.products.map(product => {
          this.totalPrice += +product.productId.price * +product.quantity;
          this.quantity += +product.quantity;
        })
        this.cartService.serverCart$.next({ totalPrice: +this.totalPrice, quantity: this.quantity });
        res.products.forEach((product: any) => {
          this.cartItems.push({
            product: product.productId,
            quantity: product.quantity
          });
        })
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
        this._errorHandler(err);
      });
    }
  }

  onLoading(event: boolean) {
    this.isLoadingDelete = event;
  }

  onUpdateQuantity(event: HTMLInputElement, productId: string) {
    if (!this.authService.isUserLoggedIn()) {
      this.cartService.setCartToLocalStorage({
        quantity: +event.value,
        productId: productId
      }, true);
    }
    else {
      const cartItem = {
        productId: productId,
        quantity: +event.value
      }
      this.isLoadingUpdateQuantity = true;
      this.cartService.postCart(cartItem).subscribe((res: PostCartResponse) => {
        this.cartService.serverCart$.next({ totalPrice: +res.totalPrice, quantity: +res.quantity });
        this.totalPrice = +res.totalPrice;
        this.quantity = +res.quantity;
        this.isLoadingUpdateQuantity = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Cart Updated' });
      }, err => {
        this.isLoadingUpdateQuantity = false;
        this._errorHandler(err);
      })
    }

  }

  onDeleteItemFromCart(productId: string, index: number, price: number, quantity: number) {
    this.isLoadingDelete = true;
    if (!this.authService.isUserLoggedIn()) {
      this.cartService.deleteItemFromCart(productId);
      this.cartItems.splice(index, 1);
      this.isLoadingDelete = false;
    }
    else {
      this.cartService.postDeleteProductCart(productId).subscribe(res => {
        this.isLoadingDelete = false;
        this.totalPrice = (this.totalPrice - (+price * +quantity));
        this.quantity = (this.quantity - quantity);
        this.cartService.serverCart$.next({ totalPrice: this.totalPrice, quantity: this.quantity});
        this.cartItems.splice(index, 1);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
      }, err => {
        this.isLoadingDelete = false;
        this._errorHandler(err);
      });
    }
  }

  private _errorHandler(err: HttpErrorResponse) {
    if (err.error['message']) {
      this.serverErrMsg = err.error['message'];
    } else {
      this.serverErrMsg = 'An error occured. Please try again!';
    }
  }

}
