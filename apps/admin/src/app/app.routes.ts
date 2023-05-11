import { Route } from '@angular/router';
import { AdminAuthGuard } from '@manjeet-ecommerce/users';
import { CategoriesListComponent } from './pages/categories/categories-list/categories-list.component';
import { CategoryEditComponent } from './pages/categories/category-edit/category-edit.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OrderDetailComponent } from './pages/orders/order-detail/order-detail.component';
import { OrdersListComponent } from './pages/orders/orders-list/orders-list.component';
import { ProductsEditComponent } from './pages/products/products-edit/products-edit.component';
import { ProductsListComponent } from './pages/products/products-list/products-list.component';
import { UserEditComponent } from './pages/users/user-edit/user-edit.component';
import { UsersListComponent } from './pages/users/users-list/users-list.component';
import { ShellComponent } from './shared/shell/shell.component';

export const appRoutes: Route[] = [
  {
    path: '', component: ShellComponent, data: { title: 'Admin Panel' },
      canActivate: [AdminAuthGuard],
      children: [
        {
          path: '', component: DashboardComponent,
        },
        {
          path: 'categories', component: CategoriesListComponent
        },
        {
          path: 'categories/new', component: CategoryEditComponent
        },
        {
          path: 'categories/edit/:id', component: CategoryEditComponent
        },
        {
          path: 'products', component: ProductsListComponent
        },
        {
          path: 'products/new', component: ProductsEditComponent
        },
        {
          path: 'products/edit/:id', component: ProductsEditComponent
        },
        {
          path: 'users', component: UsersListComponent
        },
        {
          path: 'users/new', component: UserEditComponent
        },
        {
          path: 'users/edit/:id', component: UserEditComponent
        },
        {
          path: 'orders', component: OrdersListComponent
        },
        {
          path: 'orders/detail/:id', component: OrderDetailComponent
        },
        {
          path: '**', redirectTo: '', pathMatch: 'full'
        }
      ]
  }
];
