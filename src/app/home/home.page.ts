import { Component, ViewChild, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
//import { Geolocation } from '@ionic-native/geolocation/ngx';
import { CalendarComponent } from 'ionic2-calendar/calendar';

import {parseISO, endOfDay } from 'date-fns';

import * as blockstack from 'blockstack';

//import { WeatherService } from '../services/weather.service';
import { ShareDataService } from '../services/shareData.service';
import { PopTasksComponent} from '../components/pop-tasks/pop-tasks.component';

import { Plugins } from '@capacitor/core';
const { LocalNotifications } = Plugins;

const appConfig = new blockstack.AppConfig(['store_write', 'publish_data']);
const userSession = new blockstack.UserSession({ appConfig: appConfig });

//const transitPrivateKey = userSession.generateAndStoreTransitKey();
// const redirectURI = 'https://calendarblock.web.app';
// const manifestURI = 'https://calendarblock.web.app/manifest.json';
// const scopes = ['store_write', 'publish_data'];
// const appDomain = 'https://calendarblock.web.app';
const gaiaPutOptions = { encrypt: false };
const gaiaGetOptions = { decrypt: false };

let popOverSub = null;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})

export class HomePage implements OnInit{
  personaName: any;
  
  isUserLogged: boolean;
  todayPage: boolean;
  calendarPage: boolean;
  toDosPage: boolean;
  settingsPage: boolean;
  showAddEventComponent: boolean;
  eventIsEditing: boolean = false;
  eventSelected: boolean = false;
  showLoginComponent: boolean = false;
  createNewToDoList: boolean = false;
  taskIsOpen: boolean = false;
  isLoading: boolean = false;

  eventIndex = [];
  eventSource = [];
  
  weatherObj: Object;

  viewTitle: string;
  textMonth: string;
  textDay: string;
  numberDay: string;

  parseStartTime: any;
  parseEndTime: any;

  calendar = {
    mode: 'month',
    currentDate: new Date(),
  };

  event = {
    title: '',
    desc: '',
    startTime: '',
    endTime: '',
    allDay: false,
    remindMe: false,
    loc: '',
    storeDate: '',
    tag: '',
    tagColor: '',
    reminder: null,
    reminderLegend: ''
  };

  @ViewChild(CalendarComponent, null) myCal: CalendarComponent;
  currentPopOver: any;
  ampm: boolean;

  constructor(
              private dataService: ShareDataService,
              private alertCtrl: AlertController,
              public popoverController: PopoverController,
              private ref: ChangeDetectorRef
              ) {}

  ngOnInit(){
    this.isLoading = true;
    this.loginBlockstack();
    //this.getWeatherData();
    this.changeScreen('today');
    this.beSubscribe();
    let todayDate = new Date();
    this.textDay = todayDate.toLocaleString('default', { weekday: 'long' });
    this.textMonth = todayDate.toLocaleString('default', { month: 'short' });
    this.numberDay = todayDate.toLocaleString('default', { day: 'numeric'});
  }

  beSubscribe(){
    this.dataService.isLoadingScreen.subscribe(loading => {
      if(loading === null){}
      if(loading === true){
        this.isLoading = true;
      }
      if(loading === false){
        this.isLoading = false;
      }
    })

    this.dataService.addDataEvent.subscribe(event => {
      if(event !== null){
        this.storeTheEvent(event);
      }
    });
    this.dataService.saveEditDataEvent.subscribe(event => {
      if(event !== null){
        this.storeEditEvent(event);
      }
    });
    this.dataService.loginEvent.subscribe(doTheLogin => {
      if(doTheLogin === null){

      }
      if(doTheLogin == true){
        this.login();
      } 
      if(doTheLogin == false) {
        this.showLoginComponent = true;
      }
    });
    this.dataService.openTaskList.subscribe(isOpenTask => {
      if(isOpenTask){
        this.taskIsOpen = true;
      }
      if(!isOpenTask){
        this.taskIsOpen = false;
      }
    });
    this.dataService.closeNewTaskList.subscribe(close => {
      if(close !== null){
        this.createToDoList();
      }
    });

    this.dataService.changeHour.subscribe(time => {
      if(time === 'gringo' || time === null || time === undefined){
        this.ampm = true;
        return userSession.putFile('user/timeFormat.json', time , gaiaPutOptions);
      }
      if(time === 'world'){
        this.ampm = false;
        return userSession.putFile('user/timeFormat.json', time , gaiaPutOptions);
      }
      
    });
    
  }

