import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { emailValidator } from "src/app/directives/email-validator.directive";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  reactiveForm!: UntypedFormGroup;
  emailAdress: string;
  showPassword: boolean = false;
  badCredentials: boolean = false;
  passwordVisibility: boolean = false;
  password: string;
  capsOn: any;

  constructor(private _authSerivce: AuthService, private _router: Router) {}

  ngOnInit(): void {
    this.reactiveForm = new UntypedFormGroup({
      email: new UntypedFormControl(this.emailAdress, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
        emailValidator(),
      ]),
      password: new UntypedFormControl(this.password, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
    });

    this._authSerivce.badCredentials$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.badCredentials = val;
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onFocusEvent(e: any) {
    this.badCredentials = false;
  }

  passwordFieldChanged() {
    this.reactiveForm.value.password.length > 3
      ? (this.passwordVisibility = true)
      : (this.passwordVisibility = false);
  }

  get email() {
    return this.reactiveForm.get("email")!;
  }

  forgotPassword() {
    this._router.navigateByUrl("/forgot-password");
  }

  public validate(): void {
    if (this.reactiveForm.invalid) {
      for (const control of Object.keys(this.reactiveForm.controls)) {
        this.reactiveForm.controls[control].markAsTouched();
      }
      return;
    }

    this._authSerivce.login(
      this.reactiveForm.value.email,
      this.reactiveForm.value.password
    );
    this.reactiveForm.reset();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
