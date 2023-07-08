import { Component, OnDestroy } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { emailValidator } from "src/app/directives/email-validator.directive";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  reactiveForm!: UntypedFormGroup;
  emailAdress: string;
  emailSent: boolean = false;
  message: string;
  tokenExpired: boolean = false;

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
      .subscribe((val) => {
        if (val.message != "") {
          this.emailSent = true;
          this.message = val.message;
        }
      });

    this._authSerivce.tokenExpired$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.tokenExpired = val;
      });
  }

  get email() {
    return this.reactiveForm.get("email")!;
  }

  public validate(): void {
    if (this.reactiveForm.invalid) {
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
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