  loadGaiaEvents(){
    this.eventIndex = [];
    this.eventSource = [];
    userSession.getFile('calenderEventIndex.json', gaiaGetOptions).then((data) => {
      if(data){
      let eventsIndexInGaia = JSON.parse(data as string);
      this.eventIndex = eventsIndexInGaia;
      //console.log('index en Gaia => ', eventsIndexInGaia, 'events en arr => ', this.eventIndex);
      for (let indexEvent of eventsIndexInGaia){
        userSession.getFile('calenderEvent/' + indexEvent + '.json', gaiaGetOptions)
        .then(data => {
          if(data){
            let eventDataGaia = JSON.parse(data as string);
            let eventData = {
              title: eventDataGaia.title,
              startTime:  parseISO(eventDataGaia.startTime),
              endTime: parseISO(eventDataGaia.endTime),
              allDay: eventDataGaia.allDay,
              desc: eventDataGaia.desc,
              loc: eventDataGaia.loc,
              storeDate: eventDataGaia.storeDate,
              tag: eventDataGaia.tag,
              tagColor: eventDataGaia.tagColor,
              remindMe: eventDataGaia.remindMe,
              reminder: parseISO(eventDataGaia.reminder),
              reminderLegend: eventDataGaia.reminderLegend
            }
            if (eventData.allDay) {
              eventData.endTime = endOfDay(eventData.endTime);
            }

            this.eventSource.push(eventData);
            this.myCal.loadEvents();
          } else {
            this.eventSource = [];
          }
          //this.isLoading = false;
        });
      }
      }
    });
  }

  //////CALENDAR///////
  resetEvent() {
    this.event = {
      title: '',
      desc: '',
      startTime: '',
      endTime: '',
      allDay: false,
      remindMe: false,
      loc: '',
      storeDate: '', 
      tag: '',
      tagColor: '',
      reminder: null,
      reminderLegend: ''
    };
  }

  // Change between month/week/day
  changeMode(mode) {
    this.calendar.mode = mode;
  } 

  // Focus today
  today() {
    this.calendar.currentDate = new Date();
  }
 
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  editEventSelected(event){
    popOverSub.unsubscribe();
    this.dataService.editEventData(event);
    this.showAddEventComponent = !this.showAddEventComponent;
    this.eventIsEditing = true;
    this.eventSelected = false;
  }

