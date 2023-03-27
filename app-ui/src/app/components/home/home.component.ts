import { Component, OnDestroy, OnInit } from "@angular/core";
import { distinctUntilChanged, filter, Subject, takeUntil, tap } from "rxjs";
import { HttpService } from "src/app/services/http.service";
import { WindowWidthService } from "src/app/services/window-width.service";
import { nanoid } from "nanoid";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { emailValidator } from "../../directives/email-validator.directive";
import {
  NavigationEnd,
  NavigationStart,
  Router,
  Event,
  NavigationError,
  ActivationEnd,
  RouterEvent,
  ActivatedRoute,
  RouterState,
  RouterStateSnapshot,
} from "@angular/router";
import { IUser } from "src/app/interfaces/form.interface";
import { CaptionsInterface } from "src/app/interfaces/user-data.interface";
import { Meta, Title } from "@angular/platform-browser";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  captionsArray: CaptionsInterface[] = [];
  captionsGroupIndex: number = 1;
  currentImage: string;
  totalCaptions: number;
  altText: string;
  reactiveForm!: UntypedFormGroup;
  totalItems: number;
  hover: boolean = false;
  windowWidth?: number;
  toonIndex: number;
  nn: string;
  user: IUser = {
    caption: "",
    email: "",
    firstname: "",
    lastname: "",
    city: "",
    state: "",
    country: "",
  };

  constructor(
    private _windowWidthService: WindowWidthService,
    private _metaService: Meta,
    private _title: Title,
    private _router: Router,
    private _httpService: HttpService,
    private _activateRoute: ActivatedRoute
  ) {
    let stateObj: RouterState = _router.routerState;

    let snapshot: RouterStateSnapshot = stateObj.snapshot;

    console.log(snapshot);
    // let prevUrl = "";
    // this._router.events
    //   .pipe(
    //     filter((e) => e instanceof NavigationEnd),
    //     distinctUntilChanged((prev, curr) => this._router.url === prevUrl),
    //     tap(() => (prevUrl = this._router.url))
    //   )
    //   .subscribe((event: Event) => {
    //     console.log(
    //       "This should only log once per route change, if url is the same "
    //     );
    //   });
    this.addTags();
  }

  ngOnInit(): void {
    this.reactiveForm = new UntypedFormGroup({
      caption: new UntypedFormControl(this.user.caption, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      email: new UntypedFormControl(this.user.email, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
        emailValidator(),
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

    this._httpService.totalItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.totalItems = val;
      });

    this._httpService.getTotal();
    const randomNumber = Math.floor(Math.random() * 5);
    this.fetchCartoonData(randomNumber);
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
    new Promise<void>((resolve) => {
      this._httpService.captionsCacheCheck(toonReference);
      resolve(this.captureCaptionResponse());
    });
  }

  // Form Field Getters
  get caption() {
    return this.reactiveForm.get("caption")!;
  }

  get email() {
    return this.reactiveForm.get("email")!;
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
    if (this.reactiveForm.invalid) {
      for (const control of Object.keys(this.reactiveForm.controls)) {
        this.reactiveForm.controls[control].markAsTouched();
      }
      return;
    }

    this.user = this.reactiveForm.value;
    this._httpService.postFormResults(this.user);
  }

  // Set Values & Append Date to URL
  captureCaptionResponse() {
    this._httpService.responseSubject$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
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
      });
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
