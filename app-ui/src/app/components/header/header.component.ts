import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { WindowWidthService } from "src/app/services/window-width.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  windowWidth?: number;

  constructor(private _windowWidthService: WindowWidthService) {
    this._windowWidthService.currentWidth$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.windowWidth = val;
        console.log(this.windowWidth)
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // Kill Subscriptions
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}