import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Product } from '../../models/product.model';
import { ProductService, ProductsResponse } from '../../services/products.service';

@Component({
  selector: 'products-featured',
  templateUrl: './featured-products.component.html',
  styles: [],
})
export class FeaturedProductsComponent implements OnInit {
  products: Product[] = [];
  isLoading = false;
  isError = false;
  isLoadingDelete = false;
  serverErrMsg: string = '';

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this._getFeaturedProducts();
  }

  _getFeaturedProducts() {
    this.isLoading = true;
    // getFeaturedProducts(4, -1) // first argument (i.e 4) refers to product count and second argument refers to sorting(-1 means descending bu date and 1 means ascending by date)
    this.productService.getFeaturedProducts(4, -1).subscribe((res: ProductsResponse) => {
      this.products = res['products'];
      this.isLoading = false;
      this.isError = false;
    }, err => {
      this.isLoading = false;
      this.isError = true;
      this._errorHandler(err);
    })
  }

  private _errorHandler(err: HttpErrorResponse) {
    if (err.error['message']) {
      this.serverErrMsg = err.error['message'];
    } else {
      this.serverErrMsg = 'An error occured. Please try again!';
    }
  }
}
