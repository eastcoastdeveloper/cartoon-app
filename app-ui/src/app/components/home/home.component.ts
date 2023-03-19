import { Component, OnDestroy, OnInit } from "@angular/core";
import { forkJoin, of, Subject, takeUntil } from "rxjs";
import { HttpService } from "src/app/services/http.service";
import { WindowWidthService } from "src/app/services/window-width.service";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { emailValidator } from "../../directives/email-validator.directive";
import { Router } from "@angular/router";
import { IUser } from "src/app/interfaces/form.interface";
import { CaptionsInterface } from "src/app/interfaces/user-data.interface";

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
  hover: boolean = false;
  windowWidth?: number;
  toonIdentifier: string;
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
    private _router: Router,
    private _httpService: HttpService
  ) {}

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

    this.configureQueryParams(this.getCurrentDate());
  }

  getCurrentDate() {
    let d = new Date();
    let currentDay = d.getDate();
    let monthIndex: any = d.getMonth();
    let year: any = d.getFullYear();

    // Double Digit Month
    monthIndex < 10 ? (monthIndex = `0${monthIndex}`) : "";
    return `${monthIndex}${currentDay}${year}`;
  }

  // Load Cartoon Route
  configureQueryParams(identifier: string) {
    this.toonIdentifier = identifier;
    this._router
      .navigate(["home", identifier], {
        queryParams: {
          toon: identifier,
        },
      })
      .then(() => {
        this.fetchCartoonData(this.toonIdentifier);
      });
  }

  // Check Cache Before Fetch
  fetchCartoonData(toonReference: string) {
    new Promise<void>((resolve) => {
      this._httpService.captionsCacheCheck(
        toonReference,
        this.captionsGroupIndex,
        10,
        0
      );
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
    console.log(this.user);
    this._httpService.postFormResults(this.user);
  }

  // Set Values & Append Date to URL
  captureCaptionResponse() {
    this._httpService.responseSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.currentImage = val.imageUrl;
        this.altText = val.altText;
        this.totalCaptions = val.totalCaptions;
        this.captionsArray = val.captions;
        this._router.navigate(["home", val.date], {
          queryParams: {
            toon: val.date,
          },
        });
      });
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
    this._httpService.captionsCacheCheck(
      this.toonIdentifier,
      this.captionsGroupIndex,
      10,
      0
    );
  }

  // Kill Subscriptions
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
