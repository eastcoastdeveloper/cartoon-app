import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject, map, catchError } from "rxjs";
import { LocalStorageInterface } from "../interfaces/local-storage.interface";
import { UserDataInterface } from "../interfaces/user-data.interface";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
  providedIn: "root",
})
export class HttpService implements OnDestroy {
  responseSubject = new BehaviorSubject<UserDataInterface[]>([]);
  unsubscribe$: Subject<boolean> = new Subject<boolean>();
  storageObject: LocalStorageInterface = new LocalStorageInterface();
  captionsArray: any = [];

  constructor(
    private _http: HttpClient,
    private _localStorageService: LocalStorageService
  ) {}

  captionsCacheCheck(
    toonReference: string | number,
    captionsGroupIndex: number,
    pageLimit: number
  ) {
    const storage = this._localStorageService.getData("captions");
    this.captionsArray = [];
    console.log(toonReference);

    // There IS Cache
    if (storage != "") {
      let parsed = JSON.parse(storage);
      this.storageObject = parsed;

      // If Requested Captions Group is Cached
      if (this.storageObject.hasOwnProperty(captionsGroupIndex)) {
        console.log("fired");
        this.captionsArray = this.storageObject[captionsGroupIndex];
        this.responseSubject.next(this.captionsArray);
      }

      // Requested Group Called First Time
      else {
        new Promise((resolve) => {
          this.populateCaptions(captionsGroupIndex, pageLimit);
          resolve(this.saveNewlyCachedData(captionsGroupIndex));
        });
      }
    }

    // There's NOTHING Cached
    else {
      this.populateCaptions(captionsGroupIndex, pageLimit);
    }
  }

  // Cache GET Request
  saveNewlyCachedData(captionsGroupIndex: number) {
    this.storageObject[captionsGroupIndex] = this.captionsArray;
    this._localStorageService.saveData(
      "captions",
      JSON.stringify(this.storageObject)
    );
  }

  // Get Captions
  populateCaptions(captionsGroupIndex: number, pageLimit: number) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<UserDataInterface[]>(
        `/api/getCaptions/?page=${captionsGroupIndex}?&limit=${pageLimit}`,
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
            this.captionsArray.push(val.captions);
          });
          console.log(this.captionsArray);
          this.storageObject[captionsGroupIndex] = this.captionsArray;
          this._localStorageService.saveData(
            "captions",
            JSON.stringify(this.storageObject)
          );
        })
      )
      .subscribe(() => {
        this.responseSubject.next(this.captionsArray);
      });
  }

  // Post New Vote
  updateVoteCount(data: UserDataInterface) {
    this._http
      .post<UserDataInterface>("/api/updateVoteCount", {
        title: "User Up or Down Voted",
      })
      .subscribe((data) => {
        console.log(data);
      });
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
