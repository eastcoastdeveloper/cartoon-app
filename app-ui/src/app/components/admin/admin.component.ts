import { Component, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { UserDataInterface } from "src/app/interfaces/user-data.interface";
import { HttpService } from "src/app/services/http.service";
import { LocalStorageService } from "src/app/services/local-storage.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  dataArray: any | undefined;
  currentTab: string = "captions";
  constructor(
    private _httpService: HttpService,
    private _router: Router,
    private _localStorage: LocalStorageService
  ) {
    this.checkForPendingComments();
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
