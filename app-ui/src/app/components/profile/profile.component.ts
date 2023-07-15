import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { latLng, Map, tileLayer } from "leaflet";
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
  private destroy$: Subject<boolean> = new Subject<boolean>();
  map: Map;
  locationEnabled = false;
  city: string;
  country: string;
  mapLoaded = false;
  userId: string | null;
  userIsAuthenticated = false;
  username: string | null;
  currentTab: string = "settings";
  profileData: any = [];
  latitude: number;
  longitude: number;

  options = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "...",
      }),
    ],
    zoom: 12,
    center: latLng(0, 0),
  };

  constructor(
    private _authService: AuthService,
    private _http: HttpService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this._authService.getUserId();

    this._authService.username$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (val) => {
        this.username = val;
      },
      error: (err) => {
        console.log(err);
      },
    });

    // if (this._router.url === "/profile") {
    this._http.location$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (val) => {
        this.city = val.city;
        this.country = val.country;
        null != this.city && null != this.userId
          ? this._http.saveGeolocation(this.city, this.country, this.userId)
          : "";
      },
    });
    // }

    this._authService
      .getAuthStatusListener()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isAuthenticated) => {
          this.userIsAuthenticated = isAuthenticated;
          this.userId = this._authService.getUserId();
        },
      });

    this.fetchProfileData(this.userId!);

    this._http.profileData$.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.profileData = val as ProfileInterface;
    });

    if (this._router.url === "/profile") {
      navigator.geolocation.watchPosition((res) => {
        this.getPosition();
      });
    }

    this.getPosition().then((pos) => {
      if ("geolocation" in navigator) {
        this.locationEnabled = true;
        this.mapLoaded = true;
        this.options.center.lat = pos.lat;
        this.options.center.lng = pos.lng;
        this.reverseGeocode(pos.lat, pos.lng);
      }
    });
  }

  reverseGeocode(lat: number, long: number) {
    if (this._router.url === "/profile") {
      this._http.getCoordinates(lat, long);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.locationEnabled ? (this.mapLoaded = true) : (this.mapLoaded = false);
    });
  }

  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((resp) => {
        resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
      });
    });
  }

  onMapReady(map: Map) {
    this.map = map;
    this.options.center;
  }

  refreshPage() {
    this.ngOnInit();
  }

  fetchProfileData(id: string) {
    id
      ? this._http.getProfileCaptions(id)
      : this._router.navigateByUrl("/login");
  }

  changePassword() {
    this._router.navigateByUrl("/forgot-password");
  }

  tabNavigation(name: string) {
    this.currentTab = name;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
