// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { RouteReuseStrategy } from '@angular/router';

// import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';

// import { AppComponent } from './app.component';
// import { AppRoutingModule } from './app-routing.module';
// import { ServiceWorkerModule } from '@angular/service-worker';
// import { environment } from '../environments/environment';

// @NgModule({
//   declarations: [AppComponent],
//   entryComponents: [],
//   imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })],
//   providers: [
//     StatusBar,
//     SplashScreen,
//     { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
//   ],
//   bootstrap: [AppComponent]
// })
// export class AppModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { ShareDataService } from './services/shareData.service';

//import {EventDetailComponent} from './event-detail/event-detail.component';
import { TagSelectorComponent } from '../app/tag-selector/tag-selector.component';
import { PopTasksComponent } from '../app/components/pop-tasks/pop-tasks.component';

@NgModule({
  declarations: [AppComponent, TagSelectorComponent, PopTasksComponent],
  entryComponents: [PopTasksComponent],
  imports: [BrowserModule, FormsModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })],
  providers: [
    StatusBar,
    ShareDataService,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
