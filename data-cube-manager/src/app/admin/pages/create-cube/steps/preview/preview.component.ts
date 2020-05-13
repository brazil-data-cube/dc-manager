import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';

@Component({
  selector: 'app-create-cube-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class CreateCubePreviewComponent implements OnInit {

  constructor(
    private cbs: CubeBuilderService,
    private ref: ChangeDetectorRef) { }

  ngOnInit() {
  }
}
