import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CubeBuilderService } from 'app/admin/pages/cube-builder.service';

@Component({
  selector: 'app-create-cube-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class CreateCubeMetadataComponent implements OnInit {

  constructor(
    private cbs: CubeBuilderService,
    private ref: ChangeDetectorRef) { }

  ngOnInit() {
  }
}
