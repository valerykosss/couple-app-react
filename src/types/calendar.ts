export type CalendarEventType = {
  userId: string;
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  status?: string;
  htmlLink?: string;
}

//для создания события (без id и с необязательным status)
// export type NewCalendarEventType = Omit<CalendarEvent, 'id'> & {
//   status?: string;
// };

// Обновляем тип NewCalendarEvent, чтобы он включал поле status

export type CalendarView = 'list' | 'calendar';