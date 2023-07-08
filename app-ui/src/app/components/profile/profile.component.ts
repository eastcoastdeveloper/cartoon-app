import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { ProfileInterface } from "src/app/interfaces/profile.interface";
import { AuthService } from "src/app/services/auth.service";
import { HttpService } from "src/app/services/http.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit, OnDestroy {
  userId: string | null;
  userIsAuthenticated = false;
  username: string | null;
  currentTab: string = "settings";
  profileData: any = [];
  private destroy: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _http: HttpService
  ) {}

  ngOnInit(): void {
    this.userId = this._authService.getUserId();

    this._authService.username$
      .pipe(takeUntil(this.destroy))
      .subscribe((val) => {
        this.username = val;
      });

    this._authService
      .getAuthStatusListener()
      .pipe(takeUntil(this.destroy))
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this._authService.getUserId();
      });

    this.fetchProfileData(this.userId!);

    this._http.profileData$.pipe(takeUntil(this.destroy)).subscribe((val) => {
      this.profileData = val as ProfileInterface;
      console.log(this.profileData);
    });
  }

  fetchProfileData(id: string) {
    this._http.getProfileCaptions(id);
  }

  changePassword() {
    this._router.navigateByUrl("/forgot-password");
  }

  tabNavigation(name: string) {
    this.currentTab = name;
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
