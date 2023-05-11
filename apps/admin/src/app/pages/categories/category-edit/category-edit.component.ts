import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { timer } from 'rxjs';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { MessageService } from 'primeng/api';

import { CategoriesService, Category, CategoryResponse } from '@manjeet-ecommerce/products';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

export interface SuccessResponse {
  success: boolean;
  message: string;
}

@Component({
  selector: 'admin-category-edit',
  templateUrl: './category-edit.component.html',
  styles: []
})
export class CategoryEditComponent implements OnInit {
  form: FormGroup;
  categoryId: string;
  submit = false;
  isLoading = false;
  isError = false;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoriesService,
    private location: Location,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
      icon: new FormControl('', [Validators.required]),
      color: new FormControl('#333'),
    });
    this.activatedRoute.params.subscribe((param: Params) => {
      if(param['id']){
        this.editMode = true;
        this.categoryId = param['id'];
        this._getCategory(this.categoryId);
      }
      else {
        this.editMode = false;
        this.categoryId = '';
      }
    })
  }

  get f() {
    return this.form.controls;
  }

  onSubmitForm() {
    this.submit = true;
    this.isError = false;
    if (!this.form.valid) {
      return;
    }
    this.isLoading = true;
    if(this.editMode) {
      this._updateCategory(this.form.value);
    }
    else {
      this._postCategory(this.form.value);
    }
  }

  private _updateCategory(category: Category) {
    this.categoryService.updateCategory(this.categoryId, category).subscribe(
      (res: SuccessResponse) => {
        this.isLoading = false;
        this.isError = false;
        if (res.success) {
          this.messageService.add({severity:'success', summary:'Success', detail: res['message']});
          // this.router.navigate(['/categories']);
          timer(1000).toPromise().then(() => {
            this.location.back();
          })
        }
      },
      (err) => {
        this.isLoading = false;
        this.isError = true;
        this._errorHandler(err);
      }
    );
  }

  private _postCategory(category: Category) {
    this.categoryService.postCategory(category).subscribe(
      (res: SuccessResponse) => {
        this.isLoading = false;
        this.isError = false;
        if (res.success) {
          this.messageService.add({severity:'success', summary:'Success', detail: res['message']});
          // this.router.navigate(['/categories']);
          timer(1000).toPromise().then(() => {
            this.location.back();
          })
        }
      },
      (err) => {
        this.isLoading = false;
        this.isError = true;
        this._errorHandler(err);
      }
    );
  }

  private _getCategory(categoryId: string) {
    this.isLoading = true;
    this.categoryService.getCategory(categoryId).subscribe((res: CategoryResponse) => {
      this.form.patchValue({
        name: res.category.name,
        icon: res.category.icon,
        color: res.category.color
      });
      this.isLoading = false;
        this.isError = false;
    }, err => {
      this.isLoading = false;
        this.isError = true;
        this._errorHandler(err);
    });
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
