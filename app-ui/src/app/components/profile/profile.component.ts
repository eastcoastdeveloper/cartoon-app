import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit, OnDestroy {
  userId: string | null;
  userIsAuthenticated = false;
  username: string | null;
  private destroy: Subject<boolean> = new Subject<boolean>();

  constructor(private _authService: AuthService) {}

  ngOnInit(): void {
    this.userId = this._authService.getUserId();

    this._authService.username$
      .pipe(takeUntil(this.destroy))
      .subscribe((val) => {
        this.username = val;
      });

    this._authService.getAuthStatusListener().subscribe((isAuthenticated) => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this._authService.getUserId();
    });
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
