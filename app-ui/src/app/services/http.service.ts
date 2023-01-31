import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject, map, catchError } from "rxjs";
import { LocalStorageInterface } from "../interfaces/local-storage.interface";
import {
  CaptionsInterface,
  UserDataInterface,
} from "../interfaces/user-data.interface";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
  providedIn: "root",
})
export class HttpService implements OnDestroy {
  responseSubject = new BehaviorSubject<UserDataInterface>({
    objectID: "",
    imageURL: "",
    altText: "",
    totalCaptions: 4,
    captions: [],
    cached: false,
  });
  unsubscribe$: Subject<boolean> = new Subject<boolean>();
  storageObject: LocalStorageInterface = new LocalStorageInterface();

  // Update/ Deleted
  captionsArray: any = [];

  cartoonDataObject: UserDataInterface = {
    objectID: "",
    imageURL: "",
    altText: "",
    totalCaptions: 4,
    captions: [],
    cached: false,
  };

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

    // There IS Cache
    if (storage != "") {
      let parsed = JSON.parse(storage);
      this.storageObject = parsed;

      // If Requested Captions Group is Cached
      if (this.storageObject.hasOwnProperty(captionsGroupIndex)) {
        this.captionsArray = this.storageObject[captionsGroupIndex];
        this.responseSubject.next(this.captionsArray);
      }

      // Requested Group Called First Time
      else {
        new Promise((resolve) => {
          this.populateCaptions(toonReference, captionsGroupIndex, pageLimit);
          resolve(this.saveNewlyCachedData(captionsGroupIndex));
        });
      }
    }

    // There's NOTHING Cached
    else {
      this.populateCaptions(toonReference, captionsGroupIndex, pageLimit);
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
  populateCaptions(
    toonReference: string | number,
    captionsGroupIndex: number,
    pageLimit: number
  ) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    console.log(toonReference);
    console.log(captionsGroupIndex);
    console.log(pageLimit);

    return this._http
      .get<UserDataInterface[]>(
        `/api/getCaptions/?toonReference=${toonReference}&captionsGroupIndex=${captionsGroupIndex}&pageLimit=${pageLimit}`,
        httpOptions
      )
      .pipe(
        map((responseData) => {
          // let cartoonDataObject: any = [];
          Object.keys(responseData).filter((currentVal, index) => {
            if (currentVal === "results") {
              this.cartoonDataObject = Object.values(responseData)[index];
              // cartoonDataObject.map((val: any) => {
              this.cartoonDataObject.cached = true;
              console.log(this.cartoonDataObject);
              // });
            }
          });
          // cartoonDataObject.map((val: any) => {
          //   this.captionsArray.push(val.captions);
          // });
          // this.storageObject[captionsGroupIndex] = this.captionsArray;
          // this._localStorageService.saveData(
          //   "captions",
          //   JSON.stringify(this.storageObject)
          // );
        })
      )
      .subscribe(() => {
        this.responseSubject.next(this.cartoonDataObject);
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
