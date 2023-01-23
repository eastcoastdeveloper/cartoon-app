import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { UserDataInterface } from "src/app/interfaces/user-data.interface";
import { HttpService } from "src/app/services/http.service";
import { WindowWidthService } from "src/app/services/window-width.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { emailValidator } from "./email-validator.directive";

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
  reactiveForm!: FormGroup;
  user: IUser;

  captionRequestIndex: number = 1;
  destroy$: Subject<boolean> = new Subject<boolean>();
  windowWidth?: number;
  userDataArray: UserDataInterface[] = [];
  hover: boolean = false;
  formResults: UserDataInterface;
  currentImage: string =
    "https://blog-www.pods.com/wp-content/uploads/2019/08/MG_6_1_Miami.jpg";

  constructor(
    private _windowWidthService: WindowWidthService,
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

    new Promise<void>((resolve, reject) => {
      this.captionRequestIndex++;
      this._httpService.populateCaptions(this.captionRequestIndex, 10);
      resolve(this.captureCaptionResponse());
    });

    // Subscribe to Window Width
    this._windowWidthService.currentWidth$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.windowWidth = val;
      });
  }

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
      });
  }

  // Up Vote
  voteUp(data: UserDataInterface) {
    data.votes!++;
    this._httpService.updateVoteCount(data);
  }

  // Down Vote
  voteDown(data: UserDataInterface) {
    data.votes! === 0 ? (data.votes = 0) : data.votes!--;
    this._httpService.updateVoteCount(data);
  }

  loadMoreCaptions() {
    this._httpService.populateCaptions(this.captionRequestIndex, 10);
  }

  // Kill Subscriptions
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
