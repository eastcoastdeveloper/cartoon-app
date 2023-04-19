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

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  host: {
    "(window:resize)": "onWindowResize($event)",
  },
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  history: { toonReference: string; num: number }[] = [];
  private unsubscribe$ = new Subject<void>();
  height: number = window.innerWidth;
  width: number = window.innerWidth;
  showRedirectMessage = false;
  isMobile: boolean = false;
  mobileWidth: number = 760;
  backButtonClick = false;
  toonReference: string;
  queryNum: number;

  constructor(
    private _windowWidthService: WindowWidthService,
    private _localStorage: LocalStorageService,
    private _activatedRoute: ActivatedRoute,
    private _location: LocationStrategy,
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
        this.toonReference = this._activatedRoute.snapshot.queryParams["toon"];
        this.queryNum = this._activatedRoute.snapshot.queryParams["num"];
        if (!this.backButtonClick) {
          this.backButtonClick = false;
          this.history.push({
            toonReference: this.toonReference,
            num: this.queryNum,
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this._location.onPopState(() => {
      this.backButtonClick = true;
      if (this.history.length > 1) {
        this.history.pop();
        setTimeout(() => {
          const dataObject = this._httpService.storageObject;
          for (let item of Object.values(dataObject!)) {
            if (
              item.itemIndex ===
              Number(this.history[this.history.length - 1].num)
            ) {
              this._httpService.responseSubject$.next(item);
            }
          }
        });
      } else {
        console.log("end of the road");
        this.preventBackButton();
      }
    });

    this._httpService.invalidURL$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.showRedirectMessage = val;

        if (this.showRedirectMessage) {
          setTimeout(() => {
            this.showRedirectMessage = false;
          }, 5000);
        }
      });
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
