import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject, catchError, map, throwError } from "rxjs";
import { IUser } from "../interfaces/form.interface";
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
  unsubscribe$: Subject<boolean> = new Subject<boolean>();
  invalidURL$ = new BehaviorSubject<boolean>(false);
  totalItems$ = new BehaviorSubject<number>(0);
  storageObject: LocalStorageInterface | null;
  cartoonDataObject: UserDataInterface;
  data: UserDataInterface;
  itemIndex: number | undefined;
  formSubmitted$ = new Subject<boolean>();
  adminResponse: UserDataInterface;
  adminResponseSubject$ = new BehaviorSubject<UserDataInterface>({
    altText: "",
    captions: [],
    imageUrl: "",
    itemIndex: 0,
    _id: "",
  });
  responseSubject$ = new BehaviorSubject<UserDataInterface>({
    altText: "",
    captions: [],
    imageUrl: "",
    itemIndex: 0,
    _id: "",
  });

  // Update/ Deleted
  currentDataObject: any = [];

  constructor(
    private _http: HttpClient,
    private _localStorageService: LocalStorageService
  ) {}

  // Search Cache
  async captionsCacheCheck(toonReference?: number) {
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
        await new Promise((resolve) => {
          this.populateCaptions(this.itemIndex);
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
    if (this.storageObject) {
      this.storageObject![captionsGroupIndex] = this.currentDataObject;
      this._localStorageService.saveData(
        "captions",
        JSON.stringify(this.storageObject)
      );
      console.log(this.storageObject);
    }
    if (this.storageObject === undefined) {
      this.getTotal();
    }
  }

  // Get Captions
  populateCaptions(toonReference?: number) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<UserDataInterface[]>(
        `/api/captions/?toonReference=${toonReference}&flag=true`,
        httpOptions
      )
      .pipe(
        map((responseData) => {
          if (null != responseData) {
            Object.keys(responseData).filter((currentVal, index) => {
              if (currentVal === "results") {
                this.cartoonDataObject = Object.values(responseData)[index];
                if (this.cartoonDataObject !== null) {
                  this.itemIndex = this.cartoonDataObject.itemIndex;
                  this.currentDataObject = this.cartoonDataObject;
                  this.saveNewlyCachedData(this.itemIndex!);
                }
                // Redirect if URL does not exist
                if (this.cartoonDataObject === null) {
                  const randomNumber = Math.floor(
                    Math.random() * this.totalItems$.value
                  );
                  this.invalidURL$.next(true);
                  this.captionsCacheCheck(randomNumber);
                  setTimeout(() => {
                    this.invalidURL$.next(false);
                  }, 5000);
                }
              }
            });
          }
        })
      )
      .subscribe(() => {
        this.responseSubject$.next(this.cartoonDataObject);
      });
  }

  getUnapprovedCaptions(toonReference?: number) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<UserDataInterface>(
        `/api/captions/?toonReference=0&flag=false`,
        httpOptions
      )
      .subscribe((data) => {
        this.adminResponseSubject$.next(data);
      });
  }

  // Update Caption
  updateCaption(
    altText: string,
    captions: CaptionsInterface[],
    imageUrl: string,
    itemIndex: number,
    id: string
  ) {
    const data: UserDataInterface = {
      altText: altText,
      captions: captions,
      imageUrl: imageUrl,
      itemIndex: itemIndex,
      _id: id,
    };
    this._http
      .put("/api/update/" + id, data)
      .subscribe((response) => console.log(response));
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
    const data = {
      formData: formData,
      currentDataObject: this.currentDataObject,
    };
    console.log(data);
    return this._http
      .post<IUser>("/api/form-submission", data)
      .pipe(
        catchError((err) => {
          return throwError(() => new Error("ups something happened"));
        })
      )
      .subscribe({
        next: () => {
          this.formSubmitted$.next(true);
        },
        error: (value) => {
          console.log(value);
          this.formSubmitted$.next(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
