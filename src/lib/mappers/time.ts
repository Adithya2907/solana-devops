import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

export function mapTime(date: Date | string | undefined | null): string {
    return timeAgo.format(new Date(date ?? '').getTime())
}