import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StripeService } from 'ngx-stripe';

import { AuthService, UserService } from '@manjeet-ecommerce/users';
import { ORDER_STATUS } from 'libs/orders/src/order.constants';
import { OrderItem } from '../../models/order-item.model';
import { Order } from '../../models/order.model';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { switchMap } from 'rxjs';
import { environment } from '@env/environment';

@Component({
  selector: 'orders-checkout',
  templateUrl: './checkout.component.html',
  styles: [],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup: FormGroup;
  isSubmitted = false;
  orderItems: OrderItem[] = [];
  countries: { _id: string, name: string }[] = [];
  serverErrMsg: string;
  totalPrice: number = 0;
  quantity: number = 0;
  isLoading = false;

  constructor(
    private router: Router,
    private usersService: UserService,
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private ordersService: OrderService,
    private authService: AuthService,
    private stripeService: StripeService
  ) { }

  ngOnInit(): void {
    this._initCheckoutForm();
    this._getCartItems();
    this._getCountries();
    this._getUserProfile();
    localStorage.removeItem('sessionOrderId');
  }

  private _initCheckoutForm() {
    this.checkoutFormGroup = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      phone: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      zip: ['', Validators.required],
      apartment: ['', Validators.required],
      street: ['', Validators.required]
    });
  }

  private _getCartItems() {
    if (!this.authService.isUserLoggedIn()) {
      const cart = this.cartService.getCartItemsFromLocalStorage();
      this.orderItems = cart.items;
    }
    else {
      this.cartService.getCartFromServer().subscribe(res => {
        this.orderItems = res.products;
        res.products.forEach((product: any) => {
          this.totalPrice += +product.productId.price * +product.quantity;
          this.quantity += +product.quantity;
          this.cartService.serverCart$.next({ totalPrice: +this.totalPrice, quantity: this.quantity });
        })
      })
    }
  }

  private _getUserProfile() {
    this.usersService.getUserProfile().subscribe(res => {
      this.checkoutFormGroup.patchValue({
        name: res['user'].name,
        email: res['user'].email,
        phone: res['user'].phone,
        city: res['user'].address.city,
        country: res['user'].address.country,
        zip: res['user'].address.zip,
        street: res['user'].address.street,
        apartment: res['user'].address.apartment
      })
    }, err => {
      this._errorHandler(err);
    });
  }

  private _getCountries() {
    this.countries = this.usersService.getCountries();
  }

  backToCart() {
    this.router.navigate(['/cart']);
  }

  createOrderSession() {
    this.isSubmitted = true;
    if (this.checkoutFormGroup.invalid) {
      return;
    }
    this.isLoading = true;
    const order: Order = {
      orderItems: this.orderItems,
      address: {
        shippingAddress1: this.f['street'].value,
        shippingAddress2: this.f['apartment'].value,
        city: this.f['city'].value,
        zip: this.f['zip'].value,
        country: this.f['country'].value,
        phone: this.f['phone'].value
      },
      status: Object.keys(ORDER_STATUS)[0],
      userId: 'userIdwillautomaticallycreatedonserver',
      _id: 'userIdwillautomaticallycreatedonserver',
      paymentStatus: 'Pending',
      dateOrdered: `${Date.now()}`
    };

    const domain = environment.domain;
    // const ord = Object.assign({}, {order, domain: domain});
    this.ordersService.createOrderSession(order, domain).pipe(
      switchMap(session => {
        if (session.sessionId) {
          order.sessionId = session.sessionId;
          this.placeOrder(order);
        }
        return this.stripeService.redirectToCheckout({ sessionId: session.sessionId })
      })
    ).subscribe(
      (result) => {

        //redirect to thank you page // payment
        this.isLoading = false;
      },
      (err) => {
        //display some message to user
        this._errorHandler(err);
        this.isLoading = false;
      }
    );
  }

  placeOrder(order: Order) {
    this.ordersService.postOrder(order).subscribe(
      (res) => {
        //redirect to thank you page // payment
        this.cartService.emptyCart();
        this.cartService.serverCart$.next({ totalPrice: 0, quantity: 0 });
        this.isLoading = false;
      },
      (err) => {
        //display some message to user
        this._errorHandler(err);
        this.isLoading = false;
      }
    );
  }

  get f() {
      return this.checkoutFormGroup.controls;
    }

  private _errorHandler(err: HttpErrorResponse) {
      if(err.error['message']) {
        this.serverErrMsg = err.error['message'];
  } else {
  this.serverErrMsg = 'Error while placing order. Please try again!';
}
  }
}
