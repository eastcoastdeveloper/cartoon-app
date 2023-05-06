import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";
import { MustMatch } from "./form-validators";
import { Subject, takeUntil } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent implements OnInit {
  reactiveForm!: UntypedFormGroup;
  emailAdress: string;
  password: string;
  confirm_password: string;
  capsOn: any;

  submitted = false;
  registerForm!: FormGroup;
  private unsubscribe$ = new Subject<void>();

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
          if (response["message"] === "Username already exists") {
            this._router.navigate(["/login"]);
            this._authService.registrationSubject$.next({ message: "" });
          }
          if (response["message"] === "User created!") {
            this._router.navigate(["/login"]);
            this._authService.registrationSubject$.next({
              message: "",
              result: { email: "", password: "" },
            });
          }
        },
      });
  }

  get email() {
    return this.reactiveForm.get("email")!;
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }

    this.emailAdress = this.registerForm.value.email;
    this.password = this.registerForm.value.password;
    this._authService.createUser(this.emailAdress, this.password);
  }

  onReset() {
    this.submitted = false;
    this.registerForm.reset();
  }
}
// function MustMatch(arg0: string, arg1: string): any {
//   throw new Error("Function not implemented.");
// }
