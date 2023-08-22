import { DOCUMENT } from "@angular/common";
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { GlobalFunctionsService } from "src/app/services/global-functions.service";

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
  menuOpen: boolean | null;
  default: true;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private _renderer2: Renderer2,
    private _globalFunctionService: GlobalFunctionsService,
    private _authService: AuthService
  ) {
    this._globalFunctionService.currentWidth$
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

    this._globalFunctionService.menuToggle$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.menuOpen = val;
      });
  }

  onLogout() {
    this._authService.logout();
  }

  toggleMobileMenu() {
    if (this.menuOpen === true) {
      this.menuOpen = false;
      this._renderer2.removeStyle(this.document.body, "overflow");
    } else {
      this._renderer2.setStyle(this.document.body, "overflow", "hidden");
      this.menuOpen = true;
    }

    this._globalFunctionService.toggleMobileMenu(this.menuOpen);
  }

  closeMobileMenu() {
    this.menuOpen = false;
    this._globalFunctionService.toggleMobileMenu(false);
    this._renderer2.removeStyle(this.document.body, "overflow");
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
