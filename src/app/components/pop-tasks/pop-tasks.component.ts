import { Component, OnInit } from '@angular/core';
import { ShareDataService } from '../../services/shareData.service';
@Component({
  selector: 'app-pop-tasks',
  templateUrl: './pop-tasks.component.html',
  styleUrls: ['./pop-tasks.component.scss'],
})
export class PopTasksComponent implements OnInit {

  constructor( private dataService: ShareDataService) { }

  ngOnInit() {}

  popOverAction(action) {
    this.dataService.openPopOver(action);
  }

}
