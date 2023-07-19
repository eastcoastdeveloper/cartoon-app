import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { WindowWidthService } from "./services/window-width.service";
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
} from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { LocationStrategy } from "@angular/common";
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
  height: number = window.innerWidth;
  width: number = window.innerWidth;
  errorMessage = false;

  notifications = {
    invalidURL: false,
    formSuccess: false,
  };

  queryNum: number;
  isMobile: boolean = false;
  mobileWidth: number = 760;
  backButtonClick = false;
  // toonReference: string;
  errorDescription: string | null;
  userNotification: boolean | null;

  constructor(
    private _windowWidthService: WindowWidthService,
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
          console.log(parsed);
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

    // Notification: Invalid URL
    this._httpService.invalidURL$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.notifications.invalidURL = val;
        if (val) {
          setTimeout(() => {
            this.notifications.invalidURL = this.userNotification = false;
          }, 5000);
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
  }

  // Initialize Window Width Service
  ngAfterViewInit() {
    this._windowWidthService.changeValue(window.innerWidth);
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
    this._windowWidthService.changeValue(this.width);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
