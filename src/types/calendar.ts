export type CalendarEventType = {
  id: string; // ID события, уникальный для Google Calendar
  summary: string; // Название события
  description?: string; // Описание события
  location?: string; // Местоположение события
  start: {
    dateTime: string; // Время начала события в ISO 8601
    timeZone: string; // Часовой пояс
  };
  end: {
    dateTime: string; // Время окончания события в ISO 8601
    timeZone: string; // Часовой пояс
  };
  htmlLink?: string; // Ссылка на событие в Google Calendar
  status?: string; // Статус события, например, "confirmed"
  creator?: {
    email: string; // Электронная почта создателя события
    displayName: string; // Имя создателя
  };
  attendees?: Array<{
    email: string; // Электронная почта участника
    responseStatus: string; // Статус участника
  }>;
  userId: string; // Идентификатор пользователя (для связи с Firestore)
  createdAt?: string; // Время создания события
  updatedAt?: string; // Время последнего обновления
  extendedProperties?: {
    private: Record<string, string>; // Дополнительные пользовательские свойства
  }

  iCalUID?: string; // Для событий из Google Calendar
  kind?: string; // Например "calendar#event" для Google
  organizer?: {
    email: string;
    self?: boolean;
  };
  etag?: string; // Для синхронизации изменений
  migratedAt?: string; // Для отслеживания миграции
  migrationError?: string; // Для хранения ошибок миграции
}