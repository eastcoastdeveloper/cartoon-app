import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { GlobalFunctionsService } from "./services/global-functions.service";
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
} from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { DOCUMENT, LocationStrategy } from "@angular/common";
import { LocalStorageService } from "./services/local-storage.service";
import { HttpService } from "./services/http.service";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  host: {
    "(window:resize)": "onWindowResize($event)",
  },
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  history: { num: number }[] = [];
  private unsubscribe$ = new Subject<void>();
  userIsAuthenticated = false;
  hasRole = false;
  height: number = window.innerWidth;
  width: number = window.innerWidth;
  errorMessage = false;

  frequency?: any | null;
  inactiveTimer: any;
  loggedout = false;
  elapsedTime = 0;

  notifications = {
    invalidURL: false,
    formSuccess: false,
    adminAccessResponse: false,
  };

  queryNum: number;
  isMobile: boolean = false;
  showMenu: boolean;
  mobileWidth: number = 760;
  backButtonClick = false;
  errorDescription: string | null;
  userNotification: boolean | null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private _renderer2: Renderer2,
    private _globalFunctionsService: GlobalFunctionsService,
    private _localStorage: LocalStorageService,
    private _activatedRoute: ActivatedRoute,
    private _location: LocationStrategy,
    private _authService: AuthService,
    private _httpService: HttpService,
    private _router: Router
  ) {
    this.history = [];
    this._router.events.pipe(takeUntil(this.unsubscribe$)).subscribe((ev) => {
      if (ev instanceof NavigationStart) {
        const storage = this._localStorage.getData("captions");
        if (storage != "") {
          let parsed = JSON.parse(storage);
          this._httpService.totalItems$.next(parsed.length);
        }
      }
      if (ev instanceof NavigationEnd) {
        this.queryNum = parseInt(
          this._activatedRoute.snapshot.queryParams["num"]
        );
        if (!this.backButtonClick) {
          this.backButtonClick = false;
          this.history.push({
            num: this.queryNum,
          });
        }
      }
    });
  }

  ngOnInit(): void {
    // Back Button
    this._location.onPopState(() => {
      this.backButtonClick = true;
      if (this.history.length > 1) {
        this.history.pop();
        setTimeout(() => {
          const dataObject = this._httpService.storageObject;
          for (let item of Object.values(dataObject!)) {
            if (null != item) {
              if (
                item.itemIndex ===
                Number(this.history[this.history.length - 1].num)
              ) {
                this._httpService.responseSubject$.next(item);
              }
            }
          }
        });
      } else {
        console.log("end of the road");
        this.preventBackButton();
      }
    });

    this._httpService.adminAccessResponse$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        if (val.message === "Not found") {
          this.notifications.adminAccessResponse = true;
          this.userNotification = false;
        }
        if (val.message === "Success") {
          this.notifications.adminAccessResponse = true;
          this.userNotification = true;
        }
        setTimeout(() => {
          this.notifications.adminAccessResponse = this.userNotification =
            false;
        }, 5000);
      });

    // Notification: Invalid URL
    this._httpService.invalidURL$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.notifications.invalidURL = val;
        if (val) {
          this.notifications.invalidURL = this.userNotification = false;
          setTimeout(() => {}, 5000);
        }
      });

    // Form Submitted
    this._httpService.formSubmitted$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (val) => {
          this.notifications.formSuccess = true;
          val
            ? (this.userNotification = true)
            : (this.userNotification = false);
          setTimeout(() => {
            this.notifications.formSuccess = this.userNotification = false;
          }, 5000);
        },
      });

    this._authService.autoAuthUser();

    // Logout if user navigates to another tab/ window
    window.onblur = () => {
      if (!this.loggedout) {
        this.userInactiveLogout();
      }
    };
    window.onfocus = () => {
      if (this.inactiveTimer !== null) {
        clearTimeout(this.inactiveTimer);
        this.inactiveTimer = null;
      }
    };
    window.onclick = () => {
      if (this.inactiveTimer !== null) {
        clearTimeout(this.inactiveTimer);
        this.inactiveTimer = null;
      }
    };

    // Logout if user is inactive for five minutes
    window.onfocus = () => {
      this.elapsedTime = 0;
    };
    window.onclick = () => {
      this.elapsedTime = 0;
    };

    let frequency = setInterval(() => {
      this.elapsedTime++;
      if (this.elapsedTime > 300) {
        clearInterval(frequency);
        this._authService.logout();
        this._router.navigateByUrl("/login");
      }
    }, 1000);

    this._globalFunctionsService.menuToggle$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.showMenu = val;
      });

    this.userIsAuthenticated = this._authService.getIsAuth();
    this._authService
      .getAuthStatusListener()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
    this._authService.hasRoleListener$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user: boolean) => {
        this.hasRole = user;
      });
  }

  // Auto logout after three minutes due to navigating to another tab or application
  userInactiveLogout() {
    this.inactiveTimer = setTimeout(() => {
      this.loggedout = true;
      this._authService.logout();
      this._router.navigateByUrl("/login");
    }, 180000); // 3 minutes
  }

  closeMobileMenu() {
    this._renderer2.removeStyle(this.document.body, "overflow");
    this._globalFunctionsService.toggleMobileMenu(false);
  }

  onLogout() {
    this._authService.logout();
  }

  // Initialize Window Width Service
  ngAfterViewInit() {
    this._globalFunctionsService.changeValue(window.innerWidth);
  }

  preventBackButton() {
    history.pushState(null, null!, location.href);
    this._location.onPopState(() => {
      history.pushState(null, null!, location.href);
    });
  }

  // Set Values on Resize
  onWindowResize(event: any) {
    this.width = event.target.innerWidth;
    this.height = event.target.innerHeight;
    this.isMobile = this.width < this.mobileWidth;
    this._globalFunctionsService.changeValue(this.width);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
