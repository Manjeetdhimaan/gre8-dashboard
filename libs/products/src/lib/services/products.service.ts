import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '@env/environment'
import { ServerResponse } from './categories.service';
import { Product } from '../models/product.model';

export interface ProductsResponse {
  success: boolean;
  message: string;
  products: Product[];
}

export interface ProductResponse {
  success: boolean;
  message: string;
  product: Product;
}

@Injectable({
  providedIn: 'root'
})

export class ProductService {

  productBaseUrl = `${environment.apiBaseUrl}/products`

  constructor(private http: HttpClient) { }

  getProducts(categoriesFilter?: string[], productsIds?: string[], searchStr?: string): Observable<ProductsResponse> {
    // let params = new HttpParams();
    if(categoriesFilter) {
      // params = params.append('categories', categoriesFilter.join(','))
      // or below approach //
      return this.http.get<ProductsResponse>(`${this.productBaseUrl}/get-products?categories=${categoriesFilter}`);
    }
    if(productsIds) {
      return this.http.get<ProductsResponse>(`${this.productBaseUrl}/get-products?productsIds=${productsIds}`);
    }
    if(searchStr) {
      return this.http.get<ProductsResponse>(`${this.productBaseUrl}/get-products?search=${searchStr}`);
    }
    // return this.http.get<ProductsResponse>(`${this.productBaseUrl}/get-products`, {params: params});
    return this.http.get<ProductsResponse>(`${this.productBaseUrl}/get-products`);
  }

  getFeaturedProducts(count: number, sort: number): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.productBaseUrl}/get-featured-products/${count}/${sort}`);
  }

  getProduct(productId: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.productBaseUrl}/get-product/${productId}`);
  }

  postProduct(productBody: FormData): Observable<ServerResponse> {
    return this.http.post<ServerResponse>(`${this.productBaseUrl}/post-product`, productBody);
  }

  updateProduct(productId: string, productBody: FormData): Observable<ServerResponse> {
    return this.http.put<ServerResponse>(`${this.productBaseUrl}/update-product/${productId}`, productBody);
  }

  updateGalleryOfProduct(productId: string, productBody: FormData): Observable<ServerResponse> {
    return this.http.put<ServerResponse>(`${this.productBaseUrl}/update-product-gallery/${productId}`, productBody);
  }

  deleteProduct(productId: string): Observable<ServerResponse> {
    return this.http.delete<ServerResponse>(`${this.productBaseUrl}/delete-product/${productId}`);
  }

  getProductsCount(): Observable<number> {
    return this.http.get<number>(`${this.productBaseUrl}/get-products-count`)
      .pipe(map((objectValue: any) => objectValue.productsCount));
  }
}
