import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { HttpService } from "src/app/services/http.service";
import { WindowWidthService } from "src/app/services/window-width.service";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { IUser } from "src/app/interfaces/form.interface";
import {
  CaptionsInterface,
  UserDataInterface,
} from "src/app/interfaces/user-data.interface";
import { LocalStorageService } from "src/app/services/local-storage.service";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  captionsArray: CaptionsInterface[] = [];
  userIsAuthenticated = false;
  captionsGroupIndex: number = 1;
  currentImage: string;
  mode: string = "create";
  totalCaptions: number;
  altText: string;
  reactiveForm!: UntypedFormGroup;
  editingData: UserDataInterface;
  captionFromAdmin: string;
  captionIndex: number;
  captionBeingEdited: string;
  totalItems: number;
  manualURL: string;
  hover: boolean = false;
  windowWidth?: number;
  toonIndex: number;
  user: IUser = {
    caption: "",
    firstname: "",
    lastname: "",
    city: "",
    state: "",
    country: "",
    approved: false,
  };

  constructor(
    private _windowWidthService: WindowWidthService,
    private _authService: AuthService,
    private _activateRoute: ActivatedRoute,
    private _localStorage: LocalStorageService,
    private _httpService: HttpService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.reactiveForm = new UntypedFormGroup({
      caption: new UntypedFormControl(this.user.caption, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      firstname: new UntypedFormControl(this.user.firstname, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      lastname: new UntypedFormControl(this.user.lastname, [
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      city: new UntypedFormControl(this.user.city, [
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      state: new UntypedFormControl(this.user.state, [
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
    });

    // Subscribe to Window Width
    this._windowWidthService.currentWidth$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.windowWidth = val;
      });

    // Set Values & Append Date to URL
    if (this._router.url.includes("caption-contest")) {
      this.mode = "create";
      this._httpService.responseSubject$
        .pipe(takeUntil(this.destroy$))
        .subscribe((val) => {
          if (val) {
            this.currentImage = val.imageUrl;
            this.altText = val.altText;
            this.captionsArray = val.captions;
            this.toonIndex = val.itemIndex;
            // this.creator = val.creator
            this.totalCaptions = this.captionsArray.length;

            this._router.navigate(["caption-contest"], {
              queryParams: {
                num: this.toonIndex,
              },
            });
          }
        });
    }

    // Capture manual value entered
    // Capture caption being edited & associated image
    this._activateRoute.queryParams.subscribe((val: Params) => {
      this.manualURL = val["num"];
      if (null != val["caption"]) {
        this.mode = "edit";
        this.captionFromAdmin = val["caption"];
        this.captionIndex = val["captionIndex"];
        this.editingData = this._httpService.adminResponseSubject$.getValue();
        this.currentImage = this.editingData.imageUrl;
        this.captionBeingEdited = this.captionFromAdmin.replace(/%20/g, " ");

        // Redirect to login if logged out while editing a caption
        this.currentImage === "" ? this._router.navigate(["/login"]) : "";
      }
    });

    // Is User Authenticated?
    this.userIsAuthenticated = this._authService.getIsAuth();
    this.userIsAuthenticated
      ? this.reactiveForm.enable()
      : this.reactiveForm.disable();

    this._authService.getAuthStatusListener().subscribe((isAuthenticated) => {
      this.userIsAuthenticated = isAuthenticated;
      this.userIsAuthenticated
        ? this.reactiveForm.enable()
        : this.reactiveForm.reset(),
        this.reactiveForm.disable();
    });

    const storage = this._localStorage.getData("captions");
    if (storage === "" || this.manualURL === undefined) {
      this.getTotals();
    }
    if (this.manualURL) {
      this.fetchCartoonData(parseInt(this.manualURL));
    }

    // Total Items Available!
    this._httpService.totalItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.totalItems = val;
      });
  }

  // Update Approved Caption
  updateCaption() {
    const updatedCaption = this.reactiveForm.controls["caption"].value;
    this.editingData.captions[this.captionIndex].caption = updatedCaption;
    this.editingData.captions[this.captionIndex].approved = true;
    this._httpService.updateCaption(
      this.editingData.altText,
      this.editingData.captions,
      this.editingData.imageUrl,
      this.editingData.itemIndex,
      this.editingData._id
    );
    this._router.navigate(["/admin"]);
    this.cacheNewlyEditedCaption();
    const storage = this._localStorage.getData("captions");
    const parsed = JSON.parse(storage);
  }

  // Cache Edited Caption
  cacheNewlyEditedCaption() {
    const storage = this._localStorage.getData("captions");
    const parsed = JSON.parse(storage);
    const updatedObject = this.editingData.captions[this.captionIndex];
    parsed[this.manualURL].captions.push(updatedObject);
    this._localStorage.saveData("captions", JSON.stringify(parsed));
  }

  // Called Once on Load
  async getTotals() {
    await new Promise((resolve) => {
      const randomNumber = Math.floor(Math.random() * 5);
      resolve(this.fetchCartoonData(randomNumber));
    });
  }

  // Check Cache Before Fetch
  fetchCartoonData(toonReference?: number) {
    this._httpService.captionsCacheCheck(toonReference);
  }

  // Form Field Getters
  get caption() {
    return this.reactiveForm.get("caption")!;
  }

  get firstname() {
    return this.reactiveForm.get("firstname")!;
  }

  get lastname() {
    return this.reactiveForm.get("lastname")!;
  }

  get city() {
    return this.reactiveForm.get("city")!;
  }

  get state() {
    return this.reactiveForm.get("state")!;
  }

  // Form Validation & Post to Backend
  public validate(): void {
    if (this.reactiveForm.invalid) {
      for (const control of Object.keys(this.reactiveForm.controls)) {
        this.reactiveForm.controls[control].markAsTouched();
      }
      return;
    }
    if (this.reactiveForm.valid) {
      this.user = this.reactiveForm.value;
      this._httpService.postFormResults(this.user);
      this.reactiveForm.reset();
    }
  }

  // Next Image
  navigateNext() {
    this.totalItems - 1 > this.toonIndex
      ? this.toonIndex++
      : (this.toonIndex = 0);
    this.fetchCartoonData(this.toonIndex);
  }

  // Previous Image
  navigatePrevious() {
    this.toonIndex === 0
      ? (this.toonIndex = this.totalItems - 1)
      : this.toonIndex--;
    this.fetchCartoonData(this.toonIndex);
  }

  // Up Vote
  voteUp(vote: number) {
    vote!++;
    this._httpService.updateVoteCount(vote);
  }

  // Down Vote
  voteDown(vote: number) {
    vote! === 0 ? (vote = 0) : vote!--;
    this._httpService.updateVoteCount(vote);
  }

  loadMoreCaptions() {
    this.captionsGroupIndex++;
    this._httpService.captionsCacheCheck(this.toonIndex);
  }

  // Kill Subscriptions
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