  async deleteEventSelected(event){

    const alert = await this.alertCtrl.create({
      header: 'Confirm event deletion',
      subHeader: 'This is permanent',
      message: 'Do you really want to delete the event?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            popOverSub.unsubscribe();
          }
        }, {
          text: 'Okay',
          handler: () => {
            popOverSub.unsubscribe();
            userSession.deleteFile('calenderEvent/' + event.storeDate + '.json')
            .then(() => {
              this.eventIndex.splice(this.eventIndex.indexOf(event.storeDate), 1);
              let eventIndexToString = JSON.stringify(this.eventIndex);
              userSession.putFile('calenderEventIndex.json', eventIndexToString, gaiaPutOptions)
              .then(() => {
                this.loadGaiaEvents();
                this.closeEventSelected();
              });
            });
          }
        }
      ]
    });
    await alert.present();
  }

  closeEventSelected (){
    this.eventSelected = false;
    this.resetEvent();
  }

  onEventSelected(event) {
    this.eventSelected = true;
    this.eventIsEditing = false;
    this.event = event;
  }

  onTimeSelected(ev) {
    let selected = new Date(ev.selectedTime);
    this.event.startTime = selected.toISOString();
    selected.setHours(selected.getHours() + 1);
    this.event.endTime = (selected.toISOString());
  }

  nextMonth() {
    var swiper = document.querySelector('.swiper-container')['swiper'];
    swiper.slideNext();
  }

  backMonth() {
    var swiper = document.querySelector('.swiper-container')['swiper'];
    swiper.slidePrev();
  }

  closeAddEvent(){
    this.showAddEventComponent = false;
  }
  closeEventEdited(){
    this.showAddEventComponent = false;
    this.eventIsEditing = false;
    this.eventSelected = true;
  }

  openAddEvent(){
    this.showAddEventComponent = !this.showAddEventComponent;
    if(!this.showAddEventComponent){
      this.eventIsEditing = false;
      this.dataService.editEventData(null);
    }
  }

  async tasksOptionsPopover(ev: any, eventOpen) {
    this.dataService.openPopOver('');
    
    //this.taskListOpen = taskListOpen;
    this.currentPopOver = await this.popoverController.create({
      component: PopTasksComponent,
      event: ev,
      translucent: false,
      animated: true,
      mode: "ios"
    });

    popOverSub = this.dataService.openPopOverList.subscribe(action => {
      if(action === ''){
      }
      if(action === 'edit'){
        this.editEventSelected(eventOpen);
        this.currentPopOver.dismiss();
      }
      if(action === 'delete'){
        this.deleteEventSelected(eventOpen);
        this.currentPopOver.dismiss();
      }
    });

    return await this.currentPopOver.present();
  }

  storeEditEvent(event){
    userSession.deleteFile('calenderEvent/' + event.storeDate + '.json')
    .then(() => {
      this.eventSource.splice(this.eventSource.indexOf(event.storeDate), 1, event);
      this.eventIndex.splice(this.eventIndex.indexOf(event.storeDate), 1);
      this.eventIndex.push(event.storeDate);
      this.myCal.loadEvents();
      this.closeAddEvent();
      this.onEventSelected(event);
      let eventIndexToString = JSON.stringify(this.eventIndex);
      let eventOnlyToString = JSON.stringify(event);
      userSession.putFile('calenderEventIndex.json', eventIndexToString, gaiaPutOptions);
      userSession.putFile('calenderEvent/' + event.storeDate + '.json', eventOnlyToString, gaiaPutOptions);
    });
  }

  storeTheEvent(event){
    this.eventIndex.push(event.storeDate);
    this.eventSource.push(event);
    let eventIndexToString = JSON.stringify(this.eventIndex);
    let eventOnlyToString = JSON.stringify(event);
    this.showAddEventComponent = false;
    userSession.putFile('calenderEventIndex.json', eventIndexToString, gaiaPutOptions);
    userSession.putFile('calenderEvent/' + event.storeDate + '.json', eventOnlyToString, gaiaPutOptions)
    .then((data) => {
      this.myCal.loadEvents();
      this.resetEvent();
      event = null;
      //this.showAddEventComponent = false;
    });
    if(event.remindMe){
      this.addEventNotification(event);
    }
  }

  createToDoList(){
    this.createNewToDoList = !this.createNewToDoList;
    this.dataService.createToDoList(this.createNewToDoList);
  }

  closeTaskOpen(){
    this.taskIsOpen = !this.taskIsOpen;
    this.dataService.openToDoList(false);

  }

  /////////////////////////

  login(){
    userSession.redirectToSignIn();
    this.loginBlockstack();
  }

  logOut(){
    userSession.signUserOut()
  }

  loginBlockstack(){
    if (userSession.isUserSignedIn()) {
      let profile = userSession.loadUserData().profile;
      this.showProfile(profile);
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(userData => {
        let profile = userData.profile;
        this.showProfile(profile);
      });
    } else {
      this.isLoading = false;
      this.showLoginComponent = true;
      //userSession.redirectToSignIn();
    }
  }

  showProfile(profile) {
    this.showLoginComponent = false;
    let person = new blockstack.Person(profile);
    this.personaName = person.name();
    this.isUserLogged = userSession.isUserSignedIn();
    if(this.isUserLogged){
      this.getUserSettings();
      this.loadGaiaEvents();
      this.isLoading = false;
      //this.loadEventsInGaia();
      //this.dataService.passUserInfo(userSession);
    } 
    else if(!this.isUserLogged){
    } 

    // document.getElementById('heading-name').innerHTML = person.name()
    // document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
  }

  getUserSettings(){
    userSession.getFile('user/timeFormat.json', gaiaGetOptions).then((time) => {
      if(time === 'gringo' || time === null){
        this.ampm = true;
      } 
      if(time === 'world'){
        this.ampm =  false;
      }
      this.dataService.changeHourTime(time as string)
    });
  }

  segmentCalendar(screen){
    if(screen.detail.value == 'today'){
      this.todayPage = true;
      this.calendarPage = false;
      this.toDosPage = false;
    }
    if(screen.detail.value == 'calendar'){
      this.todayPage = false;
      this.toDosPage = false;
      this.calendarPage = true;
    }
    if(screen == 'todos'){
      this.todayPage = false;
      this.calendarPage = false;
      this.toDosPage = true;
    }
  }

  changeScreen(screen){
    if(screen == 'today'){
      this.todayPage = true;
      this.calendarPage = false;
      this.toDosPage = false;
      this.settingsPage = false;
    }
    if(screen == 'calendar'){
      this.calendarPage = true;
      this.todayPage = false;
      this.toDosPage = false;
      this.settingsPage = false;
    }
    if(screen == 'todos'){
      this.dataService.doTheLoading(true);
      this.toDosPage = true;
      this.todayPage = false;
      this.calendarPage = false;
      this.settingsPage = false;
      this.eventSelected = false;
    }
    
    if(screen == 'settings'){
      this.todayPage = false;
      this.calendarPage = false;
      this.toDosPage = false;
      this.settingsPage = true;
    }
  }

  addEventNotification(event){
    LocalNotifications.schedule({
      notifications: [
        {
          title: event.title,
          body: event.desc,
          id: event.storeDate,
          //schedule: { at: new Date(Date.now() + 1000 * 5) },
          schedule: { at: event.reminder },
          sound: null,
          attachments: null,
          actionTypeId: "",
          extra: null
        }
      ]
    });

  }

}
