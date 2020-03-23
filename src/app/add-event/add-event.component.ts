import { Component, OnInit } from '@angular/core';
import { ShareDataService } from '../services/shareData.service';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import {parseISO, subMinutes, subDays, endOfDay, startOfDay } from 'date-fns';

import Picker from 'pickerjs';
//import { TagSelectorComponent } from '../tag-selector/tag-selector.component'
import { UserSession } from 'blockstack';
const userSession = new UserSession;

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit {

  event = {
    title: '',
    desc: '',
    startTime: null,
    endTime: null,
    allDay: false,
    remindMe: false,
    loc: '',
    storeDate: '',
    tag: '',
    tagColor: '',
    reminder: null,
    reminderLegend: ''
  };

  tags = [];

  defaultTags = [
    {
      name: 'Personal',
      color: '#4FC3F7',
      id: 1
    },
    {
      name: 'Work',
      color: '#CF195E',
      id: 2,
    },
    {
      name: 'Home',
      color: '#46C4B5',
      id: 3
    }
  ];

  tagEvent = {
    name: '',
    color: ''
  }
 
  minDate = new Date().toISOString();

  createTagScreen: boolean = false;
  newTagScreen: boolean = false;
  editMode: boolean;

  reminderTime: any;
  reminderSelectBoo: boolean = true;
  reminderVal: any;
  reminderText: string;

  constructor( private dataService: ShareDataService,
               private nav: Router,
               private modalCtrl: ModalController) { }

  ngOnInit() {
    this.editMode = false;
    this.loadTags();
    this.resetEvent();
    this.editEventSubscribe();
    this.reminderSelectBoo = true;
    //this.loadPickerElements();  
  }

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

  addEvent() {
    let eventCopy;
    if(!this.editMode){
      eventCopy = {
        title: this.event.title,
        // startTime:  new Date(this.event.startTime),
        // endTime: new Date(this.event.endTime),
        // startTime:  format(new Date(this.event.startTime), 'MMM D, YYYY HH:mm'),
        // endTime: format(new Date(this.event.endTime), 'MMM D, YYYY HH:mm'),
        startTime:  parseISO(this.event.startTime),
        endTime: parseISO(this.event.endTime),
        allDay: this.event.allDay,
        remindMe: this.event.remindMe,
        desc: this.event.desc,
        loc: this.event.loc,
        storeDate: Date.parse(this.event.startTime),
        tag: this.tagEvent.name,
        tagColor: this.tagEvent.color,
        reminder: this.reminderTime,
        reminderLegend: this.reminderVal
      }
   }
    if(this.editMode){
      eventCopy = {
        title: this.event.title,
        // startTime:  new Date(this.event.startTime),
        // endTime: new Date(this.event.endTime),
        startTime:  parseISO(this.event.startTime),
        endTime: parseISO(this.event.endTime),
        allDay: this.event.allDay,
        remindMe: this.event.remindMe,
        desc: this.event.desc,
        loc: this.event.loc,
        storeDate: this.event.storeDate,
        tag: this.tagEvent.name,
        tagColor: this.tagEvent.color,
        reminder: this.reminderTime,
        reminderLegend: this.reminderVal
      }
  //this.editPickerElements(this.event.startTime, this.event.endTime);
   }
 
    if (eventCopy.allDay) {
      // eventCopy.startTime = startOfDay(new Date(this.event.startTime));
      // eventCopy.endTime = endOfDay(new Date(this.event.endTime));
      // eventCopy.endTime = endOfDay(eventCopy.endTime);
      let start = eventCopy.startTime;
      let end = eventCopy.endTime;
 
      //eventCopy.startTime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      //eventCopy.endTime = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

      // eventCopy.startTime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      // eventCopy.endTime = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
    }
    if(!this.editMode){
      this.dataService.addEventData(eventCopy);
    }
    if(this.editMode){
      this.dataService.saveEditEventData(eventCopy);
      console.log('editamos el evento')
    }
    this.resetEvent();
  }
  
  // saveEdit() {
  //   let eventCopy = {
  //     title: this.event.title,
  //     startTime:  new Date(this.event.startTime),
  //     endTime: new Date(this.event.endTime),
  //     allDay: this.event.allDay,
  //     desc: this.event.desc,
  //     loc: this.event.loc,
  //     storeDate: this.event.storeDate,
  //     tag: this.tagEvent.name,
  //     tagColor: this.tagEvent.color
  //   }
 
  //   if (eventCopy.allDay) {
  //     let start = eventCopy.startTime;
  //     let end = eventCopy.endTime;
 
  //     eventCopy.startTime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  //     eventCopy.endTime = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
  //   }
    
  //   this.dataService.addEventData(eventCopy);
  //   this.resetEvent();
  // }

  editEventSubscribe(){
    this.dataService.editDataEvent.subscribe(event => {
      console.log('event a editar => ', event)
      if(event === null) {
        this.resetEvent();
        console.log('el edit event es null no hacemos nada');
      } else {
        this.editMode = true;
        console.log('el edit event NO es null, cargamos la data => ', event);
        let formatStart = new Date(event.startTime).toISOString();
        let formatEnd = new Date(event.endTime).toISOString();
        this.event = {
          title: event.title,
          desc: event.desc,
          // startTime: null,
          // endTime: null,
          // startTime: new Date(event.startTime),
          // endTime: new Date(event.endTime),
          startTime: formatStart,
          endTime: formatEnd,
          allDay: event.allDay,
          remindMe: event.remindMe,
          loc: event.loc,
          storeDate: event.storeDate,
          tag: event.tag,
          tagColor: event.tagColor,
          reminder: event.reminder,
          reminderLegend: event.reminderLegend
        };
        //this.editPickerElements(event.startTime, event.endTime);
        this.tagEvent = {
          name: event.tag,
          color: event.tagColor
        }
        if(this.event.remindMe){

          this.reminderSelect(this.event.reminderLegend)
        }
      }
    });

    // this.dataService.resetDataEvent.subscribe(reset => {
    //   if(reset === true){
    //     this.resetEvent();
    //     this.dataService.resetEventData(false);
    //   }
    // });
  }

  saveEditEvent(){
    console.log('guardando edit event...');
    this.addEvent();
    // userSession.deleteFile('calenderEvent/' + this.event.storeDate + '.json')
    //   .then(() => {
    //     this.addEvent();
    //   });
  }

  // loadPickerElements(){
  //   let inputStart = document.getElementById('inputStart');
  //   let inputEnd = document.getElementById('inputEnd');

  //   //console.log(this.inputStart);

  //   const pickerStart = new Picker(inputStart, {
  //     //inline: true,
  //     date: new Date(),
  //     format: 'MMM D, YYYY HH:mm',
  //     container: '.pickerContainer',
  //   });
  //   //pickerStart.getDate(true);
    
  //   const pickerEnd = new Picker(inputEnd, {
  //     date: new Date(),
  //     format: 'MMM D, YYYY HH:mm',
  //     container: '.pickerContainer'
  //   });
  // }

  // editPickerElements(startTime, endTime){
  //   let inputStart = document.getElementById('inputStart');
  //   //let formatStart = new Date(startTime);
  //   let inputEnd = document.getElementById('inputEnd');
  //   //inputEnd.innerHTML = endTime;

  //   const pickerStart = new Picker(inputStart, {
  //     //inline: true,
  //     date: new Date(startTime),
  //     format: 'MMM D, YYYY HH:mm',
  //     container: '.pickerContainer',
  //   });
  //   this.event.startTime = pickerStart.getDate(true);
  //   //console.log(pickerStart.getDate(true));
  //   //pickerStart.pick();
    
  //   const pickerEnd = new Picker(inputEnd, {
  //     date: new Date(endTime),
  //     format: 'MMM D, YYYY HH:mm',
  //     container: '.pickerContainer'
  //   });
  //   this.event.endTime = pickerEnd.getDate(true);
  // }

  loadTags(){
    
    userSession.getFile('tags/caleTags.json').then(dataTags => {
      if(dataTags !== null) {
        let parsedTags = JSON.parse(dataTags as string);
        this.tags = parsedTags;
        this.tagEvent = {
          name: this.tags[0].name,
          color: this.tags[0].color
        }
      }
      if(dataTags === null) {
        this.tags = this.defaultTags;
        this.tagEvent = {
          name: this.tags[0].name,
          color: this.tags[0].color
        }
      }
      if(this.editMode) {
        this.tagEvent = {
          name: this.event.tag,
          color: this.event.tagColor
        }
      }
      // else {
      //   
      // }
    });
  }

  dataSelected(date){
    //console.log(date);
    this.reminderSelectBoo = false;
  }

  reminderSelect(reminder){
    //console.log('el selected reminder es => ', reminder.detail.value);
    console.log('el selected reminder es => ', reminder);
    this.reminderVal = reminder;
    if(this.reminderVal === 'r1' || this.event.reminderLegend === 'r1') {
      this.reminderTime = parseISO(this.event.startTime);
      console.log('elegimos el 1 => ', this.reminderTime);
      this.reminderText = 'At time of the event';
    }
    if(this.reminderVal === 'r2' || this.event.reminderLegend === 'r2') {
      this.reminderTime = subMinutes(parseISO(this.event.startTime), 5);
      console.log('elegimos el 2 => ', this.reminderTime);
      this.reminderText = '5 minutes before';
    }
    if(this.reminderVal === 'r3' || this.event.reminderLegend === 'r3') {
      this.reminderTime = subMinutes(parseISO(this.event.startTime), 15);
      console.log('elegimos el 3 => ', this.reminderTime);
      this.reminderText = '15 minutes before';
    }
    if(this.reminderVal === 'r4' || this.event.reminderLegend === 'r4') {
      this.reminderTime = subMinutes(parseISO(this.event.startTime), 60);
      console.log('elegimos el 4 => ', this.reminderTime);
      this.reminderText = '1 hour before';
    }
    if(this.reminderVal === 'r5' || this.event.reminderLegend === 'r5') {
      this.reminderTime = subDays(parseISO(this.event.startTime), 1);
      console.log('elegimos el 5 => ', this.reminderTime);
      this.reminderText = '1 day before';
    }
    if(this.reminderVal === null || this.reminderVal == '' || this.event.reminderLegend === null || this.event.reminderLegend === '') {
      this.reminderVal === 'r1';
    }
  }

  onSubmit(){
    console.log('submitted');
  }

  chooseTag(){
    console.log('chooseTag');
    this.nav.navigate(['/tagSelector']);
    this.dataService.shareTagObject.subscribe(tag => {
      if(tag !== null){
        this.tagEvent = {
          name: tag.name,
          color: tag.color
        }
        console.log(this.tagEvent)
      }
    });

    //this.createTagScreen = true;
  }

  closeModal(){
    this.modalCtrl.dismiss();
  }
  

}
