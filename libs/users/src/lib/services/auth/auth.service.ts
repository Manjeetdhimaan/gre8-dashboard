import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '@env/environment';

export interface LoginResponse {
  message: string;
  success: boolean;
  _id: string;
  token: string
}

const TOKEN = 'token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isUserCheckingOut = false;
  isAdminLogin = false;
  isUserLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  authBaseUrl = `${environment.apiBaseUrl}/users`;

  constructor( private http: HttpClient, private router: Router ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    console.log('user login')
    return this.http.post<LoginResponse>(`${this.authBaseUrl}/user-login`, {email, password});
  }

  adminLogin(email: string, password: string): Observable<LoginResponse> {
    console.log('Admin login')
    return this.http.post<LoginResponse>(`${this.authBaseUrl}/admin-login`, {email, password});
  }

  logout() {
    this.deleteToken();
  }

  // localStorage token handling
  setToken(token: string) {
    localStorage.setItem(TOKEN, token);
  }

  getToken() {
    return localStorage.getItem(TOKEN);
  }

  deleteToken() {
    localStorage.removeItem(TOKEN);
    this.router.navigate(['/login']);
    this.isUserLoggedIn$.next(false);
  }

  getUserPayload() {
    const token = this.getToken();
    if (token) {
      const userPayload = atob(token.split('.')[1]);
      if(userPayload) {
        return JSON.parse(userPayload);
      }
      return null;
    }
    else
      return null;
  }

  isAdminLoggedIn() {
    const userPayload = this.getUserPayload();
    if (userPayload && userPayload.isAdmin)
      return userPayload.exp > Date.now() / 1000;
    else{
      return false;
    }
  }

  isUserLoggedIn() {
    const userPayload = this.getUserPayload();
    if (userPayload && userPayload.exp > Date.now() / 1000){
      this.isUserLoggedIn$.next(true);
      return userPayload.exp > Date.now() / 1000;
    }
    else{
      return false;
    }
  }
}
