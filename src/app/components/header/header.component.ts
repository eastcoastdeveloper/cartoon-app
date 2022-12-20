import { Component, OnInit } from "@angular/core";
import { WindowWidthService } from "src/app/services/window-width.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  windowWidth?: number;

  constructor(private _windowWidthService: WindowWidthService) {
    this._windowWidthService.currentWidth$.subscribe((val) => {
      this.windowWidth = val;
    });
  }

  ngOnInit(): void {}
}
