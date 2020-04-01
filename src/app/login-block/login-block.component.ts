import { Component, OnInit } from '@angular/core';
import { ShareDataService } from '../services/shareData.service';

@Component({
  selector: 'app-login-block',
  templateUrl: './login-block.component.html',
  styleUrls: ['./login-block.component.scss'],
})
export class LoginBlockComponent implements OnInit {

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    slidesPerColumnFill: 'column',
    autoplay: {
      delay: 3000,
    },
  };

  constructor( private dataService: ShareDataService) { }

  ngOnInit() {}

  loginFlow(){
    this.dataService.doTheLogin(true);
  }

}
