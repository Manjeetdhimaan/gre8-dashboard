import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { timer } from 'rxjs';

import { CategoriesResponse, CategoriesService, Category, ProductResponse, ProductService } from '@manjeet-ecommerce/products';
import { SuccessResponse } from '../../categories/category-edit/category-edit.component';

@Component({
  selector: 'admin-products-list',
  templateUrl: './products-edit.component.html',
  styles: [],
})
export class ProductsEditComponent implements OnInit {
  editMode = false;
  submitted = false;
  isLoading = false;
  isError = false;
  productForm: FormGroup;
  productGalleryForm: FormGroup;
  categories: Category[] = [];
  imagePreview: string | ArrayBuffer;
  productId: string;
  images: string[] = [];

  constructor(private fb: FormBuilder, private categoryService: CategoriesService, private messageService: MessageService, private productService: ProductService, private location: Location, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this._initForm();
    this.activatedRoute.params.subscribe((param: Params) => {
      if (param['id']) {
        this.editMode = true;
        this.productId = param['id'];
        this._getProduct(this.productId);
        // this._getCategories();
        this.f['image'].setValidators(null);
        this.f['image'].updateValueAndValidity();
      }
      else {
        this.editMode = false;
        this.productId = '';
        // this._getCategories();
      }
    })
  }

  get f() {
    return this.productForm.controls;
  }

  get catgoriesControls() {
    return (this.productForm.get('categories') as FormArray).controls;
  }

  private _initForm() {
    this.productForm = this.fb.group({
      name: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      mrpPrice: new FormControl(''),
      category: new FormControl(''),
      author: new FormControl(''),
      countInStock: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      richDescription: new FormControl(''),
      image: new FormControl('', [Validators.required]),
      images: new FormControl([]),
      categories: new FormArray([]),
      isFeatured: new FormControl(false)
    });

    this.productGalleryForm = this.fb.group({
      images: new FormControl('')
    })
  }

  private _getCategories() {
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

  private _postProduct(productForm: FormData) {
    this.productService.postProduct(productForm).subscribe(
      (res: SuccessResponse) => {
        this.isLoading = false;
        this.isError = false;
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
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

  private _getProduct(productId: string) {
    this.isLoading = true;
    this.productService.getProduct(productId).subscribe((res: ProductResponse) => {
      this.productForm = new FormGroup({
        name: new FormControl(res.product.name, Validators.required),
        image: new FormControl(res.product.image, Validators.required),
        price: new FormControl(res.product.currentPrice, Validators.required),
        mrpPrice: new FormControl(res.product.mrpPrice? res.product.mrpPrice : ''),
        author: new FormControl(res.product.author),
        countInStock: new FormControl(res.product.countInStock),
        description: new FormControl(res.product.description),
        richDescription: new FormControl(res.product.richDescription),
        isFeatured: new FormControl(res.product.isFeatured),
        categories: new FormArray(
          res.product?.['categories'].map((x: any) => {
            return new FormGroup({
              categoryName: new FormControl(x)
            })
          })
        )
      });

      this.imagePreview = res.product.image;
      this.images = res.product.images[0] ? res.product.images[0].imageUrls : [];
      this.isLoading = false;
      this.isError = false;
    }, err => {
      this.isLoading = false;
      this.isError = true;
      this._errorHandler(err);
    });
  }

  private _updateProduct(product: FormData) {
    this.productService.updateProduct(this.productId, product).subscribe(
      (res: SuccessResponse) => {
        this.isLoading = false;
        this.isError = false;
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
          // this.router.navigate(['/categories']);
          // timer(1000).toPromise().then(() => {
          //   this.location.back();
          // })
        }
      },
      (err) => {
        this.isLoading = false;
        this.isError = true;
        this._errorHandler(err);
      }
    );
  }

  onAddCategory() {
    (<FormArray>this.productForm.get('categories')).push(
      new FormGroup({
        categoryName: new FormControl(null, Validators.required)
      })
    );
  }

  onDeleteCategory(index: number) {
    (<FormArray>this.productForm.get('categories')).removeAt(index);
  }

  onSubmitForm() {
    this.submitted = true;
    let categories: any[] = [];
    this.productForm.value.categories.forEach((val: any) => {
      categories.push(val.categoryName)
    });
    if (!this.productForm.valid) return;
    this.isLoading = true;
    const productFormData = new FormData();
    Object.keys(this.f).map(key => {
      if(key != 'categories') {
        productFormData.append(key, this.f[key].value);
      }
    });

    if (categories.length > 0) {
      productFormData.append('categories', JSON.stringify(categories));
    }
    if (this.editMode) {
      this._updateProduct(productFormData);
    }
    else {
      this._postProduct(productFormData);
    }
  }

  onImageSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.productForm.patchValue({
        image: file
      });
      this.productForm.get('image')?.updateValueAndValidity();
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.imagePreview = fileReader.result as string;
      }
      fileReader.readAsDataURL(file);
    }
  }

  onGalleyImagesSelect(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.productGalleryForm.patchValue({
        images: files
      });
      this.productGalleryForm.get('images')?.updateValueAndValidity();

      for (let i = 0; i <= files.length; i++) {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          this.images.push(fileReader.result as string);
        }
        if (files[i]) {
          fileReader.readAsDataURL(files[i]);
        }
      }
    }
  }

  private _updateGalleryOfProduct(product: FormData) {
    this.productService.updateGalleryOfProduct(this.productId, product).subscribe(
      (res: SuccessResponse) => {
        this.isLoading = false;
        this.isError = false;
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
          // this.router.navigate(['/categories']);
          // timer(1000).toPromise().then(() => {
          //   this.location.back();
          // })
        }
      },
      (err) => {
        this.isLoading = false;
        this.isError = true;
        this._errorHandler(err);
      }
    );
  }

  onSubmitGalleryForm() {
    this.submitted = true;
    if (!this.productGalleryForm.valid) return;
    this.isLoading = true;
    const productFormData = new FormData();
    if (this.productGalleryForm.controls['images'].value) {
      const filesLength: number = this.productGalleryForm.controls['images'].value.length;
      for (let i = 0; i <= filesLength; i++) {
        productFormData.append('images', this.productGalleryForm.controls['images'].value[i]);
      }
      if (this.editMode) {
        this._updateGalleryOfProduct(productFormData);
      }
    }
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
