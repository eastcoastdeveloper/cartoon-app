import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { EmailService } from "src/app/services/email-service.service";

@Component({
  selector: "app-contact",
  templateUrl: "./contact-form.component.html",
  styleUrls: ["./contact-form.component.scss"],
})
export class ContactFormComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribe$ = new Subject<boolean>();
  emailAdress: string;
  userMessage: string;
  username: string;
  submitted = false;
  protected contactForm!: FormGroup;
  formSent: boolean = false;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private _router: Router,
    private _authService: AuthService,
    private _emailService: EmailService
  ) {}

  ngOnInit(): void {
    this.contactForm = this.formBuilder.group({
      message: ["", [Validators.required]],
    });
  }

  ngAfterViewInit(): void {
    this._authService.username$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (val) => {
        if (val != null) {
          this.username = val;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.contactForm.valid) {
      this.userMessage = this.contactForm.value.message;
      this.formSent = true;
      this._emailService.sendEmail(this.username, this.userMessage);
      setTimeout(() => {
        this._router.navigateByUrl("[/caption-contest]");
      }, 3000);
    }
  }

  onReset() {
    this.submitted = false;
    this.contactForm.reset();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
