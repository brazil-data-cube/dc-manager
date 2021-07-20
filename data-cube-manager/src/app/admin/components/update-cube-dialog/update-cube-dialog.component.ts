import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'app/shared/helpers/date.adapter';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { closeLoading, showLoading } from 'app/app.action';

@Component({
  selector: 'app-update-cube-dialog',
  templateUrl: './update-cube-dialog.component.html',
  styleUrls: ['./update-cube-dialog.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class UpdateCubeDialog implements OnInit {
  public environmentVersion = window['__env'].environmentVersion
  form: FormGroup;
  cube: object;
  metadata: string;
  parameters: any = { };

  private cubeParameters_: any;

  constructor(
    public dialogRef: MatDialogRef<UpdateCubeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private service: CubeBuilderService,
    private store: Store<AppState>,
    private snackBar: MatSnackBar
  ) {
    this.cube = data['cube'];
    this.cubeParameters_ = data['parameters'];
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [{ value: '' }, [Validators.required]],
      description: [{ value: '' }, [Validators.required]],
      public: [{ value: false }, [Validators.required]],
    });

    this.form.patchValue({
      title: this.cube['title'],
      description: this.cube['description'],
      public: this.cube['is_public']
    });

    this.metadata = this.cube['_metadata'];
  }

  get cubeParameters () {
    return JSON.stringify(this.cubeParameters_, null, 4);
  }

  set cubeParameters (v) {
    try{
      this.cubeParameters_ = JSON.parse(v);
    }
    catch(e) {};
  }

  close(status = false) {
    this.dialogRef.close(status);
  }

  get codeMetadata () {
    return JSON.stringify(this.metadata, null, 2);
  }

  set codeMetadata (v) {
    try{
      this.metadata = JSON.parse(v);
    }
    catch(e) {};
  }

  async update() {
    if (this.form.invalid) {
      return;
    }

    this.store.dispatch(showLoading());

    const data = {...this.form.value, metadata: this.metadata};

    try {
      await this.service.update(this.cube['id'], data);

      if (this.environmentVersion === 'local') {
        await this.service.updateCubeParameters(this.cube['id'], this.cubeParameters_);
      }

      this.snackBar.open('Update datacube has been successfully.', '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-success'
      });

      this.close(true);

    } catch (err) {
      let message = err.error;

      if (err.status === 0) {
        message = 'Server error. Please contact the system administrator';
      }

      this.snackBar.open(JSON.stringify(message), '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-error'
      });
    } finally {
      this.store.dispatch(closeLoading());
    }
  }

}
