import { Component, OnInit } from "@angular/core";
import { WindowWidthService } from "src/app/services/window-width.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  windowWidth?: number;

  constructor(private _windowWidthService: WindowWidthService) {}

  ngOnInit(): void {
    this._windowWidthService.currentWidth$.subscribe((val) => {
      this.windowWidth = val;
    });
  }
}
