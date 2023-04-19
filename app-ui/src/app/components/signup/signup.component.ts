import { Component, OnInit } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { emailValidator } from "src/app/directives/email-validator.directive";
import { AuthService } from "src/app/services/auth.service";
import { HttpService } from "src/app/services/http.service";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent implements OnInit {
  reactiveForm!: UntypedFormGroup;
  emailAdress: string;
  password: string;

  constructor(
    private _httpService: HttpService,
    private _authService: AuthService
  ) {}

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

  get email() {
    return this.reactiveForm.get("email")!;
  }

  public validate(): void {
    if (this.reactiveForm.invalid) {
      for (const control of Object.keys(this.reactiveForm.controls)) {
        this.reactiveForm.controls[control].markAsTouched();
      }
      return;
    } else {
      this.emailAdress = this.reactiveForm.value.email;
      this.password = this.reactiveForm.value.password;
      console.log(this.emailAdress);
      this._authService.createUser(this.emailAdress, this.password);
      // this._httpService.postEmail(this.emailAdress);
    }
  }

  // onSignup(obj: any) {

  // }
}
