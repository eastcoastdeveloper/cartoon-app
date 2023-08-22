import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from "./components/login/login.component";
import { SignupComponent } from "./components/signup/signup.component";
import { AdminComponent } from "./components/admin/admin.component";
import { AuthGuard } from "./guards/auth.guard";
import { ProfileComponent } from "./components/profile/profile.component";
import { ForgotPasswordComponent } from "./components/forgot-password/forgot-password.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "caption-contest",
    pathMatch: "full",
  },
  {
    path: "caption-contest",
    component: HomeComponent,
  },
  {
    path: "edit",
    component: HomeComponent,
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
  },
  {
    path: "reset-password/:id/:token",
    component: SignupComponent,
  },
  {
    path: "signup",
    component: SignupComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "profile",
    component: ProfileComponent,
  },
  {
    path: "**",
    redirectTo: "caption-contest",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}

export const routingComponents = [
  HomeComponent,
  SignupComponent,
  LoginComponent,
  ForgotPasswordComponent,
  AdminComponent,
  ProfileComponent,
];
