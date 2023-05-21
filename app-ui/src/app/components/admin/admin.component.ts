import { Component } from "@angular/core";
import { HttpService } from "src/app/services/http.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent {
  dataArray: any | undefined;
  constructor(private _httpService: HttpService) {
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
}
