import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { UserDataInterface } from "src/app/interfaces/user-data.interface";
import { AuthService } from "src/app/services/auth.service";
import { HttpService } from "src/app/services/http.service";
import { LocalStorageService } from "src/app/services/local-storage.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit, OnDestroy {
  @ViewChild("otp", { static: false }) otp: ElementRef;
  @ViewChild("email", { static: false }) email: ElementRef;
  @ViewChild("passcode", { static: false }) passcode: ElementRef;

  private unsubscribe$ = new Subject<void>();
  dataArray: any | undefined;
  currentTab: string = "captions";
  username: string | null;
  alphanumeric: any;
  userInput = false;
  constructor(
    private _httpService: HttpService,
    private _authService: AuthService,
    private _router: Router,
    private _localStorage: LocalStorageService
  ) {
    this.checkForPendingComments();
    this.username = this._authService.username$.value;

    this.generateCode();
    this.alphanumeric = setInterval(() => {
      this.generateCode();
    }, 900000);
  }

  ngOnInit(): void {
    this._httpService.adminAccessResponse$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        val.message === "success"
          ? (this.userInput = true)
          : (this.userInput = false);
      });
  }

  checkForPendingComments() {
    this._httpService.adminResponseSubject$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        if (val.captions === undefined) {
          this.dataArray = val;
        }
      });
    this._httpService.getUnapprovedCaptions();
  }

  onBlurEvent() {
    const otp = this.otp.nativeElement.value;
    const email = this.email.nativeElement.value;
    const passcode = this.passcode.nativeElement.value;
    this._httpService.compareValues(otp, email, passcode);
  }

  tabNavigation(name: string) {
    this.currentTab = name;
  }

  navigateToPage(toonReference: number) {
    this._router.navigate(["caption-contest", toonReference], {
      queryParams: {
        num: toonReference,
      },
    });
  }

  rejectCaption(
    data: UserDataInterface,
    captionIndex: number,
    toonReference: number
  ) {
    this.approveOrDelete(
      data,
      captionIndex,
      toonReference,
      "Irrelevant/ Inappropriate",
      false,
      true
    );
  }

  // Approve Caption
  approveCaption(
    data: UserDataInterface,
    captionIndex: number,
    toonReference: number
  ) {
    this.approveOrDelete(data, captionIndex, toonReference, "Approved", true);
  }

  // result is approved: boolean
  approveOrDelete(
    data: UserDataInterface,
    captionIndex: number,
    toonReference: number,
    outcome: string,
    result: boolean,
    flagged?: boolean
  ) {
    data.captions[captionIndex].approved = result;
    this._httpService.updateCaption(
      data.altText,
      data.captions,
      data.imageUrl,
      data.itemIndex,
      data._id,
      captionIndex,
      outcome,
      data.captions[captionIndex].creator,
      data.captions[captionIndex].id,
      flagged
    );
    this.updateCacheAfterEditOrApprove(data, captionIndex, toonReference);
    this.checkForPendingComments();
  }

  editCaption(toonReference: number, data: UserDataInterface, caption: any) {
    this.updateCacheAfterEditOrApprove(data, data.itemIndex, toonReference);
    this._httpService.adminResponseSubject$.next(data);
    this._router.navigate(["/edit"], {
      queryParams: {
        num: data.itemIndex,
        caption: encodeURI(caption),
        captionIndex: toonReference,
      },
    });
  }

  updateCacheAfterEditOrApprove(
    data: UserDataInterface,
    captionIndex: number,
    toonReference: number
  ) {
    const storage = this._localStorage.getData("captions");
    if (storage != "") {
      const parsed = JSON.parse(storage);
      const updatedObject = data.captions[captionIndex];
      null != parsed[toonReference]
        ? parsed[toonReference].captions.push(updatedObject)
        : "";
      this._localStorage.saveData("captions", JSON.stringify(parsed));
    }
  }

  generateCode() {
    this._httpService.generateOTP(this.username);
  }

  exportCaptionData() {
    console.log("captions...");
  }

  ngOnDestroy(): void {
    clearInterval(this.alphanumeric);
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
