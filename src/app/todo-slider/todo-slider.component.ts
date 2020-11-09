import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { ShareDataService } from '../services/shareData.service';
import {UserSession} from 'blockstack';
import { PopTasksComponent} from '../pop-tasks/pop-tasks.component';

const userSession = new UserSession;
const gaiaPutOptions = { encrypt: false };
const gaiaGetOptions = { decrypt: false };

//const popover = PopoverController;
let popOverSub = null;

@Component({
  selector: 'app-todo-slider',
  templateUrl: './todo-slider.component.html',
  styleUrls: ['./todo-slider.component.scss'],
})
export class TodoSliderComponent implements OnInit {

  slideOpts = {
    //centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: 10,
    zoom: {
      toggle: false,
    },
    observer: true
  };

  openTaskView: boolean = false;
  newTaskList: boolean = false;
  newList: boolean = false;
  saveAndCloseNewList: boolean = false;
  listTitileEdit: boolean = false;
  taskOpen: any;

  todosIndex = [];
  todoSources = [];
  todosIndexDefaults = [
    {
      nameList: 'Work',
      color: '#CF195E',
      task: []
    },
    {
      nameList: 'Personal',
      color: '#4FC3F7',
      task: []
    },
    {
      nameList: 'Home',
      color: '#46C4B5',
      task: []
    }
  ];
  toDosOpen = [];
  
  createTaskList = {
    name: '',
    color: ''
  };

  createTask = {
    name: ''
  };

  tagsColors = [
    {
      name: 'Red',
      color: '#CF195E'
    },
    {
      name: 'Orange',
      color: '#F5A623'
    },
    {
      name: 'Green',
      color: '#46C4B5'
    },
    {
      name: 'Yellow',
      color: '#B3A814'
    },
    {
      name: 'Blue',
      color: '#4FC3F7'
    },
    {
      name: 'Purple',
      color: '#BD10E0'
    },
    {
      name: 'Brown',
      color: '#8B572A'
    },
  ];
  newTagColor: any;

  @ViewChild('slides', {static: false}) slides;
  fabBgColor: any;
  taskListOpen: any;
  currentPopOver;
  
  constructor( private dataService: ShareDataService,
               private alertCtrl: AlertController,
               public popoverController: PopoverController ) { 
    this.todoSources = [];  
  }

  ngOnInit() {
    
    this.loadGaiaTodos();
    this.dataService.newToDoList.subscribe(list => {
      if(list === null){
      }else {
        this.createNewList(list);
      }
    });
    this.dataService.openTaskList.subscribe(isOpenTask => {
      if(!isOpenTask){  
        //console.log('is open task es false asi que cerramos');
        this.openTaskView = false;
        this.newTaskList = true;
        this.listTitileEdit = false;
      }
    });
    
  }

  ngOnDestroy(){
    this.dataService.openToDoList(false);
  }

  loadGaiaTodos(){
    userSession.getFile('tareasIndex.json', gaiaGetOptions)
    .then(data => {
      if(data){
        let todosIndexInGaia = JSON.parse(data as string);
        this.todosIndex = todosIndexInGaia;
      } else {
        this.todosIndex = this.todosIndexDefaults;
      }
      this.dataService.doTheLoading(false);  
    });
  }

  colorTaskList(color){
    this.newTagColor = color;
  }

  openTaskList(taskList){
    this.openTaskView = true;
    this.newTaskList = false;
    this.dataService.openToDoList(true);
    this.taskOpen = taskList;
    this.fabBgColor = this.taskOpen.color;
    this.createTask.name = '';
    this.todoSources = this.taskOpen.task;
  }

  createNewList(newList){
    if(newList){
      this.newTagColor = this.tagsColors[0].color;
      this.newList = newList;
      let defualtSettingsList = {
        nameList: 'New List',
        color: this.newTagColor,
        task: []
      };
      this.todosIndex.unshift(defualtSettingsList);
      this.slides.slideTo(0, 1500);
    } 
    if(!newList){
      this.todosIndex.shift();
      this.newList = false;
    }    
  }

  storeNewList(list){
    
    let newTareasList = {
      nameList: list.name,
      color: this.newTagColor,
      task: []
    }
    this.todosIndex.push(newTareasList);
    this.slides.slideTo(this.todosIndex.length, 1500);
    let todosIndexToString = JSON.stringify(this.todosIndex);
    userSession.putFile('tareasIndex.json', todosIndexToString, gaiaPutOptions)
    .then(()=>{
      this.newList = false;
      this.dataService.closeToDoList(false);
      this.createTaskList.name = '';
      this.createTaskList.color = this.tagsColors[0].color;
    });
  }

