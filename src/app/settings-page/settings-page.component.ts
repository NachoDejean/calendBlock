import { Component, OnInit } from '@angular/core';
import { ShareDataService } from '../services/shareData.service';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPageComponent implements OnInit {

  constructor( private dataService: ShareDataService,) { }

  ngOnInit() {}

  changeTheTime(time){
    console.log(time);
    this.dataService.changeHourTime(time);
  }

}
