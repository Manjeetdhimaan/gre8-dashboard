import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Product } from '../../models/product.model';
import { ProductService, ProductsResponse } from '../../services/products.service';
import { CategoriesResponse, CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'products-list',
  templateUrl: './products-list.component.html',
  styles: [],
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  isLoadingProducts = false;
  isLoadingCategories = false;
  isLoadingFilters = false;
  isCategoryPage = false;
  serverErrMsg: string;

  constructor(private productService: ProductService, private categoryService: CategoriesService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      params['categoryId'] ? this._getCategoryProducts(params['categoryId']) : this._getProducts();
      params['categoryId'] ? this.isCategoryPage = true : this.isCategoryPage = false;
    })
    // this._getProducts();
    this._getCategories();
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  private _getCategories() {
    this.isLoadingCategories = true;
    this.categoryService.getCategories().subscribe(
      (res: CategoriesResponse) => {
        this.categories = res['categories'];
        this.isLoadingCategories = false;
      },
      (err) => {
        this.isLoadingCategories = false;
        this._errorHandler(err);
      }
    );
  }

  private _getProducts(categoriesFilter?: any) {
    this.isLoadingProducts = true;
    setTimeout(() => {
      this.activatedRoute.queryParams.subscribe((queryParams: Params) => {
        if (queryParams['categories']) {
          categoriesFilter = queryParams['categories'];
          // getting products with filters
          this.productService.getProducts(categoriesFilter).subscribe((res: ProductsResponse) => {
            // marking filter value as checked when after refreshing or loading page
            this.categories.map(category => {
              category.checked = (categoriesFilter.indexOf(category._id) > -1);
            })
            if (!res['products']) {
              this.products = [];
            }
            else {
              this.products = res['products'];
            }
            this.isLoadingProducts = false;
            this.isLoadingCategories = false;
            this.isLoadingFilters = false;
            this.serverErrMsg = '';
          }, err => {
            this.isLoadingProducts = false;
            this.isLoadingCategories = false;
            this.isLoadingFilters = false;
            this._errorHandler(err);
          })
        }
        else {
          // getting products without filters;
          this.productService.getProducts().subscribe((res: ProductsResponse) => {
            if (!res['products']) {
              this.products = [];
            }
            else {
              this.products = res['products'];
            }
            this.isLoadingProducts = false;
            this.isLoadingFilters = false;
            this.isLoadingCategories = false;
            this.serverErrMsg = '';
          }, err => {
            this.isLoadingProducts = false;
            this.isLoadingFilters = false;
            this.isLoadingCategories = false;
            this._errorHandler(err);
          })
        }
      })
    }, 0);

  }

  private _getCategoryProducts(categoriesFilter: any[]) {
    this.isLoadingProducts = true;
    this.productService.getProducts(categoriesFilter).subscribe((res: ProductsResponse) => {
      if (!res['products']) {
        this.products = [];
      }
      else {
        this.products = res['products'];
      }
      this.isLoadingProducts = false;
      this.isLoadingFilters = false;
      this.isLoadingCategories = false;
      this.serverErrMsg = '';
    }, err => {
      this.isLoadingProducts = false;
      this.isLoadingFilters = false;
      this.isLoadingCategories = false;
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

  categoryFilter() {
    this.isLoadingFilters = true;
    const selectedCategories = this.categories.filter(category => category.checked).map(category => category._id);
    if (selectedCategories.length <= 0) {
      this.router.navigate([`/products`]);
      // this.ngOnInit();
      // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      return;
    }
    else {
      this.router.navigate([`.`], {relativeTo: this.activatedRoute , queryParams: { categories: selectedCategories.join(':') } });
    }
    // this._getProducts();
  }
}
