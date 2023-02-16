import { Component, OnDestroy, OnInit } from "@angular/core";
import { forkJoin, of, Subject, takeUntil } from "rxjs";
import { HttpService } from "src/app/services/http.service";
import { WindowWidthService } from "src/app/services/window-width.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { emailValidator } from "../../directives/email-validator.directive";
import { Router } from "@angular/router";
import { IUser } from "src/app/interfaces/form.interface";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  userDataArray: any = [];
  captionsGroupIndex: number = 1;
  currentImage: string;
  reactiveForm!: FormGroup;
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
    this.reactiveForm = new FormGroup({
      caption: new FormControl(this.user.caption, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      email: new FormControl(this.user.email, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
        emailValidator(),
      ]),
      firstname: new FormControl(this.user.firstname, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      lastname: new FormControl(this.user.lastname, [
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      city: new FormControl(this.user.city, [
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      state: new FormControl(this.user.state, [
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
    return `${monthIndex}${currentDay}${year}`;
  }

  // Load Cartoon Route
  configureQueryParams(identifier: string) {
    console.log(identifier);
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

  // Get Captions & Full Payload
  captureCaptionResponse() {
    // this._httpService.extractCaptionsFromPayload();
    // const observables = {
    //   a: of(this._httpService.captionsSubject),
    //   b: of(this._httpService.responseSubject),
    // };
    // const join = forkJoin(observables);
    // join.subscribe((val) => {
    //   console.log(val.a.getValue());
    //   console.log(val.b.getValue());
    // });
    // combineLatest(
    //   this._httpService.captionsSubject,
    //   this._httpService.responseSubject
    // ).subscribe(([captionsSubject, responseSubject]) => {
    //   console.log(captionsSubject);
    //   console.log(responseSubject);
    // });
    this._httpService.responseSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.userDataArray = val;
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
