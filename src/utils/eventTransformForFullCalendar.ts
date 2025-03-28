import { CalendarEventType } from "../types/calendar";

//события в формат для FullCalendar
export function transformEvents(googleEvents: CalendarEventType[]) {
  return googleEvents.map(function(event) {
    return {
      id: event.id,
      title: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime,
      url: event.htmlLink,
      extendedProps: {
        status: event.status,
        timeZone: event.start.timeZone
      }
    };
  });
}

//форматирует дату события для отображения
export function formatEventDateTime(event: CalendarEventType) {
  return new Date(event.start.dateTime).toLocaleString("ru-RU", {
    timeZone: event.start.timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}