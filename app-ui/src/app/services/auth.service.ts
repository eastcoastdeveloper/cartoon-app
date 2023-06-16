import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthData } from "../interfaces/auth-data";
import { BehaviorSubject, Subject, catchError, map, of } from "rxjs";
import { Router } from "@angular/router";
import { LocalStorageService } from "./local-storage.service";
import { error } from "console";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private token: string | null;
  private isAuthenticated = false;
  private hasRole = false;
  private tokenTimer: any;
  private userId: string | null;
  private username: string | null;
  private authStatusListener = new Subject<boolean>();
  private hasRoleListener = new Subject<boolean>();
  private roles: number[] = [];

  resetPassword$ = new BehaviorSubject<{
    username: string;
    password: string;
    email: string;
  }>({ username: "", password: "", email: "" });

  // errorMsg: string;
  emailMessage$ = new BehaviorSubject<{ message: string }>({ message: "" });
  userObject: any;
  badCredentials$ = new Subject<boolean>();
  username$ = new BehaviorSubject<string | null>(null);
  registrationSubject$ = new BehaviorSubject<{
    message?: string;
    result?: { email: string; password: string };
  }>({ message: "", result: { email: "", password: "" } });

  constructor(
    private _http: HttpClient,
    private _router: Router,
    private _localStorage: LocalStorageService
  ) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getRole() {
    return this.hasRole;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getHasRoleListener() {
    return this.hasRoleListener.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  createUser(
    username: string,
    email: string,
    password: string,
    city: string,
    state: string,
    country: string,
    showLocation: boolean,
    showCountry: boolean,
    captions: []
  ) {
    const authData: AuthData = {
      username: username,
      email: email,
      password: password,
      city: city,
      state: state,
      country: country,
      showLocation: showLocation,
      showCountry: showCountry,
      captions: [],
    };
    this._http.post("/api/user/signup", authData).subscribe({
      next: (value) => {
        console.log(value);
        this.registrationSubject$.next(value);
      },
      error: (err) => {
        console.log("User already exists");
        this.registrationSubject$.next({ message: "Username already exists" });
      },
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    return this._http
      .post<{
        token: string;
        expiresIn: number;
        userId: string;
        username: string;
        roles: [user: number];
      }>("/api/user/login", authData)
      .subscribe({
        next: (response) => {
          const token = response.token;
          this.token = token;
          if (token) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.username = response.username;
            this.username$.next(this.username);
            this.authStatusListener.next(true);
            this.roles = response.roles;

            this.roles.map((user) => {
              if (user === 5015) {
                this.hasRole = true;
                this.hasRoleListener.next(this.hasRole);
                return;
              } else {
                this.hasRole = false;
                this.hasRoleListener.next(this.hasRole);
              }
            });

            const now = new Date();
            this.getRole();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData(
              token,
              expirationDate,
              this.userId,
              this.username
            );
            this._router.navigate(["/"]);
          }
        },
        error: (err) => {
          this.badCredentials$.next(true);
        },
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn =
      authInformation?.expirationDate.getTime()! - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation?.token!;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.username = authInformation.username;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.username$.next(this.username);
    }
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      username: username,
    };
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.username$.next(null);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this._router.navigate(["/"]);
  }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userId: string,
    username: string
  ) {
    this._localStorage.saveData("token", token);
    this._localStorage.saveData("expiration", expirationDate.toISOString());
    this._localStorage.saveData("userId", userId);
    this._localStorage.saveData("username", username);
  }

  private clearAuthData() {
    this._localStorage.removeData("token");
    this._localStorage.removeData("expiration");
    this._localStorage.removeData("userId");
    this._localStorage.removeData("username");
  }

  forgotPassword(email: string) {
    const body = { email: email };
    return this._http
      .post<{ message: string }>("api/reset/forgot", body)
      .pipe()
      .subscribe((obj) => {
        this.emailMessage$.next(obj);
      });
  }

  resetPassword(id: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<AuthData>(`/api/reset/${id}/${token}`, httpOptions)
      .subscribe((item) => {
        this.userObject = item;
        this.resetPassword$.next(this.userObject);
        console.log(this.userObject);
      });
  }

  updatePass(id: string, token: string, password: string) {
    const body = { password: password };
    return this._http
      .post<{ value: string }>(`/api/reset/${id}/${token}`, body)
      .subscribe((val) => {
        console.log(val);
      });
  }
}
