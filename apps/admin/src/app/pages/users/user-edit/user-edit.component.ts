import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { timer } from 'rxjs';

import { User, UserResponse, UserService } from '@manjeet-ecommerce/users';
import { SuccessResponse } from '../../categories/category-edit/category-edit.component';

@Component({
  selector: 'admin-user-edit',
  templateUrl: './user-edit.component.html',
  styles: [],
})
export class UserEditComponent {

  editMode = false;
  submitted = false;
  isLoading = false;
  isError = false;
  userForm: FormGroup;
  countries:{_id: string, name: string}[] = [];
  userId: string

  constructor(private fb: FormBuilder, private userService: UserService, private messageService: MessageService, private location: Location, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this._initForm();
    this._getCountries();
    this.activatedRoute.params.subscribe((param: Params) => {
      if (param['id']) {
        this.editMode = true;
        this.userId = param['id'];
        this._getUser(this.userId);
        this.f['password'].setValidators(null);
        this.f['password'].updateValueAndValidity();
      }
      else {
        this.editMode = false;
        this.userId = '';
      }
    })
  }

  get f() {
    return this.userForm.controls;
  }

  private _initForm() {
    this.userForm = this.fb.group({
      name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      isAdmin: new FormControl(false),
      phone: new FormControl(null, [Validators.required]),
      street: new FormControl(null),
      city: new FormControl(null),
      zip: new FormControl(null),
      apartment: new FormControl(null),
      country: new FormControl(null)
    })
  }

  private _getCountries() {
    this.countries = this.userService.getCountries();
  }

  private _postUser(userForm: User) {
    this.userService.postUser(userForm).subscribe(
      (res: SuccessResponse) => {
        this.isLoading = false;
        this.isError = false;
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
          // this.router.navigate(['/users']);
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

  private _getUser(userId: string) {
    this.isLoading = true;
    this.userService.getUser(userId).subscribe((res: UserResponse) => {
      this.userForm.patchValue({
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        isAdmin: res.user.isAdmin,
        street: res.user.address?.street,
        zip: res.user.address?.zip,
        apartment: res.user.address?.apartment,
        country: res.user.address?.country,
        city: res.user.address?.city
      });
      this.isLoading = false;
      this.isError = false;
    }, err => {
      this.isLoading = false;
      this.isError = true;
      this._errorHandler(err);
    });
  }

  private _updateUser(user: User) {
    this.userService.updateUser(this.userId, user).subscribe(
      (res: SuccessResponse) => {
        this.isLoading = false;
        this.isError = false;
        if (res.success) {
          this.messageService.add({severity:'success', summary:'Success', detail: res['message']});
          // this.router.navigate(['/users']);
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

  onSubmitForm() {
    this.submitted = true;
    if (!this.userForm.valid) return;
    this.isLoading = true;
    if (this.editMode) {
      this._updateUser(this.userForm.value);
    }
    else {
      this._postUser(this.userForm.value);
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
