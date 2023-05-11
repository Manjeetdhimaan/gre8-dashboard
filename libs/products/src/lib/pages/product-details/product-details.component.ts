import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Product } from '../../models/product.model';
import { ProductResponse, ProductService } from '../../services/products.service';
import { CartService, PostCartResponse } from '@manjeet-ecommerce/orders';
import { CartItem } from 'libs/orders/src/lib/models/cart.model';
import { AuthService } from '@manjeet-ecommerce/users';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'products-details',
  templateUrl: './product-details.component.html',
  styles: []
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  product: Product;
  quantity: number = 1;
  isLoading = false;
  isLoadingCart = false;
  serverErrMsg: string;
  prev: any;

  constructor(private productService: ProductService, private activatedRoute: ActivatedRoute, private cartService: CartService, private authService: AuthService, private messageService: MessageService, private router: Router) { }

  ngOnInit(): void {
    this.prev = this.router.routeReuseStrategy.shouldReuseRoute;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['productId']) {
        this._getProduct(params['productId']);
      }
    });
  }

  addProductToCart(productId: string) {
    const cartItem: CartItem = {
      productId: productId,
      quantity: this.quantity
    }
    if (!this.authService.isUserLoggedIn()) {
      this.cartService.setCartToLocalStorage(cartItem);
      // this.messageService.add({severity:'success', summary:'Success', detail: 'Cart updated'});
    }
    else {
      // if user is logged in
      this.isLoadingCart = true;
      this.cartService.postCart(cartItem, true).subscribe((res: PostCartResponse) => {
        this.isLoadingCart = false;
        this.cartService.serverCart$.next({totalPrice: +res.totalPrice, quantity: +res.quantity})
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
      }, err => {
        this.isLoadingCart = false;
        this._errorHandler(err);
      })
    }
  }

  private _getProduct(id: string) {
    this.serverErrMsg = '';
    this.isLoading = true;
    this.productService.getProduct(id).subscribe((res: ProductResponse) => {
      this.product = res['product'];
      this.serverErrMsg = '';
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
      this._errorHandler(err);
    });
  }

  private _errorHandler(err: HttpErrorResponse) {
    if (err.error['message']) {
      this.serverErrMsg = err.error['message'];
    } else {
      this.serverErrMsg = 'An error occured. Please try again!';
    }
  }

  ngOnDestroy(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = this.prev;
  }
}
