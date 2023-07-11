import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";
import { MustMatch } from "./form-validators";
import { Subject, takeUntil } from "rxjs";
import { Router } from "@angular/router";
import { generateUsername } from "friendly-username-generator";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<boolean>();
  passwordVisibility: boolean = false;
  emailAdress: string;
  username: string;
  password: string;
  userAlreadyRegisteredError = false;
  userRegistered: boolean = false;
  city: string = "";
  state: string = "";
  country: string = "";
  showLocation: boolean = false;
  showCountry: boolean = false;
  captions: [];

  confirm_password: string;
  showPassword: boolean = false;
  capsOn: any;

  submitted = false;
  registerForm!: FormGroup;
  // private unsubscribe$:Subject<boolean> = new Subject<void>();

  constructor(
    private _authService: AuthService,
    private formBuilder: FormBuilder,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group(
      {
        // title: ["", Validators.required],
        // firstName: ["", Validators.required],
        // lastName: ["", Validators.required],
        // // validates date format yyyy-mm-dd
        // dob: [
        //   "",
        //   [
        //     Validators.required,
        //     Validators.pattern(
        //       /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/
        //     ),
        //   ],
        // ],
        // username: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
        // acceptTerms: [false, Validators.requiredTrue],
      },
      {
        validators: MustMatch("password", "confirmPassword"),
      }
    );

    this._authService.registrationSubject$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          // if (response["message"] === "Username already exists") {
          //   this.userAlreadyRegisteredError = true;
          //   this.userRegistered = false;
          // }
          if (response["message"] === "User created!") {
            this.userAlreadyRegisteredError = false;
            this.userRegistered = true;
            setTimeout(() => {
              this._router.navigate(["/login"]);
              this._authService.registrationSubject$.next({
                message: "",
              });
            }, 3500);
          }
        },
        error: (error) => {
          this.userAlreadyRegisteredError = true;
        },
      });
  }

  passwordFieldChanged() {
    this.registerForm.value.password.length > 3
      ? (this.passwordVisibility = true)
      : (this.passwordVisibility = false);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get email() {
    return this.registerForm.get("email")!;
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }

    this.username = generateUsername();
    this.emailAdress = this.registerForm.value.email;
    this.password = this.registerForm.value.password;
    this._authService.createUser(
      this.username,
      this.emailAdress,
      this.password,
      this.city,
      this.state,
      this.country,
      this.showLocation,
      this.showCountry,
      this.captions
    );

    console.log(this.username);
  }

  onReset() {
    this.submitted = false;
    this.registerForm.reset();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
