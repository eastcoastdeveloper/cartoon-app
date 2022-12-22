import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DummyDataInterface } from "../interfaces/dummyData";

@Injectable({
  providedIn: "root",
})
export class HttpService {
  // Broadcaster
  responseSubject = new BehaviorSubject<DummyDataInterface[]>([]);

  constructor(private _http: HttpClient) {}

  fetchDummyData() {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<DummyDataInterface[]>("assets/dummyData.json", httpOptions)
      .subscribe((data) => {
        this.responseSubject.next(data);
      });
  }
}
