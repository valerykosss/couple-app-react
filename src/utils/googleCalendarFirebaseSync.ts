import { message } from "antd";
import { CalendarEventType } from "../types/calendar";
import { createGoogleCalendarEvent, updateGoogleCalendarEvent } from "../api/googleCalendar/googleCalendar";
import { createEvent, updateEvent } from "../api/firebase/firebase";


export async function syncEventWithGoogleAndFirebase(token: string, event: CalendarEventType, isNew: boolean) {
  try {
    if (isNew) {
      //событие новое - создаем его в Google Calendar
      const googleEvent = await createGoogleCalendarEvent(token, event);

      //id события из Google Calendar в локальное событие
      event.googleEventId = googleEvent.id;

      await createEvent(event);
      message.success("Событие успешно синхронизировано с Google Calendar и Firebase");

    } else {
      //событие уже существует - обновляем его в Google Calendar
      const googleEvent = await updateGoogleCalendarEvent(token, event);

      //ID события из Google Calendar в локальное событие
      event.googleEventId = googleEvent.id;

      if (event.id) {
        await updateEvent(event.id, event);
      } else {
        console.error("Ошибка: у обновляемого события отсутствует ID.");
      }
      message.success("Событие успешно обновлено в Google Calendar и Firebase");
    }
  } catch (error) {
    console.error("Ошибка синхронизации с Google Calendar и Firebase:", error);
    message.error("Не удалось синхронизировать событие с Google Calendar и Firebase");
  }
}