import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { ShareDataService } from '../services/shareData.service';
import {UserSession} from 'blockstack';
import { PopTasksComponent} from '../components/pop-tasks/pop-tasks.component';

import { takeWhile } from 'rxjs/operators'

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
    // this.dataService.openPopOverList.subscribe(action => {
    //   if(action === null){ console.log('null no hacemos nada')}
    //   if(action === 'edit'){
    //     console.log('editamos la lista');
    //     //this.dataService.openPopOver(null);
    //     //this.dataService.openPopOverList.unsubscribe();
    //   }
    //   if(action === 'delete'){
    //     this.deleteTaskList(this.taskListOpen);
    //     this.dataService.openPopOver(null);
    //   }
    // }).unsubscribe();
    //this.dataService.openPopOverList.takeUntil()
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
        console.log('is open task es false asi que cerramos');
        this.openTaskView = false;
        this.newTaskList = true;
        //this.dataService.openPopOver(null);
      }
    });
    
  }

  ngOnDestroy(){
    console.log('on destroy');
    this.dataService.openPopOverList.subscribe().unsubscribe();
    //this.dataService.openPopOverList.pipe(takeUntil(this.openTaskView === false));
  }

  loadGaiaTodos(){
    userSession.getFile('tareasIndex.json', gaiaGetOptions)
    .then(data => {
      if(data){
        let todosIndexInGaia = JSON.parse(data as string);
        this.todosIndex = todosIndexInGaia;
      } else {
        console.log('no hay data en gaia');
        this.todosIndex = this.todosIndexDefaults;
      }
      console.log(this.todosIndex)  
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
    console.log(this.taskOpen);
    this.todoSources = this.taskOpen.task;
    console.log(this.todoSources);
    //this.dataService.openPopOver(null);
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
      //console.log("pasamos por aqui...")
      this.todosIndex.shift();
      this.newList = false;
      //this.dataService.createToDoList(false);
    }    
  }

  // saveCreateNewList(){
  //   console.log('save create new list');
  //   this.openTaskView = false;
  //   this.newTaskList = false;
  // }

  storeNewList(list){
    this.todosIndex.shift();
    let newTareasList = {
      nameList: list.name,
      color: this.newTagColor,
      task: []
    }
    //this.todosIndex.splice(0, 0, newTareasList);
    this.todosIndex.unshift(newTareasList);
    //this.todosIndex.push(newTareasList);
    console.log(this.todosIndex)
    this.slides.update();
    //this.slides.slideTo(this.todosIndex.length, 1500);
    this.slides.slideTo(0, 1500);
    let todosIndexToString = JSON.stringify(this.todosIndex);
    userSession.putFile('tareasIndex.json', todosIndexToString, gaiaPutOptions)
    .then(()=>{
      this.newList = false;
      this.dataService.closeToDoList(false);
      this.createTaskList.name = '';
      this.createTaskList.color = this.tagsColors[0].color;
      //this.saveAndCloseNewList = true;
    });
  }

  // identify(index, item){
  //   console.log(index, item);

  //   return item;
  // }

  // slideTask(task, item){
  //     item.close();
  //     task.style
  // }

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

    //this.currentPopOver = popover;

    popOverSub = this.dataService.openPopOverList.subscribe(action => {
      if(action === ''){ 
        console.log('null no hacemos nada');
        //this.popOverSub.unsubscribe();
      }
      if(action === 'edit'){
        this.editTheList();
        //this.dataService.openPopOver(null);
      }
      if(action === 'delete'){
        this.deleteTaskList(this.taskListOpen);
        //this.dataService.openPopOver(null);
        //this.popOverSub.unsubscribe();
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
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
            //this.dataService.openPopOver(null);
            popOverSub.unsubscribe();
          }
        }, {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
            let indexArrName: string = taskList.nameList;
            let arrIndex = this.todosIndex.findIndex(list => list.nameList === indexArrName);
            this.todosIndex.splice(arrIndex, 1);
            this.openTaskView = false;
            this.dataService.openToDoList(false);
            
            //this.dataService.openPopOver(null);
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
    console.log('editamos la lista');
        //this.popOverSub.unsubscribe();
        //this.dataService.openPopOver('');
        this.currentPopOver.dismiss();
        popOverSub.unsubscribe();
    //this.dataService.openPopOverList.subscribe().unsubscribe();
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
      //console.log(arrIndex);
      //this.todosIndex[arrIndex].task.splice(0, 0, task);
      this.todosIndex[arrIndex].task.splice(0, 0, todoData);
      console.log(this.todosIndex);
      let todosIndexData = JSON.stringify(this.todosIndex);
      this.createTask.name = '';
      this.newTaskList = true;
      userSession.putFile('tareasIndex.json', todosIndexData, gaiaPutOptions);
    }
  }

  storeTaskCompleted(task, taskIndex, taskList, isChecked){
    console.log('checked dice que... => ' ,isChecked)
    let todoData = {};
    if(isChecked){
      console.log('NO esta checked');
      todoData = {
        task: task.task,
        isChecked: false
      }
    }
    if(!isChecked){
      console.log('esta checked');
      todoData = {
        task: task.task,
        isChecked: true
      }
    }
    console.log('todoData => ' ,todoData);
    let indexArrName: string = taskList.nameList;
    let arrIndex = this.todosIndex.findIndex(list => list.nameList === indexArrName);
    this.todosIndex[arrIndex].task.splice(taskIndex, 1, todoData);
    let todosIndexData = JSON.stringify(this.todosIndex);
    userSession.putFile('tareasIndex.json', todosIndexData, gaiaPutOptions);
    //this.getPercentageCompleted(this.todosIndex[arrIndex].task)
  }

  getPercentageCompleted(tasksList){
    // for (let task of this.todosIndex[].length) {

    // }

    console.log(tasksList);

    // let arrayPercentages = [];

    // for (let taskChecked of this.todosIndex){
    //   for (let checkTasks of taskChecked.task){
    //     //let isCheckedTaskLabel = checkTasks.isChecked;
    //     // arrayPercentages = checkTasks.filter(checked => checked.isChecked === true);
    //     // console.log(arrayPercentages);
    //     // let checkedTasks = checkTasks.find(taskCompleted => taskCompleted.isChecked === true);
    //     console.log(checkTasks.isChecked);
    //   }
    // }

    // for (let i = 0; i < this.todosIndex.length; i++) {
    //   // let totalTasksChecked = [];
    //   // let totalTasks = this.todosIndex[i].task.length;
    //   // console.log("totalTasks => ", totalTasks);
    //   let totalTasks = this.todosIndex[i].task[i].task;
    //   //console.log(totalTasks);
    //   //totalTasks.find(task => task.isChecked === true);
    //   // for(let taskCompleted of this.todosIndex[i].task) {
    //   //   console.log('taskCompleted => ', taskCompleted);
    //   //   if(taskCompleted.isChecked === true){
    //   //     totalTasksChecked.push(taskCompleted);
    //   //   }
    //   // }
    //   //console.log("totalTasksChecked", totalTasksChecked.length);
    //   //let getPercentage = Math.round(total)
    // }
  }


}
