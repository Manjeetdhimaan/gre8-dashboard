import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { usersRoutes } from './lib.routes';
import { LoginComponent } from './pages/login/login.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(usersRoutes),
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule
  ],
  declarations: [LoginComponent]
})
export class UsersModule { }
