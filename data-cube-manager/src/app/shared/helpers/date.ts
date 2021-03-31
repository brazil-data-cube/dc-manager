 /**
 * convert date to string with USA template
 */
export function formatDateUSA(date: Date): string {
    let month: string = (date.getUTCMonth() + 1).toString();
    month = month.toString().length === 1 ? `0${month}` : month;
    let day: string = (date.getUTCDate()).toString();
    day = day.toString().length === 1 ? `0${day}` : day;

    return `${date.getUTCFullYear()}-${month}-${day}`;
}