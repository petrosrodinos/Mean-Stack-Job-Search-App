import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { environment } from "../../environments/environment";
import { AuthData } from "./auth-data.model";

const BACKEND_URL = environment.apiUrl + "/user/";

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private userEmail: string;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUserEmail() {
    return this.userEmail;
  }

  createUser(
    email: string,
    password: string,
    address: string,
    number: string,
    image: File
  ) {
    const authData = new FormData();
    authData.append("email", email);
    authData.append("password", password);
    authData.append("address", address);
    authData.append("number", number);
    authData.append("image", image, address);
    // const authData = {
    //   email: email,
    //   password: password,
    //   address,
    //   number,
    //   image,
    // };
    this.http
      .post<{
        token: string;
        expiresIn: number;
        userId: string;
        email: string;
      }>(BACKEND_URL + "/signup", authData)
      .subscribe(
        (response) => {
          this.loggingUser(response);
        },
        (error) => {
          console.log(error);
          this.authStatusListener.next(false);
        }
      );
  }

  login(email: string, password: string) {
    const authData = { email: email, password: password };
    this.http
      .post<{
        token: string;
        expiresIn: number;
        userId: string;
        email: string;
      }>(BACKEND_URL + "/login", authData)
      .subscribe(
        (response) => {
          this.loggingUser(response);
        },
        (error) => {
          this.authStatusListener.next(false);
        }
      );
  }

  private loggingUser(response: {
    token: string;
    expiresIn: number;
    userId: string;
    email: string;
  }) {
    const token = response.token;
    this.token = token;
    if (token) {
      const expiresInDuration = response.expiresIn;
      this.setAuthTimer(expiresInDuration);
      this.isAuthenticated = true;
      this.userId = response.userId;
      this.userEmail = response.email;
      this.authStatusListener.next(true);
      const now = new Date();
      const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
      this.saveAuthData(token, expirationDate, this.userId, response.email);
      this.router.navigate(["/"]);
    }
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }

  private setAuthTimer(duration: number) {
    console.log("Setting timer: " + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userId: string,
    email: string
  ) {
    // localStorage.setItem("token", token);
    // localStorage.setItem("expiration", expirationDate.toISOString());
    // localStorage.setItem("userId", userId);
    const authData = {
      token: token,
      expiration: expirationDate.toISOString(),
      userId: userId,
      email: email,
    };
    localStorage.setItem("authData", JSON.stringify(authData));
  }

  private clearAuthData() {
    localStorage.removeItem("authData");
  }

  private getAuthData() {
    const authData = JSON.parse(localStorage.getItem("authData"));
    const token = authData.token;
    const expirationDate = authData.expiration;
    const userId = authData.userId;
    const email = authData.email;
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      email: email,
    };
  }
}
