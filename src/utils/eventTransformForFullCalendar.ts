import { CalendarEventType } from "../types/calendar";

export function transformEvents(googleEvents: CalendarEventType[]) {
  return googleEvents.map(event => ({
    id: event.id,
    title: event.summary,
    start: event.start.dateTime,
    end: event.end.dateTime,
    extendedProps: {
      status: event.status,
      timeZone: event.start.timeZone
    }
  }));
}