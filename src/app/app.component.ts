import { AfterViewInit, Component, OnInit } from "@angular/core";
import { WindowWidthService } from "./services/window-width.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  host: {
    "(window:resize)": "onWindowResize($event)",
  },
})
export class AppComponent implements AfterViewInit {
  mobileWidth: number = 760;
  width: number = window.innerWidth;
  height: number = window.innerWidth;
  isMobile: boolean = false;

  constructor(private _windowWidthService: WindowWidthService) {}

  // Initialize Window Width Service
  ngAfterViewInit() {
    this._windowWidthService.changeValue(window.innerWidth);
  }

  onWindowResize(event: any) {
    this.width = event.target.innerWidth;
    this.height = event.target.innerHeight;
    this.isMobile = this.width < this.mobileWidth;
    this._windowWidthService.changeValue(this.width);
  }
}
