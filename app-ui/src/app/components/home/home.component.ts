import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { UserDataInterface } from "src/app/interfaces/dummyData";
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
  dummyDataArray: UserDataInterface[] = [];

  constructor(
    private _windowWidthService: WindowWidthService,
    private _httpService: HttpService
  ) {}

  ngOnInit(): void {
    new Promise<void>((resolve, reject) => {
      this._httpService.populateCaptions(1, 10);
      resolve(this.captureCaptionResponse());
    });

    // Subscribe to Window Width
    this._windowWidthService.currentWidth$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.windowWidth = val;
      });
  }

  // Set Caption Response to Array
  captureCaptionResponse() {
    this._httpService.responseSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.dummyDataArray = val;
      });
  }

  // Up Vote
  voteUp(data: UserDataInterface) {
    data.votes!++;
    this._httpService.updateVoteCount(data);
  }

  // Down Vote
  voteDown(data: UserDataInterface) {
    data.votes! === 0 ? (data.votes = 0) : data.votes!--;
    console.log(data.votes);
  }

  // Kill Subscriptions
  ngOnDestroy(): void {
    // Kill Subscriptions
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
