import { Component, OnInit } from '@angular/core';

import { OrderService } from '@manjeet-ecommerce/orders';
import { ProductService } from '@manjeet-ecommerce/products';
import { UserService } from '@manjeet-ecommerce/users';

@Component({
  selector: 'admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  statistics = [];
  totalUsers = 0;
  totalOrders = 0;
  totalSales = 0;
  totalProducts = 0;
  isLoading = false;
  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.orderService.getOrdersCount().subscribe(orders => {
      this.totalOrders = orders;
    }, err => {
      console.log(err);
    })

    this.userService.getUsersCount().subscribe(res => {
      console.log('user', res);
      this.totalUsers = res
    }, err => {
      console.log(err)
    })

    this.orderService.getTotalSales().subscribe(res => {
      this.totalSales = res;
      this.isLoading = false;
    }, err => {
      console.log(err);
      this.isLoading = false;
    })

    this.productService.getProductsCount().subscribe(count => {
      this.totalProducts = count;
      this.isLoading = false;
    }, err => {
      console.log(err);
      this.isLoading = false;
    })

  }
}
