import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./components/home/home.component";
import { HeaderComponent } from "./components/header/header.component";
import { LoadingInterceptor } from "./guards/loading.interceptor";
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, HeaderComponent, FooterComponent],
  imports: [HttpClientModule, BrowserModule, AppRoutingModule],
  providers: [
    HttpClientModule,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
