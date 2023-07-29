import { Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Subject, takeUntil, tap } from "rxjs";
import { emailValidator } from "src/app/directives/email-validator.directive";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnDestroy {
  @ViewChild("otpEntry", { static: false }) otpEntry: ElementRef;
  private unsubscribe$ = new Subject<void>();
  otp: string;
  reactiveForm!: UntypedFormGroup;
  emailAdress: string;
  emailSent: boolean = false;
  message: string;
  tokenExpired: boolean = false;
  userDoesNotExist: boolean = false;

  constructor(private _authSerivce: AuthService) {}

  ngOnInit(): void {
    this.reactiveForm = new UntypedFormGroup({
      email: new UntypedFormControl(this.emailAdress, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
        emailValidator(),
      ]),
    });

    this._authSerivce.emailMessage$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (val) => {
          if (val.message === "User does not exist.") {
            this.userDoesNotExist = true;
            return;
          }
          if (val.message != "") {
            this.message = val.message;
            this.emailSent = true;
          }
        },
      });

    this._authSerivce.tokenExpired$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.tokenExpired = val;
      });

    this.otp = this.generateOTP(6);
  }

  generateOTP(limit: number) {
    var digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()";
    let OTP = "";
    for (let i = 0; i < limit; i++) {
      OTP += digits[Math.floor(Math.random() * 46)];
    }
    return OTP;
  }

  get email() {
    return this.reactiveForm.get("email")!;
  }

  public validate(): void {
    if (
      this.reactiveForm.invalid &&
      this.otp === this.otpEntry.nativeElement.innerText
    ) {
      for (const control of Object.keys(this.reactiveForm.controls)) {
        this.reactiveForm.controls[control].markAsTouched();
      }
      return;
    }

    this._authSerivce.forgotPassword(this.reactiveForm.value.email);
    this.reactiveForm.reset();
  }

  onFocusEvent(e: any) {
    this.tokenExpired = false;
    this.userDoesNotExist = false;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
