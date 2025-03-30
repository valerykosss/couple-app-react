import { message } from 'antd';
import { createGoogleCalendarEvent } from '../api/googleCalendar/googleCalendar';
import { CalendarEventType } from '../types/calendar';
import { createEvent } from '../api/firebase/firebase';
import { AppDispatch, action } from "../store";

export default async function handleAddEvent(
  values: { title: string },
  eventData: { start: string; end: string } | null,
  dispatch: AppDispatch,
  form: any,
  setLoading: (loading: boolean) => void
) {
  try {
    setLoading(true);

    const authUser = localStorage.getItem("authUser");
    if (!authUser) {
      message.error("Не удалось найти данные пользователя.");
      return;
    }

    const parsedAuthUser = JSON.parse(authUser);
    const userId = parsedAuthUser.id;
    const accessToken = parsedAuthUser.accessToken;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const newEvent: Omit<CalendarEventType, "id"> = {
      summary: values.title,
      start: { dateTime: eventData?.start || "", timeZone },
      end: { dateTime: eventData?.end || "", timeZone },
      userId,
    };

    const googleEvent = await createGoogleCalendarEvent(accessToken, newEvent);

    const firebaseEvent: CalendarEventType = {
      ...newEvent,
      id: googleEvent.id,
      htmlLink: googleEvent.htmlLink,
      status: googleEvent.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createEvent(firebaseEvent);

    message.success("Событие успешно добавлено!");
    form.resetFields();
    dispatch(action.eventModalSlice.hideModal());
  } catch (error) {
    console.error("Ошибка:", error);
    message.error("Не удалось создать событие.");
  } finally {
    setLoading(false);
  }
}