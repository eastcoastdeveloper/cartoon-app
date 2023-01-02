import { Component } from "@angular/core";
import { LoaderService } from "src/app/services/loader.service";

@Component({
  selector: "app-loader",
  template: `<div *ngIf="this.loader.getLoading()" class="cssload-container">
    <div class="cssload-speeding-wheel"></div>
  </div>`,
  styleUrls: ["./loader.component.scss"],
})
export class LoaderComponent {
  constructor(public loader: LoaderService) {}
}
