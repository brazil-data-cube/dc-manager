import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-step-layout',
    templateUrl: './step-layout.component.html',
    styleUrls: ['./step-layout.component.scss']
})
export class StepLayerComponent implements OnInit {

    @Input('first') public first = false;
    @Input('titleNext') public titleNext = 'Next';
    @Input('removeNext') public removeNext = false;

    constructor() { }

    ngOnInit() {
    }

}
