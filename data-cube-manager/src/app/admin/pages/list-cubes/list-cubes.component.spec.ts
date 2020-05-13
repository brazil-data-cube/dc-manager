/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCubesComponent } from './list-cubes.component';

describe('ListCubesComponent', () => {
  let component: ListCubesComponent;
  let fixture: ComponentFixture<ListCubesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListCubesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCubesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
