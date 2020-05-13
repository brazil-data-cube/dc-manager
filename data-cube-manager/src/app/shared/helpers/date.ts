/**
 * convert date to string with USA template
 */
export function formatDateUSA(date: Date): string {
    let month: string = (date.getMonth() + 1).toString();
    month = month.toString().length === 1 ? `0${month}` : month;
    let day: string = (date.getDate()).toString();
    day = day.toString().length === 1 ? `0${day}` : day;

    return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * add on month in date
 */
export function addMonth(date: Date): Date {
    return new Date(date.setMonth(date.getMonth() + 1));
}

/**
 * sum days in date
 */
export function addDays(date: Date, qntDays: number): Date {
    return new Date(date.setDate(date.getDate() + qntDays));
}

/**
 * subtract on month in date
 */
export function subMonth(date: Date): Date {
    return new Date(date.setMonth(date.getMonth() - 1));
}

/**
 * subtract days in date
 */
export function subDays(date: Date, qntDays: number): Date {
    return new Date(date.setDate(date.getDate() - qntDays));
}

/**
 * get last day by month
 */
export function getLastDateMonth(date: Date): number {
    const nextMonth = addMonth(new Date(date.setDate(1)));
    const thisMonthDate = new Date(nextMonth.setDate(nextMonth.getDate() - 1));
    return thisMonthDate.getDate();
}
