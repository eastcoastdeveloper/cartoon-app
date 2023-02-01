import { Component, OnDestroy } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { WindowWidthService } from "src/app/services/window-width.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  windowWidth?: number;

  constructor(private _windowWidthService: WindowWidthService) {
    this._windowWidthService.currentWidth$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.windowWidth = val;
      });
  }

  // Kill Subscriptions
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
