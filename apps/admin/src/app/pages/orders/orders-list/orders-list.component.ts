import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Order, OrderService, OrdersResponse, ORDER_STATUS } from '@manjeet-ecommerce/orders';
import { ServerResponse } from '@manjeet-ecommerce/products';

@Component({
  selector: 'admin-orders-list',
  templateUrl: './orders-list.component.html',
  styles: [],
})
export class OrdersListComponent {

  orders: Order[] = [];
  isLoading = false;
  isLoadingDelete = false;
  isError = false;
  errorMsg = '';
  orderStatus = ORDER_STATUS;

  constructor(
    private orderService: OrderService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.orderService.getOrders().subscribe(
      (res: OrdersResponse) => {
        this.orders = res['orders'];
        this.isLoading = false;
        this.isError = false;
      },
      (err) => {
        this.isLoading = false;
        this.isError = true;
        this._errorHandler(err);
      }
    );
  }

  onDeleteOrder(orderId: string, order: Order) {
    this.isError = false;
    this.confirmationService.confirm({
      message: 'Are you sure to delete ?',
      header: 'Delete Order with id  "' + order._id + '" ?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isLoadingDelete = true;
        this.orderService.deleteOrder(orderId).subscribe(
          (res: ServerResponse) => {
            this.isLoadingDelete = false;
            this.isError = false;
            if (res.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: res['message'],
              });
              this.orders.splice(
                this.orders.indexOf(order),
                1
              );
            }
          },
          (err) => {
            this.isLoadingDelete = false;
            this.isError = true;
            this._errorHandler(err);
          }
        );
      },
    });
  }

  onShowOrder(orderId: string) {
    this.router.navigate(['/orders/detail/'+orderId]);
  }

  private _errorHandler(err: any) {
    if (err.error['message']) {
      this.errorMsg = err.error['message'];
      // this.messageService.add({
      //   severity: 'error',
      //   summary: 'Error',
      //   detail: err.error['message'],
      // });

    } else {
      this.errorMsg = 'An error occured';
      this.messageService.add({
        severity: 'error',
        summary: 'An error occured',
        detail: 'Please try again!',
      });
    }
  }
}
