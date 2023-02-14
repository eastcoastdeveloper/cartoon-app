import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import {
  CaptionsInterface,
  UserDataInterface,
} from "src/app/interfaces/user-data.interface";
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
  userDataArray: CaptionsInterface[] = [];
  captionsGroupIndex: number = 1;
  // formResults: UserDataInterface;
  currentImage: string;
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

  // Set Caption Response to Array
  captureCaptionResponse() {
    this._httpService.responseSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.userDataArray = val.captions;
        this.currentImage = val.imageURL;
        console.log(val);
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
