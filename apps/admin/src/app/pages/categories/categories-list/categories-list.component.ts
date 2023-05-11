import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  CategoriesService,
  Category,
  CategoriesResponse,
  ServerResponse,
} from '@manjeet-ecommerce/products';
import {
  ConfirmationService,
  MessageService,
} from 'primeng/api';

@Component({
  selector: 'admin-category-list',
  templateUrl: './categories-list.component.html',
  styles: [],
})
export class CategoriesListComponent implements OnInit {
  categories: Category[] = [];
  isLoading = false;
  isLoadingDelete = false;
  isError = false;

  constructor(
    private categoryService: CategoriesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe(
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

  onDeleteCategory(categoryId: string, category: Category) {
    this.isError = false;
    this.confirmationService.confirm({
      message: 'Are you sure to delete catergry ' + category.name + '?',
      header: 'Delete Category ' + category.name + '?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isLoadingDelete = true;
        this.categoryService.deleteCategory(categoryId).subscribe(
          (res: ServerResponse) => {
            this.isLoadingDelete = false;
            this.isError = false;
            if (res.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: res['message'],
              });
              this.categories.splice(
                this.categories.indexOf(category),
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

  onUpdateCategory(categoryId: string) {
    this.router.navigate(['/categories/edit/'+categoryId]);
  }

  private _errorHandler(err: HttpErrorResponse) {
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
