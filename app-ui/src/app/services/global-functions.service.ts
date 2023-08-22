import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GlobalFunctionsService {
  someWidth: number = window.innerWidth;
  menuToggle$ = new BehaviorSubject<boolean>(false);

  private winWidthSource = new BehaviorSubject(this.someWidth);
  currentWidth$ = this.winWidthSource.asObservable();

  changeValue(newValue: number) {
    this.winWidthSource.next(newValue);
    return newValue;
  }

  toggleMobileMenu(val: boolean) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    this.menuToggle$.next(val);
  }
}
