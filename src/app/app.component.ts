import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { ShareDataService } from './services/shareData.service';

import { UserSession } from 'blockstack';
const userSession = new UserSession;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  isUserLogged: boolean;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private dataService: ShareDataService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.isUserLogged = userSession.isUserSignedIn();
      //this.dataService.doTheLogin(this.isUserLogged);
      //console.log(this.isUserLogged )
    });
  }

  changeTheTime(time){
    console.log(time);
    this.dataService.changeHourTime(time);
  }

  login(){
    this.dataService.doTheLogin(true);
    this.isUserLogged = userSession.isUserSignedIn();
  }

  logOut(){
    userSession.signUserOut();
    this.dataService.doTheLogin(false);
    this.isUserLogged = userSession.isUserSignedIn();
  }
}
