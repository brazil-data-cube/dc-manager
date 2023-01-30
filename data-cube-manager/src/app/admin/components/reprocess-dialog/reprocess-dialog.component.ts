import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'app/shared/helpers/date.adapter';
import { CubeBuilderService } from 'app/services/cube-builder';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { showLoading, closeLoading } from 'app/app.action';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reprocess-dialog',
  templateUrl: './reprocess-dialog.component.html',
  styleUrls: ['./reprocess-dialog.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class ReprocessDialogComponent implements OnInit {

  form: FormGroup;
  editable: boolean = true;
  grid: string = '';
  firstRun: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ReprocessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private service: CubeBuilderService,
    private store: Store<AppState>,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (this.data.hasOwnProperty('editable')) {
      this.editable = !!this.data.editable;
    }

    this.grid = this.data.grid;

    // If first tile
    if (this.data.tiles && this.data.tiles.length === 0) {
      this.firstRun = true;
    }

    this.form = this.fb.group({
      tiles: [{ value: '', disabled: !this.editable }, [Validators.required]],
      // You should change collection.
      collections: ['', [Validators.required]],
      start_date: [{ value: '', disabled: !this.editable }, [Validators.required]],
      end_date: [{ value: '', disabled: !this.editable }, [Validators.required]],
      datacube: [{ value: '', disabled: !this.editable }, [Validators.required]],
      stac_url: ['', [Validators.required]],
      token: [''],
    });

    if (this.isCloud()) {
      this.form.addControl('bucket', new FormControl({ value: '', disabled: !this.editable }, [Validators.required]));
      this.form.addControl('datacube_version', new FormControl({ value: '', disabled: !this.editable }, [Validators.required]));
      this.form.addControl('indexes_only_regular_cube', new FormControl(false, [Validators.required]));
      this.form.removeControl('collections');
      this.form.removeControl('stac_url');
      this.form.removeControl('token');

    } else {
      if (this.data.collections && Array.isArray(this.data.collections)) {
        this.data.collections = this.data.collections.join(',');
      }
    }

    if (this.data.tiles && Array.isArray(this.data.tiles)) {
      this.data.tiles = this.data.tiles.join(',');
    }

    this.form.patchValue({ ...this.data });
  }

  getTitle() {
    return this.data.title;
  }

  close() {
    this.dialogRef.close()
  }

  async dispatch() {
    if (this.form.invalid) {
      return;
    }

    try {
      this.store.dispatch(showLoading());

      const data = this.form.getRawValue();

      data.tiles = !Array.isArray(data.tiles) ? data.tiles.split(',') : data.tiles;
      data.start_date = moment(data.start_date).utc().format('YYYY-MM-DD');
      data.end_date = moment(data.end_date).utc().format('YYYY-MM-DD');

      if (!this.isCloud()) {
        let collections = data.collections;

        if (!this.firstRun) {
          collections = this.data.collections;
        }

        data.collections = !Array.isArray(collections) ? collections.split(',') : collections;
      }

      data.datacube = data.datacube;
      data.force = !!this.data.force;

      await this.service.start(data);

      this.snackBar.open('Update datacube has been successfully triggered.', '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-success'
      });

      this.close();

    } catch (err) {
      let message = null;

      if (err.status === 0 || err.status === 500) {
        message = 'Server error. Please contact the system administrator';
      } else {
        message = err.error.description;
      }

      this.snackBar.open(message, '', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'app_snack-bar-error'
      });
    } finally {
      this.store.dispatch(closeLoading());
    }
  }

  isCloud() {
    return window['__env'].environmentVersion === 'cloud'
  }

}
