// import { Component, OnDestroy, OnInit } from "@angular/core";
// import { FormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
// import { ActivatedRoute, Router } from "@angular/router";
// import { AuthService } from "src/app/services/auth.service";
// import { MustMatch } from "../signup/form-validators";
// import { Subject, takeUntil } from "rxjs";
// import { PasswordValidators } from "../home/password-validators";
// import { GlobalMethods } from "src/app/services/global-methods.service";

// @Component({
//   selector: "app-reset-password",
//   templateUrl: "./reset-password.component.html",
//   styleUrls: ["./reset-password.component.scss"],
// })
// export class ResetPasswordComponent implements OnInit, OnDestroy {
//   private unsubscribe$ = new Subject<void>();
//   passwordVisibility: boolean = false;
//   reactiveForm!: UntypedFormGroup;
//   resetPasswordObject: { email: string; password: string; username: string };
//   showPassword: boolean = false;
//   passwordFieldFocus = false;
//   passwordInfo = false;
//   submitted = false;
//   password: string;
//   token: string;
//   capsOn: any;
//   id: string;

//   uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   lowercase = "abcdefghijklmnopqrstuvwxyz";
//   numbers = "1234567890";
//   characters = "(?=.*[$@^!%*?&]";

//   constructor(
//     private formBuilder: FormBuilder,
//     private _authService: AuthService,
//     private _router: Router,
//     private _activatedRoute: ActivatedRoute,
//     private _globalMethods: GlobalMethods
//   ) {
//     this._activatedRoute.params
//       .pipe(takeUntil(this.unsubscribe$))
//       .subscribe((val) => {
//         this.id = val["id"];
//         this.token = val["token"];
//       });
//   }

//   ngOnInit(): void {
//     this.reactiveForm = this.formBuilder.group(
//       {
//         password: [
//           "",
//           [
//             Validators.required,
//             Validators.minLength(8),
//             PasswordValidators.patternValidator(new RegExp("(?=.*[0-9])"), {
//               requiresDigit: true,
//             }),
//             PasswordValidators.patternValidator(new RegExp("(?=.*[A-Z])"), {
//               requiresUppercase: true,
//             }),
//             PasswordValidators.patternValidator(new RegExp("(?=.*[a-z])"), {
//               requiresLowercase: true,
//             }),
//             PasswordValidators.patternValidator(
//               new RegExp("(?=.*[$@^!%*?&])"),
//               {
//                 requiresSpecialChars: true,
//               }
//             ),
//           ],
//         ],
//         confirmPassword: ["", Validators.required],
//       },
//       {
//         validators: MustMatch("password", "confirmPassword"),
//       }
//     );

//     this._authService.resetPassword$
//       .pipe(takeUntil(this.unsubscribe$))
//       .subscribe((val) => {
//         this.resetPasswordObject = val;
//       });
//     this._authService.resetPassword(this.id, this.token);
//   }

//   generateCode() {
//     this.reactiveForm.get("password")?.setValue("");
//     this.reactiveForm.get("confirmPassword")?.setValue("");
//     const result = this._globalMethods.generateCode();
//     this.reactiveForm.get("password")?.setValue(result);
//     this.reactiveForm.get("confirmPassword")?.setValue(result);
//     this.passwordFieldFocus = true;
//   }

//   onBlurEvent(evt: any) {
//     this.passwordFieldFocus = false;
//     this.showPassword = false;
//   }

//   passwordFieldChanged() {
//     this.reactiveForm.value.password.length > 3
//       ? (this.passwordVisibility = true)
//       : (this.passwordVisibility = false);
//   }

//   onFocusEvent(evt: any) {
//     this.passwordFieldFocus = true;
//     this.showPassword = true;
//   }

//   togglePasswordInfo() {
//     this.passwordInfo
//       ? (this.passwordInfo = false)
//       : (this.passwordInfo = true);
//   }

//   get f() {
//     return this.reactiveForm.controls;
//   }

//   get email() {
//     return this.reactiveForm.get("email")!;
//   }

//   get minLengthValid() {
//     return !this.reactiveForm.controls["password"].hasError("minlength");
//   }

//   get requiresDigitValid() {
//     return !this.reactiveForm.controls["password"].hasError("requiresDigit");
//   }

//   get requiresUppercaseValid() {
//     return !this.reactiveForm.controls["password"].hasError(
//       "requiresUppercase"
//     );
//   }

//   get requiresLowercaseValid() {
//     return !this.reactiveForm.controls["password"].hasError(
//       "requiresLowercase"
//     );
//   }

//   get requiresSpecialCharsValid() {
//     return !this.reactiveForm.controls["password"].hasError(
//       "requiresSpecialChars"
//     );
//   }

//   onSubmit() {
//     this.submitted = true;
//     if (this.reactiveForm.invalid) {
//       return;
//     }

//     this.password = this.reactiveForm.value.password;
//     this._authService.updatePass(this.id, this.token, this.password);
//     this._router.navigateByUrl("/login");
//   }

//   ngOnDestroy(): void {
//     this.unsubscribe$.next();
//     this.unsubscribe$.complete();
//   }
// }
