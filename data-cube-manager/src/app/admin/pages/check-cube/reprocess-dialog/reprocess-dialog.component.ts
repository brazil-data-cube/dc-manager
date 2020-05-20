import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-reprocess-dialog',
  templateUrl: './reprocess-dialog.component.html',
  styleUrls: ['./reprocess-dialog.component.css']
})
export class ReprocessDialogComponent implements OnInit {

  form: FormGroup;
  editable: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ReprocessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    if (this.data.hasOwnProperty('editable')) {
      this.editable = !!this.data.editable;
    }

    this.form = this.fb.group({
      tiles: [{ value: '', disabled: !this.editable }, [Validators.required]],
      collections: [{ value: '', disabled: !this.editable }, [Validators.required]],
      start_date: [{ value: '', disabled: !this.editable }, [Validators.required]],
      end_date: [{ value: '', disabled: !this.editable }, [Validators.required]]
    });

    this.form.patchValue(this.data);
  }

  close() {
    this.dialogRef.close()
  }

}
