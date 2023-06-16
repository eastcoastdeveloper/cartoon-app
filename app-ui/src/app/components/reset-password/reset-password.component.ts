import { Component } from "@angular/core";
import { FormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { MustMatch } from "../signup/form-validators";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"],
})
export class ResetPasswordComponent {
  passwordVisibility: boolean = false;
  reactiveForm!: UntypedFormGroup;
  resetPasswordObject: { email: string; password: string; username: string };
  showPassword: boolean = false;
  confirm_password: string;
  submitted = false;
  password: string;
  token: string;
  capsOn: any;
  id: string;

  constructor(
    private formBuilder: FormBuilder,
    private _authService: AuthService,
    private _activatedRoute: ActivatedRoute
  ) {
    this._activatedRoute.params.subscribe((val) => {
      this.id = val["id"];
      this.token = val["token"];
    });
  }

  ngOnInit(): void {
    this.reactiveForm = this.formBuilder.group(
      {
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
      },
      {
        validators: MustMatch("password", "confirmPassword"),
      }
    );

    this._authService.resetPassword$.subscribe((val) => {
      this.resetPasswordObject = val;
    });
    this._authService.resetPassword(this.id, this.token);
  }

  passwordFieldChanged() {
    this.reactiveForm.value.password.length > 3
      ? (this.passwordVisibility = true)
      : (this.passwordVisibility = false);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get f() {
    return this.reactiveForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.reactiveForm.invalid) {
      return;
    }

    this.password = this.reactiveForm.value.password;
    this._authService.updatePass(this.id, this.token, this.password);
  }
}
