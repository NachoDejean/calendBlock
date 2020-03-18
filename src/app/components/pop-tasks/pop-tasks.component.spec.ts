import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PopTasksComponent } from './pop-tasks.component';

describe('PopTasksComponent', () => {
  let component: PopTasksComponent;
  let fixture: ComponentFixture<PopTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopTasksComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PopTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
