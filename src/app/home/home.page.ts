import { Component, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
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
const redirectURI = 'https://calendblock.appassionates.com';
const manifestURI = 'https://calendblock.appassionates.com/manifest.json';
const scopes = ['store_write', 'publish_data'];
const appDomain = 'https://calendblock.appassionates.com';
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

  eventIndex = [];
  eventSource = [];
  
  weatherObj: Object;

  viewTitle: string;
  textMonth: string;
  textDay: string;
  numberDay: string;

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

  constructor(
              //private geolocation: Geolocation,
              private dataService: ShareDataService,
              private alertCtrl: AlertController,
              public popoverController: PopoverController
              //private ws: WeatherService
              ) {}

  ngOnInit(){
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
    this.dataService.addDataEvent.subscribe(event => {
      console.log('event del service es ', event);
      if(event !== null){
        this.storeTheEvent(event);
      }
    });
    this.dataService.saveEditDataEvent.subscribe(event => {
      if(event !== null){
        console.log('salvamos el event editado ', event);
        this.storeEditEvent(event);
      }
    });
    this.dataService.loginEvent.subscribe(doTheLogin => {
      if(doTheLogin){
        this.login();
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
    
  }

  loadGaiaEvents(){
    this.eventIndex = [];
    this.eventSource = [];
    userSession.getFile('calenderEventIndex.json', gaiaGetOptions).then((data) => {
      if(data){
      let eventsIndexInGaia = JSON.parse(data as string);
      this.eventIndex = eventsIndexInGaia;
      console.log('index en Gaia => ', eventsIndexInGaia, 'events en arr => ', this.eventIndex);
      for (let indexEvent of eventsIndexInGaia){
        userSession.getFile('calenderEvent/' + indexEvent + '.json', gaiaGetOptions)
        .then(data => {
          if(data){
            console.log(data);
            let eventDataGaia = JSON.parse(data as string);
            let eventData = {
              title: eventDataGaia.title,
              // startTime:  eventDataGaia.startTime,
              // endTime: eventDataGaia.endTime,
              //startTime:  new Date(eventDataGaia.startTime),
              //endTime: new Date(eventDataGaia.endTime),
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
              // let start = eventData.startTime;
              // let end = eventData.endTime;

              eventData.endTime = endOfDay(eventData.endTime);
  
              //eventData.startTime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
              //eventData.endTime = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
            }

            this.eventSource.push(eventData);
            this.myCal.loadEvents();
          } else {
            this.eventSource = [];
          }
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
            console.log('Confirm Cancel: blah');
            popOverSub.unsubscribe();
          }
        }, {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
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
    console.log('pasamos ppor el close evenet?')
    this.showAddEventComponent = false;
  }

  openAddEvent(){
    this.showAddEventComponent = !this.showAddEventComponent;
    if(!this.showAddEventComponent){
      this.eventIsEditing = false;
      this.dataService.editEventData(null);
    }
  }

  async tasksOptionsPopover(ev: any, eventOpen) {
    console.log(ev);
    this.dataService.openPopOver('');
    
    //this.taskListOpen = taskListOpen;
    this.currentPopOver = await this.popoverController.create({
      component: PopTasksComponent,
      event: ev,
      translucent: true,
      animated: true,
      mode: "ios"
    });

    //ev.preventDefault();

    //this.currentPopOver = popover;

    popOverSub = this.dataService.openPopOverList.subscribe(action => {
      if(action === ''){ 
        console.log('null no hacemos nada');
        //this.popOverSub.unsubscribe();
      }
      if(action === 'edit'){
        this.editEventSelected(eventOpen);
        this.currentPopOver.dismiss();
        //this.editTheList();
        //this.dataService.openPopOver(null);
      }
      if(action === 'delete'){
        this.deleteEventSelected(eventOpen);
        this.currentPopOver.dismiss();
        //this.dataService.openPopOver(null);
        //this.popOverSub.unsubscribe();
      }
    });

    return await this.currentPopOver.present();
  }

  storeEditEvent(event){
    userSession.deleteFile('calenderEvent/' + event.storeDate + '.json')
    .then(() => {
      this.eventSource.splice(this.eventSource.indexOf(event.storeDate), 1);
      this.eventIndex.splice(this.eventIndex.indexOf(event.storeDate), 1);
      this.eventIndex.push(event.storeDate);
      this.eventSource.push(event);
      //this.closeEventSelected();
      this.myCal.loadEvents();
      this.onEventSelected(event);
      this.closeAddEvent();
      this.showAddEventComponent = false;
      let eventIndexToString = JSON.stringify(this.eventIndex);
      let eventOnlyToString = JSON.stringify(event);
      userSession.putFile('calenderEventIndex.json', eventIndexToString, gaiaPutOptions)
      //.then(data => {console.log('dataIndexGaia => ', data)});
      userSession.putFile('calenderEvent/' + event.storeDate + '.json', eventOnlyToString, gaiaPutOptions)
      .then((data) => {
        console.log('data del then despues del EDIT ', data);
        //this.loadGaiaEvents();
        
        
        //this.resetEvent();
        //event = null;
        
      });
      //userSession.putFile('calenderEventIndex.json', eventIndexToString, gaiaPutOptions)
      // .then(() => {
      //   this.loadGaiaEvents();
      //   this.closeEventSelected();
      // });
    });
  }

  storeTheEvent(event){
    this.eventIndex.push(event.storeDate);
    this.eventSource.push(event);
    let eventIndexToString = JSON.stringify(this.eventIndex);
    let eventOnlyToString = JSON.stringify(event);
    userSession.putFile('calenderEventIndex.json', eventIndexToString, gaiaPutOptions)
    .then(data => {console.log('dataIndexGaia => ', data)});
    userSession.putFile('calenderEvent/' + event.storeDate + '.json', eventOnlyToString, gaiaPutOptions)
    .then((data) => {
      console.log('data del then despues del store ', data);
      this.myCal.loadEvents();
      this.resetEvent();
      event = null;
      this.showAddEventComponent = false;
    });
    if(event.remindMe){
      this.addEventNotification(event);
    }
  }

  createToDoList(){
    this.createNewToDoList = !this.createNewToDoList;
    console.log("createNewToDoList => " ,this.createNewToDoList);
    this.dataService.createToDoList(this.createNewToDoList);
  }

  closeTaskOpen(){
    console.log('closeTaskOpen!')
    this.taskIsOpen = !this.taskIsOpen;
    this.dataService.openToDoList(false);

  }

  /////////////////////////

  login(){
    userSession.redirectToSignIn();
    this.loginBlockstack();
    //userSession.handlePendingSignIn()
  }

  // loginBlock(){
  //   const authRequest = blockstack.makeAuthRequest(transitPrivateKey, redirectURI, manifestURI, scopes, appDomain);
  //   blockstack.redirectToSignInWithAuthRequest(authRequest);
  // }

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
      // go to login component
      console.log('show login component');
      this.showLoginComponent = true;
      //userSession.redirectToSignIn();
    }
  }

  showProfile(profile) {
    this.showLoginComponent = false;
    //console.log(userSession.loadUserData());
    let person = new blockstack.Person(profile);
    //console.log('person => ', person);
    this.personaName = person.name();
    this.isUserLogged = userSession.isUserSignedIn();
    if(this.isUserLogged){
      this.loadGaiaEvents();
      //this.loadEventsInGaia();
      //this.dataService.passUserInfo(userSession);
    } 
    else if(!this.isUserLogged){
      console.log('deberiamos de mostrar que el usuario no esta logeado y hubo algún problema');
    } 

    // document.getElementById('heading-name').innerHTML = person.name()
    // document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
  }

  // getWeatherData(){
  //   //alert('weather?');
  //   this.geolocation.getCurrentPosition().then(data => {
  //     let lat = data.coords.latitude;
  //     let long = data.coords.longitude;
  //     this.ws.getWeather(lat, long).subscribe(weather => {
  //       console.log('wethereando... ', weather);
  //       this.weatherObj = weather;
  //       //console.log(weather);
  //       let todayDate = new Date();
  //       //console.log(todayDate, todayDate.getDay());
  //       this.textMonth = todayDate.toLocaleString('default', { day: 'numeric', month: 'long' });
  //       //console.log(this.textMonth);
  //     });
  //    }).catch((error) => {
  //      console.log('Error getting location', error);
  //    });
  // }

  segmentCalendar(screen){
    //console.log(screen);
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
    }
    if(screen == 'calendar'){
      this.todayPage = false;
      this.toDosPage = false;
      this.calendarPage = true;
    }
    if(screen == 'todos'){
      this.todayPage = false;
      this.calendarPage = false;
      this.toDosPage = true;
    }
    
    if(screen == 'settings'){
      this.todayPage = false;
      this.calendarPage = false;
      this.toDosPage = false;
      this.settingsPage = false;
      
      //this.testNoti();
    }
  }

  addEventNotification(event){
    console.log('test notifications => ', event);
    //console.log(LocalNotifications.areEnabled());
    //LocalNotifications.areEnabled().then(()=>{console.log('notis are enabled!')})
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
