import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject, catchError, map, takeUntil, throwError } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class EmailService {
  private unsubscribe$: Subject<boolean> = new Subject<boolean>();

  constructor(private _http: HttpClient) {}

  sendEmail(userId: string, userMessage: string) {
    const data = {
      userReference: userId,
      message: userMessage,
    };

    return this._http
      .post<string>("/api/email", data)
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((err) => {
          return throwError(() => new Error("timed out"));
        })
      )
      .subscribe({
        next: (data) => {
          console.log(data);
        },
        error: (value) => {
          console.log(value);
        },
      });
  }
}
