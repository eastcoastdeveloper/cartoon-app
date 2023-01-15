import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject, map, catchError } from "rxjs";
import { UserDataInterface } from "../interfaces/user-data.interface";

@Injectable({
  providedIn: "root",
})
export class HttpService implements OnDestroy {
  responseSubject = new BehaviorSubject<UserDataInterface[]>([]);
  unsubscribe$: Subject<boolean> = new Subject<boolean>();
  captionsArray: any = [];

  constructor(private _http: HttpClient) {}

  // Get Captions
  populateCaptions(pageNum: number, pageLimit: number) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<UserDataInterface[]>(
        `/api/getCaptions/?page=${pageNum}?&limit=${pageLimit}`,
        httpOptions
      )
      .pipe(
        map((responseData) => {
          let allProjects: any = [];
          Object.keys(responseData).filter((currentVal, index) => {
            if (currentVal === "results") {
              allProjects = Object.values(responseData)[index];
              allProjects.map((val: any) => {
                val.cached = true;
              });
            }
          });
          allProjects.map((val: any) => {
            this.captionsArray.push(val);
          });
        })
      )
      .subscribe(() => {
        this.responseSubject.next(this.captionsArray);
      });
  }

  // Post New Vote
  updateVoteCount(newUpVote: UserDataInterface) {
    const headers = { "content-type": "application/json" };
    const body = JSON.stringify(newUpVote);
    console.log(body);
    return this._http
      .post<any>("/api/update-caption-vote", body, {
        headers: headers,
        observe: "response",
        reportProgress: true,
      })
      .pipe(
        catchError((err) => {
          console.log(err);
          throw err;
        })
      );
  }

  // Post Form Results
  postFormResults(formData: UserDataInterface) {
    const headers = { "content-type": "application/json" };
    const body = JSON.stringify(formData);
    return this._http
      .post<any>("/api/form-submission", body, {
        headers: headers,
        observe: "response",
        reportProgress: true,
      })
      .pipe(
        catchError((err) => {
          console.log(err);
          throw err;
        })
      );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
