import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { UserDataInterface } from "src/app/interfaces/user-data.interface";
import { HttpService } from "src/app/services/http.service";
import { WindowWidthService } from "src/app/services/window-width.service";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  windowWidth?: number;
  userDataArray: UserDataInterface[] = [];
  hover: boolean = false;
  formResults: UserDataInterface;

  currentImage: string =
    "https://blog-www.pods.com/wp-content/uploads/2019/08/MG_6_1_Miami.jpg";

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
        this.userDataArray = val;
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
    this._httpService.updateVoteCount(data);
  }

  @ViewChild("captionForm") form: NgForm;

  onSubmit() {
    this.formResults = {
      caption: this.form.value.caption,
      email: this.form.value.email,
      firstName: this.form.value.fName,
      lastName: this.form.value.lName,
      city: this.form.value.city,
      state: this.form.value.state,
    };
    this._httpService.postFormResults(this.formResults);
    this.form.reset();
  }

  // Kill Subscriptions
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
