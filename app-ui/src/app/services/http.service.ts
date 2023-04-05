import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject, map } from "rxjs";
import { IUser } from "../interfaces/form.interface";
import { LocalStorageInterface } from "../interfaces/local-storage.interface";
import { UserDataInterface } from "../interfaces/user-data.interface";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
  providedIn: "root",
})
export class HttpService implements OnDestroy {
  storageObject: LocalStorageInterface | null;
  unsubscribe$: Subject<boolean> = new Subject<boolean>();
  cartoonDataObject: UserDataInterface;
  itemIndex: number | undefined;
  totalItems: number | undefined;
  totalItems$ = new BehaviorSubject<number>(0);
  responseSubject$ = new BehaviorSubject<UserDataInterface>({
    altText: "",
    captions: [],
    imageUrl: "",
    itemIndex: 0,
    totalCaptions: 0,
  });

  // Update/ Deleted
  currentDataObject: any = [];

  constructor(
    private _http: HttpClient,
    private _localStorageService: LocalStorageService
  ) {}

  // Search Cache
  captionsCacheCheck(toonReference?: number) {
    const storage = this._localStorageService.getData("captions");
    this.currentDataObject = {};
    this.itemIndex = toonReference;

    // There IS Cache
    if (storage != "") {
      let parsed = JSON.parse(storage);
      this.storageObject = Object.values(parsed);

      // If Requested Captions Group is Cached
      if (this.storageObject[this.itemIndex!]) {
        this.currentDataObject = this.storageObject[this.itemIndex!];
        this.responseSubject$.next(this.currentDataObject);
      }

      // Requested Group Called First Time
      if (!this.storageObject[this.itemIndex!]) {
        new Promise((resolve) => {
          this.populateCaptions(this.itemIndex);
          resolve(this.saveNewlyCachedData(this.itemIndex!));
        });
      }
    }

    // There's NOTHING Cached
    else {
      this.populateCaptions(toonReference);
    }
  }

  // Cache GET Request
  saveNewlyCachedData(captionsGroupIndex: number) {
    this.storageObject![captionsGroupIndex] = this.currentDataObject;
    this._localStorageService.saveData(
      "captions",
      JSON.stringify(this.storageObject)
    );
  }

  // Get Captions
  populateCaptions(toonReference?: number) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<UserDataInterface[]>(
        `/api/getCaptions/?toonReference=${toonReference}`,
        httpOptions
      )
      .pipe(
        map((responseData) => {
          if (null != responseData) {
            Object.keys(responseData).filter((currentVal, index) => {
              if (currentVal === "results") {
                this.cartoonDataObject = Object.values(responseData)[index];
                this.itemIndex = this.cartoonDataObject.itemIndex;
                this.currentDataObject = this.cartoonDataObject;
                this.saveNewlyCachedData(this.itemIndex!);
              }
            });
          }
        })
      )
      .subscribe(() => {
        this.responseSubject$.next(this.cartoonDataObject);
      });
  }

  // Get Captions
  getTotal() {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<LocalStorageInterface>(`/api/init`, httpOptions)
      .pipe(
        map((response) => {
          this.storageObject = response;
          this.totalItems$.next(Object.keys(this.storageObject).length);
        })
      )
      .subscribe(() => {
        return this.storageObject;
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
      .subscribe((responseData) => {});
  }

  // Post Form Results
  postEmail(signUpEmail: String) {
    // return this._http
    //   .post<IUser>("/api/form-submission", formData)
    //   .subscribe((responseData) => {});
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
