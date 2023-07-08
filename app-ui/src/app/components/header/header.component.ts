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
  userIsAuthenticated = false;
  windowWidth?: number;
  hasRole = false;
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
    this.userIsAuthenticated = this._authService.getIsAuth();
    this._authService
      .getAuthStatusListener()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
    this._authService.hasRoleListener$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: boolean) => {
        this.hasRole = user;
      });
  }

  onLogout() {
    this._authService.logout();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
