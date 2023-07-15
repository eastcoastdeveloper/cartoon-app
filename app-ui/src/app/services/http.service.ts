import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import {
  BehaviorSubject,
  Subject,
  catchError,
  map,
  takeUntil,
  throwError,
} from "rxjs";
import { IUser } from "../interfaces/form.interface";
import { LocalStorageInterface } from "../interfaces/local-storage.interface";
import {
  CaptionsInterface,
  UserDataInterface,
} from "../interfaces/user-data.interface";
import { LocalStorageService } from "./local-storage.service";
import { ProfileInterface } from "../interfaces/profile.interface";

@Injectable({
  providedIn: "root",
})
export class HttpService implements OnDestroy {
  private unsubscribe$: Subject<boolean> = new Subject<boolean>();
  userLocation$ = new BehaviorSubject<{ city: string; country: string }>({
    city: "",
    country: "",
  });
  invalidURL$ = new BehaviorSubject<boolean>(false);
  totalItems$ = new BehaviorSubject<number>(0);
  storageObject: LocalStorageInterface | null;
  cartoonDataObject: UserDataInterface;
  data: UserDataInterface;
  itemIndex: number | undefined;
  formSubmitted$ = new Subject<boolean>();
  adminResponse: UserDataInterface;
  profileData: ProfileInterface;
  location$ = new BehaviorSubject<{ city: string; country: string }>({
    city: "",
    country: "",
  });
  profileData$ = new BehaviorSubject<ProfileInterface>({
    imageUrl: "",
    caption: "",
    id: "",
    status: "",
  });
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
        takeUntil(this.unsubscribe$),
        map((responseData) => {
          console.log(responseData);
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

  getCoordinates(lat: number, long: number) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<
        [{ geometry: object; properties: { city: string; country: string } }]
      >(`/api/map/?lat=${lat}&long=${long}`, httpOptions)
      .subscribe((val) => {
        const result = Object.values(val);
        let city = result[0].properties.city;
        let country = result[0].properties.country;
        this.location$.next({ city, country });
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
      .pipe(takeUntil(this.unsubscribe$))
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
    id: string,
    creator?: string,
    captionReferenceID?: string
  ) {
    const data: {
      altText: string;
      captions: CaptionsInterface[];
      imageUrl: string;
      itemIndex: number;
      _id: string;
      creator?: string;
      captionReferenceID?: string;
    } = {
      altText: altText,
      captions: captions,
      imageUrl: imageUrl,
      itemIndex: itemIndex,
      _id: id,
      creator: creator,
      captionReferenceID: captionReferenceID,
    };
    this._http
      .put("/api/update/" + id, data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => console.log(response));
  }

  flagCaption() {
    console.log("caption flagged");
  }

  // Get Captions
  getTotal() {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<LocalStorageInterface>(`/api/init`, httpOptions)
      .pipe(
        takeUntil(this.unsubscribe$),
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
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {});
  }

  // Post Form Results
  postFormResults(formData: IUser) {
    const data = {
      formData: formData,
      currentDataObject: this.currentDataObject,
    };
    return this._http
      .post<IUser>("/api/form-submission", data)
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((err) => {
          return throwError(() => new Error("ups something happened"));
        })
      )
      .subscribe({
        next: () => {
          this.formSubmitted$.next(true);
        },
        error: (value) => {
          this.formSubmitted$.next(false);
        },
      });
  }

  getProfileCaptions(id: string) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<ProfileInterface>(`/api/profile/${id}`, httpOptions)
      .subscribe((item) => {
        this.profileData$.next(item);
      });
  }

  saveGeolocation(city: string, country: string, id: string) {
    const data = {
      city: city,
      country: country,
      id: id,
    };
    return this._http
      .post<{ city: string; country: string; id: string }>(
        `/api/profile/location`,
        data
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        console.log(val);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
