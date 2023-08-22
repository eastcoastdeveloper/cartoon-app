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
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class HttpService implements OnDestroy {
  private unsubscribe$: Subject<boolean> = new Subject<boolean>();
  invalidURL$ = new BehaviorSubject<boolean>(false);
  totalItems$ = new BehaviorSubject<number>(0);
  storageObject: LocalStorageInterface | null;
  cartoonDataObject: UserDataInterface;
  data: UserDataInterface;
  itemIndex: number | undefined;
  formSubmitted$ = new Subject<boolean>();
  adminResponse: UserDataInterface;
  profileData: ProfileInterface;
  adminAccessResponse$ = new BehaviorSubject<{ message: string }>({
    message: "",
  });
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
    private _authService: AuthService,
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

    !toonReference ? (toonReference = this.generateRandomNumber()) : "";

    return this._http
      .get<UserDataInterface[]>(
        `/api/captions/?toonReference=${toonReference}&flag=true`,
        httpOptions
      )
      .pipe(
        takeUntil(this.unsubscribe$),
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
                  const randomNumber = this.generateRandomNumber();
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

  generateRandomNumber() {
    return Math.floor(Math.random() * this.totalItems$.value);
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
    captionsIndex: number,
    outcome: string,
    creator?: string,
    captionReferenceID?: string,
    flagged?: boolean
  ) {
    const data: {
      altText: string;
      captions: CaptionsInterface[];
      imageUrl: string;
      itemIndex: number;
      _id: string;
      captionsIndex: number;
      outcome: string;
      creator?: string;
      captionReferenceID?: string;
      flagged?: boolean;
    } = {
      altText: altText,
      captions: captions,
      imageUrl: imageUrl,
      itemIndex: itemIndex,
      _id: id,
      captionsIndex: captionsIndex,
      outcome: outcome,
      creator: creator,
      captionReferenceID: captionReferenceID,
      flagged: flagged,
    };
    this._http
      .put("/api/update/" + id, data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => console.log(response));
  }

  generateOTP(id: string | null) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<LocalStorageInterface>(
        `/api/snapshot/generate?id=${id}`,
        httpOptions
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe();
  }

  exportData() {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get(`/api/snapshot/data`, httpOptions)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.downloadFile(val);
      });
  }

  // Compare OTP, email, and credentials user
  compareValues(otp: string, email: string, passcode: string) {
    const httpOptions = {
      headers: new HttpHeaders(),
    };

    return this._http
      .get<{ message: string }>(
        `/api/snapshot/compare?otp=${otp}&email=${email}&passcode=${passcode}`,
        httpOptions
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.adminAccessResponse$.next(val);
      });
  }

  downloadFile(data: any, filename = "data") {
    let arrHeader = ["username", "email", "location"];
    let csvData = this.ConvertToCSV(data, arrHeader);
    let blob = new Blob(["\ufeff" + csvData], {
      type: "text/csv;charset=utf-8;",
    });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser =
      navigator.userAgent.indexOf("Safari") != -1 &&
      navigator.userAgent.indexOf("Chrome") == -1;
    if (isSafariBrowser) {
      //if Safari open in new window to save file with random filename.
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", "users.csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ConvertToCSV(objArray: string, headerList: string[]) {
    let array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    let str = "";
    // let row = "S.No,";

    // let newHeaders = ["username", "email", "location"];

    // for (let index in newHeaders) {
    //   row += newHeaders[index] + ",";
    // }
    // row = row.slice(0, -1);
    // str += row + "\r\n";
    for (let i = 0; i < array.length; i++) {
      let line = i + 1 + "";
      for (let index in headerList) {
        let head = headerList[index];
        line += "," + this.strRep(array[i][head]);
      }
      str += line + "\r\n";
    }
    return str;
  }

  strRep(data: string) {
    if (typeof data == "string") {
      let newData = data.replace(/,/g, " ");
      return newData;
    } else if (typeof data == "undefined") {
      return "-";
    } else if (typeof data == "number") {
      return data;
    } else {
      return data;
    }
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
          console.log(value);
          console.log(this._authService);
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
