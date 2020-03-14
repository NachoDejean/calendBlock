import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
 
@Injectable()
export class ShareDataService {

    private loginToBlockstack = new BehaviorSubject<boolean>(false);
    loginEvent = this.loginToBlockstack.asObservable();
    doTheLogin(dataLogin: any){
        this.loginToBlockstack.next(dataLogin);
    }
    
    private dataEventObject = new BehaviorSubject<any>(null);
    addDataEvent = this.dataEventObject.asObservable();
    addEventData(dataEvent: any){
        this.dataEventObject.next(dataEvent);
    }
    
    private editEventObject = new BehaviorSubject<any>(null);
    editDataEvent = this.editEventObject.asObservable();
    editEventData(dataEvent: any){
        this.editEventObject.next(dataEvent);
    }
    
    private saveEditEvent = new BehaviorSubject<any>(null);
    saveEditDataEvent = this.saveEditEvent.asObservable();
    saveEditEventData(dataEvent: any){
        this.saveEditEvent.next(dataEvent);
    }
    
    private tagObject = new BehaviorSubject<any>(null);
    shareTagObject = this.tagObject.asObservable();
    shareTag(tag: any){
        this.tagObject.next(tag);
    }
    
    private addToDoList = new BehaviorSubject<any>(null);
    newToDoList = this.addToDoList.asObservable();
    createToDoList(list: any){
        this.addToDoList.next(list);
    }
    
    private closeNewToDoList = new BehaviorSubject<any>(null);
    closeNewTaskList = this.closeNewToDoList.asObservable();
    closeToDoList(list: any){
        this.closeNewToDoList.next(list);
    }
    
    private taskListOpen = new BehaviorSubject<any>(false);
    openTaskList = this.taskListOpen.asObservable();
    openToDoList(list: any){
        this.taskListOpen.next(list);
    }
    
    

    
    
    
    
    

    

}