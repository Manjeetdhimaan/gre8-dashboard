import { animate, group, keyframes, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { Product } from '../../models/product.model';
import { ProductService, ProductsResponse } from '../../services/products.service';

@Component({
  selector: 'products-search',
  templateUrl: './products-search.component.html',
  styles: [],
  animations: [
    trigger('fadeIn', [
      state('in', style({
        opacity: 1,
      })),
      transition('void => *', [
        animate(300, keyframes([
          style({
            opacity: 0
          }),
          style({
            opacity: 0.5
          }),
          style({
            opacity: 1
          }),
          style({
            opacity: 1
          })
        ]))
      ]),
      transition('* => void', [
        group([
          animate(50, style({
            color: 'red'
          })),
          animate(250, style({
            opacity: 0
          }))
        ])
      ])
    ]),
    trigger('list2', [
      state('in', style({
        opacity: 1,
        transform: 'translateY(0)'
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
            offset: 0
          }),
          style({
            transform: 'translateY(-20px)',
            opacity: 1,
            offset: 0.1
          }),
          style({
            transform: 'translateY(0px)',
            opacity: 1,
            offset: 0.4
          })
        ]))
      ]),
      transition('* => void', [
        group([
          animate(50, style({
            color: 'red'
          })),
          animate(250, style({
            opacity: 0
          }))
        ])
      ])
    ])
  ]
})
export class ProductsSearchComponent implements OnInit {
  products: Product[] = [];
  isLoadingProducts = false;
  serverErrMsg: string;
  searchText: string;
  isNotFound = false;

  constructor(private productService: ProductService) { }

  ngOnInit() {
  }

  onSearchProducts(searchEvent: Event, clearSearchEvent?:boolean) {

    const search = (searchEvent.target as HTMLInputElement).value;
    if(clearSearchEvent) {
      this.products = [];
      this.searchText = '';
      return;
    }
    if(search.trim() === '') {
      this.products = [];
    }
    else {
      this.isNotFound = false;
      this._getProducts(this.searchText);
    }
  }

  private _getProducts(searchText?: any) {
    this.isLoadingProducts = true;
    // getting products without filters
    this.productService.getProducts(undefined, undefined, searchText).subscribe((res: ProductsResponse) => {
      if (!res['products']) {
        this.products = [];
        this.isNotFound = true;
      }
      else {
        this.products = res['products'];
        this.isNotFound = false;
      }
      this.isLoadingProducts = false;
      this.serverErrMsg = '';
    }, err => {
      this.isLoadingProducts = false;
      this._errorHandler(err);
    })
  }

  private _errorHandler(err: HttpErrorResponse) {
    if (err.error['message']) {
      if (err.error['message'] === 'No Products found' && err.status === 404) {
        this.products = [];
      }
      this.serverErrMsg = err.error['message'];
    } else {
      this.serverErrMsg = 'An error occured. Please try again!';
    }
  }
}
