import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxStripeModule } from 'ngx-stripe';

import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';

import { ordersRoutes } from './lib.routes';
import { CartIconComponent } from './components/cart-icon/cart-icon.component';
import { CartComponent } from './pages/cart/cart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ThanksComponent } from './pages/thanks/thanks.component';

@NgModule({
  imports: [
    CommonModule,
    BadgeModule,
    ButtonModule,
    InputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    InputMaskModule,
    ToastModule,
    RouterModule.forRoot(ordersRoutes),
    NgxStripeModule.forRoot('pk_test_51Mkl8USHSaj2D0AU1gNSXyfTaJEF8ED76yYPZfHD9hKVBCYZMqTbrOoD8QHtpkusdMqnwQYv9clrrTSDnYbvTCqq00Tphb5Q2v'),
    SkeletonModule
  ],
  declarations: [
    CartIconComponent,
    CartComponent,
    OrderSummaryComponent,
    CheckoutComponent,
    ThanksComponent
  ],
  exports: [
    CartIconComponent,
    CartComponent
  ],
  providers: [MessageService]
})
export class OrdersModule {}
