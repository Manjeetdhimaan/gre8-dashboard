import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Order, OrderResponse, OrderService, PAYMENT_STATUS } from '@manjeet-ecommerce/orders';
import { ORDER_STATUS } from '../order.contants';

@Component({
  selector: 'admin-order-detail',
  templateUrl: './order-detail.component.html',
  styles: [
    `
      .order-address {
        width: 100%
      }

      @media(max-width: 600px) {
        .order-address {
        width: 100vw;
        display: block;
      }
      }
    `
  ],
})
export class OrderDetailComponent implements OnInit {

  submit = false;
  isLoading = false;
  isError = false;
  order: Order;
  selectedOrderStatus: string;
  orderStatuses: any = [];
  paymentStatus = PAYMENT_STATUS;

  constructor(private orderService: OrderService, private messageService: MessageService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this._mapOrderStatuses();
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['id']) {
        this._getOrder(params['id']);
      }
    });
  }

  private _mapOrderStatuses() {
    this.orderStatuses = Object.keys(ORDER_STATUS).map(key => {
      return {
        id: key,
        name: ORDER_STATUS[key].label
      }
    });
  }

  private _getOrder(orderId: string) {
    this.isLoading = true;
    this.orderService.getOrder(orderId).subscribe((res: OrderResponse) => {
      this.order = res['order'];
      console.log(this.order)
      this.selectedOrderStatus = res['order'].status;
      this.isLoading = false;
      this.isError = false;
    }, err => {
      this.isLoading = false;
      this.isError = true;
      this._errorHandler(err);
    });
  }

  onChangeStatus(event: HTMLInputElement, orderId: string) {
    this.orderService.updateOrderStatus(orderId, { status: event.value })
      .subscribe((res: OrderResponse) => {
        this.isLoading = false;
        this.isError = false;
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
          // this.router.navigate(['/categories']);
        }
      }, err => {
        this._errorHandler(err);
      });
  }

  private _errorHandler(err: any) {
    if (err.error['message']) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err.error['message'],
      });

    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'An error occured',
        detail: 'Please try again!',
      });
    }
  }
}
