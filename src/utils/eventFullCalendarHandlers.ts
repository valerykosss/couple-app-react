import { message } from "antd";
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  hasGoogleCalendarAccess,
  updateGoogleCalendarEvent,
} from "../api/googleCalendar/googleCalendar";
import { CalendarEventType } from "../types/calendar";
import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "../api/firebase/firebase";
import { AppDispatch, action } from "../store";
import { v4 } from "uuid";

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

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const newEvent: Omit<CalendarEventType, "id"> = {
      summary: values.title,
      start: { dateTime: eventData?.start || "", timeZone },
      end: { dateTime: eventData?.end || "", timeZone },
      userIds: [userId],
      createdBy: userId,
    };

    let firebaseEvent: CalendarEventType;

    if (hasGoogleCalendarAccess()) {
      const accessToken = parsedAuthUser.accessToken;
      const googleEvent = await createGoogleCalendarEvent(
        accessToken,
        newEvent
      );

      firebaseEvent = {
        ...newEvent,
        id: googleEvent.id,
        htmlLink: googleEvent.htmlLink,
        status: googleEvent.status,
      };
    } else {
      firebaseEvent = {
        ...newEvent,
        id: v4(),
        htmlLink: "",
        status: "",
      };
    }

    firebaseEvent.createdAt = new Date().toISOString();
    firebaseEvent.updatedAt = new Date().toISOString();

    console.log(firebaseEvent);

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

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const updatedEvent = {
      id: eventData.id,
      summary: values.title,
      start: { dateTime: eventData.start, timeZone },
      end: { dateTime: eventData.end, timeZone },
      // userIds: [parsedAuthUser.id],
      updatedAt: new Date().toISOString(),
    };

    let firebaseEvent: Partial<CalendarEventType>;

    if (hasGoogleCalendarAccess()) {
      const accessToken = parsedAuthUser.accessToken;
      const googleEvent = await updateGoogleCalendarEvent(
        accessToken,
        updatedEvent
      );
      firebaseEvent = {
        ...updatedEvent,
        htmlLink: googleEvent.htmlLink,
        status: googleEvent.status,
      };
    } else {
      firebaseEvent = {
        ...updatedEvent,
        htmlLink: "",
        status: "",
      };
    }

    await updateEvent(eventData.id, firebaseEvent);

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
    if (hasGoogleCalendarAccess()) {
      const accessToken = parsedAuthUser.accessToken;
      await deleteGoogleCalendarEvent(accessToken, eventId);
    }

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
