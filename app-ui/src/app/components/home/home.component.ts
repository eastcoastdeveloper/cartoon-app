import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, take, takeUntil } from "rxjs";
import { HttpService } from "src/app/services/http.service";
import { WindowWidthService } from "src/app/services/window-width.service";
import { nanoid } from "nanoid";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { IUser } from "src/app/interfaces/form.interface";
import {
  CaptionsInterface,
  UserDataInterface,
} from "src/app/interfaces/user-data.interface";
import { Meta, Title } from "@angular/platform-browser";
import { LocalStorageService } from "src/app/services/local-storage.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  captionsArray: CaptionsInterface[] = [];
  dataObject: UserDataInterface;
  captionsGroupIndex: number = 1;
  currentImage: string;
  totalCaptions: number;
  altText: string;
  reactiveForm!: UntypedFormGroup;
  totalItems: number;
  manualURL: string;
  hover: boolean = false;
  windowWidth?: number;
  toonIndex: number;
  user: IUser = {
    caption: "",
    firstname: "",
    lastname: "",
    city: "",
    state: "",
    country: "",
  };

  constructor(
    private _windowWidthService: WindowWidthService,
    private _activateRoute: ActivatedRoute,
    private _localStorage: LocalStorageService,
    private _httpService: HttpService,
    private _metaService: Meta,
    private _router: Router,
    private _title: Title
  ) {
    this.addTags();
  }

  ngOnInit(): void {
    this.reactiveForm = new UntypedFormGroup({
      caption: new UntypedFormControl(this.user.caption, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      firstname: new UntypedFormControl(this.user.firstname, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      lastname: new UntypedFormControl(this.user.lastname, [
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      city: new UntypedFormControl(this.user.city, [
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      state: new UntypedFormControl(this.user.state, [
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
    });

    // Subscribe to Window Width
    this._windowWidthService.currentWidth$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.windowWidth = val;
      });

    this._activateRoute.queryParams.pipe(take(1)).subscribe((val) => {
      this.manualURL = val["num"];
    });

    const storage = this._localStorage.getData("captions");
    if (storage === "" || this.manualURL === undefined) {
      this.getTotals();
    }
    if (this.manualURL) {
      this.fetchCartoonData(parseInt(this.manualURL));
    }

    this._httpService.totalItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.totalItems = val;
      });

    // Set Values & Append Date to URL
    this._httpService.responseSubject$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        if (val) {
          this.currentImage = val.imageUrl;
          this.altText = val.altText;
          this.totalCaptions = val.totalCaptions;
          this.captionsArray = val.captions;
          this.toonIndex = val.itemIndex;
          const uiid = nanoid().slice(0, 5);
          this._router.navigate(["home", uiid], {
            queryParams: {
              toon: uiid,
              num: this.toonIndex,
            },
          });
        }
      });
  }

  // Called Once on Load
  async getTotals() {
    await new Promise((resolve) => {
      const randomNumber = Math.floor(Math.random() * 5);
      resolve(this.fetchCartoonData(randomNumber));
    });
  }

  addTags() {
    this._metaService.addTags([
      { name: "robots", content: "index, follow" },
      {
        name: "keywords",
        content: "Angular SEO Integration, Music CRUD, Angular Universal",
      },
      { name: "author", content: "Eric Scott" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "description", content: "Free Web tutorials" },
      { name: "date.created", content: "2022-10-15", scheme: "YYYY-MM-DD" },
      { name: "date.updated", content: "2023-02-05", scheme: "YYYY-MM-DD" },
      { name: "date.modified", content: "2023-03-25", scheme: "YYYY-MM-DD" },
      { charset: "UTF-8" },
    ]);
    this._title.setTitle("APOD Nasa Gov");
  }

  // Check Cache Before Fetch
  fetchCartoonData(toonReference?: number) {
    this._httpService.captionsCacheCheck(toonReference);
  }

  // Form Field Getters
  get caption() {
    return this.reactiveForm.get("caption")!;
  }

  get firstname() {
    return this.reactiveForm.get("firstname")!;
  }

  get lastname() {
    return this.reactiveForm.get("lastname")!;
  }

  get city() {
    return this.reactiveForm.get("city")!;
  }

  get state() {
    return this.reactiveForm.get("state")!;
  }

  // Form Validation & Post to Backend
  public validate(): void {
    console.log(this.reactiveForm);
    if (this.reactiveForm.invalid) {
      for (const control of Object.keys(this.reactiveForm.controls)) {
        this.reactiveForm.controls[control].markAsTouched();
      }
      return;
    }

    this.user = this.reactiveForm.value;
    this._httpService.postFormResults(this.user);
  }

  navigateNext() {
    this.totalItems - 1 > this.toonIndex
      ? this.toonIndex++
      : (this.toonIndex = 0);
    this.fetchCartoonData(this.toonIndex);
  }

  navigatePrevious() {
    this.toonIndex === 0
      ? (this.toonIndex = this.totalItems - 1)
      : this.toonIndex--;
    this.fetchCartoonData(this.toonIndex);
  }

  // Up Vote
  voteUp(vote: number) {
    vote!++;
    this._httpService.updateVoteCount(vote);
  }

  // Down Vote
  voteDown(vote: number) {
    vote! === 0 ? (vote = 0) : vote!--;
    this._httpService.updateVoteCount(vote);
  }

  loadMoreCaptions() {
    this.captionsGroupIndex++;
    this._httpService.captionsCacheCheck(this.toonIndex);
  }

  // Kill Subscriptions
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
