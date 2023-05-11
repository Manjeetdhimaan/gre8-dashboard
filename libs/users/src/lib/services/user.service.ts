import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ServerResponse } from '@manjeet-ecommerce/products';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';

import * as countriesLib from 'i18n-iso-countries';
declare const require: any;

export interface UsersResponse {
  success: boolean;
  message: string;
  users: User[];
}

export interface UserResponse {
  success: boolean;
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userBaseUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {
    countriesLib.registerLocale(require('i18n-iso-countries/langs/en.json'));
   }

  getUsers():Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.userBaseUrl}/get-users`);
  }

  getUser(userId: string):Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.userBaseUrl}/get-user/${userId}`);
  }

  getUserProfile():Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.userBaseUrl}/get-user-profile`);
  }

  getUsersCount(): Observable<number> {
    return this.http.get<number>(`${this.userBaseUrl}/get-users-count`)
      .pipe(map((objectValue: any) => objectValue.userCount));
  }

  postUser(userBody: User):Observable<ServerResponse> {
    return this.http.post<ServerResponse>(`${this.userBaseUrl}/post-user`, userBody);
  }

  updateUser(userId: string, userBody: User):Observable<ServerResponse> {
    return this.http.put<ServerResponse>(`${this.userBaseUrl}/update-user/${userId}`, userBody);
  }

  deleteUser(userId: string):Observable<ServerResponse> {
    return this.http.delete<ServerResponse>(`${this.userBaseUrl}/delete-user/${userId}`);
  }

  getCountries(): { _id: string; name: string }[] {
    return Object.entries(countriesLib.getNames('en', { select: 'official' })).map((entry) => {
      return {
        _id: entry[0],
        name: entry[1]
      };
    });
  }

  getCountry(countryKey: string): string {
    return countriesLib.getName(countryKey, 'en');
  }

}
