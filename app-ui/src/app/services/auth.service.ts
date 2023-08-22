import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { AuthData } from "../interfaces/auth-data";
import {
  BehaviorSubject,
  EMPTY,
  Subject,
  catchError,
  takeUntil,
  throwError,
} from "rxjs";
import { Router } from "@angular/router";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
  providedIn: "root",
})
export class AuthService implements OnDestroy {
  private authStatusListener = new Subject<boolean>();
  private unsubscribe$ = new Subject<void>();
  private token: string | null;
  private isAuthenticated = false;
  private tokenTimer: any;
  private userId: string | null;
  private username: string | null;
  private roles: number[] = [];

  hasRoleListener$ = new BehaviorSubject<boolean>(false);
  tokenExpired$ = new BehaviorSubject<boolean>(false);
  emailMessage$ = new BehaviorSubject<{ message: string }>({ message: "" });

  resetPassword$ = new BehaviorSubject<{
    username: string;
    password: string;
    email: string;
  }>({ username: "", password: "", email: "" });

  userObject: any;
  userLevel: string;
  badCredentials$ = new Subject<boolean>();
  username$ = new BehaviorSubject<string | null>(null);
  registrationSubject$ = new BehaviorSubject<{
    message?: string;
  }>({ message: "" });

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

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  createUser(
    username: string,
    email: string,
    password: string,
    showLocation: boolean,
    captions: []
  ) {
    const authData: AuthData = {
      username: username,
      email: email,
      password: password,
      captions: [],
    };
    this._http
      .post("/api/user/signup", authData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (value) => {
          this.registrationSubject$.next(value);
        },
        error: (err) => {
          this.registrationSubject$.next({
            message: "Username already exists",
          });
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
      .pipe(takeUntil(this.unsubscribe$))
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
            this.calculateRoles();

            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData(
              token,
              expirationDate,
              this.userId,
              this.username,
              this.userLevel
            );
            this._router.navigate(["/"]);
          }
        },
        error: (response) => {
          this.badCredentials$.next(true);
          return EMPTY;
        },
      });
  }

  /*
   ** Get date at time of login
   ** setInterval for every 3 minutes to check if elapsed time is 1 hr greater than logged in time
   ** if elapsed time is one hour or greater than logged in time, log out
   */

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

  calculateRoles() {
    this.roles.map((user) => {
      if (user === 5015) {
        this.userLevel = "true";
        this.hasRoleListener$.next(true);
        return;
      }
      if (user != 5015) {
        this.userLevel = "false";
        this.hasRoleListener$.next(false);
      }
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
      let boolString = authInformation.level;
      let boolValue = boolString === "true";
      this.hasRoleListener$.next(boolValue);
    }
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private getAuthData() {
    const token = this._localStorage.getData("tkn");
    const expirationDate = this._localStorage.getData("exp");
    const userId = this._localStorage.getData("refId");
    const username = this._localStorage.getData("uref");
    const level = this._localStorage.getData("level");

    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      username: username,
      level: level,
    };
  }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userId: string,
    username: string,
    userLevel: string
  ) {
    this._localStorage.saveData("tkn", token);
    this._localStorage.saveData("exp", expirationDate.toISOString());
    this._localStorage.saveData("refId", userId);
    this._localStorage.saveData("uref", username);
    this._localStorage.saveData("level", userLevel);
  }

  private clearAuthData() {
    this._localStorage.removeData("tkn");
    this._localStorage.removeData("exp");
    this._localStorage.removeData("refId");
    this._localStorage.removeData("uref");
    this._localStorage.removeData("level");
  }

  forgotPassword(email: string) {
    const body = { email: email };
    return this._http
      .post<{ message: string }>("api/reset/forgot", body)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (obj) => {
          this.emailMessage$.next(obj);
        },
        error: (err) => {
          this.emailMessage$.next({ message: "User does not exist." });
        },
      });
  }

  resetPassword(id: string, token: string) {
    this.tokenExpired$.next(false);
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<AuthData>(`/api/reset/${id}/${token}`, httpOptions)
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((err) => {
          this.tokenExpired$.next(true);
          this._router.navigateByUrl("/forgot-password");
          return throwError(err);
        })
      )
      .subscribe((item) => {
        this.userObject = item;
        this.resetPassword$.next(this.userObject);
      });
  }

  updatePass(id: string, token: string, password: string) {
    const body = { password: password };
    return this._http
      .post<{ value: string }>(`/api/reset/${id}/${token}`, body)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        console.log(val);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
