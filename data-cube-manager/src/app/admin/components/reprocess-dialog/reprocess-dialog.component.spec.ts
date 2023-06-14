import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReprocessDialogComponent } from './reprocess-dialog.component';

describe('ReprocessDialogComponent', () => {
  let component: ReprocessDialogComponent;
  let fixture: ComponentFixture<ReprocessDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReprocessDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReprocessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
