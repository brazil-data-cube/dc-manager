import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'app/shared/helpers/date.adapter';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { showLoading, closeLoading } from 'app/app.action';

@Component({
  selector: 'app-reprocess-dialog',
  templateUrl: './reprocess-dialog.component.html',
  styleUrls: ['./reprocess-dialog.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class ReprocessDialogComponent implements OnInit {

  form: FormGroup;
  editable: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ReprocessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private service: CubeBuilderService,
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
    if (this.data.hasOwnProperty('editable')) {
      this.editable = !!this.data.editable;
    }

    this.getDataCubeMeta(this.data.cube)
      .then(values => this.form.patchValue(values));

    this.form = this.fb.group({
      tiles: [{ value: '', disabled: !this.editable }, [Validators.required]],
      collections: [{ value: '', disabled: true }, [Validators.required]], // You cannot change collection
      start_date: [{ value: '', disabled: !this.editable }, [Validators.required]],
      end_date: [{ value: '', disabled: !this.editable }, [Validators.required]],
      url_stac: [{ value: '', disabled: !this.editable }, [Validators.required]],
      bucket: [{ value: '', disabled: !this.editable }, [Validators.required]],
      satellite: [{ value: '', disabled: !this.editable }, [Validators.required]],
      datacube: [{ value: '', disabled: !this.editable }, [Validators.required]],
    });

    this.form.patchValue({ ...this.data, datacube: this.data.cube });
  }

  close() {
    this.dialogRef.close()
  }

  async getDataCubeMeta(cubeId: string) {
    this.store.dispatch(showLoading());

    try {
      const meta = await this.service.getCubeMeta(cubeId) as any;

      return meta;
    } catch (err) {
      console.error(err);
    } finally {
      this.store.dispatch(closeLoading());
    }
  }

  async dispatch() {
    if (this.form.invalid) {
      return;
    }

    this.store.dispatch(showLoading());

    try {
      // await this.service.start(this.form.value);
    } finally {
      this.store.dispatch(closeLoading());
    }
  }

}
