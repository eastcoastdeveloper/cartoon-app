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

  fetchDummyData() {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<DummyDataInterface[]>("/api", httpOptions)
      .pipe(map((responseData) => {
        let allProjects:any = [];
          Object.keys(responseData).filter((currentVal, index) => {
            if (currentVal === "data") {
              allProjects = Object.values(responseData)[index];
              allProjects.map((val:any) => {
                val.cached = true;
              });
            }
          });
          allProjects.map((val:any) => {
            this.captionsArray.push(val);
          });
        }))
        .subscribe(() => {
        this.responseSubject.next(this.captionsArray);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
