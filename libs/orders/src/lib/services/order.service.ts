import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '@env/environment'
import { Order } from '../models/order.model';

export interface OrdersResponse {
  success: boolean;
  message: string;
  orders: Order[];
}

export interface OrderResponse {
  success: boolean;
  message: string;
  order: Order;
}

export interface OrderSessionResponse {
  success: boolean;
  message: string;
  sessionId: string;
}

export interface ServerResponse {
  success: boolean,
  message: string
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  orderBaseUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) { }

  getOrders():Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.orderBaseUrl}/get-orders`);
  }

  getOrder(orderId: string):Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.orderBaseUrl}/get-order/${orderId}`);
  }


  createOrderSession(orderBody: Order, domain: string):Observable<OrderSessionResponse> {
    const order = Object.assign({}, {orderBody, domain: domain})
    return this.http.post<OrderSessionResponse>(`${this.orderBaseUrl}/create-order-session`, order);
  }

  postOrder(orderBody: Order):Observable<ServerResponse> {
    return this.http.post<ServerResponse>(`${this.orderBaseUrl}/post-order`, orderBody);
  }

  confirmOrder(orderSessionId: string):Observable<ServerResponse> {
    return this.http.post<ServerResponse>(`${this.orderBaseUrl}/confirm-order`, {orderSessionId: orderSessionId});
  }

  updateOrderStatus(orderId: string, orderStatusBody: {status: string}):Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.orderBaseUrl}/update-order-status/${orderId}`, orderStatusBody);
  }

  deleteOrder(orderId: string):Observable<ServerResponse> {
    return this.http.delete<ServerResponse>(`${this.orderBaseUrl}/delete-order/${orderId}`);
  }

  getOrdersCount(): Observable<number> {
    return this.http
      .get<number>(`${this.orderBaseUrl}/get-orders-count`)
      .pipe(map((objectValue: any) => objectValue.orderCount));
  }

  getTotalSales(): Observable<number> {
    return this.http
      .get<number>(`${this.orderBaseUrl}/get-totalsales`)
      .pipe(map((objectValue: any) => objectValue.totalSales));
  }
}
