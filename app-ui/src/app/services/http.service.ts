import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject, map } from "rxjs";
import { UserDataInterface } from "../interfaces/dummyData";

@Injectable({
  providedIn: "root",
})
export class HttpService implements OnDestroy {
  // Broadcaster
  responseSubject = new BehaviorSubject<UserDataInterface[]>([]);
  unsubscribe$: Subject<boolean> = new Subject<boolean>();
  captionsArray: any = [];

  constructor(private _http: HttpClient) {}

  /* ############################## */
  /*        Get Captions            */
  /* ############################## */
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

  /* ############################## */
  /*         Post New Vote          */
  /* ############################## */
  updateVoteCount(data: UserDataInterface) {
    this._http
      .post<UserDataInterface>("/api/updateVoteCount", {
        title: "User Up or Down Voted",
      })
      .subscribe((data) => {
        console.log(data);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
