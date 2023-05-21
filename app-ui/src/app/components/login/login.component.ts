import { Component, OnInit } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { emailValidator } from "src/app/directives/email-validator.directive";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  reactiveForm!: UntypedFormGroup;
  emailAdress: string;
  showPassword: boolean = false;
  password: string;
  capsOn: any;

  constructor(private _authSerivce: AuthService) {}

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
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
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

    this._authSerivce.login(
      this.reactiveForm.value.email,
      this.reactiveForm.value.password
    );
    this.reactiveForm.reset();
  }
}
