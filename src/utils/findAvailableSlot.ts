import { message } from 'antd';
import { getDateCard, getEventsByUserId } from '../api/firebase/firebase';
import { CalendarEventType, TimeSlot } from '../types/calendar';

export const findAvailableSlot = async (
  matchedCardId: string,
  userIds: string[]
): Promise<TimeSlot | null> => {
  try {

    const event = await getDateCard(matchedCardId);
    if (!event?.durationMinutes) {
      message.error('Не удалось получить данные о мероприятии');
      return null;
    }

    const now = new Date();
    const timeMax = new Date(now);
    now.setDate(now.getDate() + 1);
    timeMax.setDate(now.getDate() + 14); // +2 недели

    const [user1Events, user2Events] = await Promise.all([
      getEventsByUserId(userIds[0]),
      getEventsByUserId(userIds[1])
    ]);

    //первый доступный слот
    for (
      let day = new Date(now);
      day <= timeMax;
      day.setDate(day.getDate() + 1)
    ) {
      //с 9 00 текущего дня
      const dayStart = new Date(day);
      dayStart.setHours(9, 0, 0, 0);
      
      //в 2300
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 0, 0, 0);

      //проверяем слоты с шагом 15 минут
      for (
        let slotStart = new Date(dayStart);
        slotStart <= dayEnd;
        slotStart.setMinutes(slotStart.getMinutes() + 15)
      ) {
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + event.durationMinutes);

        //проверка что слот не выходит за границы 23 00
        if (slotEnd > dayEnd) break;

        //свободны ли пользователи
        if (
          !isTimeOccupied(slotStart, slotEnd, user1Events) &&
          !isTimeOccupied(slotStart, slotEnd, user2Events)
        ) {
          return { start: slotStart, end: slotEnd };
        }
      }
    }

    message.warning('Не найдено свободного времени в ближайшие 2 недели');
    return null;
  } catch (error) {
    message.error('Ошибка при поиске времени для встречи');
    return null;
  }
};

const isTimeOccupied = (
  start: Date,
  end: Date,
  events: CalendarEventType[]
): boolean => {
  return events.some(event => {
    const eventStart = new Date(event.start.dateTime);
    const eventEnd = new Date(event.end.dateTime);
    return start < eventEnd && end > eventStart;
  });
};