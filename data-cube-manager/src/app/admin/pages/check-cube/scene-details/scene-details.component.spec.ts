import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneDetailsComponent } from './scene-details.component';

describe('SceneDetailsComponent', () => {
  let component: SceneDetailsComponent;
  let fixture: ComponentFixture<SceneDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SceneDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SceneDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
