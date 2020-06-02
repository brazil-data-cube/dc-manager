import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapFieldComponent } from './map-field.component';

describe('MapFieldComponent', () => {
  let component: MapFieldComponent;
  let fixture: ComponentFixture<MapFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
