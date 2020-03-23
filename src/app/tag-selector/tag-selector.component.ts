import { Component, OnInit } from '@angular/core';
import { ShareDataService } from '../services/shareData.service';
import { UserSession } from 'blockstack';
import { NavController } from '@ionic/angular';

const userS = new UserSession;

@Component({
  selector: 'app-tag-selector',
  templateUrl: './tag-selector.component.html',
  styleUrls: ['./tag-selector.component.scss'],
})
export class TagSelectorComponent implements OnInit {
  
  createTagScreen: boolean = false;
  newTagScreen: boolean = false;
  slideOpen: boolean = false;

  tag = {
    label: ''
  }

  colorTag;

  tags = [];

  defaultTags = [
    {
      name: 'Personal',
      color: '#4FC3F7'
    },
    {
      name: 'Work',
      color: '#CF195E'
    },
    {
      name: 'Home',
      color: '#46C4B5'
    }
  ];
  
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
  selectedNewTag = {
    name: '',
    color: ''
  };
  tagFromEdit: boolean = false;
  validateCreate: boolean = false;
  
  constructor( private dataService: ShareDataService,
               private nav: NavController) { }

  ngOnInit() {
    this.loadTheTags();
  }

  resetTag(){
    this.selectedNewTag.name = '';
    this.selectedNewTag.color = this.tagsColors[0].color;
  }

  tagSelected(tag){
    //console.log('xq pasamos tagselector');
    this.dataService.shareTag(tag);
    this.nav.pop();
  }

  createNewTag(){
    if(this.selectedNewTag.name != ''){
      this.validateCreate = true;
      
      let tagObject = {
        name: this.selectedNewTag.name,
        color: this.selectedNewTag.color
      }
      console.log(tagObject)
      this.tags.push(tagObject);
      this.storeTheTags();
    }
    else {
      console.log('error validate');
      this.validateCreate = false;
    }
  }

  radioSelect(color) {
    console.log(color);
    this.selectedNewTag.color = color
  }

  loadTheTags(){
    userS.getFile('tags/calTags.json').then(dataTags => {
      if(dataTags !== null) {
        let parsedTags = JSON.parse(dataTags as string);
        this.tags = parsedTags;
      } else {
        this.tags = this.defaultTags;
      }
    });
    this.selectedNewTag.color = this.tagsColors[0].color;
  }

  saveEditTag(){
    //let tagIndex = this.tags.findIndex(tag => tag.name === item.name);
  }

  storeTheTags(){
    let tagsToString = JSON.stringify(this.tags);
    userS.putFile('tags/calTags.json', tagsToString);
    this.resetTag();
    this.newTagScreen = !this.newTagScreen;
    this.validateCreate = false;
  }





  slideOptions(item, action){
    if(action === 0){
      console.log('edit item');
      this.newTagScreen = true;
      this.tagFromEdit = true;
      this.selectedNewTag.name = item.name;
      this.selectedNewTag.color = item.color;

    }
    if(action === 1){
      console.log('delete item');
      let tagIndex = this.tags.findIndex(tag => tag.name === item.name);
      console.log(tagIndex);
      this.tags.splice(tagIndex, 1);
      let tagsToString = JSON.stringify(this.tags);
      userS.putFile('tags/calTags.json', tagsToString);
    }

    if(action === 2){
      //item.closeSlidingItems();
      let newId = new Date().getMilliseconds();
      //Date.parse(newId);
      console.log(newId)
    }
    console.log(item);
    //item.close();
  }

  itemSlide(item){
    item.open();
    // this.slideOpen = !this.slideOpen;
    // console.log(this.slideOpen);
    // if(this.slideOpen){
    //   item.open();
    // } else {
    //   console.log('close slide')
    //   item.close();
    // }
    //console.log(item)
  }

}
