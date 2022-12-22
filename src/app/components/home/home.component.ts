import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { DummyDataInterface } from "src/app/interfaces/dummyData";
import { HttpService } from "src/app/services/http.service";
import { WindowWidthService } from "src/app/services/window-width.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  windowWidth?: number;
  dummyDataArray: DummyDataInterface[] = [];

  constructor(
    private _windowWidthService: WindowWidthService,
    private _httpService: HttpService
  ) {}

  ngOnInit(): void {
    new Promise<void>((resolve, reject) => {
      this._httpService.fetchDummyData();
      resolve(this.doSomething());
    });

    // Subscribe to Window Width
    this._windowWidthService.currentWidth$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.windowWidth = val;
      });
  }

  doSomething() {
    this._httpService.responseSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.dummyDataArray = val;
      });
  }

  ngOnDestroy(): void {
    // Kill Subscriptions
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
