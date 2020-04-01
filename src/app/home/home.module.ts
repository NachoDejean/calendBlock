import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgCalendarModule  } from 'ionic2-calendar';
import { HomePage } from './home.page';
import {AddEventComponent} from '../add-event/add-event.component';
import {LoginBlockComponent} from '../login-block/login-block.component';
import {TodoSliderComponent} from '../todo-slider/todo-slider.component';
import {LoadingComponent} from '../loading/loading.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ]),
    NgCalendarModule,
    
  ],
  declarations: [HomePage, AddEventComponent, LoginBlockComponent, TodoSliderComponent, LoadingComponent]
})
export class HomePageModule {}
