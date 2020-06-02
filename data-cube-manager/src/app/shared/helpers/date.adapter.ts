import { NativeDateAdapter } from "@angular/material/core";
import { Injectable } from "@angular/core";
import * as moment from 'moment';

/**
 * adapter to parser and format dates of the input date
 */
@Injectable({ providedIn: 'root' })
export class AppDateAdapter extends NativeDateAdapter {

    /**
     * parser initial date to EN format (YYYY/mm/dd)
     */
    parse(value: any): Date | null {
        if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
            const str = value.split('/');
            const year = Number(str[0]);
            const month = Number(str[1]) - 1;
            const date = Number(str[2]);
            return new Date(year, month, date);
        }
        const timestamp = typeof value === 'number' ? value : Date.parse(value);
        return isNaN(timestamp) ? null : new Date(timestamp);
    }

    /**
     * format date result to EN format (YYYY/mm/dd)
     * possibles: with or without days
     */
    format(date: Date, displayFormat: string): string {
        // tslint:disable-next-line
        const momentDate = moment(date).utc();

        if (displayFormat == 'input') {
            return momentDate.format('YYYY-MM-DD');
        // tslint:disable-next-line
        } else if (displayFormat == 'inputMonth') {
            return momentDate.format('MM-YYYY');
        } else {
            return momentDate.format('MMMM Do YYYY');
        }
    }
}

/**
 * options to format date
 */
export const APP_DATE_FORMATS = {
    parse: {
        dateInput: { month: 'short', year: 'numeric', day: 'numeric' }
    },
    display: {
        // dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
        dateInput: 'input',
        // monthYearLabel: { month: 'short', year: 'numeric', day: 'numeric' },
        monthYearLabel: 'inputMonth',
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
        monthYearA11yLabel: { year: 'numeric', month: 'long' }
    }
};
