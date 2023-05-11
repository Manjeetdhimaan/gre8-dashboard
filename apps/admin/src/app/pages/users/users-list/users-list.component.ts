import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ServerResponse } from '@manjeet-ecommerce/products';

import { User, UserService, UsersResponse } from '@manjeet-ecommerce/users';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'admin-users-list',
  templateUrl: './users-list.component.html',
  styles: [],
})
export class UsersListComponent {
  isLoading = false;
  isError = false;
  isLoadingDelete = false;
  users: User[];

  globalFilterColumn = [
    'user\'s name',
    'email',
    'is admin',
    'actions'
  ];

  columns = [
    { header: 'User\'s Name', field: 'user\'s name', fieldName: 'user\'s name' },
    { header: 'Email', field: 'email', fieldName: 'email' },
    { header: 'Is Admin', field: 'is admin', fieldName: 'is admin' },
    { header: 'Actions', field: 'actions', fieldName: 'actions'}
  ];

  _selectedColumns: any[] = this.columns;

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.columns.filter((col) => val.includes(col));
  }

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this._getUsers();
  }

  private _getUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe(
      (res: UsersResponse) => {
        this.users = res['users'];
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

  getCountryName(countryKey: string) {
    if (countryKey) return this.userService.getCountry(countryKey);
    return;
  }

  onDeleteUser(userId: string, user: User) {
    this.isError = false;
    this.confirmationService.confirm({
      message: 'Are you sure to delete user ' + user.name + '?',
      header: 'Delete user ' + user.name + '?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isLoadingDelete = true;
        this.userService.deleteUser(userId).subscribe(
          (res: ServerResponse) => {
            this.isLoadingDelete = false;
            this.isError = false;
            if (res.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: res['message'],
              });
              this.users.splice(
                this.users.indexOf(user),
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

  onUpdateUser(userId: string) {
    this.router.navigate(['/users/edit/'+userId]);
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
