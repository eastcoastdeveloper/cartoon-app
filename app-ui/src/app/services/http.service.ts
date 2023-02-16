import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject, map, catchError } from "rxjs";
import { IUser } from "../interfaces/form.interface";
import { LocalStorageInterface } from "../interfaces/local-storage.interface";
import { UserDataInterface } from "../interfaces/user-data.interface";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
  providedIn: "root",
})
export class HttpService implements OnDestroy {
  storageObject: LocalStorageInterface = new LocalStorageInterface();
  unsubscribe$: Subject<boolean> = new Subject<boolean>();
  cartoonDataObject: UserDataInterface;
  responseSubject = new BehaviorSubject<Array<UserDataInterface>>([]);

  // Update/ Deleted
  currentDataObject: any = [];

  constructor(
    private _http: HttpClient,
    private _localStorageService: LocalStorageService
  ) {}

  captionsCacheCheck(
    toonReference: string,
    captionsGroupIndex: number,
    pageLimit: number,
    itemIndex: number
  ) {
    const storage = this._localStorageService.getData("captions");
    this.currentDataObject = {};

    // There IS Cache
    if (storage != "") {
      let parsed = JSON.parse(storage);
      this.storageObject = Object.values(parsed);
      console.log(this.storageObject);

      // If Requested Captions Group is Cached
      if (this.storageObject.hasOwnProperty(captionsGroupIndex)) {
        this.currentDataObject = this.storageObject[captionsGroupIndex];
        this.responseSubject.next(this.currentDataObject);
        console.log(this.currentDataObject);
      }

      // Requested Group Called First Time
      else {
        new Promise((resolve) => {
          this.populateCaptions(
            toonReference,
            captionsGroupIndex,
            pageLimit,
            itemIndex
          );
          resolve(this.saveNewlyCachedData(captionsGroupIndex));
        });
      }
    }

    // There's NOTHING Cached
    else {
      this.populateCaptions(
        toonReference,
        captionsGroupIndex,
        pageLimit,
        itemIndex
      );
    }
  }

  // Cache GET Request
  saveNewlyCachedData(captionsGroupIndex: number) {
    this.storageObject[captionsGroupIndex] = this.currentDataObject;
    this._localStorageService.saveData(
      "captions",
      JSON.stringify(this.storageObject)
    );
  }

  // Get Captions
  populateCaptions(
    toonReference: string | number,
    captionsGroupIndex: number,
    pageLimit: number,
    itemIndex: number
  ) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<UserDataInterface[]>(
        `/api/getCaptions/?toonReference=${toonReference}&captionsGroupIndex=${captionsGroupIndex}&pageLimit=${pageLimit}&itemIndex=${itemIndex}`,
        httpOptions
      )
      .pipe(
        map((responseData) => {
          console.log(responseData);
          Object.keys(responseData).filter((currentVal, index) => {
            if (currentVal === "captions") {
              this.cartoonDataObject = Object.values(responseData)[index];
              this.cartoonDataObject.cached = true;
            }
          });
          this.storageObject[captionsGroupIndex] = this.cartoonDataObject;
          this._localStorageService.saveData(
            "captions",
            JSON.stringify(this.storageObject)
          );
          console.log(this.cartoonDataObject);
        })
      )
      .subscribe(() => {
        // this.responseSubject.next(this.cartoonDataObject);
      });
  }

  // Post New Vote
  updateVoteCount(data: number) {
    this._http
      .post<UserDataInterface>("/api/updateVoteCount", {
        title: "User Up or Down Voted",
      })
      .subscribe((data) => {});
  }

  // Post Form Results
  postFormResults(formData: IUser) {
    return this._http
      .post<IUser>("/api/form-submission", formData)
      .subscribe((responseData) => {
        console.log(responseData);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
