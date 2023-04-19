import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthData } from "../interfaces/auth-data";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private _http: HttpClient) {}

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this._http.post("/api/user/signup", authData).subscribe((response) => {
      console.log(response);
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this._http.post("/api/user/login", authData).subscribe((response) => {
      console.log(response);
    });
  }
}
