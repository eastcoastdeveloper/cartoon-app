import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { UserDataInterface } from "src/app/interfaces/user-data.interface";
import { HttpService } from "src/app/services/http.service";
import { WindowWidthService } from "src/app/services/window-width.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { emailValidator } from "../../directives/email-validator.directive";
import { Router } from "@angular/router";

interface IUser {
  caption: string;
  email: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  userDataArray: UserDataInterface[] = [];
  captionsGroupIndex: number = 1;
  formResults: UserDataInterface;
  reactiveForm!: FormGroup;
  hover: boolean = false;
  windowWidth?: number;
  toonIdentifier: string;
  user: IUser;

  constructor(
    private _windowWidthService: WindowWidthService,
    private _router: Router,
    private _httpService: HttpService
  ) {
    this.user = {} as IUser;
  }

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

    this.configureQueryParams("abc1");
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

  fetchCartoonData(toonReference: string) {
    new Promise<void>((resolve, reject) => {
      this.captionsGroupIndex++;
      // identifier, first of ten captions, limiter (10)
      this._httpService.captionsCacheCheck(
        toonReference,
        this.captionsGroupIndex,
        10
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

  // Form Validation
  public validate(): void {
    if (this.reactiveForm.invalid) {
      for (const control of Object.keys(this.reactiveForm.controls)) {
        this.reactiveForm.controls[control].markAsTouched();
      }
      return;
    }

    this.user = this.reactiveForm.value;

    console.info("Caption:", this.user.caption);
    console.info("Email:", this.user.email);
    console.info("First Name:", this.user.firstname);
    console.info("Last Name:", this.user.lastname);
    console.info("City:", this.user.city);
    console.info("State:", this.user.state);
  }

  // Set Caption Response to Array
  captureCaptionResponse() {
    this._httpService.responseSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.userDataArray = val;
        console.log(val);
      });
  }

  // Up Vote
  voteUp(data: UserDataInterface) {
    // data.votes!++;
    this._httpService.updateVoteCount(data);
  }

  // Down Vote
  voteDown(data: UserDataInterface) {
    // data.votes! === 0 ? (data.votes = 0) : data.votes!--;
    this._httpService.updateVoteCount(data);
  }

  loadMoreCaptions() {
    this.captionsGroupIndex++;
    this._httpService.captionsCacheCheck(
      this.toonIdentifier,
      this.captionsGroupIndex,
      10
    );
  }

  // Kill Subscriptions
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
