import { message } from 'antd';
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent, updateGoogleCalendarEvent } from '../api/googleCalendar/googleCalendar';
import { CalendarEventType } from '../types/calendar';
import { createEvent, deleteEvent, updateEvent } from '../api/firebase/firebase';
import { AppDispatch, action } from "../store";

export async function handleAddEvent(
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

export async function handleUpdateEvent( 
    values: { title: string },
    eventData: { id: string; start: string; end: string },
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
      const accessToken = parsedAuthUser.accessToken;
  
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  
      const updatedEvent: CalendarEventType = {
        id: eventData.id,
        summary: values.title,
        start: { dateTime: eventData.start, timeZone },
        end: { dateTime: eventData.end, timeZone },
        userId: parsedAuthUser.id,
        updatedAt: new Date().toISOString()
      };
  
      const googleEvent = await updateGoogleCalendarEvent(accessToken, updatedEvent);
  
      await updateEvent(eventData.id, {
        summary: values.title,
        start: updatedEvent.start,
        end: updatedEvent.end,
        updatedAt: updatedEvent.updatedAt,
        htmlLink: googleEvent.htmlLink,
        status: googleEvent.status
      });
  
      message.success("Событие успешно обновлено!");
      dispatch(action.eventModalSlice.hideModal());
    } catch (error) {
      console.error("Ошибка при обновлении:", error);
      message.error("Не удалось обновить событие.");
    } finally {
      setLoading(false);
    }
  }

  export async function handleDeleteEvent(
    eventId: string,
    dispatch: AppDispatch,
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
      const accessToken = parsedAuthUser.accessToken;
  
      await deleteGoogleCalendarEvent(accessToken, eventId);
  
      await deleteEvent(eventId);
  
      message.success("Событие успешно удалено!");
      dispatch(action.eventModalSlice.hideModal());
    } catch (error) {
      console.error("Ошибка при удалении:", error);
      message.error("Не удалось удалить событие.");
    } finally {
      setLoading(false);
    }
  }