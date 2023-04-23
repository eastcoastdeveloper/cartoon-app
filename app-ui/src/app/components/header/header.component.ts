import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { WindowWidthService } from "src/app/services/window-width.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  windowWidth?: number;
  userIsAuthenticated = false;
  default: true;

  constructor(
    private _windowWidthService: WindowWidthService,
    private _authService: AuthService
  ) {
    this._windowWidthService.currentWidth$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.windowWidth = val;
      });
  }

  ngOnInit(): void {
    this._authService.getAuthStatusListener().subscribe((isAuthenticated) => {
      this.userIsAuthenticated = isAuthenticated;
      console.log("Header: Is Authenticated");
    });
  }

  onLogout() {
    this._authService.logout();
  }

  // Kill Subscriptions
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
