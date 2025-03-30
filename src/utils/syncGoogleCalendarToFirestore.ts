import { message } from "antd";
import { fetchGoogleCalendarEvents } from "../api/googleCalendar/googleCalendar";
import { createEvent } from "../api/firebase/firebase";

// Функция для получения и сохранения событий из Google Calendar в Firestore
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

      // Получаем события из Google Calendar
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