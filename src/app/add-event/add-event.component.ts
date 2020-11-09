import { Component, OnInit } from "@angular/core";
import { ShareDataService } from "../services/shareData.service";
import { ModalController } from "@ionic/angular";
import { Router } from "@angular/router";

import { parseISO, subMinutes, subDays} from "date-fns";
import { UserSession } from "blockstack";
const userSession = new UserSession();

@Component({
  selector: "app-add-event",
  templateUrl: "./add-event.component.html",
  styleUrls: ["./add-event.component.scss"]
})
export class AddEventComponent implements OnInit {
  event = {
    title: "",
    desc: "",
    startTime: null,
    endTime: null,
    allDay: false,
    remindMe: false,
    loc: "",
    storeDate: "",
    tag: "",
    tagColor: "",
    reminder: null,
    reminderLegend: ""
  };

  tags = [];

  defaultTags = [
    {
      name: "Personal",
      color: "#4FC3F7",
      id: 1
    },
    {
      name: "Work",
      color: "#CF195E",
      id: 2
    },
    {
      name: "Home",
      color: "#46C4B5",
      id: 3
    }
  ];

  tagEvent = {
    name: "",
    color: ""
  };

  minDate = new Date().toISOString();

  createTagScreen: boolean = false;
  newTagScreen: boolean = false;
  editMode: boolean;

  reminderTime: any;
  reminderSelectBoo: boolean = true;
  reminderVal: any;
  reminderText: string;

  constructor(
    private dataService: ShareDataService,
    private nav: Router,
    private modalCtrl: ModalController
  ) {}

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
      title: "",
      desc: "",
      startTime: "",
      endTime: "",
      allDay: false,
      remindMe: false,
      loc: "",
      storeDate: "",
      tag: "",
      tagColor: "",
      reminder: null,
      reminderLegend: ""
    };
  }

  addEvent() {
    let eventCopy;
    if (!this.editMode) {
      eventCopy = {
        title: this.event.title,
        startTime: parseISO(this.event.startTime),
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
      };
    }
    if (this.editMode) {
      eventCopy = {
        title: this.event.title,
        startTime: parseISO(this.event.startTime),
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
      };
    }

    if (eventCopy.allDay) {
      let start = eventCopy.startTime;
      let end = eventCopy.endTime;
    }
    if (!this.editMode) {
      this.dataService.addEventData(eventCopy);
    }
    if (this.editMode) {
      this.dataService.saveEditEventData(eventCopy);
    }
    this.resetEvent();
  }

  editEventSubscribe() {
    this.dataService.editDataEvent.subscribe(event => {
      if (event === null) {
        this.resetEvent();
      } else {
        this.editMode = true;
        let formatStart = new Date(event.startTime).toISOString();
        let formatEnd = new Date(event.endTime).toISOString();
        this.event = {
          title: event.title,
          desc: event.desc,
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
        this.tagEvent = {
          name: event.tag,
          color: event.tagColor
        };
        if (this.event.remindMe) {
          this.reminderSelect(this.event.reminderLegend);
        }
      }
    });
  }

  saveEditEvent() {
    this.addEvent();
  }

  loadTags() {
    userSession.getFile("tags/caleTags.json").then(dataTags => {
      if (dataTags !== null) {
        let parsedTags = JSON.parse(dataTags as string);
        this.tags = parsedTags;
        this.tagEvent = {
          name: this.tags[0].name,
          color: this.tags[0].color
        };
      }
      if (dataTags === null) {
        this.tags = this.defaultTags;
        this.tagEvent = {
          name: this.tags[0].name,
          color: this.tags[0].color
        };
      }
      if (this.editMode) {
        this.tagEvent = {
          name: this.event.tag,
          color: this.event.tagColor
        };
      }
    });
  }

  dataSelected(date) {
    this.reminderSelectBoo = false;
  }

  reminderSelect(reminder) {
    this.reminderVal = reminder;
    if (this.reminderVal === "r1" || this.event.reminderLegend === "r1") {
      this.reminderTime = parseISO(this.event.startTime);
      this.reminderText = "At time of the event";
    }
    if (this.reminderVal === "r2" || this.event.reminderLegend === "r2") {
      this.reminderTime = subMinutes(parseISO(this.event.startTime), 5);
      this.reminderText = "5 minutes before";
    }
    if (this.reminderVal === "r3" || this.event.reminderLegend === "r3") {
      this.reminderTime = subMinutes(parseISO(this.event.startTime), 15);
      this.reminderText = "15 minutes before";
    }
    if (this.reminderVal === "r4" || this.event.reminderLegend === "r4") {
      this.reminderTime = subMinutes(parseISO(this.event.startTime), 60);
      this.reminderText = "1 hour before";
    }
    if (this.reminderVal === "r5" || this.event.reminderLegend === "r5") {
      this.reminderTime = subDays(parseISO(this.event.startTime), 1);
      this.reminderText = "1 day before";
    }
    if (
      this.reminderVal === null ||
      this.reminderVal == "" ||
      this.event.reminderLegend === null ||
      this.event.reminderLegend === ""
    ) {
      this.reminderVal === "r1";
    }
  }

  onSubmit() {}

  chooseTag() {
    this.nav.navigate(["/tagSelector"]);
    this.dataService.shareTagObject.subscribe(tag => {
      if (tag !== null) {
        this.tagEvent = {
          name: tag.name,
          color: tag.color
        };
      }
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
