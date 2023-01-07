import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject, map } from "rxjs";
import { DummyDataInterface } from "../interfaces/dummyData";

@Injectable({
  providedIn: "root",
})
export class HttpService implements OnDestroy {
  // Broadcaster
  responseSubject = new BehaviorSubject<DummyDataInterface[]>([]);
  unsubscribe$: Subject<boolean> = new Subject<boolean>();
  captionsArray: any = [];

  constructor(private _http: HttpClient) {}

  populateCaptions(pageNum: number, pageLimit: number) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<DummyDataInterface[]>(
        `/api/getCaptions/?page=${pageNum}?&limit=${pageLimit}`,
        httpOptions
      )
      .pipe(
        map((responseData) => {
          let allProjects: any = [];
          console.log(responseData);
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

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
