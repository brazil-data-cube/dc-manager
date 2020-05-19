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