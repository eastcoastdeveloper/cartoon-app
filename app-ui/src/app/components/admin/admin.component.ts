import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { HttpService } from "src/app/services/http.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent {
  dataArray: any | undefined;
  imageUpload: boolean = false;
  constructor(private _httpService: HttpService, private _router: Router) {
    this.checkForPendingComments();
  }

  checkForPendingComments() {
    this._httpService.adminResponseSubject$.subscribe((val) => {
      if (val.captions === undefined) {
        this.dataArray = val;
        this.dataArray.forEach((item: any) => {
          let filteredArray = item.captions.filter(
            (caption: { approved: any }) => {
              return !caption.approved;
            }
          );
          item.captions = filteredArray;
        });
      }
    });
    this._httpService.getUnapprovedCaptions();
  }

  navigateToPage(toonReference: number) {
    this._router.navigate(["home", toonReference], {
      queryParams: {
        num: toonReference,
      },
    });
  }
}
