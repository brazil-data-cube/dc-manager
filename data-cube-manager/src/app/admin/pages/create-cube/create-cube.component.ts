import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

@Component({
    selector: 'app-create-cube',
    templateUrl: './create-cube.component.html',
    styleUrls: ['./create-cube.component.scss']
})
export class CreateCubeComponent implements OnInit {
    @ViewChild('stepper', { }) stepper: MatStepper;

    constructor() { }

    ngOnInit() {
    }

}
