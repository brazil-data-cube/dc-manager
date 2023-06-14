import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBandDialogComponent } from './update-band-dialog.component';

describe('UpdateBandDialogComponent', () => {
  let component: UpdateBandDialogComponent;
  let fixture: ComponentFixture<UpdateBandDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateBandDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateBandDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
