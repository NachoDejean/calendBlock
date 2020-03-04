import { Component, OnInit, ViewChild } from '@angular/core';
import { ShareDataService } from '../services/shareData.service';
import {UserSession} from 'blockstack';

const userSession = new UserSession;
const gaiaPutOptions = { encrypt: false }
const gaiaGetOptions = { decrypt: false }

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
  };

  openTaskView: boolean = false;
  newTaskList: boolean = false;
  newList: boolean = false;
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
  
  constructor( private dataService: ShareDataService) { 
    this.todoSources = [];
  }

  ngOnInit() {
    this.loadGaiaTodos();
    this.dataService.newToDoList.subscribe(list => {
      this.createNewList(list);
      // if(list){
      //   console.log('creamos una nueva lista');
      // }
    });
    this.dataService.openTaskList.subscribe(isOpenTask => {
      if(!isOpenTask){
        console.log('is open task es false asi que cerramos');
        this.openTaskView = false;
        this.newTaskList = true;
      }
    })
  }

  loadGaiaTodos(){
    userSession.getFile('tareasIndex.json', gaiaGetOptions)
    .then(data => {
      if(data){
        let todosIndexInGaia = JSON.parse(data as string);
        this.todosIndex = todosIndexInGaia;
        // for (let indexTodos of this.todosIndex){
        //   userSession.getFile('todosList/'+ indexTodos + '.json', gaiaGetOptions)
        //   .then(data => {
        //     if(data){
        //       let todoDataInGaia = JSON.parse(data as string);
        //       let todoData = {
        //         nameList: indexTodos,
        //         task: todoDataInGaia
        //       }
        //       // this.todoSources.push(todoData);
        //       this.todoSources.push(todoData);
        //     } else {
        //       // console.log('no hay todos data en Gaia');
        //       // this.todoSources = [];
        //     }
        //   });
        // }
      } else {
        console.log('no hay data en gaia');
        this.todosIndex = this.todosIndexDefaults;
        // for (let taskInLists of this.todosIndex){
        //   let dataInList = {
        //     nameList: taskInLists.nameList,
        //     task: taskInLists.task
        //   };
        //   this.todoSources.push(dataInList);
        //   console.log(this.todoSources);
        // }
      }
      
      
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
    this.createTask.name = '';
    console.log(this.taskOpen);
    this.todoSources = this.taskOpen.task;
    console.log(this.todoSources);
    // let arrIndex = this.todoSources.findIndex(list => list.nameList === taskList.nameList);
    // this.toDosOpen = this.todoSources[arrIndex];
    // console.log(this.toDosOpen)
  }

  createNewList(newList){
    this.newTagColor = this.tagsColors[0].color;
    this.newList = newList;
    console.log('create new list => ', newList);
    // this.openTaskView = true;
    // this.newTaskList = true;
    if(newList){
      let defualtSettingsList = {
        nameList: 'New List',
        color: this.newTagColor,
        task: []
      };
      this.todosIndex.unshift(defualtSettingsList);
      this.slides.slideTo(0, 1500);
    } if(!newList){
      console.log("pasamos por aqui...")
      this.todosIndex.shift();
    }
    
  }
  saveCreateNewList(){
    console.log('save create new list');
    this.openTaskView = false;
    this.newTaskList = false;
  }

  storeNewList(list){
    // list = [];
    // console.log(list);
    let newTareasList = {
      nameList: list.name,
        color: this.newTagColor,
        task: []
    }
    //this.todoSources.push(list);
    
    this.todosIndex.push(newTareasList);
    //this.todosIndex.unshift(newTareasList);
    let todosIndexToString = JSON.stringify(this.todosIndex);
    let todosOnlyToString = JSON.stringify(list);
    userSession.putFile('tareasIndex.json', todosIndexToString, gaiaPutOptions);
    userSession.putFile('todosList/' + list.name + '.json', todosOnlyToString, gaiaPutOptions);
  }

  slideTask(item){

  }

  newTask(){
    this.newTaskList = true;
  }

  storeTask(task, taskList){
    console.log(task, taskList.nameList);
    let indexArrName: string = taskList.nameList;
    if(task != ''){
      let todoData = {
        task: task
      }
      //this.todoSources.push(task);
      //this.todoSources.splice(taskList.name, 0, task);

      let arrIndex = this.todosIndex.findIndex(list => list.nameList === indexArrName);
      console.log(arrIndex);
      //console.log(this.todosIndex.splice(arrIndex, 0, this.todoSources));
      
      //this.todosIndex[arrIndex].task = this.todoSources;
      //this.todosIndex[arrIndex].task.splice(0, 0, this.todoSources);
      //let taskToString = JSON.stringify(this.todoSources);
      this.todosIndex[arrIndex].task.splice(0, 0, task);
      console.log(this.todosIndex);
      let todosIndexData = JSON.stringify(this.todosIndex);
      //this.todoSources.splice(this.todoSources[arrIndex], 1);
      //this.toDosOpen[0].task.splice(0,0,task);
      //console.log(this.toDosOpen.task);
      //this.todoSources.(todoData);
      this.createTask.name = '';
      this.newTaskList = true;
      userSession.putFile('tareasIndex.json', todosIndexData, gaiaPutOptions);
      //console.log(this.todoSources);
    }
    
    
  }

}
