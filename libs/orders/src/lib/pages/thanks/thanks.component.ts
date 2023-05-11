import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MessageService } from 'primeng/api';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'orders-thanks',
  templateUrl: './thanks.component.html',
  styles: [],
})
export class ThanksComponent implements OnInit {

  isSuccessFromServer = false;
  isLoading = false;

  constructor(private orderService: OrderService, private messageService: MessageService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params['session_id']) {
        this.orderService.confirmOrder(params['session_id']).subscribe(res => {
          if(res.success) {
            this.isSuccessFromServer = true;
          }
          this.isLoading = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
        }, err => {
          this.isSuccessFromServer = false;
          this.isLoading = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: err.error['message'] });
        })
      }
    })
  }
}
