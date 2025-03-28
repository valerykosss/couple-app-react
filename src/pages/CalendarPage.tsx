import { Button, Card, Typography } from 'antd';
import { useTypedSelector } from '../store';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import handleGoogleAuth from '../api/googleAuth/googleAuth';
import { FullCalendarWithModals } from '../components/FullCalendarWithModals';
import { createGoogleCalendarEvent, fetchGoogleCalendarEvents, updateGoogleCalendarEvent } from '../api/googleCalendar/googleCalendar';  // Функции для работы с Google Calendar
import { getEventsByUser, createEvent, updateEvent, getEventFromFirebaseByGoogleId } from '../api/firebase/firebase';  // Ваши функции Firebase

const { Title } = Typography;
 
export function CalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useTypedSelector(state => state.authSlice);

  // Функция для подключения Google Calendar
  const handleConnectGoogleCalendar = async () => {
    try {
      await handleGoogleAuth({
        isRegister: false,
        dispatch,
        navigate: () => {},
        onClose: () => {},
        showWelcomeMessage: false,
      });
    } catch (error) {
      console.error('Ошибка при подключении Google Calendar:', error);
    }
  };

  //загрузка событий (из Google Calendar или Firebase)
  const loadEvents = async () => {
    try {
      if (authState.calendarToken) {
        const googleEvents = await fetchGoogleCalendarEvents(authState.calendarToken);
        // Массовая проверка существования событий в Firebase
        const eventsToSync = await Promise.all(googleEvents.map(async (event) => {
          if (!event.id) return null;
          const exists = await getEventFromFirebaseByGoogleId(event.id);
          return exists ? null : event;
        }));
        
        await Promise.all(eventsToSync.filter(Boolean).map(syncEventWithFirebaseAndGoogle));
        return googleEvents;
      } else if (authState.id) {
        return await getEventsByUser(authState.id);
      }
      return [];
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
      return [];
    }
  };


  const syncEventWithFirebaseAndGoogle = async (googleEvent: any) => {
    try {
      await createEvent(googleEvent);//в Firebase
  
      if (authState.calendarToken) {
        await createGoogleCalendarEvent(authState.calendarToken, googleEvent);
        console.log('Событие синхронизировано с Firebase и Google Calendar');
      } else {
        console.error('Отсутствует токен для Google Calendar');
      }
    } catch (error) {
      console.error('Ошибка при синхронизации события', error);
    }
  };


  //cинхронизация локальных событий с Google Calendar (при изменении или создании)
  const syncLocalEvent = async (event: any) => {
    if (authState.calendarToken) {
      try {
        await updateGoogleCalendarEvent(authState.calendarToken, event);
        await updateEvent(event.id, event);
        console.log('Событие обновлено в Google Calendar и Firebase');
      } catch (error) {
        console.error('Ошибка при синхронизации локального события с Google Calendar', error);
      }
    }
  };

// При подключении Google Calendar после локальных событий:
const handleGoogleCalendarAfterLocalEvents = async () => {
  if (!authState.calendarToken) {
    console.error('Токен Google Calendar отсутствует.');
    return;
  }

  if (!authState.id) {
    console.error('ID пользователя отсутствует.');
    return;
  }

  try {
    const localEvents = await getEventsByUser(authState.id);  //локальные события из Firebase

    for (const localEvent of localEvents) {

      if (!localEvent.id) {
        console.error('У события отсутствует id:', localEvent);
        continue; // Пропускаем это событие
      }

      // Синхронизируем локальное событие с Google Calendar
      await createGoogleCalendarEvent(authState.calendarToken, localEvent);
      // Обновляем событие в Firebase
      await updateEvent(localEvent.id, localEvent);

      console.log(`Событие с ID ${localEvent.id} синхронизировано с Google Calendar и обновлено в Firebase.`);
    }

    console.log('Все локальные события синхронизированы с Google Calendar');
  } catch (error) {
    console.error('Ошибка при синхронизации локальных событий с Google Calendar', error);
  }
};

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Мой календарь</Title>
      <FullCalendarWithModals 
        token={authState.calendarToken} 
        loadEvents={loadEvents}  // Передаем функцию для загрузки событий
        syncLocalEvent={syncLocalEvent}  // Функция для синхронизации локального события
        handleGoogleCalendarAfterLocalEvents={handleGoogleCalendarAfterLocalEvents}  // Функция для синхронизации локальных событий после подключения Google Calendar
      />
      {!authState.calendarToken && (
        <Card style={{ marginTop: 20 }}>
          <Button 
            type="primary" 
            onClick={handleConnectGoogleCalendar}
          >
            Подключить Google Календарь
          </Button>
        </Card>
      )}
    </div>
  );
}