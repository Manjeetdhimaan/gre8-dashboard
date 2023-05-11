import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Category } from '../../models/category.model';
import { CategoriesResponse, CategoriesService } from '../../services/categories.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'products-categories-banner',
  templateUrl: './categories-banner.component.html',
  styles: [],
})
export class CategoriesBannerComponent implements OnDestroy {

  categories: Category[] = [];
  isLoading = false;
  isLoadingDelete = false;
  isError = false;
  serverErrMsg: string;
  subscription: Subscription;

  constructor(private categoryService: CategoriesService) {
    this.isLoading = true;
    this.serverErrMsg = '';
    this.subscription = this.categoryService.getCategories().subscribe(
      (res: CategoriesResponse) => {
        this.categories = res['categories'];
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

  private _errorHandler(err: HttpErrorResponse) {
    if (err.error['message']) {
      this.serverErrMsg = err.error['message']
    } else {
      this.serverErrMsg = 'An error occured';
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
