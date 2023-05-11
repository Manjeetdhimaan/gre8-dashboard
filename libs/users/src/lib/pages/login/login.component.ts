import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CART_KEY } from '@manjeet-ecommerce/orders';

import { AuthService, LoginResponse } from '../../services/auth/auth.service';

@Component({
  selector: 'user-login',
  templateUrl: './login.component.html',
  styles: [],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  isSubmitted = false;
  errMsg: string;
  isLoading = false;
  totalPrice: number = 0;
  quantity: number = 0;
  isUserChecking = false;

  constructor( private authService: AuthService, private router: Router, private cartService: CartService ) {}

  ngOnInit(): void {
      this.isUserChecking = this.authService.isUserCheckingOut ? true : false;
      this._initForm();
  }

  get f() {
    return this.loginForm.controls;
  }

  private _initForm() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(4)]),
    })
  }

  onSubmitForm() {
    this.isSubmitted = true;
    this.errMsg = '';
    if(!this.loginForm.valid) return;
    this.isLoading = true;
    this._login();
  }

  private _login() {
    if (!this.authService.isAdminLogin) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe((res: LoginResponse) => {
        this.isLoading = false;
        if(res.success) {
          this.authService.setToken(res['token']);
          this.authService.isUserLoggedIn$.next(this.authService.isUserLoggedIn());
          this.authService.isUserCheckingOut ? this.router.navigate(['/cart']) : this.router.navigate(['/']);
          this.authService.isUserCheckingOut = false;

          const fetchedCart = localStorage.getItem(CART_KEY);
          // if cart is present in localstorage, store that in user account and clear localstorage cart
          if (fetchedCart && JSON.parse(fetchedCart).items && JSON.parse(fetchedCart).items.length >0) {
            const cart = JSON.parse(fetchedCart);
            this.cartService.postMultipleCart(cart).subscribe(res => {
              this.cartService.emptyCart();
              this.cartService.getCartFromServer().subscribe(res => {
                this.isLoading = false;
                res.products.forEach((product: any) => {
                  this.totalPrice += +product.productId.price * +product.quantity;
                  this.quantity += +product.quantity;
                })
                this.cartService.serverCart$.next({ totalPrice: +this.totalPrice, quantity: this.quantity });
              }, err => {
                this.isLoading = false;
                this._errorHandler(err);
              });
            }, err => {
              this.isLoading = false;
              this._errorHandler(err);
            })
          }
        }
      }, err => {
        this.isLoading = false;
        this._errorHandler(err);
      });
    }
    else {
      this.authService.adminLogin(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe((res: LoginResponse) => {
        this.isLoading = false;
        if(res.success) {
          this.authService.setToken(res['token']);
          this.router.navigate(['/']);
          this.authService.isUserCheckingOut = false;
        }
      }, err => {
        this.isLoading = false;
        this._errorHandler(err);
      });
    }
  }

  private _errorHandler(err: HttpErrorResponse) {
    if (err.error['message']) {
      this.errMsg = err.error['message'];
    } else {
      this.errMsg = 'An error occured. Please try again!';
    }
  }
}
