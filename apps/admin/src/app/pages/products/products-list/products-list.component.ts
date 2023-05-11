import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Product, ServerResponse } from '@manjeet-ecommerce/products';
import { ProductService, ProductsResponse } from '@manjeet-ecommerce/products';

@Component({
  selector: 'admin-products-list',
  templateUrl: './products-list.component.html',
  styles: [],
})

export class ProductsListComponent implements OnInit {
  products:Product[] = [];
  isLoading = false;
  isError = false;
  isLoadingDelete = false;

  constructor(private productService: ProductService, private messageService: MessageService, private router: Router, private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
      this._getProducts();
  }

  _getProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe((res: ProductsResponse) => {
      this.products = res['products'];
      this.isLoading = false;
      this.isError = false;
    }, err => {
      this.isLoading = false;
      this.isError = true;
      this._errorHandler(err);
    })
  }

  onDeleteProduct(productId: string, product:any) {
    this.isError = false;
    this.confirmationService.confirm({
      message: 'Are you sure to delete product ' + product.name + '?',
      header: 'Delete Product ' + product.name + '?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isLoadingDelete = true;
        this.productService.deleteProduct(productId).subscribe(
          (res: ServerResponse) => {
            this.isLoadingDelete = false;
            this.isError = false;
            if (res.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: res['message'],
              });
              this.products.splice(
                this.products.indexOf(product),
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

  onUpdateProduct(productId: string) {
    this.router.navigate([`products/edit/${productId}`]);
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
