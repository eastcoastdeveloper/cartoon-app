import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { WindowWidthService } from "src/app/services/window-width.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  windowWidth?: number;

  constructor(private _windowWidthService: WindowWidthService) {}

  ngOnInit(): void {
    this._windowWidthService.currentWidth$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.windowWidth = val;
      });
  }

  ngOnDestroy(): void {
    // Kill Subscriptions
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
