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

  rejectCaption() {
    this._httpService.flagCaption();
  }

  // Approve Caption
  approveCaption(
    data: UserDataInterface,
    captionIndex: number,
    toonReference: number
  ) {
    data.captions[captionIndex].approved = true;
    this._httpService.updateCaption(
      data.altText,
      data.captions,
      data.imageUrl,
      data.itemIndex,
      data._id,
      data.captions[captionIndex].creator,
      data.captions[captionIndex].id
    );
    const storage = this._localStorage.getData("captions");
    const parsed = JSON.parse(storage);
    const updatedObject = data.captions[captionIndex];
    // console.log(parsed);
    null != parsed[toonReference]
      ? parsed[toonReference].captions.push(updatedObject)
      : "";
    this._localStorage.saveData("captions", JSON.stringify(parsed));
  }

  editCaption(toonReference: number, data: UserDataInterface, caption: any) {
    this._httpService.adminResponseSubject$.next(data);
    this._router.navigate(["/edit"], {
      queryParams: {
        num: toonReference,
        caption: encodeURI(caption),
        captionIndex: data.itemIndex,
      },
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
