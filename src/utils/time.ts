import type { CalendarType } from '../context/settings'

const getLocaleAndCalendar = (calendar: CalendarType): { locale: string; calendarSystem: string } => {
    switch (calendar) {
        case 'solar-hijri':
            return { locale: 'fa-IR', calendarSystem: 'persian' }
        case 'lunar-hijri':
            return { locale: 'ar-SA', calendarSystem: 'islamic-civil' }
        default:
            return { locale: 'en-US', calendarSystem: 'gregory' }
    }
}

export const formatTimestamp = (
    value: number,
    timezone: string,
    calendar: CalendarType,
): string => {
    const ms = value > 1_000_000_000_000 ? value : value * 1000
    const date = new Date(ms)
    if (Number.isNaN(date.getTime())) return 'Invalid timestamp'

    const tz = timezone === 'local' ? undefined : timezone
    const { locale, calendarSystem } = getLocaleAndCalendar(calendar)

    const formatted = new Intl.DateTimeFormat(`${locale}-u-ca-${calendarSystem}`, {
        timeZone: tz,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short',
    }).format(date)

    return formatted
}

export const formatTimestampShort = (
    value: number,
    timezone: string,
    calendar: CalendarType,
): string => {
    const ms = value > 1_000_000_000_000 ? value : value * 1000
    const date = new Date(ms)
    if (Number.isNaN(date.getTime())) return 'Invalid timestamp'

    const tz = timezone === 'local' ? undefined : timezone
    const { locale, calendarSystem } = getLocaleAndCalendar(calendar)

    const dateStr = new Intl.DateTimeFormat(`${locale}-u-ca-${calendarSystem}`, {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short',
    }).format(date)

    return dateStr
}
