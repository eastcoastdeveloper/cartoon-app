import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthData } from "../interfaces/auth-data";
import { BehaviorSubject, Subject } from "rxjs";
import { Router } from "@angular/router";
import { Tokenresponse } from "../interfaces/token.interface";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private token: string | null;
  private isAuthenticated = false;
  private authStatusListener = new Subject<boolean>();

  badCredentials$ = new Subject<boolean>();
  registrationSubject$ = new BehaviorSubject<{
    message?: string;
    result?: { email: string; password: string };
  }>({ message: "", result: { email: "", password: "" } });

  constructor(private _http: HttpClient, private _router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
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
      .post<Tokenresponse>("/api/user/login", authData)
      .subscribe({
        next: (response) => {
          const token = response.token;
          this.token = token;
          if (token) {
            this.isAuthenticated = true;
            this.authStatusListener.next(true);
            this._router.navigate(["/"]);
          }
        },
        error: (err) => {
          this.badCredentials$.next(true);
        },
      });
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
  }
}