  async tasksOptionsPopover(ev: any, taskListOpen) {
    this.dataService.openPopOver('');
    
    this.taskListOpen = taskListOpen;
    this.currentPopOver = await this.popoverController.create({
      component: PopTasksComponent,
      event: ev,
      translucent: true,
      animated: true,
      mode: "ios"
    });

    ev.preventDefault();

    popOverSub = this.dataService.openPopOverList.subscribe(action => {
      if(action === ''){}
      if(action === 'edit'){
        this.editTheList();
      }
      if(action === 'delete'){
        this.deleteTaskList(this.taskListOpen);
      }
    });

    return await this.currentPopOver.present();
  }

  async deleteTaskList(taskList){
    this.currentPopOver.dismiss();
    const alert = await this.alertCtrl.create({
      header: 'Confirm list deletion?',
      subHeader: 'This is permanent',
      message: 'Do you really want to delete this list?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            popOverSub.unsubscribe();
          }
        }, {
          text: 'Okay',
          handler: () => {
            let indexArrName: string = taskList.nameList;
            let arrIndex = this.todosIndex.findIndex(list => list.nameList === indexArrName);
            this.todosIndex.splice(arrIndex, 1);
            this.openTaskView = false;
            this.dataService.openToDoList(false);
            popOverSub.unsubscribe();
            let todosIndexData = JSON.stringify(this.todosIndex);
            userSession.putFile('tareasIndex.json', todosIndexData, gaiaPutOptions);
          }
        }
      ]
    });
    await alert.present();
  }

  editTheList(){
    this.listTitileEdit = true;
    this.createTaskList.name = this.taskOpen.nameList;
    this.newTagColor = this.taskOpen.color;
    this.currentPopOver.dismiss();
    popOverSub.unsubscribe();
  }

  saveEditList(list){
    let indexArrName: string = this.taskListOpen.nameList;
    let arrIndex = this.todosIndex.findIndex(list => list.nameList === indexArrName);
    let editTaskList = {
      nameList: list.name,
      color: this.newTagColor,
      task: this.taskListOpen.task
    }
    this.todosIndex.splice(arrIndex, 1, editTaskList);
    this.taskOpen.nameList = editTaskList.nameList;
    this.taskOpen.color = editTaskList.color;
    this.taskOpen.task = editTaskList.task;
    this.listTitileEdit = false;
    let todosIndexData = JSON.stringify(this.todosIndex);
    userSession.putFile('tareasIndex.json', todosIndexData, gaiaPutOptions);
  }

  deleteTask(task, taskIndex, taskList) {
    let indexArrName: string = taskList.nameList;
    let arrIndex = this.todosIndex.findIndex(list => list.nameList === indexArrName);
    this.todosIndex[arrIndex].task.splice(taskIndex, 1);
    let todosIndexData = JSON.stringify(this.todosIndex);
    userSession.putFile('tareasIndex.json', todosIndexData, gaiaPutOptions);
  }

  newTask(){
    this.newTaskList = true;
  }

  storeTask(task, taskList){
    console.log(task, taskList.nameList);
    let indexArrName: string = taskList.nameList;
    if(task != ''){
      let todoData = {
        task: task,
        isChecked: false
      }

      let arrIndex = this.todosIndex.findIndex(list => list.nameList === indexArrName);
      this.todosIndex[arrIndex].task.splice(0, 0, todoData);
      let todosIndexData = JSON.stringify(this.todosIndex);
      this.createTask.name = '';
      this.newTaskList = true;
      userSession.putFile('tareasIndex.json', todosIndexData, gaiaPutOptions);
    }
  }

  storeTaskCompleted(task, taskIndex, taskList, isChecked){
    let todoData = {};
    if(isChecked){
      todoData = {
        task: task.task,
        isChecked: false
      }
    }
    if(!isChecked){
      todoData = {
        task: task.task,
        isChecked: true
      }
    }
    let indexArrName: string = taskList.nameList;
    let arrIndex = this.todosIndex.findIndex(list => list.nameList === indexArrName);
    this.todosIndex[arrIndex].task.splice(taskIndex, 1, todoData);
    let todosIndexData = JSON.stringify(this.todosIndex);
    userSession.putFile('tareasIndex.json', todosIndexData, gaiaPutOptions);
  }
}
