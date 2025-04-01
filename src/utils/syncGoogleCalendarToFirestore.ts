import { message } from "antd";
import { createGoogleCalendarEvent, fetchGoogleCalendarEvents } from "../api/googleCalendar/googleCalendar";
import { createEvent, deleteEvent, getEventsByUserId, updateEvent } from "../api/firebase/firebase";
import { CalendarEventType } from "../types/calendar";

export function isLocalEvent(event: CalendarEventType): boolean {
  const isGoogleEvent = (
    event.iCalUID ||
    event.htmlLink?.includes('google.com')
  );

  return !isGoogleEvent;
}

export function syncGoogleCalendarToFirestore() {
  return (async () => {
    const authUser = localStorage.getItem('authUser');
    if (!authUser) {
      message.error("Данные пользователя не найдены в localStorage.");
      return;
    }

    try {
      const parsedAuthUser = JSON.parse(authUser);
      
      const accessToken = parsedAuthUser.accessToken;
      const userId = parsedAuthUser.id;

      if (!accessToken || !userId) {
        message.error("Не удалось найти необходимые данные для авторизации.");
        return;
      }

      const googleEvents = await fetchGoogleCalendarEvents(accessToken);

      const eventsToSave = googleEvents.map(event => ({
        ...event,
        userIds: [userId],
        createdBy: userId
      }));

      for (const event of eventsToSave) {
        await createEvent(event);
      }

      message.success("События успешно синхронизированы с Firestore.");
    } catch (error) {
      console.error("Ошибка при синхронизации с Google Calendar:", error);
      message.error("Не удалось синхронизировать события.");
    }
  })();
}

export async function migrateLocalEventsToGoogle(
  userId: string,
  accessToken: string
) {
  try {
    const localEvents = (await getEventsByUserId(userId)).filter(isLocalEvent);

    const results = await Promise.allSettled(
      localEvents.map(async event => {
        const googleEvent = createGoogleCalendarEvent(accessToken, {
          summary: event.summary,
          start: event.start,
          end: event.end,
          userIds: [userId]
        });
        await deleteEvent(event.id);
        return { success: true };
      })
    );

    return {
      success: results.some(r => r.status === 'fulfilled'),
      migratedCount: results.filter(r => r.status === 'fulfilled').length,
      errors: results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => ({ error: r.reason.message }))
    };
  } catch (error: any) {
    console.error('Migration error:', error);
    return {
      success: false,
      migratedCount: 0,
      errors: [{ error: error.message }]
    };
  }
}