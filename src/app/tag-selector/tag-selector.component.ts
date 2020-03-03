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
  selectedNewTag: any;
  
  constructor( private dataService: ShareDataService,
               private nav: NavController) { }

  ngOnInit() {
    this.loadTheTags();
  }

  // newTag() {
  //   this.newTagScreen = true;
  // }

  tagSelected(tag){
    console.log('xq pasamos tagselector');
    this.dataService.shareTag(tag);
    this.nav.pop();
  }

  createNewTag(){
    let tagLabel = this.tag.label;
    console.log(tagLabel, this.selectedNewTag, this.selectedNewTag.color);
    this.newTagScreen = !this.newTagScreen;
    let tagObject = {
      name: tagLabel,
      color: this.selectedNewTag.color
    }
    this.tags.push(tagObject);
    this.storeTheTags();
  }

  radioSelect(event) {
    this.selectedNewTag = event.detail.value;
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
  }

  storeTheTags(){
    let tagsToString = JSON.stringify(this.tags);
    userS.putFile('tags/calTags.json', tagsToString);
  }

}
