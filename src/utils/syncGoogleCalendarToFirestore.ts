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
    // Извлекаем данные пользователя из localStorage
    const authUser = localStorage.getItem('authUser');
    
    if (!authUser) {
      message.error("Данные пользователя не найдены в localStorage.");
      return;
    }

    try {
      // Преобразуем строку в объект
      const parsedAuthUser = JSON.parse(authUser);
      
      // Извлекаем accessToken и userId
      const accessToken = parsedAuthUser.accessToken;
      const userId = parsedAuthUser.id;

      if (!accessToken || !userId) {
        message.error("Не удалось найти необходимые данные для авторизации.");
        return;
      }

      const googleEvents = await fetchGoogleCalendarEvents(accessToken);

      // Преобразуем их в формат, который подойдёт для Firestore
      const eventsToSave = googleEvents.map(event => ({
        ...event,
        userId: userId,  // Добавляем userId, чтобы понять, чье это событие
      }));

      // Сохраняем события в Firestore
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

// export async function syncGoogleCalendarToFirestore() {
//   try {
//     const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    
//     if (!authUser.accessToken || !authUser.id) {
//       message.error("Необходимые данные для авторизации не найдены");
//       return;
//     }

//     const [googleEvents, existingEvents] = await Promise.all([
//       fetchGoogleCalendarEvents(authUser.accessToken),
//       getEventsByUserId(authUser.id) // Получаем все существующие события пользователя
//     ]);

//     // Создаем Map для быстрого поиска событий по iCalUID
//     const existingEventsMap = new Map(
//       existingEvents.map(event => [event.iCalUID, event])
//     );

//     const operations = googleEvents.map(async (googleEvent) => {
//       const existingEvent = existingEventsMap.get(googleEvent.iCalUID);

//       if (existingEvent) {
//         // Если событие существует, обновляем его ID и другие поля
//         await updateEvent(existingEvent.id, {
//           ...googleEvent,
//           id: googleEvent.id, // Обновляем ID на Google ID
//           userId: authUser.id // Сохраняем userId
//         });
//       } else {
//         // Если события нет, создаем новое
//         await createEvent({
//           ...googleEvent,
//           userId: authUser.id
//         });
//       }
//     });

//     await Promise.all(operations);
//     message.success(`Синхронизировано ${googleEvents.length} событий`);
    
//   } catch (error) {
//     console.error("Ошибка синхронизации:", error);
//     message.error("Ошибка при синхронизации с Google Calendar");
//     throw error;
//   }
// }

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
          userId: userId
        });
        await deleteEvent(event.id);
        return { success: true };
      }
          // .then(googleEvent => ({
          //   id: googleEvent.id,
          //   iCalUID: googleEvent + '@google.com',
          //   htmlLink: googleEvent.htmlLink
          // }))
      )
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